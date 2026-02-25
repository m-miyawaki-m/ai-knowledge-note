<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  articlesByCategory: { type: Object, default: () => ({}) },
  selectedSlug: { type: String, default: '' }
})

const emit = defineEmits(['select'])

const searchQuery = ref('')
const expandedCategories = ref(new Set())

// 初期状態で全カテゴリを展開
watch(() => props.categories, (cats) => {
  if (cats.length > 0 && expandedCategories.value.size === 0) {
    cats.forEach(c => expandedCategories.value.add(c.slug))
  }
}, { immediate: true })

const filteredArticles = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return props.articlesByCategory

  const result = {}
  for (const [catSlug, articles] of Object.entries(props.articlesByCategory)) {
    const filtered = articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    )
    if (filtered.length > 0) result[catSlug] = filtered
  }
  return result
})

function toggleCategory(slug) {
  if (expandedCategories.value.has(slug)) {
    expandedCategories.value.delete(slug)
  } else {
    expandedCategories.value.add(slug)
  }
}

function selectArticle(slug) {
  emit('select', slug)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>AI Knowledge Note</h2>
    </div>

    <div class="sidebar-search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="記事を検索..."
        class="search-input"
      />
    </div>

    <nav class="sidebar-nav">
      <template v-for="cat in categories" :key="cat.slug">
        <div
          v-if="filteredArticles[cat.slug]?.length"
          class="category-group"
        >
          <button
            class="category-header"
            @click="toggleCategory(cat.slug)"
          >
            <span class="category-arrow" :class="{ expanded: expandedCategories.has(cat.slug) }">
              ▶
            </span>
            {{ cat.name }}
            <span class="category-count">{{ filteredArticles[cat.slug]?.length || 0 }}</span>
          </button>

          <ul v-if="expandedCategories.has(cat.slug)" class="article-list">
            <li
              v-for="article in filteredArticles[cat.slug]"
              :key="article.slug"
              class="article-item"
              :class="{ selected: article.slug === selectedSlug }"
              @click="selectArticle(article.slug)"
            >
              {{ article.title }}
            </li>
          </ul>
        </div>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background: #fafafa;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px 16px 8px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: #6a1b9a;
  margin: 0;
}

.sidebar-search {
  padding: 8px 16px;
}

.search-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
}

.search-input:focus {
  border-color: #6a1b9a;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: #6a1b9a;
  text-align: left;
}

.category-header:hover {
  background: #f0f0f0;
}

.category-arrow {
  font-size: 10px;
  transition: transform 0.2s;
  display: inline-block;
}

.category-arrow.expanded {
  transform: rotate(90deg);
}

.category-count {
  margin-left: auto;
  font-size: 11px;
  color: #999;
  font-weight: 400;
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-item {
  padding: 6px 16px 6px 32px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.article-item:hover {
  background: #f0f0f0;
}

.article-item.selected {
  background: #e8e0f0;
  border-left-color: #6a1b9a;
  font-weight: 600;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    z-index: 100;
    transition: left 0.3s;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  }

  .sidebar.open {
    left: 0;
  }
}
</style>
