import { ref, computed } from 'vue'
import matter from 'gray-matter'
import { marked } from 'marked'

// content/**/*.md を文字列として一括読み込み
const mdModules = import.meta.glob('../content/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
})

// _category.yml を読み込み
const categoryModules = import.meta.glob('../content/**/_category.yml', {
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
    const catSlug = path.match(/content\/([^/]+)\//)?.[1]
    if (catSlug) {
      categories[catSlug] = parseCategory(raw)
    }
  }

  // 記事をパース
  const articleList = []
  for (const [path, raw] of Object.entries(mdModules)) {
    const slug = path.match(/\/([^/]+)\.md$/)?.[1]
    const category = path.match(/content\/([^/]+)\//)?.[1]
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
