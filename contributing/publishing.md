# Publishing

This is a guide for publishing Templates to npm. Most contributors don't need to worry about publishing. Publishing can only be done by the Salesforce tooling team. Please contact us if there are changes that you'd like to publish.

Every PR merge to main gets published automatically and goes through a minor version upgrade. The following steps are only when you need a one-off release to either pubish a major version or a patch version.

## Prerequisites

1. Publisher has a valid CircleCI token for the forcedotcom organization. More info on CircleCI's doc [Create a Personal API token](https://circleci.com/docs/2.0/managing-api-tokens/#creating-a-personal-api-token).
1. Publisher is a part of the GitHub team 'PDT'.

## Background

After feature/bug work has been QA'd and closed, it's time to prepare those changes for publishing.

The salesforcedx-templates project uses a two-branch strategy. Work that is currently under development is committed to the 'develop' branch. The 'main' branch is what's currently in production or is being staged for production.

## Publishing to NPM

To publish the changes to npm, we run the task `Publish Library and Plugin`. This task calls the script `publish-workflow.sh` and prompts the user for the required information. The publish-workflow script generates an HTTP Request to the CircleCI API. It tells CircleCI that it wants to run the `publish-workflow` from the `main` branch.

### Publish a major or patch release version

1. Open the Command Palette (press Ctrl+Shift+P on Windows or Linux, or Cmd+Shift+P on macOS).
1. Search for `Tasks: Run Task`.
1. Select `Publish Library and Plugin`.
1. Enter your CircleCI Token.
1. Pick if you want it to be major, minor or patch version.
1. Once the request has been sent, approve the workflow in CircleCI. <b>Note</b>: Only members of the GitHub team 'PDT' can approve the workflow.
