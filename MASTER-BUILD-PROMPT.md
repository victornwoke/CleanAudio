# MASTER-BUILD-PROMPT.md

Read `AGENTS.md`, `PRD.md`, `README.md`, and the current numbered prompt before making changes.

Work through only one numbered prompt at a time. Before coding:

1. Inspect the full repository and the exact files affected.
2. Open every PNG listed under Visual references.
3. Identify existing working behaviour that must be preserved.
4. Confirm the installed package versions and use their official documentation.
5. Implement the complete task, including realistic loading, empty, disabled, permission, offline, success, cancellation, and failure states.
6. Run type-check, lint, and relevant tests.
7. Summarize:
   - files changed
   - behaviour implemented
   - tests/commands run
   - native rebuild requirements
   - honest remaining limitations

Do not fabricate completed audio processing, purchases, notifications, monitoring, analytics, or backend behaviour. Where an external dashboard, store product, signing credential, native module, or backend secret is required, implement the code boundary and configuration documentation, then clearly mark the external step as not yet verified.
