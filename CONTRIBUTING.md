## Contributing

1. Familiarize yourself with the codebase by reading the [docs](docs), in
   particular the [development](contributing/developing.md) doc.
1. Create a new issue before starting your project so that we can keep track of
   what you're trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
1. Fork this repository.
1. The [development](contributing/developing.md) doc has details on how to set up your environment.
1. Create a _topic_ branch in your fork based on the correct branch (usually the **develop** branch, see [Branches section](#branches)). Note: this step is recommended but technically not required if contributing using a fork.
1. Edit the code in your fork.
1. Sign CLA (see [CLA](#cla).
1. Send us a pull request when you're done. We'll review your code, suggest any
   needed changes, and merge it in.

### CLA

External contributors are required to sign a Contributor's License
Agreement. You can do so by going to https://cla.salesforce.com/sign-cla.

## Branches

- We work in `develop`.
- Our released (aka. _production_) branch is `main`.
- Our work happens in _topic_ branches (feature and/or bug-fix).
  - Feature as well as bug-fix branches are based on `develop`.
  - Branches _should_ be kept up-to-date using `rebase`.
  - See below for further merge instructions.

### Merging between branches

- We try to limit merge commits as much as possible.

  - They are usually only ok when done by our release automation.

- _Topic_ branches are based on `develop` and are squash-merged into `develop`.

- Hot-fix branches are an exception.
  - Instead, we aim for faster cycles and a generally stable `develop` branch.

### Merging `develop` into `main`

- When a development cycle finishes, the content of the `develop` branch becomes the `main` branch.

```
$ git checkout main
$ git reset --hard develop
$
$ # Using a custom commit message for the merge below
$ git merge -m 'Merge -s our (where _ours_ is develop) releasing stream x.y.z.' -s ours origin/main
$ git push origin main
```

## Pull Requests

- Develop features and bug fixes in _topic_ branches.
- _Topic_ branches can live in forks (external contributors) or within this repository (committers).
  \*\* When creating _topic_ branches in this repository please prefix with `<developer-name>/`.

### Merging Pull Requests

- Pull request merging is restricted to `squash & merge` only.