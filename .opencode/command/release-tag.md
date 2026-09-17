---
description: Apply the version and latest Git tags after a release commit reaches main.
agent: build
---

Read the release version from `package.json`, then apply the release tags.

The package version must already be updated and committed on `main`. Do not
create a GitHub release. The GitHub Actions workflow does that after the
version tag is pushed.

Run these checks and commands:

```bash
set -eu
VERSION="$(node -p "require('./package.json').version")"
TAG="v$VERSION"

test "$(git branch --show-current)" = "main"
test -z "$(git status --short)"
test "$(node -p "require('./package.json').version")" = "$VERSION"
git fetch origin main --tags
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"
git show-ref --verify --quiet "refs/tags/$TAG" && exit 1 || true

git tag -a "$TAG" -m "Release $TAG"
git push origin "$TAG"
git tag -f latest "$TAG"
git push origin +refs/tags/latest
```

Report the pushed version tag and the updated `latest` tag.
