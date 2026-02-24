# ハイブリッド記事＋用語サイドバー設計書

## 概要

AI用語の学習体験を「辞書型（単発用語カード）」から「記事型（文脈のある解説＋用語パネル）」に刷新する。Topic単位の記事をメインコンテンツとし、右サイドバーに関連用語カードを表示する3カラムレイアウトを採用する。

## 背景・課題

現状の用語カード形式では：
- 用語が単発で連携がなく、全体像が掴みにくい
- 「なぜTokenをEmbeddingに変換するのか」といった文脈が伝わらない
- 点が並んでいるだけで、線になっていない

## 設計方針

| 項目 | 決定 |
|------|------|
| 記事粒度 | Topic単位（1 Topic = 1記事） |
| 用語クリック | 右サイドバーでハイライト |
| データ配置 | 既存JSONに `article` フィールド追加 |
| 既存タブ | 用語集タブ → 記事ビューに置き換え、学習パスは残す |
| 記事作成 | AIが生成 |
| レイアウト | 3カラム（左ナビ + 記事 + 右用語パネル） |

## データ構造

Topic に `article` フィールドを追加する。

```json
{
  "id": "arch-topic-transformer",
  "term": "Transformer",
  "termJa": "トランスフォーマー",
  "meaning": "既存の短い説明（そのまま残す）",
  "article": {
    "sections": [
      {
        "heading": "概要",
        "body": "Transformerは**Self-Attention**という仕組みを中心としたアーキテクチャです。入力テキストはまず[[found-term-token|トークン]]に分割され…",
        "termRefs": ["found-term-token", "found-term-embedding"]
      }
    ]
  },
  "relatedConceptIds": ["arch-concept-self-attention"],
  "sourceUrl": "..."
}
```

### 用語リンク記法

記事内で用語に言及する際は `[[term-id|表示テキスト]]` を使用する。

- `term-id`: 既存の用語ID（`found-term-token` 等）または概念ID（`arch-concept-self-attention` 等）
- カテゴリ横断の参照も可（architectures記事からfoundations用語を参照）
- `termRefs`: セクションごとに関連用語IDを明示。右パネルの表示順制御に使用

### フォールバック

`article` フィールドが無い Topic は、`meaning` を記事本文として表示する。

## レイアウト

### PC（768px以上）

```
┌──────────┬──────────────────────────┬───────────────────┐
│ TreeSide │ ArticleView              │ TermSidebar       │
│ bar      │                          │                   │
│ 250px    │ [TabNav: 記事|学習パス]   │ 記事中の用語が    │
│          │                          │ カード形式で並ぶ  │
│ [既存]   │ # Transformerの仕組み     │                   │
│          │                          │ ■ Token ←ハイライト│
│ ● 基礎   │ テキストはまず           │   最小単位…       │
│   ├ 基本  │ [トークン] に分割され…  │                   │
│   └ 学習  │                          │ □ Embedding       │
│ ● アーキ │ ## Self-Attentionの仕組み │   数値ベクトル…   │
│   ├ Trans│                          │                   │
│   └ Diff │ 各トークンが…            │ □ Multi-Head…     │
└──────────┴──────────────────────────┴───────────────────┘
  固定250px    フレキシブル               固定200px
```

### モバイル（768px未満）

```
┌─────────────────────┐
│ Header        [≡]   │
├─────────────────────┤
│ ArticleView         │
│                     │
│ # Transformerの仕組み│
│                     │
│ テキストはまず       │
│ [トークン] に…      │
│                     │
├─────────────────────┤
│ ▼ 関連用語 (3)      │  ← 折りたたみ
│ ┌─────────────────┐ │
│ │ ■ Token         │ │
│ │   最小単位…     │ │
│ ├─────────────────┤ │
│ │ □ Embedding     │ │
│ └─────────────────┘ │
└─────────────────────┘
```

- 左ナビ: ハンバーガーメニューでオーバーレイ（既存動作）
- 右パネル: 記事下部に折りたたみセクションとして配置
- ブレークポイント: 768px

## コンポーネント構成

### 新規作成

| コンポーネント | 役割 |
|---|---|
| `ArticleView.vue` | Topic の article を描画。セクションごとに ArticleSection を配置 |
| `ArticleSection.vue` | heading + body を描画。`[[id\|text]]` をパースして用語リンクに変換 |
| `TermSidebar.vue` | 記事の termRefs に基づく用語カード一覧。ハイライト機能付き |

### 変更

| コンポーネント | 変更内容 |
|---|---|
| `App.vue` | 3カラムレイアウト管理、右パネル追加 |
| `TabNav.vue` | 「用語集」→「記事」にラベル変更 |

### 削除

| コンポーネント | 理由 |
|---|---|
| `GlossaryTab.vue` | ArticleView に置き換え |
| `TopicCard.vue` | 記事ビューが Topic の表示を担当 |
| `ConceptCard.vue` | 記事内に自然に統合 |
| `SearchFilter.vue` | 記事ビューでは不要 |

### 変更なし

| コンポーネント |
|---|
| `TreeSidebar.vue` |
| `TreeNode.vue` |
| `LearningPathTab.vue` |
| `RoadmapBranch.vue` |
| `RoadmapNode.vue` |
| `TermCard.vue`（再利用） |

## インタラクション

1. **左ナビで Topic をクリック** → ArticleView が該当 Topic の記事を表示、TermSidebar が連動
2. **記事中の用語リンクをクリック** → 右パネルの該当カードがハイライト（スクロール + 2秒フェード）
3. **左ナビで Term をクリック** → その Term が属する Topic の記事を表示 + 右パネルでハイライト
4. **タブ切り替え** → 「記事」と「学習パス」を切り替え。右パネルは記事タブのときだけ表示

## 記事生成

### ルール

- AIが既存の用語データを元にTopic単位で記事を生成
- 1記事2〜4セクション、各セクション3〜5文程度
- カテゴリをまたいだ用語参照もOK

### 対象（初期スコープ）

| カテゴリ | Topic | 予想用語リンク数 |
|---|---|---|
| foundations | 基本用語 | 約8 |
| foundations | 学習の仕組み | 約9 |
| architectures | Transformer | 約5 + foundations用語 |
| architectures | Diffusion Model | 約3 + foundations用語 |
