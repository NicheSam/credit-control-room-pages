# Credit Control Room Pages

Public deployment repository for Credit Control Room.

## Privacy
- No plaintext transaction data is stored in this repository.
- `data/dashboard.enc.json` is encrypted with ECDH P-256 + HKDF-SHA256 + AES-256-GCM.
- `config/public-key.json` contains only the public encryption key.
- The private unlock key is not stored in GitHub.

The private source/maintenance repository remains separate.
