<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import SearchFilter from './components/SearchFilter.vue'
import TabNav from './components/TabNav.vue'
import GlossaryTab from './components/GlossaryTab.vue'
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

const searchQuery = ref('')
const selectedType = ref('all')
const selectedCategory = ref('architectures')
const activeTab = ref('glossary')
const highlightId = ref(null)
const selectedNodeId = ref(null)
const sidebarOpen = ref(false)

const categoryData = computed(() => dataMap[selectedCategory.value])

watch(selectedCategory, () => {
  searchQuery.value = ''
  selectedType.value = 'all'
  activeTab.value = 'glossary'
  highlightId.value = null
})

async function jumpToTerm(termId) {
  activeTab.value = 'glossary'
  highlightId.value = termId
  await nextTick()
  const el = document.getElementById(`term-${termId}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('highlight')
    setTimeout(() => {
      el.classList.remove('highlight')
      highlightId.value = null
    }, 2000)
  }
}

async function handleTreeSelect({ type, id, categoryKey }) {
  selectedNodeId.value = id
  sidebarOpen.value = false

  if (type === 'category') {
    selectedCategory.value = categoryKey
    return
  }

  // Switch to the correct category if needed
  if (selectedCategory.value !== categoryKey) {
    selectedCategory.value = categoryKey
  }

  activeTab.value = 'glossary'
  await nextTick()

  // Scroll to the selected element
  let elementId = null
  if (type === 'topic') {
    // Topics don't have a dedicated scroll target in GlossaryTab, just show the category
    return
  } else if (type === 'concept') {
    elementId = `concept-${id}`
  } else if (type === 'term') {
    elementId = `term-${id}`
  }

  if (elementId) {
    const el = document.getElementById(elementId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('highlight')
      setTimeout(() => el.classList.remove('highlight'), 2000)
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
          <SearchFilter
            v-model:searchQuery="searchQuery"
            v-model:selectedType="selectedType"
          />
          <TabNav v-model:activeTab="activeTab" />
          <GlossaryTab
            v-if="activeTab === 'glossary'"
            :categoryData="categoryData"
            :searchQuery="searchQuery"
            :selectedType="selectedType"
            @jump-to-term="jumpToTerm"
          />
          <LearningPathTab
            v-if="activeTab === 'learning-path'"
            :categoryData="categoryData"
          />
        </main>
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

.app-header {
  padding: 16px 24px;
  max-width: 720px;
  margin: 0 auto;
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
}
</style>
