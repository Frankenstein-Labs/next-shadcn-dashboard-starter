# Deployment

The starter deploys to Vercel out of the box, or anywhere Docker runs. `next.config.ts` sets `output: 'standalone'`, so production builds are optimized for self-hosting.

## Vercel (Recommended)

1. Connect the repository to Vercel
2. Add environment variables in the dashboard
3. Deploy

For other platforms, see the [Next.js deployment docs](https://nextjs.org/docs/app/getting-started/deploying).

## GitHub Actions CI/CD

The workflow at `.github/workflows/ci-cd.yml` runs on pull requests and pushes to `main`. It installs the locked Bun dependencies, checks formatting, runs TypeScript typechecking, runs lint, and builds the Next.js application. Lint is currently reported as non-blocking because the starter contains existing upstream lint findings; formatting, typechecking, and build failures remain blocking.

On pushes to `main`, the workflow also contains a Vercel deployment step. It skips deployment explicitly when the repository secrets below are absent, so a fork or a repository that has not been connected to Vercel does not fail for missing credentials:

- `VERCEL_TOKEN`: Vercel personal or team token;
- `VERCEL_ORG_ID`: Vercel team or account identifier;
- `VERCEL_PROJECT_ID`: Vercel project identifier.

Add these values under **Settings → Secrets and variables → Actions**. Do not place them in `.env`, workflow YAML, or frontend code. Application runtime secrets such as Clerk, Sentry, Marketplace, and API Hub provider keys remain configured in Vercel project environment variables and are not copied into GitHub Actions.

## Environment Variables for Production

Ensure these are set in your deployment platform:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- All `NEXT_PUBLIC_*` variables for client-side access
- `SENTRY_*` variables if using error tracking

Sentry source maps are uploaded automatically in CI.

## Frankenstein-Labs Marketplace

The Marketplace uses server-side Next.js route handlers. The browser never calls
Coder directly. Configure these additional Vercel variables:

- `FRANKENSTEIN_API_URL`: the deployed Render API URL, such as
  `https://frankenstein-api-catalog-free.onrender.com`;
- `FRANKENSTEIN_API_SECRET`: the same secret as Render's
  `FRANKENSTEIN_API_SECRET`, stored as a server-only variable;
- `FRANKENSTEIN_API_TIMEOUT_MS=75000`: allows for a free Render service cold start;
- `NEXT_PUBLIC_APP_URL`: the final HTTPS dashboard URL used for `metadataBase`.

Never prefix `FRANKENSTEIN_API_SECRET`, `CLERK_SECRET_KEY`, a Coder session token,
or a database DSN with `NEXT_PUBLIC_`. The Render free catalog mode serves the
69 templates and 93 modules but does not provide Coder workspaces or provisioning.
See the repository-level `INTEGRATION_GUIDE.md` for the complete Vercel/Render
configuration and the external compute requirements.

## Docker

Two production-ready Dockerfiles are included: `Dockerfile` (Node.js) and `Dockerfile.bun` (Bun). Pass `NEXT_PUBLIC_*` variables as `--build-arg` at build time and runtime secrets via `-e` at run time.

Build the image:

```bash
# Node.js
docker build \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx \
  -t shadcn-dashboard .

# OR Bun
docker build -f Dockerfile.bun \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx \
  -t shadcn-dashboard .
```

Run the container:

```bash
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx \
  -e CLERK_SECRET_KEY=<clerk-secret-server-only> \
  --restart unless-stopped \
  --name shadcn-dashboard \
  shadcn-dashboard
```
