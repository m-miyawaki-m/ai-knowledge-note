#!/usr/bin/env node
/**
 * コンテンツ品質改善スクリプト
 *
 * 1. ファイル名正規化（found-topic-* プレフィックス除去）
 * 2. 用語重複削除（1用語1定義の原則）
 * 3. タグ正規化（全章→全フェーズ統一、上限8個）
 * 4. updated日付を本日に更新
 * 5. "Structured Outputs" → "Structured Output" 表記統一
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = path.join(__dirname, '..', 'content')
const TODAY = '2026-02-26'

// ─── 1. 用語オーナーシップマップ ────────────────────────────────────
// 各用語のプライマリ定義ファイル（このファイルのみに定義を残す）
const TERM_OWNERS = {
  'AI Agent（AIエージェント）': 'ai-agents/ai-agent-overview.md',
  'Planning（計画（プランニング））': 'ai-agents/ai-agent-architecture.md',
  'Human-in-the-Loop（ヒューマンインザループ）': 'ai-agents/ai-agent-overview.md',
  'Tool Use / Function Calling（ツール呼び出し）': 'ai-agents/ai-agent-architecture.md',
  'LangGraph（LangGraph）': 'ai-agents/ai-agent-overview.md',
  'Agent Memory（エージェントメモリ）': 'ai-agents/ai-agent-architecture.md',
  'Agent Evaluation（エージェント評価）': 'ai-agents/agent-evaluation.md',
  'AgentOps（AgentOps）': 'ai-agents/agent-in-production.md',
  'Guardrails（ガードレール）': 'ai-agents/agent-in-production.md',
  'Agent Architecture Self-Improvement（エージェントの自己改善）': 'ai-agents/ai-agent-architecture.md',
  'Single-Agent Workflow（シングルエージェントワークフロー）': 'ai-agents/ai-agent-architecture.md',
  'Multi-Agent Workflow（マルチエージェントワークフロー）': 'ai-agents/ai-agent-architecture.md',
  'Self-Correction（自己修正）': 'ai-agents/ai-agent-architecture.md',
  'Reflection（リフレクション）': 'ai-agents/ai-agent-architecture.md',
  'Plan-and-Execute（計画実行型）': 'ai-agents/ai-agent-architecture.md',
  'Code Interpreter（コードインタープリタ）': 'ai-agents/development-setup.md',
  'Embedding API（エンベディングAPI）': 'ai-agents/development-setup.md',
  'Prompt Template（プロンプトテンプレート）': 'ai-development/prompt-design-patterns.md',
  'Hallucination（ハルシネーション）': 'ai-development/glossary-driven-development.md',
  'Few-shot Learning（Few-shot学習）': 'ai-development/glossary-driven-development.md',
  'Structured Output（構造化出力）': 'ai-development/glossary-driven-development.md',
  'Context Window（コンテキストウィンドウ）': 'ai-development/context-engineering.md',
  'Context Engineering（コンテキストエンジニアリング）': 'ai-development/context-engineering.md',
  'Knowledge Base（ナレッジベース）': 'ai-development/context-engineering.md',
  'RAG (Retrieval-Augmented Generation)（検索拡張生成）': 'ai-development/glossary-driven-development.md',
  'Grounding（グラウンディング）': 'ai-development/glossary-driven-development.md',
  'Token Limit（トークン制限）': 'ai-development/context-engineering.md',
  'Chain-of-Thought（思考連鎖）': 'ai-development/prompt-design-patterns.md',
  'AI Review（AIレビュー）': 'ai-development/prompt-design-patterns.md',
  'Custom Instructions（カスタム指示）': 'ai-development/rules-custom-instructions.md',
  'Glossary-Driven Development（用語集駆動開発）': 'ai-development/glossary-driven-development.md',
  'Prompt Engineering（プロンプトエンジニアリング）': 'ai-development/requirements-definition-with-ai.md',
  'IDE AI Integration（IDE AI統合）': 'ai-development/vscode-ai-integration.md',
  'AI Code Completion（AIコード補完）': 'ai-development/vscode-ai-integration.md',
  'IDE Chat Interface（IDEチャットインターフェース）': 'ai-development/vscode-ai-integration.md',
  'Continue（Continue拡張機能）': 'ai-development/vscode-continue-extension.md',
  'Inline Suggestion（インライン提案）': 'ai-development/vscode-ai-integration.md',
  'Tab Completion（タブ補完）': 'ai-development/vscode-ai-integration.md',
  'AI Agent in IDE（IDEエージェント）': 'ai-development/vscode-ai-integration.md',
  'AI Debugging（AIデバッグ）': 'ai-development/integration-testing-with-ai.md',
  'Test Case Generation（テストケース生成）': 'ai-development/unit-testing-with-ai.md',
  'Context Provider（コンテキストプロバイダ）': 'ai-development/vscode-continue-extension.md',
  'Code Analysis（コード解析）': 'ai-development/outline-design-with-ai.md',
  'Parameter（パラメータ）': 'ai-basics/found-topic-basic-terms.md',
  // Structured Outputs → Structured Output に統一（後述の置換と連携）
  'Structured Outputs（構造化出力）': 'ai-agents/development-setup.md',
}

// ─── 2. ファイル名変更マップ ────────────────────────────────────────
const FILE_RENAMES = {
  'ai-basics/found-topic-basic-terms.md': 'ai-basics/basic-terms.md',
  'ai-basics/found-topic-learning.md': 'ai-basics/learning.md',
}

// ─── 3. タグ上限数 ──────────────────────────────────────────────────
const MAX_TAGS = 8

// カテゴリごとに優先度の高いタグ（先頭ほど優先）
const TAG_PRIORITY = {
  'ai-agents': ['基礎', '設計', '構成要素', '評価', '運用', '安全性', 'パターン', 'ワークフロー', 'ツール', '実践', 'フレームワーク'],
  'ai-basics': ['基礎', 'nlp', 'モデル', '学習'],
  'ai-development': ['基礎', '実践', '設計', 'プロンプト', '品質', 'ツール', '情報検索', '制約', '情報管理', 'テスト'],
  'model-architecture': ['基礎', 'モデル', 'transformer', 'diffusion', 'attention'],
}

// ─── ヘルパー関数 ────────────────────────────────────────────────────

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return null

  const yamlStr = match[1]
  const body = match[2]
  const data = {}

  for (const line of yamlStr.split('\n')) {
    const kvMatch = line.match(/^(\w+):\s*(.+)$/)
    if (!kvMatch) continue
    const [, key, value] = kvMatch

    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value.slice(1, -1).split(',').map(s => s.trim())
    } else if (value.startsWith('"') && value.endsWith('"')) {
      data[key] = value.slice(1, -1)
    } else {
      data[key] = value
    }
  }

  return { data, body, raw: yamlStr }
}

function buildFrontmatter(data) {
  const lines = ['---']
  if (data.title) lines.push(`title: "${data.title}"`)
  if (data.tags) lines.push(`tags: [${data.tags.join(', ')}]`)
  if (data.created) lines.push(`created: ${data.created}`)
  if (data.updated) lines.push(`updated: ${data.updated}`)
  lines.push('---')
  return lines.join('\n')
}

function extractTermName(line) {
  const match = line.match(/^- \*\*([^*]+)\*\*/)
  return match ? match[1] : null
}

