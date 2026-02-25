# UI/UXリデザイン実装計画 — Markdown記事ベースへの移行

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 3層JSON + 3カラムレイアウトを、Markdownファイル + 2カラムの技術ブログ風UIに移行する

**Architecture:** `content/カテゴリ/*.md` ファイルを Vite の `import.meta.glob` で文字列読み込みし、`gray-matter` + `marked` でランタイムパース。Vue 3 コンポーネントを 10個 → 3個 に集約し、2カラムレイアウトに変更。

**Tech Stack:** Vue 3, Vite, gray-matter, marked

---

### Task 1: 依存パッケージのインストール

**Files:**
- Modify: `app/package.json`

**Step 1: gray-matter と marked をインストール**

```bash
cd app && npm install gray-matter marked
```

**Step 2: インストール確認**

```bash
cd app && node -e "const m = require('gray-matter'); const { marked } = require('marked'); console.log('OK')"
```

Expected: `OK` が出力される

**Step 3: コミット**

```bash
git add app/package.json app/package-lock.json
git commit -m "chore: gray-matter と marked を追加"
```

---

### Task 2: JSON → Markdown 変換スクリプトの作成

**Files:**
- Create: `scripts/migrate-to-markdown.js`

**Step 1: スクリプトを作成**

移行対象のJSONファイル:
- `data/foundations.json` — 2 topics, 4 concepts, 15 terms
- `data/architectures.json` — 2 topics, 3 concepts, 5 terms
- `data/ai-development.json` — 5 topics, 2 concepts, 30+ terms
- `data/ai-agents.json` — 0 topics, 25 terms (用語のみ)

変換ルール:
1. 各カテゴリの `topics` を個別の `.md` ファイルに変換
2. `article.sections` の `heading` → `## 見出し`、`body` → 本文
3. インラインリンク `[[term-id|text]]` → `[[text]]` (Wikilink形式)
4. frontmatter: `title`, `tags`, `created`, `updated`
5. 各カテゴリに `_category.yml` を生成
6. `terms` の情報は各トピック記事の末尾に「用語集」セクションとして統合
7. 出力先: `content/カテゴリスラッグ/`

カテゴリのスラッグマッピング:
- `foundations` → `ai-basics`
- `architectures` → `model-architecture`
- `ai-development` → `ai-development`
- `ai-agents` → `ai-agents`

```javascript
// scripts/migrate-to-markdown.js
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_DIR = join(ROOT, 'data')
const CONTENT_DIR = join(ROOT, 'content')

const CATEGORY_MAP = {
  foundations: { slug: 'ai-basics', name: 'AI基礎' },
  architectures: { slug: 'model-architecture', name: 'モデルアーキテクチャ' },
  'ai-development': { slug: 'ai-development', name: 'AI開発活用' },
  'ai-agents': { slug: 'ai-agents', name: 'AIエージェント' }
}

// [[term-id|表示テキスト]] → [[表示テキスト]] に変換
function convertInlineLinks(body) {
  return body.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, _id, text) => `[[${text}]]`)
}

function topicToMarkdown(topic, terms, concepts) {
  const lines = []

  // Frontmatter
  const tags = new Set()
  if (topic.article?.sections) {
    for (const sec of topic.article.sections) {
      for (const ref of (sec.termRefs || [])) {
        const term = terms.find(t => t.id === ref)
        if (term?.tags) term.tags.forEach(t => tags.add(t))
      }
    }
  }

  lines.push('---')
  lines.push(`title: "${topic.termJa || topic.term}"`)
  if (tags.size > 0) {
    lines.push(`tags: [${[...tags].join(', ')}]`)
  }
  lines.push(`created: 2026-02-25`)
  lines.push(`updated: 2026-02-25`)
  lines.push('---')
  lines.push('')

  // 記事本文
  if (topic.article?.sections) {
    for (const section of topic.article.sections) {
      lines.push(`## ${section.heading}`)
      lines.push('')
      lines.push(convertInlineLinks(section.body))
      lines.push('')
    }
  } else if (topic.meaning) {
    lines.push(convertInlineLinks(topic.meaning))
    lines.push('')
  }

  // 関連用語セクション
  const relatedTerms = []
  if (topic.article?.sections) {
    const refIds = new Set()
    for (const sec of topic.article.sections) {
      for (const ref of (sec.termRefs || [])) refIds.add(ref)
    }
    for (const id of refIds) {
      const term = terms.find(t => t.id === id)
      if (term) relatedTerms.push(term)
    }
  }

  if (relatedTerms.length > 0) {
    lines.push('## 用語')
    lines.push('')
    for (const term of relatedTerms) {
      const name = term.termJa ? `${term.term}（${term.termJa}）` : term.term
      lines.push(`- **${name}**: ${term.meaning}`)
    }
    lines.push('')
  }

  // ソースURL
  if (topic.sourceUrl) {
    lines.push('## 参考')
    lines.push('')
    lines.push(`- [${topic.sourceUrl}](${topic.sourceUrl})`)
    lines.push('')
  }

  return lines.join('\n')
}

