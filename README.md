# Credit Control Room Pages

Public deployment repository for Credit Control Room.

## Privacy

- No plaintext transaction data is stored in this repository.
- `data/dashboard.enc.json` / verified `parts/data/*.txt` are encrypted with ECDH P-256 + HKDF-SHA256 + AES-256-GCM.
- `config/public-key.json` contains only the public encryption key.
- The private unlock key is never stored in GitHub.
- The private source/maintenance repository remains separate.

## Initial bootstrap

1. Upload the generated encrypted baseline as `data/dashboard.enc.json`.
2. Keep `parts/manifest.json` at `mode: base`.
3. Repository Settings → Pages → Source → GitHub Actions.
4. The deployment workflow publishes the site.
5. Unlocking happens only in the browser with the private `CCR2.…` token.

## Weekly GPT publishing

After the initial baseline, weekly GPT updates use verified 5,000-character encrypted parts. `parts/manifest.json` switches to `mode: parts` only after every part passes byte-size and Git blob SHA verification. A partial publishing failure therefore cannot replace the last known-good snapshot.

See `docs/WEEKLY_UPDATE_PUBLIC.md` for the full procedure.
