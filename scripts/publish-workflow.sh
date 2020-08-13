#!/usr/bin/env bash

# For publishing a patch version, add the following parameter:
# "publish-type": "patch"

CircleCIToken=$1
PublishType=$2
curl -v -u ${CircleCIToken}: -X POST --header "Content-Type: application/json" -d '{
  "branch": "main",
  "parameters": {
    "publish": true,
    "publish-type": "'"${PublishType}"'"
  }
}' https://circleci.com/api/v2/project/gh/forcedotcom/salesforcedx-templates/pipeline

# open the release pipe line url
open "https://app.circleci.com/pipelines/github/forcedotcom/salesforcedx-templates"