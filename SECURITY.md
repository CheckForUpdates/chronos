# Security Policy

## Supported Versions

Currently, the `main` branch is the only supported version for security updates.

## Reporting a Vulnerability

Chronos is a purely client-side application. We do not operate servers, store user data, or manage keys. 

However, if you discover a flaw in our Web Crypto implementation, key derivation strategy, or `.chronos` file parsing that could compromise the confidentiality of user payloads, please open an issue or submit a pull request detailing the concern.

### Note on Time-Locks
As documented in `ARCHITECTURE.md`, the time-lock mechanism relies on the client's system clock. Bypassing the time-lock by altering the system clock is an expected limitation of the zero-server architecture and does **not** constitute a security vulnerability.
