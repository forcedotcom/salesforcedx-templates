# Publishing

This is a guide for publishing Templates to npm. Most contributors don't need to worry about publishing. Publishing can only be done by the Salesforce tooling team. Please contact us if there are changes that you'd like to publish.

Every PR merge to main gets published automatically and follows semantic versioning. The following steps are only when you need a manual release.

## Prerequisites

1. Publisher is a part of the GitHub team 'PDT'.

## Background

After feature/bug work has been QA'd and closed, it's time to prepare those changes for publishing.

The salesforcedx-templates project uses a two-branch strategy. Work that is currently under development is committed to the 'develop' branch. The 'main' branch is what's currently in production or is being staged for production.

## Publishing to NPM

When a commit is merged to main, we will automatically create the github release, and then publish the changes to npm using our Github Actions. If that fails for any reason and you need to create a manual release, you can do so using the following workflow.

### Publish a release version manually

1. Navigate to the `Actions` tab in the repository
1. Under `Workflows` on the left side, select `manual release`.
1. Select `Run Workflow`, and ensure the newest version is published to npm once the workflow completes.
1. Any failures will notify the pdt release channel internally.

### Major version notes

Historically, the package version of the library has supplied the Salesforce API version to be used for creating the most up-to-date metadata for Salesforce components. This meant that we were not able to use semantic versioning to indicate a major, or breaking, change. The current version of the templates library is now configured so that the `salesforceApiVersion` field in the `package.json` will now indicate the version to use for Salesforce metadata.
