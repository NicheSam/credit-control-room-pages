# 每週 GPT 發布規格（v2 公鑰加密）

1. Gmail / PDF 增量抓取，更新 canonical Google Sheet。
2. 更新 `transactions`、`merchant_rules`、`dashboard_fact`、`monthly_summary`。
3. 對當月與必要時上月產生 GPT 月度判讀，append 到 `ai_monthly_summary`。
4. 匯出 `dashboard_fact`、`monthly_summary`、`ai_monthly_summary` 的純值 JSON。
5. 從 Public repo `NicheSam/credit-control-room-pages/config/public-key.json` 讀取 P-256 公鑰。
6. 產生新的 ephemeral P-256 key pair，使用 ECDH 取得 shared secret。
7. 以 HKDF-SHA256（random 16-byte salt，info=`credit-control-room:v2`）導出 32-byte AES key。
8. 將 payload gzip 後，以 AES-256-GCM（random 12-byte IV，AAD=`credit-control-room:v2`）加密。
9. 將完整 version 2 envelope JSON 以 **20,000 字元**為固定上限切分成 `parts/data/00.txt`、`01.txt`…。
10. 更新 `parts/manifest.json` 的 `data`（分片數）與 `generated_at`。若新版本分片數變少，刪除多餘舊分片，避免舊密文殘留。
11. 不在 Public repo 寫入任何純值 `latest.json`、`monthly_summary.json`、`ai_monthly_summary.json` 或其他帳務明文。
12. Push `main` 後由 GitHub Pages workflow 驗證分片、組合密文並自動部署。

## 安全邊界

- **GPT 只需要公鑰，不需要、也不得讀取使用者私鑰。**
- 私鑰只由使用者保存，用於瀏覽器端解鎖。
- 公鑰可以安全地公開存放在 repository。
- Public repo 的訪客可以下載密文，但沒有私鑰無法解讀帳務內容。
