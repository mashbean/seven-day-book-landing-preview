# 下一步建議

2026-04-24 session 結束時的待辦。按緊急度分三層。

---

## P0 · 正式化前必做

### 1. Matters 正式上線前核對

- [ ] **PM 審頁面文案**——特別是 hero headline、7 天 prompt 示意、FAQ 第 5 題（合作邀請）的語氣是否符合 Matters 官方口吻
- [ ] **@freewrite 編輯審六段節錄**——確認引用（司陶、Jules Vela、內角和、裕美抹茶、锡德不在此、'' 空瓦）的作者同意把該段文字在 landing 公開引用
- [ ] **數字再次核對**：280+ / 189 / 3,000+ / 9,000+ / 800 萬字 對齊 2026-04 當下最新公告；若要常規更新，考慮把數字外部化為 `public/data/stats.json` 讓運營自己改
- [ ] **大滿貫 SVG 授權確認**：徽章 SVG 取自 matters.town，確認是 Matters 自家設計、無第三方 licensing 問題

### 2. 域名 & 部署目標

- [ ] 決定正式域名：`landing.matters.town` / `seven.matters.town` / `writing.matters.town`？
- [ ] 決定部署 host：繼續 GitHub Pages、改 Vercel、改 Cloudflare Pages、或進 `matters-web` 主 repo 作為子路由？
- [ ] 若進 matters-web：把 Astro 輸出的靜態 HTML 搬到 Next.js public/，或改寫為 React 元件

### 3. OG image

- [ ] 目前 `<meta og:image>` 沒值，社群分享時沒預覽圖。生成一張 1200×630 OG（可手工設計，或復用 `hero.heroCover` 加 overlay）並放 `public/images/og-cover.png`

---

## P1 · 品質加強

### 資料與內容

- [ ] **events 資料動態化**：目前寫死在 `src/data/seven-day-book.ts`；若 Matters 有 GraphQL endpoint 可查 WritingChallenge 列表，build 時 fetch 進來會讓 landing 自動跟進最新一期
- [ ] **avatars 自動輪替**：目前 30 位是寫死的名單。可改為 build 時從 @freewrite 最近 3 期參與者隨機抽樣
- [ ] **voices 節錄擴充**：目前只 6 段、都從 2026 Q1 三期抽。可擴到 12 段跨更多期別 / 作者
- [ ] **新增 partners 案例**：目前只「兩廳院 · 給自己的情書」一筆，理想狀況是 2–3 個

### 元件化（程式結構）

目前 `index.astro` 是 monolithic inline（~450 行 markup + ~900 行 CSS）。若日後要維護：

- [ ] 拆成 `src/components/sevenDay/` 下的 8 個 sub-component：
  - `SdbHero.astro`
  - `SdbPulse.astro`
  - `SdbCadence.astro`（7-day chips）
  - `SdbTimeline.astro`（12 events zigzag）
  - `SdbVoices.astro`
  - `SdbGallery.astro`
  - `SdbPassport.astro`
  - `SdbPartners.astro`
- [ ] 每個元件的 `<style>` 拉到對應 `.css` module 或 `global.css` 的 scoped block
- [ ] 這件事**不急**——只在之後要多頁面 reuse 或其他人進來維護時做

### 可及性 & 效能

- [ ] **Lighthouse 跑過**：目前沒實測，先跑一次 a11y / perf / best-practices / SEO 四項
- [ ] **圖片 preload**：hero `campaignCover` 是 1920×1080 PNG，可考慮加 `<link rel="preload" as="image">` 或改 webp
- [ ] **contrast 二次檢查**：雖然 option A 已經選 AAA，但 hero 白字在漸變深色 bg 上、以及 voice card 引號符號的對比度實際上還沒用工具量過
- [ ] **keyboard nav**：topbar nav 可 tab、avatars 可 tab、7-day chips 目前不是可 focus 的 button（`<li>`），考慮視需求改
- [ ] **reduced-motion**：已加 `@media (prefers-reduced-motion: reduce)`，但 marquee / pulse / float / ray-burst 的替代靜態狀態還沒針對性微調

### 響應式

- [ ] iPhone SE / 小螢幕實測 hero headline（3 行可能太擠）
- [ ] 測 tablet landscape（timeline 在 ~768–900px 時 zigzag 可能重疊）
- [ ] 超寬螢幕（>1440px）目前 `.section` max-width 1120px 還算舒適，但 hero 可能顯得太小

---

## P2 · 若還有心力

### 設計擴充

- [ ] **互動敘事元素**：hero 可加 parallax、可加 cursor-based highlight
- [ ] **七天形狀的 day chips 可以更遊戲化**：例如「抽一天看看」按鈕隨機展示一個 prompt、「偷看第七天」hover 會暫時揭露被 blur 的題目
- [ ] **Voice card 可加手繪便利貼樣式**：用 CSS rotate / drop-shadow 做成手記感
- [ ] **Passport 徽章改互動 mint**：連到 Matters 的鏈上憑證 mint flow，做成活 CTA 而非只是裝飾

### 資料建設

- [ ] **統計 dashboard**：把 280+ / 189 / 9,000+ 這些數字做成一個可更新的 dashboard（可能整合 @freewrite Apollo client），運營自行改
- [ ] **內容管理介面**：讓運營不透過 git 也能改 headline / stats / voices
- [ ] **多語言**：若有英文讀者，做一版 EN

### 品牌線

- [ ] 與 Matters 設計團隊對齊 wordmark 用色（目前 topbar 用 ink 深色、footer 用 muted）
- [ ] 檢查 Brand Guidelines PDF 的 clear-space / minimum-size 規則是否符合
- [ ] 討論 lime pulse dot 作為品牌記號的露出密度是否妥當

---

## 已完成（過去 24 小時）

- 清理 blog fork cruft（15+ 檔）
- Freewrite palette option A 全域落地
- 12 期真實 events + 30 頭像 + 6 引文
- Hero full-bleed + 3 行 title
- 7-day chips 三階段 (open/dim/locked)
- 12 期 zigzag timeline
- Visual memory mosaic gallery
- 大滿貫 shield SVG + 漂浮動畫
- Matters wordmark 內嵌 + favicon 置換
- GitHub Pages deploy pipeline
- 建議 merge 路徑文件（本檔）

---

## 問一下 PM / GM

1. Landing 掛哪個網域？要不要搶在某個 launch 節點？
2. B2B 合作案例有更多想秀的嗎（例如最近跟誰談過）？
3. 主 CTA 要更偏「洽談合作」（B2B）還是「加入下期」（社群）？目前並陳。
4. 大滿貫徽章 SVG 的授權？
5. 這頁之後誰維護？需不需要 CMS？
