# AI開発活用カテゴリ 設計書

## 概要

ソフトウェア開発の各フェーズ（要件定義〜結合テスト）でAIをどう活用するかを解説する新カテゴリ「AI開発活用」を追加する。概念・考え方中心で、特定ツールに依存しない内容とする。

## 設計方針

| 項目 | 決定 |
|------|------|
| カテゴリ名 | `ai-development`（AI開発活用） |
| 記事数 | 6記事（フェーズごとに1 Topic） |
| 記事の焦点 | 概念・考え方中心（ツール非依存） |
| 用語 | AI技術用語（15〜20個） |
| データ配置 | `data/ai-development.json` を新規作成 |

## フェーズ構成

| # | Topic | 記事で扱う内容 |
|---|---|---|
| 1 | 要件定義でのAI活用 | 要件の抽出・整理支援、矛盾・曖昧さの検出 |
| 2 | 基本設計でのAI活用 | アーキテクチャ設計支援、技術選定の比較検討 |
| 3 | 概要設計でのAI活用 | モジュール分割・IF設計、既存コードベースの理解 |
| 4 | 詳細設計でのAI活用 | クラス設計・ロジック設計、擬似コード生成 |
| 5 | 単体テストでのAI活用 | テストケース自動生成、境界値分析、カバレッジ向上 |
| 6 | 結合テストでのAI活用 | シナリオベーステスト、回帰テスト効率化 |

## 用語一覧（予定）

| 用語 | ID | type | 登場フェーズ |
|---|---|---|---|
| Prompt Engineering | aidev-term-prompt-engineering | technique | 全フェーズ |
| RAG | aidev-term-rag | technique | 基本設計、概要設計 |
| Code Generation | aidev-term-code-generation | technique | 詳細設計、単体テスト |
| AI Review | aidev-term-ai-review | technique | 概要設計、詳細設計、テスト |
| Test Case Generation | aidev-term-test-case-generation | technique | 単体テスト、結合テスト |
| Natural Language Processing | aidev-term-nlp | theory | 要件定義 |
| Few-shot Learning | aidev-term-few-shot | technique | 要件定義、詳細設計 |
| Zero-shot Learning | aidev-term-zero-shot | technique | 詳細設計 |
| Chain-of-Thought | aidev-term-chain-of-thought | technique | 基本設計、詳細設計 |
| Context Window | aidev-term-context-window | theory | 基本設計、概要設計 |
| Hallucination | aidev-term-hallucination | theory | 概要設計、全フェーズ |
| Code Analysis | aidev-term-code-analysis | technique | 概要設計 |
| Embedding Search | aidev-term-embedding-search | technique | 概要設計 |
| Token Limit | aidev-term-token-limit | theory | 詳細設計 |
| Mutation Testing | aidev-term-mutation-testing | technique | 単体テスト |
| Test Scenario Generation | aidev-term-test-scenario-generation | technique | 結合テスト |
| AI Debugging | aidev-term-ai-debugging | technique | 結合テスト |
| Automated Regression Testing | aidev-term-auto-regression | technique | 結合テスト |

## 実装範囲

### 変更が必要なもの

| 対象 | 変更内容 |
|---|---|
| `data/ai-development.json` | 新規作成: 6 Topic + Concept + Term + article |
| `app/src/App.vue` | dataMap に ai-development を追加（import + 1行） |

### 変更が不要なもの

- TreeSidebar, ArticleView, TermSidebar, ArticleSection — 既存のまま動作
- レイアウト, スタイル — 変更不要
- vite.config.js — `@data` エイリアスで解決済み

## データ形式

前回の記事ビュー実装と同じ形式:

```json
{
  "category": "ai-development",
  "displayName": "AI開発活用",
  "description": "ソフトウェア開発の各フェーズでAIを活用する考え方と手法。",
  "topics": [
    {
      "id": "aidev-topic-requirements",
      "term": "Requirements Definition with AI",
      "termJa": "要件定義でのAI活用",
      "meaning": "短い説明",
      "article": {
        "sections": [
          {
            "heading": "セクション見出し",
            "body": "本文。[[aidev-term-prompt-engineering|プロンプトエンジニアリング]]で用語リンク。",
            "termRefs": ["aidev-term-prompt-engineering"]
          }
        ]
      },
      "relatedConceptIds": ["aidev-concept-xxx"]
    }
  ],
  "concepts": [...],
  "terms": [...]
}
```

記事内から既存カテゴリの用語も参照可能（例: `[[found-term-embedding|エンベディング]]`）。
