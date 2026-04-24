import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'

const ENDPOINT = 'https://server.matters.town/graphql'
const SITE_ORIGIN = 'https://matters.town'
const USER_NAME = 'freewrite'
const ROOT = path.resolve('research/matters-seven-day-book/raw/freewrite')

const PROFILE_QUERY = `
  query Profile($userName: String!) {
    user(input: { userName: $userName }) {
      id
      userName
      displayName
      avatar
      liker { civicLiker }
      info {
        description
        profileCover
        ethAddress
        badges { type }
      }
      status {
        state
        articleCount
        momentCount
      }
      followers(input: { first: 0 }) { totalCount }
      following { users(input: { first: 0 }) { totalCount } }
      articles(input: { first: 0 }) { totalCount }
      collections(input: { first: 0 }) { totalCount }
      pinnedWorks {
        __typename
        id
        title
        cover
        pinned
        ... on Article {
          slug
          shortHash
          summary
        }
        ... on Collection {
          articles(input: { first: 0 }) { totalCount }
        }
      }
    }
  }
`

const WRITINGS_QUERY = `
  query Writings($userName: String!, $after: String) {
    user(input: { userName: $userName }) {
      writings(input: { first: 20, after: $after }) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            __typename
            ... on Article {
              id
              createdAt
              articleState: state
              title
              slug
              shortHash
              summary
              displayCover
              cover
              readTime
              wordCount
              tags { content }
              campaigns {
                campaign { __typename id shortHash name }
                stage { __typename id name }
              }
              appreciationsReceived(input: { first: 0 }) { totalCount }
              donations(input: { first: 0 }) { totalCount }
            }
            ... on Moment {
              id
              shortHash
              createdAt
              momentState: state
              content
              likeCount
              commentCount
              assets { path }
            }
          }
        }
      }
    }
  }
`

const ARTICLE_QUERY = `
  query Article($shortHash: String!) {
    article(input: { shortHash: $shortHash }) {
      id
      title
      slug
      shortHash
      createdAt
      state
      summary
      content
      cover
      displayCover
      readTime
      wordCount
      author {
        id
        userName
        displayName
        avatar
      }
      tags { content }
      campaigns {
        campaign { __typename id shortHash name }
        stage { __typename id name }
      }
      appreciationsReceived(input: { first: 0 }) { totalCount }
      donations(input: { first: 0 }) { totalCount }
    }
  }
`

async function graphql(query, variables) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
      'user-agent': 'Codex research scrape for Matters freewrite account',
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = await response.json()
  if (!response.ok || json.errors) {
    const message = JSON.stringify(json.errors || json, null, 2)
    throw new Error(`GraphQL request failed\n${message}`)
  }
  return json.data
}

function decodeEntities(input = '') {
  return input
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
}

function htmlToMarkdown(html = '') {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<img\b[^>]*?\bsrc=["']([^"']+)["'][^>]*>/gi, (_, src) => `\n\n![image](${src})\n\n`)
    .replace(/<a\b[^>]*?\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
      const cleanLabel = stripTags(label).trim() || href
      return `[${cleanLabel}](${href})`
    })
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/blockquote>/gi, '\n\n')
    .replace(/<blockquote[^>]*>/gi, '\n\n> ')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
  text = stripTags(text)
  return decodeEntities(text)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function stripTags(input = '') {
  return input.replace(/<[^>]+>/g, '')
}

