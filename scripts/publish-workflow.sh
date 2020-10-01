#!/usr/bin/env bash

# For publishing a patch version, add the following parameter:
# "publish-type": "patch"

CircleCIToken=$1
PublishType=$2
PublishVersion=$3

if [ ! -z "${PublishVersion}" ]; then
  if [[ "${PublishVersion}" =~ ^[0-9]{2}\.[0-9]{1,2}\.[0-9]{1,2}$ ]]; then
    echo "Publish version ${PublishVersion} is valid."
  else
    echo "Publish version ${PublishVersion} does not fit the format xx.yy.zz. Exiting."
    exit 1
  fi
fi

curl -v -u ${CircleCIToken}: -X POST --header "Content-Type: application/json" -d '{
  "branch": "main",
  "parameters": {
    "publish": true,
    "publish-type": "'"${PublishType}"'",
    "publish-version": "'"${PublishVersion}"'"
  }
}' https://circleci.com/api/v2/project/gh/forcedotcom/salesforcedx-templates/pipeline

# open the release pipe line url
open "https://app.circleci.com/pipelines/github/forcedotcom/salesforcedx-templates"