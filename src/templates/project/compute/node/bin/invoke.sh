
#!/usr/bin/env bash

####
# Invoke locally running API app.
#
# This script makes HTTP requests to a locally running API server with proper
# Salesforce client context headers for testing purposes.
###

set -euo pipefail

# Display usage information
function show_usage() {
  cat <<EOF
Usage: $0 ORG_DOMAIN ACCESS_TOKEN ORG_ID USER_ID [METHOD] [API_PATH] [DATA]

DESCRIPTION:
  Invoke a locally running API app with Salesforce client context.

REQUIRED PARAMETERS:
  ORG_DOMAIN    Organization domain (e.g., mycompany.my.salesforce.com)
  ACCESS_TOKEN  Salesforce access token
  ORG_ID        Salesforce organization ID (15 or 18 characters)
  USER_ID       Salesforce user ID (15 or 18 characters)

OPTIONAL PARAMETERS:
  METHOD        HTTP method (GET, POST, PUT, DELETE, PATCH) [default: GET]
  API_PATH      API endpoint path [default: /healthcheck]
  DATA          JSON data for POST/PUT requests (use --data '{"key":"value"}')

EXAMPLES:
  # Basic GET request to /healthcheck
  $0 mycompany.my.salesforce.com TOKEN_123 00D123456789ABC 005123456789ABC

  # POST request with data
  $0 mycompany.my.salesforce.com TOKEN_123 00D123456789ABC 005123456789ABC POST /hello '--data "{\"filename\":\"test\"}"'

  # Custom endpoint
  $0 mycompany.my.salesforce.com TOKEN_123 00D123456789ABC 005123456789ABC GET /generatePDF

OPTIONS:
  -h, --help    Show this help message

EOF
}

# Validate Salesforce ID format (15 or 18 characters, alphanumeric)
function validate_sf_id() {
  local id="$1"
  local name="$2"
  
  if [[ ! "$id" =~ ^[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?$ ]]; then
    echo "Error: $name must be 15 or 18 alphanumeric characters" >&2
    return 1
  fi
}

# Validate domain format
function validate_domain() {
  local domain="$1"
  
  if [[ ! "$domain" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "Error: ORG_DOMAIN must be a valid domain (e.g., mycompany.my.salesforce.com)" >&2
    return 1
  fi
}

# Validate HTTP method
function validate_method() {
  local method="$1"
  
  if [[ ! "$method" =~ ^(GET|POST|PUT|DELETE|PATCH)$ ]]; then
    echo "Error: METHOD must be one of: GET, POST, PUT, DELETE, PATCH" >&2
    return 1
  fi
}

# Validate API path
function validate_api_path() {
  local path="$1"
  
  if [[ ! "$path" =~ ^/ ]]; then
    echo "Error: API_PATH must start with '/' (e.g., /healthcheck)" >&2
    return 1
  fi
}

# Check for help flags
if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  show_usage
  exit 0
fi

# Check minimum required parameters
if [[ $# -lt 4 ]]; then
  echo "Error: Missing required parameters" >&2
  echo "" >&2
  show_usage
  exit 1
fi

# Using Python here since the GNU and BSD versions of the 'base64' command have differing
# output wrapping behaviour/arguments, which makes writing something portable a pain.
function base64_encode() {
  python3 -c "import base64, sys; print(base64.b64encode(sys.stdin.buffer.read()).decode('ascii'))"
}

# Parse and validate parameters
ORG_DOMAIN="$1"
ACCESS_TOKEN="$2"
ORG_ID="$3"
USER_ID="$4"
METHOD="${5:-GET}"
API_PATH="${6:-/healthcheck}"
DATA="${7:-}"

# Validate all parameters
echo "Validating parameters..."

validate_domain "$ORG_DOMAIN"
validate_sf_id "$ORG_ID" "ORG_ID"
validate_sf_id "$USER_ID" "USER_ID"
validate_method "$METHOD"
validate_api_path "$API_PATH"

# Check if access token is not empty
if [[ -z "$ACCESS_TOKEN" ]]; then
  echo "Error: ACCESS_TOKEN cannot be empty" >&2
  exit 1
fi

echo "✓ All parameters validated successfully"

# Generate request ID with current timestamp
REQUEST_ID="${ORG_ID}-$(uuidgen | tr '[:upper:]' '[:lower:]')-$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"

# Build client context
CLIENT_CONTEXT=$(base64_encode <<EOF
{
  "requestId": "${REQUEST_ID}",
  "accessToken": "${ACCESS_TOKEN}",
  "apiVersion": "62.0",
  "namespace": "",
  "orgId": "${ORG_ID}",
  "orgDomainUrl": "${ORG_DOMAIN}",
  "userContext": {
    "userId": "${USER_ID}",
    "username": "admin@mycompany.com"
  }
}
EOF
)

# Build curl command
echo ""
echo "Making request to: http://127.0.0.1:3000${API_PATH}"
echo "Method: $METHOD"
echo "Request ID: $REQUEST_ID"
echo ""

CMD="curl -v \
  http://127.0.0.1:3000${API_PATH} \
  -X $METHOD \
  -H \"Content-Type: application/json\" \
  -H \"x-request-id: ${REQUEST_ID}\" \
  -H \"x-client-context: ${CLIENT_CONTEXT}\" \
  $DATA"

echo "Executing command:"
echo "$CMD"
echo ""

eval "$CMD"
