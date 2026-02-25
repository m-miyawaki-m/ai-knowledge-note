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
