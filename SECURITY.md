# Security Policy

GoodJob is an out-of-tree DeepSeek Harness plugin. It runs inside the DSH host and browser profile, so a security issue may affect the host process, session data, model-facing operations, or the workspace UI.

## Supported versions

| Version | Support |
| --- | --- |
| `main` and the latest tagged release | Supported |
| Older commits and releases | Best effort only |

## Reporting a vulnerability

Please report suspected vulnerabilities privately. Use GitHub's **Report a vulnerability** flow in the repository's Security tab when it is available. If that flow is unavailable, send a private GitHub message to [@fentz26](https://github.com/fentz26). Do not open a public issue or discussion for an unpatched vulnerability.

Include, when safe to share:

- the affected GoodJob revision or installed version;
- the DSH version, operating system, Node.js version, and package-manager version;
- the impact and a minimal reproduction or proof of concept;
- the capabilities, permissions, profile, or session involved; and
- relevant logs with credentials, tokens, prompts, session contents, and personal data removed.

The maintainer will acknowledge the report when practicable, validate the impact, coordinate a fix or mitigation, and agree on a disclosure date with the reporter. There is no guaranteed response or remediation time.

## Protecting credentials and session data

Never include API keys, GitHub tokens, private keys, cookies, authorization headers, complete session logs, or unredacted mailbox and transcript content in a report. If a secret was exposed while reproducing an issue, revoke or rotate it before reporting and identify only the secret type and affected environment.

GoodJob does not store credentials. Installation and DSH provider authentication remain responsible for access control; use a throwaway profile and least-privileged credentials when testing an untrusted change.

## Scope

This policy covers the GoodJob source, published bundle, package dependencies, installation metadata, host adapters, and browser workspace. A vulnerability in a DeepSeek Harness capability used by GoodJob should also be reported to the upstream DSH maintainers through their security process.
