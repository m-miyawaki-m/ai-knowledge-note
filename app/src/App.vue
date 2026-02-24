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
import aiDevelopmentData from '@data/ai-development.json'

const dataMap = {
  architectures: architecturesData,
  foundations: foundationsData,
  training: trainingData,
  applications: applicationsData,
  tools: toolsData,
  'ai-development': aiDevelopmentData
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
      // 全カテゴリから用語・概念を検索
      for (const data of allData) {
        const found = (data.terms || []).find(t => t.id === termId)
          || (data.concepts || []).find(c => c.id === termId)
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
let highlightTimer = null
function handleArticleTermClick(termId) {
  if (highlightTimer) clearTimeout(highlightTimer)
  highlightTermId.value = termId
  highlightTimer = setTimeout(() => {
    highlightTermId.value = null
    highlightTimer = null
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
  width: 520px;
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
  .app-layout {
    flex-direction: column;
  }

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
