---
name: Workspace package installs
description: Dependency installation behavior in this pnpm monorepo
---

For artifact-specific npm dependencies, install with the workspace package filter rather than a root-scoped installer.

**Why:** The available language-package helper runs `pnpm add` from the workspace root and fails on the workspace-root safety check for app-only dependencies.

**How to apply:** Use `pnpm --filter @workspace/<artifact> add <package>` when a dependency should live in one artifact.