function slugify(input = '') {
  return input
    .normalize('NFKD')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90) || 'untitled'
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function extractImageUrls(record) {
  const values = []
  const push = (value) => {
    if (!value || typeof value !== 'string') return
    if (/^https?:\/\//.test(value)) values.push(value)
  }
  push(record.avatar)
  push(record.cover)
  push(record.displayCover)
  push(record.profileCover)
  push(record.author?.avatar)
  if (record.info) push(record.info.profileCover)
  if (Array.isArray(record.assets)) {
    for (const asset of record.assets) push(asset?.path)
  }
  const html = record.content || ''
  for (const match of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)) {
    const url = match[1]
    if (/^https?:\/\/(?:imagedelivery\.net|assets\.matters\.news|assets-next\.mattersprotocol\.io|matters-server-production\.s3)/.test(url)) {
      push(url)
    }
  }
  for (const match of html.matchAll(/https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp)(?:\/public|[^\s"'<>]*)?/gi)) {
    push(match[0])
  }
  return unique(values)
}

function extensionFor(url, contentType = '') {
  const fromUrl = url.match(/\.(png|jpe?g|gif|webp|svg)(?:[/?#]|$)/i)?.[1]
  if (fromUrl) return fromUrl.toLowerCase().replace('jpeg', 'jpg')
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('jpeg')) return 'jpg'
  if (contentType.includes('gif')) return 'gif'
  if (contentType.includes('webp')) return 'webp'
  if (contentType.includes('svg')) return 'svg'
  return 'bin'
}

async function downloadImages(urls, imageDir) {
  const manifest = []
  await mkdir(imageDir, { recursive: true })
  for (const [index, url] of urls.entries()) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        headers: { 'user-agent': 'Codex research scrape for Matters freewrite account' },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const contentType = response.headers.get('content-type') || ''
      const ext = extensionFor(url, contentType)
      const filename = `${String(index + 1).padStart(3, '0')}.${ext}`
      const filePath = path.join(imageDir, filename)
      const arrayBuffer = await response.arrayBuffer()
      await writeFile(filePath, Buffer.from(arrayBuffer))
      manifest.push({ url, file: path.relative(ROOT, filePath), contentType, bytes: arrayBuffer.byteLength })
    } catch (error) {
      manifest.push({ url, error: error.message })
    }
    if ((index + 1) % 10 === 0 || index + 1 === urls.length) {
      console.log(`Downloaded ${index + 1}/${urls.length} image records`)
    }
  }
  return manifest
}

function toArticleMarkdown(article, imageManifestByUrl) {
  const url = `${SITE_ORIGIN}/a/${article.shortHash}`
  const localCover = imageManifestByUrl.get(article.displayCover || article.cover)?.file
  const tags = (article.tags || []).map((tag) => tag.content).join(', ')
  const campaigns = (article.campaigns || []).map((item) => item.campaign?.name).filter(Boolean).join(', ')
  return [
    '---',
    `title: ${JSON.stringify(article.title)}`,
    `createdAt: ${article.createdAt}`,
    `url: ${url}`,
    `shortHash: ${article.shortHash}`,
    `state: ${article.state}`,
    `summary: ${JSON.stringify(article.summary || '')}`,
    `tags: ${JSON.stringify(tags)}`,
    `campaigns: ${JSON.stringify(campaigns)}`,
    `appreciations: ${article.appreciationsReceived?.totalCount ?? 0}`,
    `donations: ${article.donations?.totalCount ?? 0}`,
    `readTime: ${article.readTime ?? ''}`,
    `displayCover: ${article.displayCover || ''}`,
    `localCover: ${localCover || ''}`,
    '---',
    '',
    `# ${article.title}`,
    '',
    article.summary ? `> ${article.summary}` : '',
    '',
    htmlToMarkdown(article.content || ''),
    '',
  ].join('\n')
}

function summarize(profile, writings, articles, imageManifest) {
  const tagCounts = new Map()
  const campaignCounts = new Map()
  let appreciations = 0
  let donations = 0
  for (const article of articles) {
    appreciations += article.appreciationsReceived?.totalCount || 0
    donations += article.donations?.totalCount || 0
    for (const tag of article.tags || []) tagCounts.set(tag.content, (tagCounts.get(tag.content) || 0) + 1)
    for (const campaign of article.campaigns || []) {
      const name = campaign.campaign?.name
      if (name) campaignCounts.set(name, (campaignCounts.get(name) || 0) + 1)
    }
  }
  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])
  const sortedCampaigns = [...campaignCounts.entries()].sort((a, b) => b[1] - a[1])
  const dates = articles.map((article) => article.createdAt).sort()
  const articlesWithCovers = articles.filter((article) => article.displayCover || article.cover).length
  const moments = writings.filter((item) => item.__typename === 'Moment')
  return {
    scrapedAt: new Date().toISOString(),
    source: `${SITE_ORIGIN}/@${USER_NAME}`,
    profile: {
      id: profile.id,
      displayName: profile.displayName,
      userName: profile.userName,
      description: profile.info?.description,
      status: profile.status,
      followers: profile.followers?.totalCount,
      following: profile.following?.users?.totalCount,
      collections: profile.collections?.totalCount,
      pinnedWorks: profile.pinnedWorks?.length || 0,
    },
    counts: {
      writings: writings.length,
      articles: articles.length,
      moments: moments.length,
      imagesFound: imageManifest.length,
      imagesDownloaded: imageManifest.filter((item) => item.file).length,
      articlesWithCovers,
      appreciations,
      donations,
    },
    articleDateRange: {
      first: dates[0],
      latest: dates.at(-1),
    },
    topTags: sortedTags.slice(0, 20).map(([tag, count]) => ({ tag, count })),
    campaigns: sortedCampaigns.map(([campaign, count]) => ({ campaign, count })),
  }
}

