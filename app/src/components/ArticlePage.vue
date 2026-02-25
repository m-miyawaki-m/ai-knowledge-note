<script setup>
import { computed } from 'vue'

const props = defineProps({
  article: { type: Object, default: null }
})

const emit = defineEmits(['navigate', 'tag-click'])

function handleContentClick(e) {
  // Wikilink クリックの処理
  const link = e.target.closest('.wikilink')
  if (link) {
    e.preventDefault()
    const slug = link.dataset.slug
    if (slug) emit('navigate', slug)
  }
}

const formattedDate = computed(() => {
  if (!props.article?.updated) return ''
  return String(props.article.updated)
})
</script>

<template>
  <main class="article-page">
    <template v-if="article">
      <header class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <div v-if="article.tags.length" class="article-tags">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="tag"
              @click="emit('tag-click', tag)"
            >
              {{ tag }}
            </span>
          </div>
          <span v-if="formattedDate" class="article-date">
            更新: {{ formattedDate }}
          </span>
        </div>
      </header>

      <div
        class="article-content"
        v-html="article.html"
        @click="handleContentClick"
      />
    </template>

    <div v-else class="article-empty">
      <p>左のメニューから記事を選択してください</p>
    </div>
  </main>
</template>

<style scoped>
.article-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}

.article-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.article-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.article-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.tag:hover {
  background: #e0e0e0;
}

.article-date {
  font-size: 12px;
  color: #999;
}

.article-content {
  line-height: 1.8;
  color: #333;
  font-size: 15px;
}

.article-content :deep(h2) {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 32px 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
}

.article-content :deep(h3) {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin: 24px 0 8px;
}

.article-content :deep(p) {
  margin: 0 0 12px;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 0 0 12px;
  padding-left: 24px;
}

.article-content :deep(li) {
  margin-bottom: 4px;
}

.article-content :deep(strong) {
  font-weight: 600;
  color: #1a1a1a;
}

.article-content :deep(code) {
  background: #f5f5f5;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.article-content :deep(pre) {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0 0 12px;
}

.article-content :deep(pre code) {
  background: none;
  padding: 0;
}

.article-content :deep(.wikilink) {
  color: #6a1b9a;
  text-decoration: none;
  border-bottom: 1px dashed #6a1b9a;
  cursor: pointer;
}

.article-content :deep(.wikilink:hover) {
  border-bottom-style: solid;
}

.article-content :deep(.wikilink-unresolved) {
  color: #999;
}

.article-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  color: #999;
}

@media (max-width: 768px) {
  .article-page {
    padding: 16px;
  }

  .article-title {
    font-size: 20px;
  }
}
</style>
