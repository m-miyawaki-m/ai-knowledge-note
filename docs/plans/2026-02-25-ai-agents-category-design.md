# AIエージェント カテゴリ 設計書

## 概要

AIエージェントの知識を体系的に学べる新カテゴリ「AIエージェント」を追加する。書籍の目次構造（全10章・3部構成）に基づき、章単位で10トピックを作成。エージェントの基礎概念から実装手法、評価・運用まで網羅する。

## 設計方針

| 項目 | 決定 |
|------|------|
| カテゴリID | `ai-agents` |
| 表示名 | `AIエージェント` |
| データ配置 | `data/ai-agents.json` 新規作成 |
| トピック数 | 10（章ごとに1トピック） |
| 用語数 | 40個（幅広く網羅） |
| 概念数 | 約20個 |
| 記事の構成 | 章→1トピック、節→セクション、コラム→セクション内に織り込み |
| 既存用語との連携 | ai-development等の用語をクロス参照 |

## トピック構成

### 第Ⅰ部 AIエージェントを知る

| # | Topic ID | 表示名 | セクション | 主な内容 |
|---|----------|--------|-----------|---------|
| 1 | `agent-topic-overview` | AIエージェントの概要 | 4 | 定義・特性、ビジネス状況・活用例、技術的位置づけ（LLMからの階段）、開発の選択肢（フレームワーク） |
| 2 | `agent-topic-architecture` | AIエージェントの構成 | 7 | 内部構成図・環境、プロフィール、ツール呼び出し・MCP、計画、自己修正、メモリ、シングル/マルチエージェントワークフロー |

### 第Ⅱ部 AIエージェントを作る

| # | Topic ID | 表示名 | セクション | 主な内容 |
|---|----------|--------|-----------|---------|
| 3 | `agent-topic-dev-setup` | 開発準備 | 5 | Chat Completions API・モデル、推論モデル・構造化出力、Function Calling、ツール（Web検索・RAG・Code Interpreter）、LangGraph |
| 4 | `agent-topic-helpdesk` | ヘルプデスク支援エージェント | 4 | Plan-and-Execute型、検索ツール（RAG）作成、LangGraphによる設計・実装、改善手法 |
| 5 | `agent-topic-data-analysis` | データ分析エージェント | 4 | シングルエージェントワークフロー、コード生成・実行・リフレクション、分析レポート作成、課題と展望 |
| 6 | `agent-topic-research` | 情報収集エージェント | 4 | マルチエージェント設計、メイン・論文調査・論文分析エージェント、LangGraph Studio、課題と展望 |
| 7 | `agent-topic-marketing` | マーケティング支援エージェント | 4 | 購買意思決定プロセスとAI、ロールプレイングによる意思決定支援、パーソナライズ施策支援、マルチエージェント連携 |

### 第Ⅲ部 AIエージェントを現場で使う

| # | Topic ID | 表示名 | セクション | 主な内容 |
|---|----------|--------|-----------|---------|
| 8 | `agent-topic-evaluation` | AIエージェントの評価 | 4 | 評価の考え方（能力/問題解決）、評価指標、LLM-as-a-Judge・評価の準備、エラー分析パターン |
| 9 | `agent-topic-production` | AIエージェントの活用 | 4 | UX設計・信頼性、リスクと攻撃手法、モニタリングツール、継続的改善方法 |
| 10 | `agent-topic-case-studies` | 実用化の取り組み | 3 | プロジェクトの進め方、AIエージェントの開発手法、人間との協働 |

## 用語一覧（40個）

### エージェント基礎（10個）

| 用語 | ID | type | 登場トピック |
|------|-----|------|-------------|
| AI Agent | `agent-term-ai-agent` | theory | 1, 2 |
| Agent Profile | `agent-term-profile` | theory | 2 |
| Tool Use / Function Calling | `agent-term-tool-use` | technique | 2, 3 |
| Planning | `agent-term-planning` | theory | 2, 4 |
| Self-Correction | `agent-term-self-correction` | technique | 2, 4 |
| Agent Memory | `agent-term-memory` | theory | 2, 9 |
| Perception | `agent-term-perception` | theory | 2 |
| Agent-Tuning | `agent-term-agent-tuning` | technique | 1 |
| Single-Agent Workflow | `agent-term-single-agent` | theory | 2, 5 |
| Multi-Agent Workflow | `agent-term-multi-agent` | theory | 2, 6, 7 |

