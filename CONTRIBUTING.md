# Contributing

1. Read [`AGENTS.md`](AGENTS.md). It applies to you and to any AI assistant you use.
2. Pick an issue assigned to you in your lane. No issue, no code.
3. `git switch staging && git pull && git switch -c feat/<lane>-<short-name>`
4. Build it inside your lane. Need something elsewhere? Open a cross-module request.
5. `pnpm check && pnpm build`
6. Push and open a pull request **into `staging`**. Fill in the template.
7. Fix review comments, keep CI green, squash-merge after approval.

Details: [`docs/workflow.md`](docs/workflow.md).

Using an AI assistant? You are responsible for everything it writes. Read the diff before
you push, and say in the PR which tool helped.
