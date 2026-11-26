# Security policy

Brain9 is a brain-training web application for elderly people, built as a university
senior project. It stores personal data, so we want to hear about a weakness before anyone
uses it.

## Reporting a vulnerability

Please report it **privately**: open the repository's **Security** tab and choose
**Report a vulnerability**. Do not open a public issue or pull request that describes the
problem.

Tell us what you found, where (a URL or a file), and how to reproduce it. If you came
across someone's personal data, say so, and do not copy, keep or share it.

We are a small student team. We will answer within seven days and tell you what we did.

## Scope

- The application in this repository and its deployments at `brain9.ast0miq.com` and
  `staging.brain9.ast0miq.com`.
- Out of scope: denial-of-service testing, automated scanning that floods the site, social
  engineering of staff or users, and anything that needs access to another person's
  account or device.

## What we already know

The design decisions and the limits we accept are written in
[`docs/security.md`](docs/security.md), including why the Content Security Policy allows
inline scripts.
