# Chronos ⏳

> An encrypted, time-locked digital time capsule tool. Open source. Self-contained. Zero liability.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![Zero Server](https://img.shields.io/badge/architecture-Zero%20Server-success.svg)

**[🚀 Try the Live Demo here!](https://CheckForUpdates.github.io/chronos/)**

Chronos is a purely client-side application that allows you to encrypt messages and lock them until a specific date in the future. It generates self-contained `.chronos` files that you can send to loved ones. 

Everything runs locally in your browser using the native Web Crypto API. We don't have servers, we don't store your data, and we don't hold your keys.

## Features
* **Zero-Knowledge Encryption**: AES-GCM and PBKDF2 guarantee your payload is safe.
* **Zero Server Liability**: We store nothing. You download the `.chronos` file and deliver it yourself.
* **Client-Side Time-Lock**: A soft-enforcement time lock prevents early peaking.

## How to use
1. **Seal a Message**: Open the Creator, compose your message, set an unlock date, and provide a secure passphrase.
2. **Download**: Download the generated `.chronos` file.
3. **Share**: Email or send the file to your recipient. Give them the passphrase securely.
4. **Unlock**: On the unlock date, they upload the file to the Reader, enter the passphrase, and the message is decrypted locally.

## 🏗️ Architecture & Security (Start Here)
**For the strongest understanding of this portfolio piece, please read [ARCHITECTURE.md](ARCHITECTURE.md)**. 

It details the zero-server `.chronos` file format, the Web Crypto implementation, and our realistic threat model.

## Local Development
See [DEVELOPMENT.md](DEVELOPMENT.md) for instructions on running this project locally.
