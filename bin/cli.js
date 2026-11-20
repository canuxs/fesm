#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);
const command = args[0];

if (command === 'help' || !command) {
  console.log(`
FESM (File Encrypt and Secure Manager)

Usage:
  fesm create <path> password <password> [length <number>]
  fesm enc <input> by <profile.semp> to <output> password <password>
  fesm unenc <input> by <profile.semp> to <output> password <password>
  fesm help
  `);
} else if (command === 'create') {
  const filePath = args[1];
  const passIndex = args.indexOf('password');
  const lenIndex = args.indexOf('length');

  if (!filePath || passIndex === -1 || !args[passIndex + 1]) {
    console.error('Usage: fesm create <path> password <password> [length <number>]');
    process.exit(1);
  }

  const password = args[passIndex + 1];
  const randomLength = (lenIndex !== -1 && args[lenIndex + 1]) ? parseInt(args[lenIndex + 1], 10) : 256;

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  const randomChars = crypto.randomBytes(Math.ceil(randomLength / 2)).toString('hex').slice(0, randomLength);

  const fullPath = filePath.endsWith('.semp') ? filePath : `${filePath}.semp`;
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, passwordHash + randomChars, 'utf8');

  console.log(`Profile created: ${fullPath}`);

} else if (command === 'enc' || command === 'unenc') {
  const inputFile = args[1];
  const byIndex = args.indexOf('by');
  const toIndex = args.indexOf('to');
  const passIndex = args.indexOf('password');

  if (!inputFile || byIndex === -1 || toIndex === -1 || passIndex === -1) {
    console.error(`Usage: fesm ${command} <input> by <profile.semp> to <output> password <password>`);
    process.exit(1);
  }

  const profilePath = args[byIndex + 1];
  const outputFile = args[toIndex + 1];
  const password = args[passIndex + 1];

  if (!fs.existsSync(profilePath) || !fs.existsSync(inputFile)) {
    console.error('Error: Input file or profile not found.');
    process.exit(1);
  }

  const profileData = fs.readFileSync(profilePath, 'utf8');
  const storedHash = profileData.slice(0, 64);
  const profileKey = profileData.slice(64);

  const inputHash = crypto.createHash('sha256').update(password).digest('hex');

  if (storedHash !== inputHash) {
    console.error('Error: Invalid password.');
    process.exit(1);
  }

  const derivedKey = crypto.createHash('sha256').update(profileKey + password).digest();

  if (command === 'enc') {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
    const fileData = fs.readFileSync(inputFile);
    const encrypted = Buffer.concat([iv, cipher.update(fileData), cipher.final()]);

    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, encrypted);
    console.log(`Encrypted: ${outputFile}`);

  } else {
    const fileData = fs.readFileSync(inputFile);
    const iv = fileData.subarray(0, 16);
    const encryptedContent = fileData.subarray(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedContent), decipher.final()]);

    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, decrypted);
    console.log(`Decrypted: ${outputFile}`);
  }

} else {
  console.error('Error: Unknown command. Use "fesm help" for usage.');
  process.exit(1);
}