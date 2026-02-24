# ハイブリッド記事＋用語サイドバー 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 用語カード形式の GlossaryTab を、Topic 単位の記事ビュー＋右用語サイドバーの3カラムレイアウトに置き換える。

**Architecture:** Topic の JSON に `article` フィールドを追加し、記事本文をレンダリングする ArticleView と、関連用語を表示する TermSidebar を新設する。記事内の `[[term-id|表示テキスト]]` をクリックすると右パネルの対応カードがハイライトされる。

**Tech Stack:** Vue 3 (Composition API, `<script setup>`) + Vite

---

### Task 1: 記事データを JSON に追加

**Files:**
- Modify: `data/foundations.json` — topics 配列の各要素に `article` を追加
- Modify: `data/architectures.json` — 同上

**Step 1: foundations.json の `found-topic-basic-terms` に article を追加**

`found-topic-basic-terms` の topic オブジェクトに以下を追加:

```json
"article": {
  "sections": [
    {
      "heading": "テキストをAIが理解するまで",
      "body": "AIがテキストを処理する第一歩は、文章を[[found-term-token|トークン]]という最小単位に分割することです。「今日は天気がいい」という文は、モデルによって「今日/は/天気/が/いい」のように分割されます。モデルが認識できるトークンの全体集合を[[found-term-vocabulary|語彙（Vocabulary）]]と呼びます。語彙サイズはモデルの表現力とコストのトレードオフで決まります。分割されたトークンは、次に[[found-term-embedding|埋め込み表現（Embedding）]]によって数値ベクトルに変換されます。意味が近い単語は、このベクトル空間上で近くに配置されます。",
      "termRefs": ["found-term-token", "found-term-vocabulary", "found-term-embedding"]
    },
    {
      "heading": "ニューラルネットワークの構成要素",
      "body": "数値化されたデータを処理するのがニューラルネットワークです。ネットワークは大量の[[found-term-parameter|パラメータ]]を持ち、その中心となるのが[[found-term-weight|重み（Weight）]]と[[found-term-bias|バイアス（Bias）]]です。重みは入力信号の強さを調整し、バイアスは閾値を制御します。各ニューロンの出力には[[found-term-activation-function|活性化関数]]が適用され、非線形な変換が加わることで、モデルは複雑なパターンを学習できるようになります。",
      "termRefs": ["found-term-parameter", "found-term-weight", "found-term-bias", "found-term-activation-function"]
    }
  ]
}
```

**Step 2: foundations.json の `found-topic-learning` に article を追加**

```json
"article": {
  "sections": [
    {
      "heading": "モデルはどうやって学ぶのか",
      "body": "モデルの学習は、予測と正解の誤差を[[found-term-loss-function|損失関数]]で数値化し、その値を小さくする方向に[[found-term-parameter|パラメータ]]を更新する繰り返しです。更新には[[found-term-gradient-descent|勾配降下法]]が使われ、損失関数の勾配（微分値）を計算してパラメータを調整します。一度に処理するデータ量を[[found-term-batch-size|バッチサイズ]]、更新の幅を[[found-term-learning-rate|学習率]]と呼びます。訓練データ全体を1周する単位が[[found-term-epoch|エポック]]で、通常は数十〜数百エポックの学習を行います。",
      "termRefs": ["found-term-loss-function", "found-term-gradient-descent", "found-term-batch-size", "found-term-learning-rate", "found-term-epoch"]
    },
    {
      "heading": "学習の先にあるもの",
      "body": "学習が完了したモデルを使って新しいデータの予測を行うことを[[found-term-inference|推論（Inference）]]と呼びます。ただし、学習しすぎると訓練データだけに過度に適合する[[found-term-overfitting|過学習（Overfitting）]]が起こります。モデルの予測精度は[[found-term-accuracy|Accuracy]]などの指標で評価します。また、大規模モデルを特定のタスクに適応させる[[found-term-fine-tuning|ファインチューニング]]も広く使われており、少量のデータで高精度な専用モデルを作れます。",
      "termRefs": ["found-term-inference", "found-term-overfitting", "found-term-accuracy", "found-term-fine-tuning"]
    }
  ]
}
```

**Step 3: architectures.json の `arch-topic-transformer` に article を追加**