function topicToSlug(topic) {
  // termJa があればそれをスラッグ化、なければ term を使う
  const base = topic.term.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base || topic.id
}

function migrate() {
  for (const [jsonKey, catConfig] of Object.entries(CATEGORY_MAP)) {
    const jsonPath = join(DATA_DIR, `${jsonKey}.json`)
    if (!existsSync(jsonPath)) {
      console.log(`Skip: ${jsonPath} not found`)
      continue
    }

    const data = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    const outDir = join(CONTENT_DIR, catConfig.slug)
    mkdirSync(outDir, { recursive: true })

    // _category.yml
    const order = Object.keys(CATEGORY_MAP).indexOf(jsonKey) + 1
    writeFileSync(
      join(outDir, '_category.yml'),
      `name: "${catConfig.name}"\norder: ${order}\n`
    )

    const topics = data.topics || []
    const terms = data.terms || []
    const concepts = data.concepts || []

    if (topics.length === 0) {
      console.log(`Skip: ${jsonKey} has no topics`)
      continue
    }

    for (const topic of topics) {
      const slug = topicToSlug(topic)
      const md = topicToMarkdown(topic, terms, concepts)
      const filePath = join(outDir, `${slug}.md`)
      writeFileSync(filePath, md)
      console.log(`Created: ${filePath}`)
    }
  }
  console.log('Migration complete!')
}

migrate()
```

**Step 2: スクリプトを実行**

```bash
node scripts/migrate-to-markdown.js
```

Expected: `content/` ディレクトリに `.md` ファイルと `_category.yml` が生成される

**Step 3: 生成結果を確認**

```bash
find content -type f | head -20
```

Expected: カテゴリフォルダごとに Markdown ファイルが存在する

**Step 4: 生成された Markdown の内容を確認**

生成ファイルを数個読んで、frontmatter・見出し・本文・用語セクションが正しく変換されているか確認する。

**Step 5: コミット**

```bash
git add scripts/migrate-to-markdown.js content/
git commit -m "feat: JSON→Markdown変換スクリプトを作成し、既存データを移行"
```

---

### Task 3: vite.config.js の更新

**Files:**
- Modify: `app/vite.config.js`

**Step 1: `@content` エイリアスを追加**

現在の設定 (`app/vite.config.js`):
```javascript
resolve: {
  alias: {
    '@data': resolve(__dirname, '../data')
  }
}
```

変更後:
```javascript
resolve: {
  alias: {
    '@data': resolve(__dirname, '../data'),
    '@content': resolve(__dirname, '../content')
  }
}
```

**Step 2: dev サーバーが起動することを確認**

```bash
cd app && npm run dev
```

Expected: エラーなしで起動する

**Step 3: コミット**

```bash
git add app/vite.config.js
git commit -m "chore: vite.config に @content エイリアスを追加"
```

---

### Task 4: useArticles composable の作成

**Files:**
- Create: `app/src/composables/useArticles.js`

**Step 1: composable を作成**

```javascript
// app/src/composables/useArticles.js
import { ref, computed } from 'vue'
import matter from 'gray-matter'
import { marked } from 'marked'

// content/**/*.md を文字列として一括読み込み
const mdModules = import.meta.glob('/content/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
})

// _category.yml を読み込み
const categoryModules = import.meta.glob('/content/**/_category.yml', {
  eager: true,
  query: '?raw',
  import: 'default'
})

