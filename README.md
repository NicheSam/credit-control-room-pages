# Credit Control Room Pages

個人信用卡帳務 Dashboard 的 GitHub Pages 部署庫。

## 使用方式

- 開啟網站後輸入 **6 位數 PIN**。
- PIN 只是避免誤開頁面的簡易門檻，不是銀行級身份驗證。
- Public repo 裡的帳務資料會在發布前先做去識別化。

## Public repo 不發布的內容

- Gmail 信件 ID
- PDF / 附件檔名
- Google Drive ID
- 原始交易唯一鍵
- 原始資料來源路徑
- 已分類交易中可能帶電話、會員編號或請款代碼的原始名稱

已分類交易對外只保留標準化商店名稱；待確認名稱中的長數字與識別碼會遮罩。

## 每週更新

ChatGPT 每週先完成 Google Sheet 帳務整理，再同步：

1. 計算月度事實指標。
2. 產生 GPT 月報並 append 到 `ai_monthly_summary`。
3. 將需發布的資料去識別化。
4. 只更新本月或有異動月份的 `data/updates/months/*.b64` 與壓縮後的 metadata。
5. GitHub Pages 自動重新部署。

不使用外部 OpenAI API，也不需要公私鑰或恢復碼。