function getRelativePath(filePath) {
  return path.relative(CONTENT_DIR, filePath).replace(/\\/g, '/')
}

// ─── メイン処理 ──────────────────────────────────────────────────────

const stats = {
  filesProcessed: 0,
  termsRemoved: 0,
  tagsNormalized: 0,
  tagsTrimmed: 0,
  filesRenamed: 0,
  datesUpdated: 0,
  structuredOutputsUnified: 0,
}

// 全 .md ファイルを収集
function collectMdFiles(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectMdFiles(full))
    } else if (entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
      files.push(full)
    }
  }
  return files
}

const mdFiles = collectMdFiles(CONTENT_DIR)

console.log(`\n📂 対象ファイル数: ${mdFiles.length}`)
console.log('─'.repeat(60))

for (const filePath of mdFiles) {
  const relPath = getRelativePath(filePath)
  const category = relPath.split('/')[0]
  const raw = fs.readFileSync(filePath, 'utf-8')
  const parsed = parseFrontmatter(raw)

  if (!parsed) {
    console.log(`⚠️  スキップ (frontmatter なし): ${relPath}`)
    continue
  }

  let { data, body } = parsed
  let changed = false

  // ── 3a. タグ正規化: 全章 → 全フェーズ ──
  if (data.tags && data.tags.includes('全章')) {
    data.tags = data.tags.map(t => t === '全章' ? '全フェーズ' : t)
    stats.tagsNormalized++
    changed = true
  }

  // ── 3b. タグ重複除去 & 上限制限 ──
  if (data.tags) {
    const uniqueTags = [...new Set(data.tags)]
    if (uniqueTags.length !== data.tags.length) {
      data.tags = uniqueTags
      changed = true
    }

    if (data.tags.length > MAX_TAGS) {
      const priority = TAG_PRIORITY[category] || []
      // 優先タグを先に、それ以外を後に並べて上限で切る
      const sorted = data.tags.sort((a, b) => {
        const ai = priority.indexOf(a)
        const bi = priority.indexOf(b)
        const pa = ai === -1 ? 999 : ai
        const pb = bi === -1 ? 999 : bi
        return pa - pb
      })
      const before = data.tags.length
      data.tags = sorted.slice(0, MAX_TAGS)
      stats.tagsTrimmed += before - MAX_TAGS
      changed = true
    }
  }

  // ── 4. updated 日付を更新 ──
  if (data.updated !== TODAY) {
    data.updated = TODAY
    stats.datesUpdated++
    changed = true
  }

  // ── 5. "Structured Outputs" → "Structured Output" 表記統一 ──
  if (body.includes('Structured Outputs（構造化出力）')) {
    body = body.replace(/Structured Outputs（構造化出力）/g, 'Structured Output（構造化出力）')
    stats.structuredOutputsUnified++
    changed = true
  }

  // ── 2. 用語重複削除 ──
  // 用語セクションの各行をチェックし、このファイルがオーナーでない用語を除去
  const lines = body.split('\n')
  const newLines = []
  let inTermSection = false
  let removedInThisFile = 0

  for (const line of lines) {
    if (line.startsWith('## 用語')) {
      inTermSection = true
      newLines.push(line)
      continue
    }

    // 用語セクション内の見出し以外の行
    if (inTermSection && line.startsWith('## ')) {
      inTermSection = false
    }

    if (inTermSection && line.startsWith('- **')) {
      const termName = extractTermName(line)
      if (termName && TERM_OWNERS[termName]) {
        const ownerFile = TERM_OWNERS[termName]
        // ファイル名が変更される場合は、変更前の名前で比較
        const currentRelPath = relPath
        const ownerRelPath = ownerFile

        if (currentRelPath !== ownerRelPath) {
          // このファイルはオーナーではないので削除
          removedInThisFile++
          stats.termsRemoved++
          continue
        }
      }
    }

    newLines.push(line)
  }

  if (removedInThisFile > 0) {
    body = newLines.join('\n')
    changed = true
  }

  // ── ファイル書き出し ──
  if (changed) {
    const newContent = buildFrontmatter(data) + '\n' + body
    fs.writeFileSync(filePath, newContent, 'utf-8')
    stats.filesProcessed++

    const changes = []
    if (removedInThisFile > 0) changes.push(`用語-${removedInThisFile}`)
    console.log(`✅ ${relPath}${changes.length ? ' (' + changes.join(', ') + ')' : ''}`)
  }
}