// [[表示テキスト]] Wikilink をクリック可能なリンクに変換する marked 拡張
function createWikilinkExtension(articles) {
  return {
    extensions: [{
      name: 'wikilink',
      level: 'inline',
      start(src) { return src.indexOf('[[') },
      tokenizer(src) {
        const match = src.match(/^\[\[([^\]]+)\]\]/)
        if (match) {
          return {
            type: 'wikilink',
            raw: match[0],
            text: match[1]
          }
        }
      },
      renderer(token) {
        // 表示テキストから記事を検索（タイトル一致）
        const article = articles.find(a =>
          a.title === token.text ||
          a.title.includes(token.text) ||
          token.text.includes(a.title)
        )
        if (article) {
          return `<a href="#" class="wikilink" data-slug="${article.slug}">${token.text}</a>`
        }
        return `<span class="wikilink-unresolved">${token.text}</span>`
      }
    }]
  }
}

function parseCategory(raw) {
  const lines = raw.trim().split('\n')
  const result = {}
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*"?([^"]*)"?$/)
    if (match) {
      const [, key, value] = match
      result[key] = isNaN(value) ? value : Number(value)
    }
  }
  return result
}

export function useArticles() {
  // カテゴリ情報をパース
  const categories = {}
  for (const [path, raw] of Object.entries(categoryModules)) {
    const catSlug = path.match(/\/content\/([^/]+)\//)?.[1]
    if (catSlug) {
      categories[catSlug] = parseCategory(raw)
    }
  }

  // 記事をパース
  const articleList = []
  for (const [path, raw] of Object.entries(mdModules)) {
    const slug = path.match(/\/([^/]+)\.md$/)?.[1]
    const category = path.match(/\/content\/([^/]+)\//)?.[1]
    if (!slug || !category) continue

    const { data: frontmatter, content } = matter(raw)
    articleList.push({
      slug,
      category,
      title: frontmatter.title || slug,
      tags: frontmatter.tags || [],
      created: frontmatter.created || null,
      updated: frontmatter.updated || null,
      rawContent: content
    })
  }

  // marked インスタンスを設定（Wikilink対応）
  const markedInstance = new marked.Marked()
  markedInstance.use(createWikilinkExtension(articleList))

  // HTML を生成
  for (const article of articleList) {
    article.html = markedInstance.parse(article.rawContent)
  }

  // カテゴリ順でソート
  const sortedCategories = computed(() => {
    return Object.entries(categories)
      .sort(([, a], [, b]) => (a.order || 99) - (b.order || 99))
      .map(([slug, meta]) => ({ slug, ...meta }))
  })

  // カテゴリ別記事マップ
  const articlesByCategory = computed(() => {
    const map = {}
    for (const cat of sortedCategories.value) {
      map[cat.slug] = articleList
        .filter(a => a.category === cat.slug)
        .sort((a, b) => (a.title > b.title ? 1 : -1))
    }
    return map
  })

  // 全タグ一覧
  const allTags = computed(() => {
    const tags = new Set()
    for (const a of articleList) {
      for (const t of a.tags) tags.add(t)
    }
    return [...tags].sort()
  })

  // 記事検索
  function searchArticles(query) {
    if (!query) return articleList
    const q = query.toLowerCase()
    return articleList.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.rawContent.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  // スラッグで記事を取得
  function getArticle(slug) {
    return articleList.find(a => a.slug === slug) || null
  }

  return {
    articles: articleList,
    categories: sortedCategories,
    articlesByCategory,
    allTags,
    searchArticles,
    getArticle
  }
}
```

**Step 2: dev サーバーで import エラーがないことを確認**

まだ App.vue から使っていないので、一旦 `main.js` に仮import して確認:

```bash
cd app && npm run dev
```

Expected: ビルドエラーなし

**Step 3: コミット**

```bash
git add app/src/composables/useArticles.js
git commit -m "feat: useArticles composable を作成（Markdown読み込み・パース）"
```

---

### Task 5: Sidebar コンポーネントの作成

**Files:**
- Create: `app/src/components/Sidebar.vue`

**Step 1: コンポーネントを作成**

TreeSidebar.vue + TreeNode.vue の機能を1コンポーネントに集約。
カテゴリ → 記事一覧のフラットなリスト。検索ボックス付き。

```vue
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  articlesByCategory: { type: Object, default: () => ({}) },
  selectedSlug: { type: String, default: '' }
})

const emit = defineEmits(['select'])

const searchQuery = ref('')
const expandedCategories = ref(new Set())

// 初期状態で全カテゴリを展開
if (props.categories.length > 0) {
  props.categories.forEach(c => expandedCategories.value.add(c.slug))
}

const filteredArticles = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return props.articlesByCategory

  const result = {}
  for (const [catSlug, articles] of Object.entries(props.articlesByCategory)) {
    const filtered = articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    )
    if (filtered.length > 0) result[catSlug] = filtered
  }
  return result
})

