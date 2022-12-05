# Publishing

This is a guide for publishing Templates to npm. Most contributors don't need to worry about publishing. Publishing can only be done by the Salesforce tooling team. Please contact us if there are changes that you'd like to publish.

Every PR merge to main gets published automatically and goes through a minor version upgrade. The following steps are only when you need a one-off release to either pubish a major version or a patch version.

## Prerequisites

1. Publisher is a part of the GitHub team 'PDT'.

## Background

After feature/bug work has been QA'd and closed, it's time to prepare those changes for publishing.

The salesforcedx-templates project uses a two-branch strategy. Work that is currently under development is committed to the 'develop' branch. The 'main' branch is what's currently in production or is being staged for production.

## Publishing to NPM

When a commit is merged to main, we will automatically create the github release, and then publish the changes to npm using our Github Actions.

### Publish a major or patch release version manually

1. Navigate to the `Actions` tab in the repository
1. Under `Workflows` on the left side, select `Publish`.
1. Select `Run Workflow` on the top row.
1. Enter the desired version number, following semantic versioning.
1. Select `Run Workflow`, and ensure the newest version is published to npm once the workflow completes.
1. Any failures will notify the pdt release channel internally.