// ── 1. ファイル名変更 ──
console.log('\n' + '─'.repeat(60))
console.log('📝 ファイル名変更:')

for (const [oldRel, newRel] of Object.entries(FILE_RENAMES)) {
  const oldPath = path.join(CONTENT_DIR, oldRel)
  const newPath = path.join(CONTENT_DIR, newRel)

  if (fs.existsSync(oldPath)) {
    // 変更前のファイル名参照を更新済みのオーナーマップと照合する必要はない
    // （ファイルは glob で読み込まれるため、ファイル名変更だけでOK）
    fs.renameSync(oldPath, newPath)
    stats.filesRenamed++
    console.log(`  ${oldRel} → ${newRel}`)
  } else {
    console.log(`  ⚠️ 見つかりません: ${oldRel}`)
  }
}

// ── サマリー ──
console.log('\n' + '═'.repeat(60))
console.log('📊 実行結果サマリー:')
console.log(`  ファイル変更数:     ${stats.filesProcessed}`)
console.log(`  用語削除数:         ${stats.termsRemoved}`)
console.log(`  タグ正規化 (全章→): ${stats.tagsNormalized}`)
console.log(`  タグ削減数:         ${stats.tagsTrimmed}`)
console.log(`  日付更新数:         ${stats.datesUpdated}`)
console.log(`  ファイル名変更数:   ${stats.filesRenamed}`)
console.log(`  表記統一:           ${stats.structuredOutputsUnified}`)
console.log('═'.repeat(60))