function toggleCategory(slug) {
  if (expandedCategories.value.has(slug)) {
    expandedCategories.value.delete(slug)
  } else {
    expandedCategories.value.add(slug)
  }
}

function selectArticle(slug) {
  emit('select', slug)
}

function getCategoryName(slug) {
  const cat = props.categories.find(c => c.slug === slug)
  return cat?.name || slug
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>AI Knowledge Note</h2>
    </div>

    <div class="sidebar-search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="記事を検索..."
        class="search-input"
      />
    </div>

    <nav class="sidebar-nav">
      <template v-for="cat in categories" :key="cat.slug">
        <div
          v-if="filteredArticles[cat.slug]?.length"
          class="category-group"
        >
          <button
            class="category-header"
            @click="toggleCategory(cat.slug)"
          >
            <span class="category-arrow" :class="{ expanded: expandedCategories.has(cat.slug) }">
              ▶
            </span>
            {{ cat.name }}
            <span class="category-count">{{ filteredArticles[cat.slug]?.length || 0 }}</span>
          </button>

          <ul v-if="expandedCategories.has(cat.slug)" class="article-list">
            <li
              v-for="article in filteredArticles[cat.slug]"
              :key="article.slug"
              class="article-item"
              :class="{ selected: article.slug === selectedSlug }"
              @click="selectArticle(article.slug)"
            >
              {{ article.title }}
            </li>
          </ul>
        </div>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background: #fafafa;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px 16px 8px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: #6a1b9a;
  margin: 0;
}

.sidebar-search {
  padding: 8px 16px;
}

.search-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
}

.search-input:focus {
  border-color: #6a1b9a;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: #6a1b9a;
  text-align: left;
}

.category-header:hover {
  background: #f0f0f0;
}

.category-arrow {
  font-size: 10px;
  transition: transform 0.2s;
  display: inline-block;
}

.category-arrow.expanded {
  transform: rotate(90deg);
}

