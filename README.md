# Using `px3` as a Git Submodule in an Angular Project

This guide explains how to add the `px3` shared code as a **Git submodule** under `src/px3` in an Angular (v20+) project, and how to work with it day-to-day.

---

## Prerequisites

- Git 2.13+
- Node.js / npm compatible with your Angular project
- An existing Angular workspace
- Access to the `px3` Git repository (e.g., GitHub/GitLab URL)

---

## 1) Add `px3` as a submodule

From the **root** of your Angular project:

```bash
git submodule add <PX3_REPO_URL> src/px3
git commit -m "Add px3 as submodule under src/px3"
```

This creates/updates a `.gitmodules` file and pins the submodule to a specific commit.

> Do **not** add `src/px3` to `.gitignore`. Submodules are tracked by a pointer commit; their contents are managed in the submodule repo itself.

---

## 2) Configure TypeScript path alias (recommended)

In your project’s `tsconfig.base.json` (or `tsconfig.json` at workspace root), add a path mapping so imports are clean:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@px3/*": ["src/px3/*"]
    }
  }
}
```

Now you can import code like:

```ts
import { somethingUseful } from '@px3/utils/something-useful';
```

---

## 3) Use `px3` in your app

- `px3` is **source code** compiled together with your app. No separate build step is required.
- Keep imports absolute via `@px3/*` (avoid deep relative paths).

Example usage:

```ts
// component.ts
import { smartValidator } from '@px3/forms/validators';
```

---

## 4) Cloning the project (for other developers/CI)

When someone clones your project, they must initialize submodules:

```bash
git clone <APP_REPO_URL>
cd <APP_REPO_DIR>
git submodule update --init --recursive
npm install
```

To pull the latest changes (including submodules):

```bash
git pull --recurse-submodules
git submodule update --init --recursive
```

---

## 5) Updating `px3` to a newer commit

Inside the main repo:

```bash
# Option A: fast-forward to latest default branch
git submodule update --remote src/px3
git add src/px3
git commit -m "Bump px3 submodule to latest"
```

Or check out a specific branch/commit inside the submodule:

```bash
cd src/px3
git fetch
git checkout <branch-or-commit>
cd ../..
git add src/px3
git commit -m "Pin px3 to <branch-or-commit>"
```

> The main repo always stores the **exact commit** of `px3` you’re pinned to.

---

## 6) Making changes to `px3`

You can edit files under `src/px3` directly, but those changes belong to the **px3 repo**:

```bash
cd src/px3
# create a feature branch if desired
git checkout -b feat/something
# edit files...
git add .
git commit -m "Implement something in px3"
git push origin feat/something
```

After merging in the px3 repo, update the pointer in the main repo (see §5).

---

## 7) Removing the submodule (if needed)

```bash
# 1) Deinit
git submodule deinit -f src/px3
# 2) Remove the path (stops tracking the pointer)
git rm -f src/px3
# 3) Clean up the Git dir of the submodule
rm -rf .git/modules/src/px3
# 4) Commit
git commit -m "Remove px3 submodule"
```

---

## 8) CI notes

- Ensure your CI runner initializes submodules, e.g.:
  - **Git**: `git submodule update --init --recursive`
  - **GitHub Actions**: `actions/checkout@v4` with `submodules: true`
- No special build steps are required; Angular will compile `src/px3` with the app.

---

## 9) Common pitfalls & tips

- **Don’t ignore `src/px3/`** in the main repo: submodules need to be tracked.
- **Angular version alignment**: since `px3` is compiled with the app, keep TS/Angular features compatible across consumers.
- **Consistent imports**: prefer `@px3/*` via `paths` mapping to avoid fragile relative imports.
- **Pin precisely**: treat the submodule commit like a dependency version; bump intentionally with a commit message.
- **Branching**: you can pin `src/px3` to a branch during development, but it’s safer to pin to a specific commit for reproducible builds.

---

## 10) Quick checklist

- [ ] `git submodule add <PX3_REPO_URL> src/px3`
- [ ] Add `@px3/*` alias in `tsconfig.base.json`
- [ ] `npm install` and import from `@px3/...`
- [ ] Teach teammates/CI to run `git submodule update --init --recursive`
- [ ] Commit submodule pointer updates when you want newer `px3` code

---

**That’s it.** Your Angular app now consumes `px3` as source via a clean Git submodule, with predictable versioning and straightforward updates.
