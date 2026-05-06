#!/usr/bin/env bash
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="${1:-$REPO_ROOT/infra/oracle/a1-flex.wsl.env}"
PYTHON_BIN="${OCI_SDK_PYTHON:-python3}"
INTERVAL_SECONDS="${OCI_A1_RETRY_INTERVAL_SECONDS:-}"
INTERVAL_MIN_SECONDS="${OCI_A1_RETRY_INTERVAL_MIN_SECONDS:-120}"
INTERVAL_MAX_SECONDS="${OCI_A1_RETRY_INTERVAL_MAX_SECONDS:-200}"
RATE_LIMIT_SECONDS="${OCI_A1_RATE_LIMIT_BACKOFF_SECONDS:-300}"

load_env_file() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    echo "{\"status\":\"MISSING_CONFIG\",\"message\":\"Env file not found: $file\"}"
    return 1
  fi

  set -a
  # shellcheck disable=SC1090
  source "$file"
  set +a
}

json_field() {
  local json="$1"
  local field="$2"
  "$PYTHON_BIN" - "$json" "$field" <<'PY'
import json
import sys

try:
    data = json.loads(sys.argv[1])
    value = data.get(sys.argv[2], "")
    print(value if value is not None else "")
except Exception:
    print("")
PY
}

next_interval_seconds() {
  if [[ -n "$INTERVAL_SECONDS" ]]; then
    echo "$INTERVAL_SECONDS"
    return 0
  fi

  "$PYTHON_BIN" - "$INTERVAL_MIN_SECONDS" "$INTERVAL_MAX_SECONDS" <<'PY'
import random
import sys

low = int(sys.argv[1])
high = int(sys.argv[2])
if high < low:
    low, high = high, low
print(random.randint(low, high))
PY
}

send_success_slack() {
  local json="$1"
  local webhook="${OCI_A1_FLEX_SLACK_WEBHOOK_URL:-}"
  if [[ -z "$webhook" ]]; then
    return 0
  fi

  local name id shape region
  name="$(json_field "$json" "displayName")"
  id="$(json_field "$json" "id")"
  shape="$(json_field "$json" "shape")"
  region="$(json_field "$json" "region")"

  "$PYTHON_BIN" - "$webhook" "$name" "$id" "$shape" "$region" <<'PY' | curl -sS -X POST -H 'Content-Type: application/json; charset=utf-8' --data-binary @- "$webhook" >/dev/null
import json
import sys

_, webhook, name, instance_id, shape, region = sys.argv
message = "\n".join([
    "Oracle A1.Flex 생성 성공",
    f"- 이름: {name}",
    f"- OCID: {instance_id}",
    f"- Shape: {shape}",
    f"- Region: {region}",
    "- E2 인스턴스: 유지됨",
    "WSL 재시도 루프를 종료합니다.",
])
print(json.dumps({"text": message}, ensure_ascii=False))
PY
}

load_env_file "$ENV_FILE" || exit 3

while true; do
  timestamp="$(date '+%Y-%m-%d %H:%M:%S %z')"
  output="$("$PYTHON_BIN" "$REPO_ROOT/scripts/oci/try_create_a1_flex.py" 2>&1)"
  exit_code=$?
  status="$(json_field "$output" "status")"
  code="$(json_field "$output" "code")"

  echo "[$timestamp] $output"

  if [[ "$status" == "SUCCESS" ]]; then
    send_success_slack "$output"
    exit 0
  fi

  if [[ "$code" == "TooManyRequests" ]]; then
    sleep "$RATE_LIMIT_SECONDS"
  else
    sleep "$(next_interval_seconds)"
  fi
done