### 開発技術（15個）

| 用語 | ID | type | 登場トピック |
|------|-----|------|-------------|
| Chat Completions API | `agent-term-chat-completions` | technique | 3 |
| Reasoning Models | `agent-term-reasoning-models` | theory | 3 |
| Structured Outputs | `agent-term-structured-outputs` | technique | 3 |
| Prompt Caching | `agent-term-prompt-caching` | technique | 3 |
| Code Interpreter | `agent-term-code-interpreter` | technique | 3, 5 |
| Embedding API | `agent-term-embedding-api` | technique | 3 |
| Assistants API | `agent-term-assistants-api` | technique | 3 |
| LangGraph | `agent-term-langgraph` | technique | 3, 4, 5, 6 |
| Model Context Protocol (MCP) | `agent-term-mcp` | technique | 2, 3 |
| Plan-and-Execute | `agent-term-plan-and-execute` | technique | 4 |
| Reflection | `agent-term-reflection` | technique | 5 |
| E2B (Code Sandbox) | `agent-term-e2b` | technique | 5 |
| LangGraph Studio | `agent-term-langgraph-studio` | technique | 6 |
| Local LLM | `agent-term-local-llm` | technique | 3 |
| AI Workflow | `agent-term-ai-workflow` | theory | 2 |

### 評価・運用（15個）

| 用語 | ID | type | 登場トピック |
|------|-----|------|-------------|
| Agent Evaluation | `agent-term-evaluation` | theory | 8 |
| LLM-as-a-Judge | `agent-term-llm-judge` | technique | 8 |
| Task Space / Domain Space | `agent-term-task-domain-space` | theory | 8 |
| Error Analysis | `agent-term-error-analysis` | technique | 8 |
| Agent UX | `agent-term-agent-ux` | theory | 9 |
| Prompt Injection | `agent-term-prompt-injection` | theory | 9 |
| AgentOps | `agent-term-agentops` | technique | 9 |
| LangSmith | `agent-term-langsmith` | technique | 9 |
| Prompt Flow Tracing | `agent-term-prompt-flow-tracing` | technique | 9 |
| Human-in-the-Loop | `agent-term-human-in-loop` | technique | 9 |
| Guardrails | `agent-term-guardrails` | technique | 9 |
| Agent Architecture Self-Improvement | `agent-term-arch-self-improvement` | technique | 9 |
| Role-Playing Agent | `agent-term-role-playing` | technique | 7 |
| Personalization Agent | `agent-term-personalization` | technique | 7 |
| RAG + Long Context | `agent-term-rag-long-context` | technique | 4 |

## 実装範囲

### 変更が必要なもの

| 対象 | 変更内容 |
|------|---------|
| `data/ai-agents.json` | 新規作成: 10 Topics + 約20 Concepts + 40 Terms + articles（約43セクション） |
| `app/src/App.vue` | dataMap に `ai-agents` を追加（import + 1行） |

### 変更が不要なもの

- TreeSidebar, ArticleView, TermSidebar, ArticleSection — 既存のまま動作
- レイアウト, スタイル — 変更不要
- vite.config.js — `@data` エイリアスで解決済み

## データ形式

既存カテゴリと同一形式:

```json
{
  "category": "ai-agents",
  "displayName": "AIエージェント",
  "description": "AIエージェントの基礎概念から実装、評価・運用まで体系的に学ぶ。",
  "topics": [
    {
      "id": "agent-topic-overview",
      "term": "AI Agent Overview",
      "termJa": "AIエージェントの概要",
      "meaning": "短い説明",
      "article": {
        "sections": [
          {
            "heading": "セクション見出し",
            "body": "本文。[[agent-term-ai-agent|AIエージェント]]で用語リンク。",
            "termRefs": ["agent-term-ai-agent"]
          }
        ]
      },
      "relatedConceptIds": ["agent-concept-xxx"]
    }
  ],
  "concepts": [...],
  "terms": [...]
}
```

記事内から既存カテゴリの用語も参照可能（例: `[[aidev-term-rag|RAG]]`）。
