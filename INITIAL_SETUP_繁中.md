# Credit Control Room｜第一次啟用 GitHub Pages

目前 Public repo 只包含網站程式、公鑰與密文發布機制，不包含帳務明文。

## 第一步：上傳初始加密快照

1. 下載 ChatGPT 提供的 `dashboard.enc.json`。
2. 回到 GitHub repository `NicheSam/credit-control-room-pages`。
3. 點 **Add file → Upload files**。
4. 建議先在電腦建立 `data` 資料夾，把 `dashboard.enc.json` 放進去後，以拖曳資料夾的方式上傳；GitHub 最終路徑必須是：
   `data/dashboard.enc.json`
5. Commit message 可填：`data: bootstrap encrypted dashboard snapshot`
6. Commit 到 `main`。

此檔案是 ECDH P-256 + HKDF-SHA256 + AES-256-GCM 密文；不含私鑰。

## 第二步：啟用 Pages

1. Repository 上方 **Settings**。
2. 左側 **Pages**。
3. **Build and deployment → Source** 選 **GitHub Actions**。
4. 回到 **Actions**，確認 `Deploy Credit Control Room to GitHub Pages` 執行成功。

預期網址：
`https://nichesam.github.io/credit-control-room-pages/`

## 第三步：解鎖

開啟網站後輸入 ChatGPT 另外提供、只由本人保存的 `CCR2.…` 私鑰解鎖碼。

- 私鑰不要放進 GitHub。
- 私鑰不要寫進 Google Sheet。
- 私鑰不要提供給每週排程。
- 每週 GPT 發布只使用 `config/public-key.json` 的公開金鑰。

## 後續自動更新

週一帳務整理完成後，Dashboard 發布流程會：

`最新 Sheet → GPT 月報 → ai_monthly_summary → 公鑰加密 → 5,000 字元分片 → Git blob SHA 驗證 → manifest 切換 → Pages deploy`

任何分片失敗時，不切換 manifest，網站繼續使用上一個已驗證版本。
