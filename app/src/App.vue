<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import SearchFilter from './components/SearchFilter.vue'
import TabNav from './components/TabNav.vue'
import GlossaryTab from './components/GlossaryTab.vue'
import LearningPathTab from './components/LearningPathTab.vue'

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

const categories = Object.entries(dataMap).map(([key, data]) => ({
  value: key,
  label: data.displayName
}))

const searchQuery = ref('')
const selectedType = ref('all')
const selectedCategory = ref('architectures')
const activeTab = ref('glossary')
const highlightId = ref(null)

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
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>AI Knowledge Note</h1>
    </header>
    <main class="main-content">
      <SearchFilter
        v-model:searchQuery="searchQuery"
        v-model:selectedType="selectedType"
        v-model:selectedCategory="selectedCategory"
        :categories="categories"
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
</template>

<style scoped>
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
</style>
