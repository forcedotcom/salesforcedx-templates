---
name: feature-branch
description: Branch and PR target conventions; use when creating branches, checking out, pushing, or choosing a PR base.
---

# Feature Branch

- Work on topic branches, not `main` or `v67-modernization`.
- `main` remains default/release branch.
- v67 modernization work: branch from and target PRs to `v67-modernization`; never merge those work items directly into `main`.
- When branching from a remote base, use `--no-track`; pushes must target the topic branch.
- Keep an existing topic branch's name. New branches: `<developer-prefix>/W-XXXXX-short-description`.
