# FESM (File Encrypt and Secure Manager)

A lightweight, zero-dependency CLI tool for symmetric file encryption and decryption using custom security profile files (`.semp`) and password combinations.

## Features

- **Zero Dependencies:** Built purely with native Node.js modules (`crypto`, `fs`, `path`).
- **Two-Factor File Security:** Decryption requires both the exact `.semp` profile file and the original password.
- **Strong Cryptography:** Uses SHA-256 for password verification/key derivation and AES-256-CBC with random Initialization Vectors (IV) for file encryption.
- **Custom Profile Lengths:** Generate `.semp` key profiles with customizable random byte lengths.

## Installation

Install globally via npm:

```bash
npm install -g fesm
```

## Usage

### 1. Create a Security Profile (`.semp`)
Before encrypting files, generate a security profile containing your password hash and a cryptographically secure random key.

```bash
fesm create <path> password <password> [length <number>]
```

**Example:**
```bash
fesm create myprofile.semp password mySecretPassword123 length 512
```
*(Note: If `length` is omitted, it defaults to 256 characters).*

### 2. Encrypt a File
Encrypt any file using your `.semp` profile and password.

```bash
fesm enc <input> by <profile.semp> to <output> password <password>
```

**Example:**
```bash
fesm enc secret.txt by myprofile.semp to secret.enc password mySecretPassword123
```

### 3. Decrypt a File
Restore an encrypted file back to its original state. You must provide the exact `.semp` file used during encryption.

```bash
fesm unenc <input> by <profile.semp> to <output> password <password>
```

**Example:**
```bash
fesm unenc secret.enc by myprofile.semp to restored.txt password mySecretPassword123
```

### 4. Help
View all available commands and syntax directly in your terminal:

```bash
fesm help
```

## Security Architecture

1. **Profile Generation:** A `.semp` file stores a 64-character SHA-256 hash of your password, immediately followed by a cryptographically secure random string.
2. **Key Derivation:** During encryption and decryption, FESM validates the input password against the stored hash, then derives a 256-bit encryption key by hashing the combination of the profile's random key and your password.
3. **Encryption:** Files are encrypted using `aes-256-cbc` with a unique 16-byte random IV prepended to the output file. Without the .semp file, the encrypted data cannot be decrypted even if the password is known.

## License

MIT © [canuxs](https://github.com/canuxs)