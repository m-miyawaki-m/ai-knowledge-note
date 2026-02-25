<script setup>
import { ref, computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import ArticlePage from './components/ArticlePage.vue'
import { useArticles } from './composables/useArticles.js'

const { articles, categories, articlesByCategory, getArticle } = useArticles()

const selectedSlug = ref(null)
const sidebarOpen = ref(false)
const filterTag = ref('')

// 初期表示: 最初のカテゴリの最初の記事を選択
const firstCat = categories.value[0]
if (firstCat) {
  const firstArticles = articlesByCategory.value[firstCat.slug]
  if (firstArticles?.length) {
    selectedSlug.value = firstArticles[0].slug
  }
}

const selectedArticle = computed(() => {
  if (!selectedSlug.value) return null
  return getArticle(selectedSlug.value)
})

function handleSelect(slug) {
  selectedSlug.value = slug
  sidebarOpen.value = false
}

function handleNavigate(slug) {
  selectedSlug.value = slug
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleTagClick(tag) {
  filterTag.value = filterTag.value === tag ? '' : tag
}

function handleClearFilter() {
  filterTag.value = ''
}
</script>

<template>
  <div class="app-layout">
    <!-- Mobile header -->
    <header class="mobile-header">
      <button class="menu-btn" @click="sidebarOpen = !sidebarOpen">☰</button>
      <span class="mobile-title">AI Knowledge Note</span>
    </header>

    <!-- Sidebar -->
    <Sidebar
      :categories="categories"
      :articles-by-category="articlesByCategory"
      :selected-slug="selectedSlug"
      :filter-tag="filterTag"
      :class="{ open: sidebarOpen }"
      @select="handleSelect"
      @clear-filter="handleClearFilter"
    />

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    />

    <!-- Main content -->
    <div class="main-area">
      <ArticlePage
        :article="selectedArticle"
        @navigate="handleNavigate"
        @tag-click="handleTagClick"
      />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #fff;
}

.mobile-header {
  display: none;
}

.main-area {
  flex: 1;
  overflow-y: auto;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 48px;
    padding: 0 16px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    z-index: 50;
  }

  .menu-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
  }

  .mobile-title {
    font-size: 16px;
    font-weight: 700;
    color: #6a1b9a;
  }

  .main-area {
    margin-top: 48px;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 99;
  }
}
</style>
