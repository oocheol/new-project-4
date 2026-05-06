# OCI A1.Flex Automation

This repository includes a local automation path for repeatedly trying to create an Oracle Always Free Ampere A1.Flex VM.

## Installed Runtime

The automation uses the OCI Python SDK runtime at:

```text
C:\tmp\oci-sdk\Scripts\python.exe
```

The user environment variable `OCI_SDK_PYTHON` points to that runtime.

## Required Local Config

Create an OCI API key config at:

```text
C:\Users\PC\.oci\config
```

Then copy the environment template:

```powershell
Copy-Item infra\oracle\a1-flex.env.example infra\oracle\a1-flex.env
```

Fill in these values:

```text
OCI_COMPARTMENT_ID
OCI_AVAILABILITY_DOMAIN
OCI_SUBNET_ID
OCI_IMAGE_ID
OCI_SSH_PUBLIC_KEY_FILE
```

## Manual Test

Validate config without creating an instance:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\try-oci-a1-flex.ps1 -DryRun
```

Try one real creation attempt:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\try-oci-a1-flex.ps1
```

Only a `SUCCESS` result sends Slack. Missing config, capacity errors, quota errors, and other failures do not send Slack.

## Safety

The script launches only `VM.Standard.A1.Flex` by default and does not modify, stop, delete, or resize existing E2 instances.
