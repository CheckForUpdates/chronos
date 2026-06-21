# Architecture & Security Model

Chronos is built on a **Zero-Server Trust Model**. It is a purely client-side application that runs locally in your browser.

## The `.chronos` File Format

Chronos does not store data on a server. Instead, it exports a highly portable `.chronos` file.
The file is a JSON object containing the encrypted payload and public metadata needed to unlock it later.

```json
{
  "version": 1,
  "metadata": {
    "title": "My Encrypted Message",
    "unlockDate": "12312026",
    "salt": "base64==",
    "hint": "Name of my first pet"
  },
  "payload": {
    "ciphertext": "base64==",
    "iv": "base64=="
  },
  "hmac": "base64=="
}
```

## Encryption Flow

We use the native Web Crypto API to ensure no third-party libraries have access to your data.

1. **Key Derivation**: The user provides a passphrase. We generate a random 16-byte salt and use `PBKDF2` with `SHA-256` and `600,000` iterations to derive a secure 256-bit AES key.
2. **Encryption**: The plaintext message is encrypted using `AES-GCM` with a 12-byte random Initialization Vector (IV).
3. **Authentication**: To prevent tampering with the public metadata (like the unlock date), we sign the `metadata` object using an `HMAC` (SHA-256) signature derived from the same root passphrase.

## Threat Model & "Soft" Time-Locks

**Chronos does not provide cryptographically guaranteed time-locks.**

True cryptographic time-locks require a trusted third party, hardware enclaves, or blockchain oracles. Since Chronos is purely client-side, the "Time-Lock" is enforced by the application reading your local system clock (`Date.now()`).

*   **If a user is honest**: The app will refuse to decrypt the file until the date arrives.
*   **If a user is malicious**: A technically skilled user could modify their system clock or edit the open-source code to bypass the time-check. However, they **still need the correct passphrase** to decrypt the AES payload.

**Chronos guarantees confidentiality (via AES), but the time-lock is a UX constraint, not a cryptographic one.**