```json
"article": {
  "sections": [
    {
      "heading": "Transformerの革新",
      "body": "2017年に発表された論文「Attention Is All You Need」で提案されたTransformerは、AI の歴史を大きく変えました。それまでの主流だったRNNは系列を逐次処理するため並列化が難しいという問題がありました。Transformerは[[arch-concept-self-attention|Self-Attention]]機構によって入力系列全体を一度に処理でき、並列計算が可能です。入力テキストはまず[[found-term-token|トークン]]に分割され、[[found-term-embedding|エンベディング]]で数値ベクトルに変換されます。",
      "termRefs": ["found-term-token", "found-term-embedding"]
    },
    {
      "heading": "Self-Attentionの仕組み",
      "body": "Transformerの中核を成す[[arch-concept-self-attention|Self-Attention]]は、各トークンが他のすべてのトークンとの関連度を計算する仕組みです。具体的には、[[arch-term-scaled-dot-product|Scaled Dot-Product Attention]]でQuery・Key間の類似度を算出し、Valueとの加重和でコンテキスト表現を得ます。これを複数の視点から同時に行うのが[[arch-term-multi-head-attention|Multi-Head Attention]]で、異なるヘッドが構文・意味・参照関係など異なるパターンを捉えます。",
      "termRefs": ["arch-term-scaled-dot-product", "arch-term-multi-head-attention"]
    },
    {
      "heading": "位置情報の扱い",
      "body": "Self-Attentionは本来、トークンの順序を区別しません。「猫が犬を追う」と「犬が猫を追う」が同じ表現になってしまいます。そこで[[arch-concept-positional-encoding|Positional Encoding]]が必要になります。元論文ではsin/cos関数による固定的な位置符号を使いましたが、現在のLLMの多くは[[arch-term-rope|RoPE（回転位置埋め込み）]]を採用しています。RoPEは相対的な位置関係を自然に表現でき、学習時より長い系列への対応も得意です。",
      "termRefs": ["arch-term-rope"]
    }
  ]
}
```

**Step 4: architectures.json の `arch-topic-diffusion` に article を追加**

```json
"article": {
  "sections": [
    {
      "heading": "拡散モデルの考え方",
      "body": "拡散モデルは、データに段階的にノイズを加えていく「Forward Process」と、そのノイズを除去して元のデータを復元する「Reverse Process」から成ります。Reverse Processをニューラルネットワークで学習させることで、ランダムノイズから高品質なデータを生成できるようになります。この[[arch-concept-denoising|ノイズ除去プロセス]]の定式化として代表的なのが[[arch-term-ddpm|DDPM]]で、マルコフ連鎖に基づく確率的なフレームワークを提供します。",
      "termRefs": ["arch-term-ddpm"]
    },
    {
      "heading": "生成品質の制御",
      "body": "拡散モデルの大きな利点は、生成結果をテキストなどの条件で制御できることです。[[arch-term-classifier-free-guidance|Classifier-Free Guidance]]は、条件付き生成と無条件生成の出力を補間することで、外部の分類器なしに生成品質をコントロールする手法です。ガイダンススケールを大きくすると条件への忠実度が上がり、小さくすると多様性が増します。Stable DiffusionやDALL-Eで使われるこの技法が、テキストから思い通りの画像を生成する鍵となっています。",
      "termRefs": ["arch-term-classifier-free-guidance"]
    }
  ]
}
```

**Step 5: コミット**

```bash
git add data/foundations.json data/architectures.json
git commit -m "feat: Topic に article フィールドを追加（4記事分）"
```

---

### Task 2: ArticleSection コンポーネントを作成

**Files:**
- Create: `app/src/components/ArticleSection.vue`

**Step 1: ArticleSection.vue を作成**

記事の1セクションを描画する。`[[term-id|表示テキスト]]` をパースしてクリック可能なリンクに変換する。

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  heading: { type: String, required: true },
  body: { type: String, required: true }
})

const emit = defineEmits(['term-click'])

const parsedBody = computed(() => {
  // [[id|text]] → { type: 'text', content } | { type: 'link', id, text }
  const parts = []
  const regex = /\[\[([^\]|]+)\|([^\]]+)\]\]/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(props.body)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: props.body.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'link', id: match[1], text: match[2] })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < props.body.length) {
    parts.push({ type: 'text', content: props.body.slice(lastIndex) })
  }

  return parts
})
</script>

