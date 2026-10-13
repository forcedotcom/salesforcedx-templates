# Publishing

This is a guide for publishing Templates to npm. Most contributors don't need to worry about publishing. Publishing can only be done by the Salesforce tooling team. Please contact us if there are changes that you'd like to publish.

Semantic merges to `main` create a GitHub release, which is then published to npm. The following steps are only when you need a manual release.

## Prerequisites

1. Publisher is a part of the GitHub team 'PDT'.

## Background

After feature/bug work has been QA'd and closed, it's time to prepare those changes for publishing.

`main` is the default and release branch; it is in production or staged for production. There is no `develop` branch. The v67 modernization uses a temporary `v67-modernization` branch created from `main` so 66.x maintenance and releases can continue there. Target templates-repo modernization PRs at `v67-modernization`; target normal maintenance PRs at `main`. Periodically merge `main` into `v67-modernization`. After the modernization work and release holds are complete, merge `v67-modernization` into `main` and publish v67.

## Publishing to NPM

When a commit is merged to main, we will automatically create the github release, and then publish the changes to npm using our Github Actions. If that fails for any reason and you need to create a manual release, you can do so using the following workflow.

### Publish a release version manually

1. Navigate to the `Actions` tab in the repository
1. Under `Workflows` on the left side, select `manual release`.
1. Select `Run Workflow`, and ensure the newest version is published to npm once the workflow completes.
1. Any failures will notify the pdt release channel internally.

### Major version notes

Historically, the package version of the library has supplied the Salesforce API version to be used for creating the most up-to-date metadata for Salesforce components. This meant that we were not able to use semantic versioning to indicate a major, or breaking, change. The current version of the templates library is now configured so that the `salesforceApiVersion` field in the `package.json` will now indicate the version to use for Salesforce metadata.
