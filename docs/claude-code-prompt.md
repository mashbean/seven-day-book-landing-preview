# Claude Code 後續作業 Prompt

你是 Claude Code，請接手 Matters 七日書 Landing Page 的後續工程與內容整理。請先完整閱讀本 repo，再開始改動。回覆請使用台灣繁體中文。

## 專案背景

Matters 要為「七日書」建立 Landing Page。首要受眾是潛在合作機構、贊助企業、公共文化機構。讀者參與與作品閱讀是第二層導流。這一輪不需要重新發想視覺系統，因為 Matters 的設計系統正在另行建立。你的任務是讓目前的內容藍圖與靜態頁面成為可驗證、可接設計、可進入正式工程流程的版本。

## 目前 repo 結構

- `src/pages/seven-day-book.astro`  
  Landing Page 初版，路由為 `/seven-day-book/`。
- `src/data/seven-day-book.ts`  
  頁面內容設定檔，集中管理數據、主題、合作案例、標籤、文章連結與 CTA。
- `research/freewrite/`  
  已擷取的 Matters 官方帳號資料，包含文章、動態、圖片與摘要。
- `scripts/scrape_matters_freewrite.mjs`  
  原始擷取腳本。
- `docs/handoff-plan.md`  
  交接方案與內容策略。

## 你的主要目標

1. 讓專案可以在乾淨環境順利通過檢查與建置。
2. 核對 Landing Page 中所有核心數據與來源。
3. 將頁面結構調整成更適合後續套入 Matters 視覺系統的形狀。
4. 保持合作洽談為主 CTA，讀者作品導流為副 CTA。
5. 交付清楚的後續工程清單，讓設計與正式上線流程可以接續。

## 請先執行的檢查

```bash
npm install
npm run check
npm run build
```

如果檢查或建置失敗，請先修正專案本身的問題。原工作環境曾遇到 Astro CLI 出現 `ECANCELED: operation canceled, read` 或 import 卡住，因此請判斷這是環境問題還是程式碼問題。修正後請再次執行檢查與建置。

## 內容驗證規則

請逐項核對以下內容。

- `19 個月`
- `133 道題目`
- `3000 多位文友`
- `近 9000 篇故事`
- `八百萬字生命書寫`
- `近 500 位朋友參與`
- `93 篇文章`
- `11 則動態`
- `185 張圖片`
- `官方帳號追蹤者 509`
- `總拍手 2360`
- `總贊助 132`

主要來源是 Matters 官方文章 `七日書總結回顧`，日期為 2026-01-05，連結為 `https://matters.town/a/fmsotswq9g6b`。本地資料來源在 `research/freewrite/summary.json`、`research/freewrite/SUMMARY.md`、`research/freewrite/articles_full.json`、`research/freewrite/writings_index.json`、`research/freewrite/profile.json`。

重要限制是，3009 參與人次是各期完結報告加總，不能寫成不重複人數。拍手、贊助、追蹤者也不能寫成平台總使用者數。

## 頁面策略

首屏必須在 5 秒內說清楚。

- 七日書是 Matters 發起的連續七日自由書寫計畫。
- 它已累積可被衡量的參與規模與生命書寫成果。
- 它適合成為機構或企業投入公共議題的文化合作載體。

主要 CTA 使用「洽談合作」。副 CTA 使用「閱讀七日書作品」或「加入下一期七日書」。全頁 CTA 層級要一致，不要讓讀者導流搶過合作洽談。

## 建議工作順序

1. 專案健康檢查  
   修正 `npm run check` 與 `npm run build`。若發現原 repo 帶有無關頁面、報告或部署設定，請評估是否要移除或隔離，但不要破壞 `/seven-day-book/`。

2. 資料來源核對  
   逐一檢查 `src/data/seven-day-book.ts` 的 metrics、caseStudy、accountMetrics、themes。每個會被公開展示的數字都要有來源、日期或本地檔案證據。

3. 頁面結構整理  
   將頁面拆成更容易維護的 Astro component，建議至少拆出 `Hero`、`Metrics`、`Workflow`、`ThemeMap`、`PublicMeaning`、`CaseStudy`、`TagLinks`、`ContactCta`。資料仍由 `src/data/seven-day-book.ts` 提供。

4. 文案調整  
   強化合作機構與贊助企業能理解的語言。避免過度抽象、避免誇大效果、避免把活動說成已證明所有公共影響。保留「私人日記轉化為集體生命檔案」這條主軸。

5. 連結驗證  
   確認每個 Matters 文章連結、標籤連結與圖片連結可開啟。若程式化 request 回 403，請用瀏覽器或 User-Agent 抽查，不要直接判定連結壞掉。

6. 響應式驗證  
   使用瀏覽器檢查 desktop、tablet、mobile。重點是文字不重疊、CTA 層級清楚、圖片不爆版、長標題換行自然、資料來源註記可讀。

7. 接設計系統準備  
   不要自行重做完整視覺系統。請將目前樣式整理成容易替換 token 的形式，並標出後續應接入 Matters design system 的地方。

## 驗收標準

- `npm run check` 通過。
- `npm run build` 通過。
- `/seven-day-book/` 可以在本機打開。
- 每個核心數字都有來源註記。
- 主 CTA 全頁一致指向合作洽談。
- 每個主題卡至少有一篇來源文章。
- 標籤導流可用，包含七日書、自由寫、馬特市自由寫、給自己的情書、兩廳院藝術出走。
- 頁面沒有把參與人次、不重複人數、拍手、贊助或追蹤者混用。

## 請避免

- 不要新增後端 API，除非 Matters 明確決定表單系統。
- 不要把現有素材改成未授權圖片。
- 不要把合作案例寫成超出公開文章證據的承諾。
- 不要讓「閱讀作品」變成主要 CTA。
- 不要在未確認部署策略前新增 GitHub Pages workflow 或 CNAME。

## 交付格式

完成後請提供。

- 修改檔案清單
- 已通過的指令與結果
- 尚未解決的問題
- 上線前必須由 Matters 確認的內容或授權事項
