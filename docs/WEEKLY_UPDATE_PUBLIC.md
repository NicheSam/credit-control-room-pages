# 每週 GPT 發布規格（v2 公鑰加密）

## 初始基準

- 第一次部署使用 `data/dashboard.enc.json` 作為完整加密基準快照。
- `parts/manifest.json` 的 `mode` 為 `base` 時，網站讀取該基準檔。
- 基準檔只有密文，不包含任何帳務明文或私鑰。

## 每週更新

1. Gmail / PDF 增量抓取，更新 canonical Google Sheet。
2. 更新 `transactions`、`merchant_rules`、`dashboard_fact`、`monthly_summary`。
3. 對當月與必要時上月產生 GPT 月度判讀，append 到 `ai_monthly_summary`。
4. 匯出 `dashboard_fact`、`monthly_summary`、`ai_monthly_summary` 的純值 JSON；純值只存在工作階段。
5. 從 Public repo `config/public-key.json` 讀取 P-256 公鑰。
6. 產生 ephemeral P-256 key pair，使用 ECDH 取得 shared secret。
7. 以 HKDF-SHA256（random 16-byte salt，info=`credit-control-room:v2`）導出 AES-256 key。
8. payload gzip 後，以 AES-256-GCM（random 12-byte IV，AAD=`credit-control-room:v2`）加密。
9. 將完整 version 2 envelope JSON 以 **5,000 字元**為分片上限寫入 `parts/data/00.txt`、`01.txt`…。
10. 每一個分片寫入後必須比對檔案 byte size 與 Git blob SHA；全部通過後才允許更新 manifest。
11. 最後更新 `parts/manifest.json`：`mode=parts`、正確 `data` 分片數、`generated_at`。若新版本分片較少，刪除多餘舊分片。
12. 如果任何分片寫入或校驗失敗，**不得切換 manifest**；網站繼續使用上一個已驗證版本。
13. Public repo 嚴禁出現純值 `latest.json`、`dashboard_fact.json`、`monthly_summary.json`、`ai_monthly_summary.json` 或其他帳務明文。
14. Push `main` 後由 GitHub Pages workflow 重組、驗證密文並部署。

## 安全邊界

- **GPT 只需要公鑰，不需要、也不得讀取使用者私鑰。**
- 私鑰只由使用者保存，用於瀏覽器端解鎖。
- 公鑰可以公開存放。
- Public repo 訪客能下載密文，但沒有私鑰無法解讀帳務內容。
