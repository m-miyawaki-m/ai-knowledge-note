# ツリー形式サイドバー + AI用語追加 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** ツリー形式のサイドバーを追加し、4階層ナビゲーション + 一般的なAI用語データの追加を行う

**Architecture:** 2カラムレイアウト（左250pxサイドバー + 右メインエリア）。TreeSidebar/TreeNode再帰コンポーネントで全カテゴリのツリーを描画し、ノード選択でApp.vueの状態を更新して右側に詳細表示。

**Tech Stack:** Vue 3 Composition API, Vite, vanilla CSS

---

### Task 1: AI用語データを foundations.json に追加

**Files:**
- Modify: `data/foundations.json`

**Step 1: foundations.json に基本用語データを追加**

基礎理論カテゴリに一般的なAI用語を体系的に追加する。以下のデータ構造:

- Topic: 「基本用語」「学習の仕組み」
- Concept: 「テキスト処理の基礎」「モデルの構成要素」「学習プロセス」「評価と推論」
- Term: トークン、埋め込み、パラメータ、重み、バイアス、エポック、バッチサイズ、学習率、損失関数、過学習、推論、ファインチューニング 等

既存の `architectures.json` のスキーマ（id命名規則 `{category}-{level}-{slug}`）に厳密に従う。

**Step 2: ビルド確認**

Run: `cd app && npm run build`
Expected: ビルド成功（JSONインポートが正しく動作する）

**Step 3: コミット**

```bash
git add data/foundations.json
git commit -m "feat: 基礎理論カテゴリにAI基本用語データを追加"
```

---

### Task 2: TreeNode.vue 再帰コンポーネントを作成

**Files:**
- Create: `app/src/components/TreeNode.vue`

**Step 1: TreeNode.vue を作成**

再帰コンポーネント。各ノードは以下を持つ:
- `label`: 表示名
- `type`: 'category' | 'topic' | 'concept' | 'term'（色分け用）
- `children`: 子ノード配列（あれば開閉可能）
- `id`: 元データのID
- `categoryKey`: どのカテゴリに属するか

Props:
- `node`: ノードオブジェクト `{ label, type, children?, id?, categoryKey }`
- `selectedId`: 現在選択中のノードID
- `depth`: インデント深さ（デフォルト0）

Emits:
- `select`: ノード選択時 `{ type, id, categoryKey }`

機能:
- 子がある場合は ▶/▼ で開閉
- クリックで `select` イベント発火
- 選択中ノードのハイライト
- type に応じた左ボーダー色（category: #6a1b9a, topic: #6a1b9a, concept: #00838f, term: #e65100）
- depth に応じたパディング（depth * 16px）

**Step 2: ビルド確認**

Run: `cd app && npm run build`
Expected: ビルド成功

**Step 3: コミット**

```bash
git add app/src/components/TreeNode.vue
git commit -m "feat: TreeNode 再帰コンポーネントを作成"
```

---

### Task 3: TreeSidebar.vue を作成

**Files:**
- Create: `app/src/components/TreeSidebar.vue`

**Step 1: TreeSidebar.vue を作成**

Props:
- `dataMap`: 全カテゴリのデータマップ `{ architectures: {...}, foundations: {...}, ... }`
- `selectedId`: 現在選択中のノードID

Emits:
- `select`: ノード選択時（TreeNode から中継）

機能:
- `dataMap` からツリーデータを構築する `computed`:
  - 各カテゴリ → type='category', children=topics
  - 各トピック → type='topic', children=concepts（topicId一致）
  - 各コンセプト → type='concept', children=terms（relatedTermIds）
  - 各用語 → type='term', children=なし
- TreeNode をルートカテゴリごとにレンダリング
- サイドバーのスタイル: 幅250px, 高さ100vh, overflow-y auto, 左固定

**Step 2: ビルド確認**

Run: `cd app && npm run build`
Expected: ビルド成功

**Step 3: コミット**

```bash
git add app/src/components/TreeSidebar.vue
git commit -m "feat: TreeSidebar コンポーネントを作成"
```

---

### Task 4: App.vue を2カラムレイアウトに変更

**Files:**
- Modify: `app/src/App.vue`
- Modify: `app/src/components/SearchFilter.vue`

**Step 1: App.vue を修正**

変更点:
1. TreeSidebar をインポート・配置
2. `dataMap` を TreeSidebar に渡す
3. サイドバーからの `select` イベントハンドラ追加:
   - `selectedNode` ref を追加（選択されたノード情報）
   - type='category' の場合: `selectedCategory` を更新
   - type='topic'/'concept'/'term' の場合: 該当カテゴリに切り替え、glossaryタブに移動、該当要素にスクロール
4. レイアウトを `display: flex` の2カラムに変更:
   - `.app-layout { display: flex; min-height: 100vh; }`
   - `.sidebar { width: 250px; flex-shrink: 0; }`
   - `.main-area { flex: 1; min-width: 0; overflow-y: auto; }`
5. ヘッダーはサイドバーの上に移動せず、サイドバー内の上部に配置するか、メインエリアの上に配置
6. モバイル用ハンバーガーメニュー: `sidebarOpen` ref、768px以下でサイドバーをオーバーレイ表示

**Step 2: SearchFilter.vue からカテゴリタブを削除**

SearchFilter からカテゴリタブ部分（`.category-tabs`）を削除。カテゴリ選択はサイドバーに移行するため不要。
プロパティ `categories`, `selectedCategory`, `update:selectedCategory` も削除。

**Step 3: ビルド確認と動作確認**

Run: `cd app && npm run build`
Expected: ビルド成功

Run: `cd app && npm run dev`
動作確認: サイドバーが左に表示され、ノードクリックで右側の表示が切り替わること。

**Step 4: コミット**

```bash
git add app/src/App.vue app/src/components/SearchFilter.vue
git commit -m "feat: 2カラムレイアウトとツリーサイドバーを統合"
```

---

### Task 5: モバイル対応

**Files:**
- Modify: `app/src/App.vue`
- Modify: `app/src/assets/style.css`

**Step 1: ハンバーガーメニューとオーバーレイを実装**

App.vue に追加:
- `sidebarOpen` ref（モバイル時のサイドバー開閉状態）
- ハンバーガーボタン（768px以下で表示、それ以上で非表示）
- オーバーレイクリックでサイドバーを閉じる
- サイドバーでノード選択時にモバイルではサイドバーを自動で閉じる

CSS media query:
```css
@media (max-width: 768px) {
  .sidebar { position: fixed; left: -250px; z-index: 100; transition: left 0.3s; }
  .sidebar.open { left: 0; }
  .overlay { display: block; }
}
```

**Step 2: 動作確認**

ブラウザのデベロッパーツールでモバイル幅にリサイズして確認。

**Step 3: コミット**

```bash
git add app/src/App.vue app/src/assets/style.css
git commit -m "feat: モバイル対応（ハンバーガーメニュー）を追加"
```