<template>
  <section class="article-section">
    <h3 class="section-heading">{{ heading }}</h3>
    <p class="section-body">
      <template v-for="(part, i) in parsedBody" :key="i">
        <span v-if="part.type === 'text'">{{ part.content }}</span>
        <a
          v-else
          class="term-link"
          href="#"
          @click.prevent="emit('term-click', part.id)"
        >{{ part.text }}</a>
      </template>
    </p>
  </section>
</template>

<style scoped>
.article-section {
  margin-bottom: 24px;
}

.section-heading {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.section-body {
  color: #333;
  line-height: 1.8;
  font-size: 0.95rem;
}

.term-link {
  color: #6a1b9a;
  text-decoration: none;
  border-bottom: 1px dashed #6a1b9a;
  cursor: pointer;
  font-weight: 500;
}

.term-link:hover {
  background: #f3e5f5;
  border-bottom-style: solid;
}
</style>
```

**Step 2: ブラウザで確認（Task 5 完了後）**

**Step 3: コミット**

```bash
git add app/src/components/ArticleSection.vue
git commit -m "feat: ArticleSection コンポーネントを作成"
```

---

### Task 3: TermSidebar コンポーネントを作成

**Files:**
- Create: `app/src/components/TermSidebar.vue`

**Step 1: TermSidebar.vue を作成**

記事に関連する用語カードを表示する右パネル。ハイライト機能付き。

```vue
<script setup>
import { ref, watch, nextTick } from 'vue'
import TermCard from './TermCard.vue'

const props = defineProps({
  terms: { type: Array, default: () => [] },
  highlightTermId: { type: String, default: null },
  collapsed: { type: Boolean, default: true }
})

const emit = defineEmits(['update:collapsed'])

const localCollapsed = ref(props.collapsed)

watch(() => props.collapsed, (v) => { localCollapsed.value = v })

function toggleCollapsed() {
  localCollapsed.value = !localCollapsed.value
  emit('update:collapsed', localCollapsed.value)
}

watch(() => props.highlightTermId, async (id) => {
  if (!id) return
  // モバイルの場合は開く
  localCollapsed.value = false
  emit('update:collapsed', false)
  await nextTick()
  const el = document.getElementById(`term-sidebar-${id}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('highlight')
    setTimeout(() => el.classList.remove('highlight'), 2000)
  }
})
</script>

<template>
  <aside class="term-sidebar">
    <!-- PC: always visible -->
    <div class="sidebar-header desktop-only">
      <h3>関連用語</h3>
      <span class="count">{{ terms.length }}</span>
    </div>

    <!-- Mobile: collapsible -->
    <button class="collapse-toggle mobile-only" @click="toggleCollapsed">
      <span>{{ localCollapsed ? '▶' : '▼' }} 関連用語 ({{ terms.length }})</span>
    </button>

    <div class="term-list" :class="{ collapsed: localCollapsed }">
      <div
        v-for="term in terms"
        :key="term.id"
        :id="`term-sidebar-${term.id}`"
        class="term-wrapper"
        :class="{ active: highlightTermId === term.id }"
      >
        <TermCard :item="term" />
      </div>
      <p v-if="!terms.length" class="empty">この記事に関連する用語はありません</p>
    </div>
  </aside>
</template>

<style scoped>
.term-sidebar {
  padding: 12px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
}

.sidebar-header h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #555;
}

.count {
  font-size: 0.75rem;
  background: #f0f0f0;
  color: #666;
  padding: 1px 8px;
  border-radius: 10px;
}

.term-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.term-wrapper {
  transition: background 0.3s;
  border-radius: 8px;
}

.term-wrapper.active {
  background: #f3e5f5;
}

.collapse-toggle {
  display: none;
  width: 100%;
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #333;
  cursor: pointer;
  text-align: left;
}

.collapse-toggle:hover {
  background: #f0f0f0;
}

.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

.empty {
  color: #999;
  font-size: 0.85rem;
  text-align: center;
  padding: 16px 0;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .term-list.collapsed {
    display: none;
  }
}

/* Highlight animation (matches existing pattern) */
:deep(.highlight) {
  animation: highlightFade 2s ease;
}

@keyframes highlightFade {
  0% { background: #f3e5f5; }
  100% { background: transparent; }
}
</style>
```

**Step 2: コミット**

```bash
git add app/src/components/TermSidebar.vue
git commit -m "feat: TermSidebar コンポーネントを作成"
```

---

### Task 4: ArticleView コンポーネントを作成

**Files:**
- Create: `app/src/components/ArticleView.vue`

**Step 1: ArticleView.vue を作成**

Topic の記事を表示するメインコンテンツ。article フィールドがなければ meaning をフォールバック表示する。

```vue
<script setup>
import ArticleSection from './ArticleSection.vue'

const props = defineProps({
  topic: { type: Object, default: null },
  categoryData: { type: Object, default: null }
})

const emit = defineEmits(['term-click'])
</script>

<template>
  <div v-if="topic" class="article-view">
    <header class="article-header">
      <h2 class="article-title">{{ topic.termJa || topic.term }}</h2>
      <p v-if="topic.termJa" class="article-title-en">{{ topic.term }}</p>
    </header>

    <!-- 記事モード -->
    <div v-if="topic.article?.sections?.length" class="article-body">
      <ArticleSection
        v-for="(section, i) in topic.article.sections"
        :key="i"
        :heading="section.heading"
        :body="section.body"
        @term-click="emit('term-click', $event)"
      />
    </div>

    <!-- フォールバック: article なし → meaning を表示 -->
    <div v-else class="article-body">
      <p class="fallback-text">{{ topic.meaning }}</p>
    </div>

    <footer v-if="topic.sourceUrl" class="article-footer">
      <a :href="topic.sourceUrl" target="_blank" rel="noopener" class="source-link">参考論文</a>
    </footer>
  </div>

  <div v-else class="empty">
    <p>左のメニューからトピックを選択してください</p>
  </div>
</template>

<style scoped>
.article-view {
  padding-top: 8px;
}

.article-header {
  margin-bottom: 24px;
}

.article-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1a1a;
}

.article-title-en {
  font-size: 0.9rem;
  color: #888;
  font-family: 'SF Mono', 'Fira Code', monospace;
  margin-top: 4px;
}

.article-body {
  margin-bottom: 24px;
}

.fallback-text {
  color: #333;
  line-height: 1.8;
}

.article-footer {
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.source-link {
  font-size: 0.85rem;
  color: #6a1b9a;
  text-decoration: none;
}

.source-link:hover {
  text-decoration: underline;
}

.empty {
  text-align: center;
  color: #999;
  padding: 60px 0;
  font-size: 0.95rem;
}
</style>
```

**Step 2: コミット**

```bash
git add app/src/components/ArticleView.vue
git commit -m "feat: ArticleView コンポーネントを作成"
```

---

### Task 5: App.vue を3カラムレイアウトに変更

**Files:**
- Modify: `app/src/App.vue`
- Modify: `app/src/components/TabNav.vue`

**Step 1: TabNav.vue のラベルを変更**

`TabNav.vue` の tabs 配列を変更:

```javascript
// Before
const tabs = [
  { value: 'glossary', label: '用語辞書' },
  { value: 'learning-path', label: '学習パス' }
]

// After
const tabs = [
  { value: 'glossary', label: '記事' },
  { value: 'learning-path', label: '学習パス' }
]
```

**Step 2: App.vue を書き換え**

import の変更:
- 削除: `SearchFilter`, `GlossaryTab`
- 追加: `ArticleView`, `TermSidebar`

state の追加:
- `selectedTopicId` — 現在表示中の Topic ID
- `highlightTermId` — 右パネルでハイライト中の用語 ID
- `termSidebarCollapsed` — モバイルの折りたたみ状態

computed の追加:
- `selectedTopic` — selectedTopicId に対応する Topic オブジェクト
- `articleTerms` — 記事の termRefs に基づく用語一覧（全カテゴリのデータから収集。重複排除・順序保持）

ロジック変更:
- `handleTreeSelect` で Topic/Term クリック時に `selectedTopicId` を設定
- `handleArticleTermClick` で記事内の用語リンククリック → `highlightTermId` を設定

テンプレート変更:
- `SearchFilter` を削除
- `GlossaryTab` → `ArticleView` + `TermSidebar` に置き換え
- 3カラムレイアウト CSS

完全な App.vue:

```vue
<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import TabNav from './components/TabNav.vue'
import ArticleView from './components/ArticleView.vue'
import TermSidebar from './components/TermSidebar.vue'
import LearningPathTab from './components/LearningPathTab.vue'
import TreeSidebar from './components/TreeSidebar.vue'

import architecturesData from '@data/architectures.json'
import foundationsData from '@data/foundations.json'
import trainingData from '@data/training.json'
import applicationsData from '@data/applications.json'
import toolsData from '@data/tools.json'

const dataMap = {
  architectures: architecturesData,
  foundations: foundationsData,
  training: trainingData,
  applications: applicationsData,
  tools: toolsData
}

const selectedCategory = ref('architectures')
const activeTab = ref('glossary')
const selectedNodeId = ref(null)
const sidebarOpen = ref(false)
const selectedTopicId = ref(null)
const highlightTermId = ref(null)
const termSidebarCollapsed = ref(true)

const categoryData = computed(() => dataMap[selectedCategory.value])

// 現在選択中の Topic
const selectedTopic = computed(() => {
  if (!selectedTopicId.value || !categoryData.value?.topics) return null
  return categoryData.value.topics.find(t => t.id === selectedTopicId.value) || null
})

// 記事に関連する用語一覧（termRefs から収集、重複排除）
const articleTerms = computed(() => {
  if (!selectedTopic.value?.article?.sections) return []
  const allData = Object.values(dataMap)
  const seenIds = new Set()
  const terms = []

  for (const section of selectedTopic.value.article.sections) {
    for (const termId of (section.termRefs || [])) {
      if (seenIds.has(termId)) continue
      seenIds.add(termId)
      // 全カテゴリから用語を検索
      for (const data of allData) {
        const found = (data.terms || []).find(t => t.id === termId)
        if (found) {
          terms.push(found)
          break
        }
      }
    }
  }
  return terms
})

// カテゴリが変わったら Topic 選択をリセット
watch(selectedCategory, () => {
  activeTab.value = 'glossary'
  highlightTermId.value = null
  // 最初の Topic を自動選択
  const topics = categoryData.value?.topics || []
  selectedTopicId.value = topics.length ? topics[0].id : null
})

// 初期表示: 最初の Topic を選択
const initialTopics = categoryData.value?.topics || []
if (initialTopics.length) {
  selectedTopicId.value = initialTopics[0].id
}

// 記事内の用語リンクをクリック
function handleArticleTermClick(termId) {
  highlightTermId.value = termId
  // 2秒後にリセット
  setTimeout(() => {
    highlightTermId.value = null
  }, 2000)
}

// ツリーナビからの選択
async function handleTreeSelect({ type, id, categoryKey }) {
  selectedNodeId.value = id
  sidebarOpen.value = false

  if (type === 'category') {
    selectedCategory.value = categoryKey
    return
  }

  // カテゴリ切り替え
  if (selectedCategory.value !== categoryKey) {
    selectedCategory.value = categoryKey
    await nextTick()
  }

  if (type === 'topic') {
    selectedTopicId.value = id
    activeTab.value = 'glossary'
    return
  }

  if (type === 'concept') {
    // Concept が属する Topic を探して表示
    const data = dataMap[categoryKey]
    const concept = (data?.concepts || []).find(c => c.id === id)
    if (concept?.topicId) {
      selectedTopicId.value = concept.topicId
      activeTab.value = 'glossary'
    }
    return
  }

  if (type === 'term') {
    // Term が属する Topic を探して表示 + 右パネルハイライト
    const data = dataMap[categoryKey]
    for (const concept of (data?.concepts || [])) {
      if ((concept.relatedTermIds || []).includes(id)) {
        selectedTopicId.value = concept.topicId
        activeTab.value = 'glossary'
        await nextTick()
        handleArticleTermClick(id)
        return
      }
    }
  }
}
</script>

<template>
  <div class="app">
    <div class="app-layout">
      <div class="sidebar" :class="{ open: sidebarOpen }">
        <TreeSidebar
          :dataMap="dataMap"
          :selectedId="selectedNodeId"
          @select="handleTreeSelect"
        />
      </div>
      <div class="overlay" v-if="sidebarOpen" @click="sidebarOpen = false"></div>
      <div class="main-area">
        <header class="app-header">
          <button class="menu-btn" @click="sidebarOpen = !sidebarOpen">☰</button>
          <h1>AI Knowledge Note</h1>
        </header>
        <main class="main-content">
          <TabNav v-model:activeTab="activeTab" />
          <ArticleView
            v-if="activeTab === 'glossary'"
            :topic="selectedTopic"
            :categoryData="categoryData"
            @term-click="handleArticleTermClick"
          />
          <LearningPathTab
            v-if="activeTab === 'learning-path'"
            :categoryData="categoryData"
          />
        </main>
      </div>
      <div
        class="term-panel"
        v-if="activeTab === 'glossary'"
      >
        <TermSidebar
          :terms="articleTerms"
          :highlightTermId="highlightTermId"
          v-model:collapsed="termSidebarCollapsed"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  flex-shrink: 0;
}

.main-area {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}

.term-panel {
  flex-shrink: 0;
  width: 260px;
  height: 100vh;
  overflow-y: auto;
  border-left: 1px solid #e0e0e0;
  background: #fafafa;
  position: sticky;
  top: 0;
}

.app-header {
  padding: 16px 24px;
}

.app-header h1 {
  font-size: 1.5rem;
  color: #1a1a1a;
}

.main-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 24px 32px;
}

.menu-btn {
  display: none;
  background: none;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1.2rem;
  padding: 4px 10px;
  cursor: pointer;
  color: #333;
}

.menu-btn:hover {
  background: #f0f0f0;
}

.overlay {
  display: none;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -250px;
    top: 0;
    z-index: 100;
    transition: left 0.3s ease;
  }

  .sidebar.open {
    left: 0;
  }

  .menu-btn {
    display: block;
  }

  .app-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 50;
  }

  .term-panel {
    width: auto;
    height: auto;
    position: static;
    border-left: none;
    border-top: 1px solid #e0e0e0;
    overflow-y: visible;
  }
}
</style>
```

**Step 3: コミット**

```bash
git add app/src/App.vue app/src/components/TabNav.vue
git commit -m "feat: 3カラムレイアウトに変更し記事ビューを統合"
```

---

### Task 6: 不要コンポーネントを削除

**Files:**
- Delete: `app/src/components/GlossaryTab.vue`
- Delete: `app/src/components/TopicCard.vue`
- Delete: `app/src/components/ConceptCard.vue`
- Delete: `app/src/components/SearchFilter.vue`

**Step 1: ブラウザで記事ビューが正常に動作することを確認**

確認ポイント:
- 左ナビで Topic を選ぶと記事が表示される
- 記事中の紫色の用語リンクをクリックすると右パネルのカードがハイライトされる
- 学習パスタブが正常に表示される
- モバイル幅で右パネルが折りたたみに変わる

**Step 2: 不要ファイルを削除**

```bash
git rm app/src/components/GlossaryTab.vue app/src/components/TopicCard.vue app/src/components/ConceptCard.vue app/src/components/SearchFilter.vue
```

**Step 3: コミット**

```bash
git commit -m "refactor: 記事ビューで不要になったコンポーネントを削除"
```

---

### Task 7: 動作確認と微調整

**Step 1: 全体の動作確認**

確認チェックリスト:
- [ ] 左ナビの各 Topic クリックで記事が切り替わる
- [ ] 記事内の用語リンククリック → 右パネルハイライト
- [ ] 左ナビの Term クリック → 対応 Topic の記事表示 + 右パネルハイライト
- [ ] カテゴリ切り替えで最初の Topic が自動選択される
- [ ] article のない Topic は meaning がフォールバック表示される
- [ ] 学習パスタブが正常動作
- [ ] モバイル幅で右パネルが折りたたみになる
- [ ] ビルドが通る: `cd app && npm run build`

**Step 2: ビルド確認**

```bash
cd app && npm run build
```

Expected: エラーなしでビルド完了

**Step 3: 問題があれば修正してコミット**

```bash
git add -A
git commit -m "fix: 記事ビュー動作確認後の微調整"
```
