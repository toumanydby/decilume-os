# Deployment workflow

The deployment model is deliberately simple:

| Git branch | Vercel environment | Purpose |
| --- | --- | --- |
| `main` | Production | The live application and custom production domain. |
| `dev` | Preview | The shared development environment; Vercel creates a preview URL for each push. |
| Other branches and pull requests | Preview | Ephemeral review deployments created by Vercel's Git integration. |

## One-time Vercel connection

1. In Vercel, create a project and import the GitHub repository `toumanydby/decilume-os`.
2. Confirm that Vercel detects **Next.js**. No `vercel.json` file is needed for this app.
3. In **Project Settings → Git**, set **Production Branch** to `main`.
4. In **Project Settings → Environment Variables**, add `GEMINI_API_KEY` for both **Production** and **Preview**. Use a different restricted key for Preview if possible. Optionally add `GEMINI_MODEL` to the same environments when overriding the default model.
5. Assign the production domain in **Project Settings → Domains**. Only deployments from `main` should be promoted to that domain.

Do not put the Gemini key in GitHub Actions secrets: the CI build does not need it, and the running API routes receive it securely from Vercel instead. Never commit `.env`, `.env.local`, or a Vercel project directory.

## GitHub CI

`.github/workflows/ci.yml` validates every pull request into `main` or `dev`, and every push to either branch. It installs exactly the dependencies pinned in `bun.lock` and runs the production Next.js build, including TypeScript validation.

In GitHub, protect the `main` branch and require the **CI / Validate application** status check before merging. Apply the same rule to `dev` if changes reach that branch through pull requests.

## Create the development branch

Once the CI configuration has been committed to `main`, create the shared development branch from it:

```bash
git switch main
git pull --ff-only origin main
git switch -c dev
git push -u origin dev
```

After the Vercel connection is complete, a push to `dev` receives a Preview deployment and a merge into `main` receives the Production deployment. Other pull requests also receive isolated Preview deployments. Vercel reports each deployment URL back to GitHub.
