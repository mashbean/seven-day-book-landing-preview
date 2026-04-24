# Matters 七日書 Landing Page

B2B 導向的 Matters 七日書 landing，面向文化機構、贊助企業、公共單位，呈現成果、流程與合作方式。

- **框架**：Astro 5（static）
- **部署目標**：GitHub Pages，之後掛載到 `matters.town` 子網域
- **Palette**：Freewrite（`#F0F9FE` / `#1999D0` / `#045898` / `#83BAD1`），依 2026-04-24 PM 決議，主 CTA / 主文字用 `#045898` 以通過 WCAG AAA
- **字體**：Noto Serif TC（reading / 標題）+ PingFang TC（UI / 內文）

## Repo 結構

```
src/
  pages/
    index.astro         ← Landing 主頁（整頁 inline，待後續抽元件）
    404.astro
  layouts/BaseLayout.astro
  components/BaseHead.astro
  data/seven-day-book.ts  ← 單一內容設定檔（數據 / 主題 / 合作案例 / 標籤 / CTA）
  styles/base.css         ← 全站 tokens + reset
  site.config.ts
.github/workflows/deploy.yml  ← GH Pages 自動部署
research/                 ← @freewrite 擷取資料
scripts/                  ← 原始擷取腳本
docs/                     ← Handoff plan / Claude prompt
```

## 本機開發

```bash
npm install
npm run dev        # http://localhost:4321
npm run build
npm run check
```

## 部署

推到 `main` 會自動透過 `.github/workflows/deploy.yml` build + publish 到 GitHub Pages。

**環境變數（GitHub repo vars）**：

| Var | 預設 | 用途 |
| --- | --- | --- |
| `SITE_URL` | `https://thematters.github.io` | canonical / og url |
| `BASE_PATH` | `/` | 如部署到 `/seven-day-book/` 子路徑時改這個 |

掛到 `matters.town` 子網域時：
1. 在 Matters DNS 設 CNAME 指向 `thematters.github.io`
2. 在 repo Settings → Pages → Custom domain 填子網域
3. `public/CNAME` 會由 GitHub Pages 流程自動處理

## 驗證狀態（2026-04-24）

- ✅ `npm run build` — 2 pages built
- ✅ `npm run check` — 0 errors / 0 warnings
- 12 個遠端圖片素材 URL 先前確認回 200
- Freewrite palette option A 已套用（主 CTA `#045898`）

## 重要提醒

- 數字必須保留來源與日期，**不要**把各期加總參與人次寫成不重複人數
- 主 CTA 是「洽談合作」，讀者導流（閱讀作品）為第二層
- 後續若要把 monolithic `index.astro` 拆成 8 個元件，請建立 `src/components/sevenDay/{Hero,Metrics,Workflow,ThemeMap,PublicMeaning,CaseStudy,TagLinks,ContactCta}.astro`
