# 每週 Dashboard 發布規格（去識別化 + PIN）

## 原則

- GitHub Pages 只保存 Dashboard 顯示需要的去識別化資料。
- 6 位 PIN 只是避免誤開頁面的簡易門檻，不視為真正的存取控制。
- 不使用 OpenAI API、公私鑰、AES 密文或恢復碼。
- Google Sheet 仍是唯一正式帳務資料源。

## 發布前去識別化

不得發布：
- Gmail 信件 ID
- PDF / 附件檔名
- Google Drive ID 或來源路徑
- 原始交易唯一鍵
- 已分類交易中可能含電話、會員編號、請款代碼的原始商店字串

可以發布：
- 日期、金額、銀行、CUBE / Unicard
- 標準化商店名稱
- 分類 / 子分類
- 固定支出、待確認等分析旗標
- 月度摘要與 GPT 月報

## 每週流程

1. 先確認 canonical Google Sheet 本週帳務整理已完成。
2. 程式先計算當月與必要時上月的事實指標。
3. ChatGPT 根據已計算事實產生月報，append 到 `ai_monthly_summary`；不呼叫外部 OpenAI API。
4. 將 Dashboard 要使用的交易資料去識別化。
5. 重新產生有異動月份的 gzip + base64 chunk。未來以 `data/chunks/YYYY-MM.b64` 為優先格式；歷史季度 chunk 可維持不動。
6. 重新產生 `data/index.json`，更新 `generated_at`、月份筆數、`monthly_summary`、最新 GPT 月報與 chunk 清單。
7. GitHub Actions 在部署前驗證：所有 chunk 可解壓、為 JSON array、沒有禁止欄位，且總筆數與 index 相符。
8. 驗證成功後才部署 GitHub Pages；失敗時明確回報，不假裝成功。

## PIN

PIN 只在前端以 SHA-256 雜湊比對，不應在 repo 文件或每週回報中寫出 PIN 明文。
