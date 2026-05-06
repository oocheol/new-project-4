param(
    [string]$EnvFile = "infra\oracle\a1-flex.env",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$pythonScript = Join-Path $repoRoot "scripts\oci\try_create_a1_flex.py"
$defaultPython = "C:\tmp\oci-sdk\Scripts\python.exe"

function Import-EnvFile {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line.Length -eq 0 -or $line.StartsWith("#")) {
            return
        }

        $parts = $line.Split("=", 2)
        if ($parts.Length -ne 2) {
            return
        }

        $name = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")
        if ($name.Length -gt 0) {
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

function Send-SuccessSlack {
    param([object]$Result)

    $webhookUrl = $env:OCI_A1_FLEX_SLACK_WEBHOOK_URL
    if ([string]::IsNullOrWhiteSpace($webhookUrl)) {
        return
    }

    $message = @"
Oracle A1.Flex 생성 성공
- 이름: $($Result.displayName)
- OCID: $($Result.id)
- Shape: $($Result.shape)
- Region: $($Result.region)
- E2 인스턴스: 유지됨
자동화는 성공 후 중지 대상입니다.
"@

    $payload = @{ text = $message } | ConvertTo-Json -Depth 4
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
    Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $bytes -ContentType "application/json; charset=utf-8" | Out-Null
}

Import-EnvFile -Path (Join-Path $repoRoot $EnvFile)

$python = $env:OCI_SDK_PYTHON
if ([string]::IsNullOrWhiteSpace($python)) {
    $python = $defaultPython
}

if (-not (Test-Path $python)) {
    throw "OCI SDK Python runtime not found. Expected: $python"
}

$argsList = @($pythonScript)
if ($DryRun) {
    $argsList += "--dry-run"
}

$output = & $python @argsList
$exitCode = $LASTEXITCODE
$text = ($output | Out-String).Trim()

if ($text.Length -gt 0) {
    Write-Output $text
}

try {
    $result = $text | ConvertFrom-Json
    if ($result.status -eq "SUCCESS") {
        Send-SuccessSlack -Result $result
    }
} catch {
    # Keep failed or malformed output silent for Slack. The console output above is enough for manual runs.
}

exit $exitCode
