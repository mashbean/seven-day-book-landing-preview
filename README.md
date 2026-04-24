# Matters 七日書 Landing Page Handoff

這個 private repo 是 Matters 七日書 Landing Page 的交接包，包含目前已擷取的官方帳號資料、靜態內容藍圖、Astro 頁面實作，以及交給 Claude Code 的後續作業 prompt。

## Repo 內容

- `src/pages/seven-day-book.astro`  
  Landing Page 靜態頁面，目前路由為 `/seven-day-book/`。
- `src/data/seven-day-book.ts`  
  單一內容設定檔，集中管理數據、主題地圖、合作案例、標籤連結、來源註記與 CTA。
- `research/freewrite/`  
  Matters 官方帳號 `@freewrite` 的擷取資料，包含文章全文、動態、圖片 manifest 與已下載圖片。
- `scripts/scrape_matters_freewrite.mjs`  
  原始擷取腳本，供日後重新抓取或比對資料。
- `docs/handoff-plan.md`  
  交接方案，說明目前進度、資料來源、風險與下一步。
- `docs/claude-code-prompt.md`  
  可直接貼給 Claude Code 的完整後續作業 prompt。

## 本機開發

```bash
npm install
npm run dev
```

開發伺服器啟動後，打開 `/seven-day-book/` 檢查頁面。

## 驗證狀態

- Prettier 檢查已通過。
- 12 個遠端圖片素材 URL 已確認回 200。
- Matters 文章與標籤連結用一般瀏覽器 User-Agent 抽查可開啟。
- 原工作環境執行 Astro CLI 時曾出現 `ECANCELED: operation canceled, read` 或 import 卡住，接手者需在乾淨環境重新跑 `npm run check` 與 `npm run build`。

## 重要提醒

- 數字必須保留來源與日期，不要把各期加總參與人次寫成不重複人數。
- 主 CTA 應維持為合作洽談，讀者導流是第二層。
- 視覺系統正在另行建立，本 repo 先以內容架構和可執行頁面骨架為主。
