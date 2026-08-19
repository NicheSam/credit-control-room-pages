# 每週 GPT 發布規格（v2 公鑰加密）

1. Gmail / PDF 增量抓取，更新 canonical Google Sheet。
2. 更新 `transactions`、`merchant_rules`、`dashboard_fact`、`monthly_summary`。
3. 對當月與必要時上月產生 GPT 月度判讀，append 到 `ai_monthly_summary`。
4. 匯出三張資料表的純值 JSON。
5. 從 Public repo `NicheSam/credit-control-room-pages/config/public-key.json` 讀取 P-256 公鑰。
6. 產生新的 ephemeral P-256 key pair，使用 ECDH 取得 shared secret。
7. 以 HKDF-SHA256（random 16-byte salt，info=`credit-control-room:v2`）導出 32-byte AES key。
8. 將 payload gzip 後，以 AES-256-GCM（random 12-byte IV，AAD=`credit-control-room:v2`）加密。
9. Envelope 格式沿用 `data/dashboard.enc.json` version 2；只更新 Public repo 的密文檔。
10. Push main 後 GitHub Pages 自動部署。

**GPT 不需要、也不得讀取使用者私鑰。** 公鑰可公開。