async function main() {
  await mkdir(ROOT, { recursive: true })
  await mkdir(path.join(ROOT, 'text', 'articles'), { recursive: true })

  console.log('Fetching profile')
  const profile = (await graphql(PROFILE_QUERY, { userName: USER_NAME })).user
  await writeFile(path.join(ROOT, 'profile.json'), JSON.stringify(profile, null, 2))

  console.log('Fetching writings index')
  const writings = []
  let after = null
  let hasNextPage = true
  while (hasNextPage) {
    const data = await graphql(WRITINGS_QUERY, { userName: USER_NAME, after })
    const connection = data.user.writings
    writings.push(...connection.edges.map((edge) => ({ cursor: edge.cursor, ...edge.node })))
    after = connection.pageInfo.endCursor
    hasNextPage = connection.pageInfo.hasNextPage
    console.log(`Fetched ${writings.length}/${connection.totalCount} writings`)
  }
  await writeFile(path.join(ROOT, 'writings_index.json'), JSON.stringify(writings, null, 2))

  console.log('Fetching full article bodies')
  const articleSummaries = writings.filter((item) => item.__typename === 'Article' && item.shortHash)
  const articles = []
  for (const [index, item] of articleSummaries.entries()) {
    const article = (await graphql(ARTICLE_QUERY, { shortHash: item.shortHash })).article
    articles.push(article)
    console.log(`Fetched article ${index + 1}/${articleSummaries.length}: ${article.shortHash}`)
  }
  await writeFile(path.join(ROOT, 'articles_full.json'), JSON.stringify(articles, null, 2))

  const moments = writings.filter((item) => item.__typename === 'Moment')
  await writeFile(path.join(ROOT, 'moments.json'), JSON.stringify(moments, null, 2))

  const imageUrls = unique([
    ...extractImageUrls(profile),
    ...articles.flatMap(extractImageUrls),
    ...moments.flatMap(extractImageUrls),
  ])
  console.log(`Downloading ${imageUrls.length} images`)
  const imageManifest = await downloadImages(imageUrls, path.join(ROOT, 'assets', 'images'))
  await writeFile(path.join(ROOT, 'assets', 'images_manifest.json'), JSON.stringify(imageManifest, null, 2))
  const imageManifestByUrl = new Map(imageManifest.map((item) => [item.url, item]))

  for (const [index, article] of articles.entries()) {
    const filename = `${String(index + 1).padStart(3, '0')}-${article.shortHash}-${slugify(article.title)}.md`
    await writeFile(path.join(ROOT, 'text', 'articles', filename), toArticleMarkdown(article, imageManifestByUrl))
  }

  const momentsMarkdown = moments.map((moment, index) => [
    `## ${index + 1}. ${moment.createdAt}`,
    '',
    `URL: ${moment.shortHash ? `${SITE_ORIGIN}/m/${moment.shortHash}` : ''}`,
    '',
    htmlToMarkdown(moment.content || ''),
    '',
  ].join('\n')).join('\n')
  await writeFile(path.join(ROOT, 'text', 'moments.md'), momentsMarkdown)

  const summary = summarize(profile, writings, articles, imageManifest)
  await writeFile(path.join(ROOT, 'summary.json'), JSON.stringify(summary, null, 2))
  await writeFile(path.join(ROOT, 'SUMMARY.md'), [
    '# Matters 自由寫官方帳號擷取摘要',
    '',
    `擷取時間: ${summary.scrapedAt}`,
    `來源: ${summary.source}`,
    '',
    '## 帳號',
    '',
    `- 顯示名稱: ${summary.profile.displayName}`,
    `- 帳號: @${summary.profile.userName}`,
    `- 簡介: ${summary.profile.description}`,
    `- 追蹤者: ${summary.profile.followers}`,
    `- 文章: ${summary.profile.status.articleCount}`,
    `- 動態: ${summary.profile.status.momentCount}`,
    '',
    '## 擷取結果',
    '',
    `- writings: ${summary.counts.writings}`,
    `- 完整文章: ${summary.counts.articles}`,
    `- 動態: ${summary.counts.moments}`,
    `- 圖片 URL: ${summary.counts.imagesFound}`,
    `- 成功下載圖片: ${summary.counts.imagesDownloaded}`,
    `- 有封面的文章: ${summary.counts.articlesWithCovers}`,
    `- 總拍手數: ${summary.counts.appreciations}`,
    `- 總贊助次數: ${summary.counts.donations}`,
    `- 文章時間範圍: ${summary.articleDateRange.first} 至 ${summary.articleDateRange.latest}`,
    '',
    '## 熱門標籤',
    '',
    ...summary.topTags.slice(0, 10).map((item) => `- ${item.tag}: ${item.count}`),
    '',
    '## 活動關聯',
    '',
    ...summary.campaigns.map((item) => `- ${item.campaign}: ${item.count}`),
    '',
  ].join('\n'))

  // Read back the summary to make the CLI output useful in one line.
  const saved = JSON.parse(await readFile(path.join(ROOT, 'summary.json'), 'utf8'))
  console.log(JSON.stringify(saved.counts))
  console.log(`Saved to ${ROOT}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