.category-count {
  margin-left: auto;
  font-size: 11px;
  color: #999;
  font-weight: 400;
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-item {
  padding: 6px 16px 6px 32px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.article-item:hover {
  background: #f0f0f0;
}

.article-item.selected {
  background: #e8e0f0;
  border-left-color: #6a1b9a;
  font-weight: 600;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    z-index: 100;
    transition: left 0.3s;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  }

  .sidebar.open {
    left: 0;
  }
}
</style>
```

**Step 2: コミット**

```bash
git add app/src/components/Sidebar.vue
git commit -m "feat: Sidebar コンポーネントを作成（カテゴリ+記事一覧+検索）"
```

---

### Task 6: ArticlePage コンポーネントの作成

**Files:**
- Create: `app/src/components/ArticlePage.vue`

**Step 1: コンポーネントを作成**

Markdown HTML の表示、タグ表示、関連記事フッター、Wikilinkクリック処理を担当。

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  article: { type: Object, default: null }
})

const emit = defineEmits(['navigate', 'tag-click'])

function handleContentClick(e) {
  // Wikilink クリックの処理
  const link = e.target.closest('.wikilink')
  if (link) {
    e.preventDefault()
    const slug = link.dataset.slug
    if (slug) emit('navigate', slug)
  }
}

const formattedDate = computed(() => {
  if (!props.article?.updated) return ''
  return String(props.article.updated)
})
</script>

<template>
  <main class="article-page">
    <template v-if="article">
      <header class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <div v-if="article.tags.length" class="article-tags">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="tag"
              @click="emit('tag-click', tag)"
            >
              {{ tag }}
            </span>
          </div>
          <span v-if="formattedDate" class="article-date">
            更新: {{ formattedDate }}
          </span>
        </div>
      </header>

      <div
        class="article-content"
        v-html="article.html"
        @click="handleContentClick"
      />
    </template>

    <div v-else class="article-empty">
      <p>左のメニューから記事を選択してください</p>
    </div>
  </main>
</template>

<style scoped>
.article-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}

.article-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.article-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.article-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.tag:hover {
  background: #e0e0e0;
}

.article-date {
  font-size: 12px;
  color: #999;
}

.article-content {
  line-height: 1.8;
  color: #333;
  font-size: 15px;
}

.article-content :deep(h2) {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 32px 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
}

.article-content :deep(h3) {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin: 24px 0 8px;
}

.article-content :deep(p) {
  margin: 0 0 12px;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 0 0 12px;
  padding-left: 24px;
}

.article-content :deep(li) {
  margin-bottom: 4px;
}

.article-content :deep(strong) {
  font-weight: 600;
  color: #1a1a1a;
}

.article-content :deep(code) {
  background: #f5f5f5;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.article-content :deep(pre) {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0 0 12px;
}

.article-content :deep(pre code) {
  background: none;
  padding: 0;
}

.article-content :deep(.wikilink) {
  color: #6a1b9a;
  text-decoration: none;
  border-bottom: 1px dashed #6a1b9a;
  cursor: pointer;
}

.article-content :deep(.wikilink:hover) {
  border-bottom-style: solid;
}

.article-content :deep(.wikilink-unresolved) {
  color: #999;
}

.article-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  color: #999;
}

@media (max-width: 768px) {
  .article-page {
    padding: 16px;
  }

  .article-title {
    font-size: 20px;
  }
}
</style>
```

**Step 2: コミット**

```bash
git add app/src/components/ArticlePage.vue
git commit -m "feat: ArticlePage コンポーネントを作成（Markdown記事表示）"
```

---

### Task 7: App.vue の書き換え

**Files:**
- Modify: `app/src/App.vue` (295行 → 約100行に縮小)

**Step 1: App.vue を新しい2カラムレイアウトに書き換え**

既存の App.vue (295行) を完全に置き換える。

```vue
<script setup>
import { ref, computed, watch } from 'vue'
import Sidebar from './components/Sidebar.vue'
import ArticlePage from './components/ArticlePage.vue'
import { useArticles } from './composables/useArticles.js'

const { articles, categories, articlesByCategory, searchArticles, getArticle } = useArticles()

const selectedSlug = ref(null)
const sidebarOpen = ref(false)

// 初期表示: 最初のカテゴリの最初の記事を選択
const firstCat = categories.value[0]
if (firstCat) {
  const firstArticles = articlesByCategory.value[firstCat.slug]
  if (firstArticles?.length) {
    selectedSlug.value = firstArticles[0].slug
  }
}

const selectedArticle = computed(() => {
  if (!selectedSlug.value) return null
  return getArticle(selectedSlug.value)
})

function handleSelect(slug) {
  selectedSlug.value = slug
  sidebarOpen.value = false
}

function handleNavigate(slug) {
  selectedSlug.value = slug
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleTagClick(tag) {
  // タグクリック時: そのタグを持つ最初の記事に遷移（将来的にフィルタUI追加可）
  const matched = articles.filter(a => a.tags.includes(tag))
  if (matched.length > 0) {
    selectedSlug.value = matched[0].slug
  }
}
</script>

<template>
  <div class="app-layout">
    <!-- Mobile header -->
    <header class="mobile-header">
      <button class="menu-btn" @click="sidebarOpen = !sidebarOpen">☰</button>
      <span class="mobile-title">AI Knowledge Note</span>
    </header>

    <!-- Sidebar -->
    <Sidebar
      :categories="categories"
      :articles-by-category="articlesByCategory"
      :selected-slug="selectedSlug"
      :class="{ open: sidebarOpen }"
      @select="handleSelect"
    />

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    />

    <!-- Main content -->
    <div class="main-area">
      <ArticlePage
        :article="selectedArticle"
        @navigate="handleNavigate"
        @tag-click="handleTagClick"
      />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #fff;
}

.mobile-header {
  display: none;
}

.main-area {
  flex: 1;
  overflow-y: auto;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 48px;
    padding: 0 16px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    z-index: 50;
  }

  .menu-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
  }

  .mobile-title {
    font-size: 16px;
    font-weight: 700;
    color: #6a1b9a;
  }

  .main-area {
    margin-top: 48px;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 99;
  }
}
</style>
```

**Step 2: dev サーバーで動作確認**

```bash
cd app && npm run dev
```

Expected: 2カラムレイアウトで記事が表示される。サイドバーでカテゴリ別に記事一覧が表示され、クリックで記事が切り替わる。

**Step 3: コミット**

```bash
git add app/src/App.vue
git commit -m "feat: App.vue を2カラムレイアウトに書き換え"
```

---

### Task 8: グローバルスタイルの更新

**Files:**
- Modify: `app/src/assets/style.css`

**Step 1: style.css を更新**

不要になったカードハイライトスタイルを削除し、基本スタイルのみ残す。

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background: #fff;
  color: #333;
  -webkit-font-smoothing: antialiased;
}
```

**Step 2: コミット**

```bash
git add app/src/assets/style.css
git commit -m "style: グローバルスタイルを整理"
```

---

### Task 9: 旧コンポーネントの削除

**Files:**
- Delete: `app/src/components/TabNav.vue`
- Delete: `app/src/components/LearningPathTab.vue`
- Delete: `app/src/components/RoadmapBranch.vue`
- Delete: `app/src/components/RoadmapNode.vue`
- Delete: `app/src/components/TermSidebar.vue`
- Delete: `app/src/components/TermCard.vue`
- Delete: `app/src/components/ArticleView.vue`
- Delete: `app/src/components/ArticleSection.vue`
- Delete: `app/src/components/TreeSidebar.vue`
- Delete: `app/src/components/TreeNode.vue`

**Step 1: 旧コンポーネントを削除**

```bash
rm app/src/components/TabNav.vue \
   app/src/components/LearningPathTab.vue \
   app/src/components/RoadmapBranch.vue \
   app/src/components/RoadmapNode.vue \
   app/src/components/TermSidebar.vue \
   app/src/components/TermCard.vue \
   app/src/components/ArticleView.vue \
   app/src/components/ArticleSection.vue \
   app/src/components/TreeSidebar.vue \
   app/src/components/TreeNode.vue
```

**Step 2: ビルドが通ることを確認**

```bash
cd app && npm run build
```

Expected: エラーなしでビルド成功

**Step 3: コミット**

```bash
git add -A app/src/components/
git commit -m "refactor: 旧コンポーネント10個を削除"
```

---

### Task 10: ビルド・動作確認・最終調整

**Files:**
- Potentially modify: any file for bug fixes

**Step 1: プロダクションビルド**

```bash
cd app && npm run build
```

Expected: `app/dist/` にビルド成果物が生成される

**Step 2: プレビューで動作確認**

```bash
cd app && npm run preview
```

確認項目:
- [ ] サイドバーにカテゴリと記事一覧が表示される
- [ ] 記事をクリックすると本文が表示される
- [ ] Markdown が正しくHTMLに変換されている（見出し、リスト、強調）
- [ ] Wikilink `[[テキスト]]` がクリック可能なリンクとして表示される
- [ ] 検索ボックスで記事がフィルタされる
- [ ] タグが記事ヘッダーに表示される
- [ ] モバイル表示でハンバーガーメニューが動作する

**Step 3: 問題があれば修正してコミット**

```bash
git add -A
git commit -m "fix: UI/UXリデザインの最終調整"
```

---

### Task 11: 旧JSONデータの整理

**Files:**
- Delete or archive: `data/foundations.json`, `data/architectures.json`, `data/ai-development.json`, `data/ai-agents.json`
- Keep: `data/` directory (空のプレースホルダは削除)

**Step 1: 旧データを削除**

Markdown に移行済みなので、旧JSONは不要。

```bash
rm data/foundations.json data/architectures.json data/ai-development.json data/ai-agents.json
rm data/training.json data/applications.json data/tools.json
```

**Step 2: vite.config.js から `@data` エイリアスを削除**

`@data` エイリアスはもう使わないので削除。

**Step 3: ビルドが通ることを確認**

```bash
cd app && npm run build
```

**Step 4: コミット**

```bash
git add -A
git commit -m "refactor: 旧JSONデータと@dataエイリアスを削除"
```

---

## タスク依存関係

```
Task 1 (パッケージ)
  ↓
Task 2 (移行スクリプト + 実行)
  ↓
Task 3 (vite.config)
  ↓
Task 4 (useArticles)
  ↓
Task 5 (Sidebar) ──┐
Task 6 (ArticlePage)┤
                    ↓
Task 7 (App.vue)
  ↓
Task 8 (style.css)
  ↓
Task 9 (旧コンポーネント削除)
  ↓
Task 10 (動作確認・最終調整)
  ↓
Task 11 (旧データ整理)
```

Task 5 と Task 6 は並列実行可能。それ以外は順次実行。
