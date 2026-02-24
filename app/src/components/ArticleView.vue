<script setup>
import ArticleSection from './ArticleSection.vue'

const props = defineProps({
  topic: { type: Object, default: null }
})

const emit = defineEmits(['term-click'])
</script>

<template>
  <div v-if="topic" class="article-view">
    <header class="article-header">
      <h2 class="article-title">{{ topic.termJa || topic.term }}</h2>
      <p v-if="topic.termJa" class="article-title-en">{{ topic.term }}</p>
    </header>

    <div v-if="topic.article?.sections?.length" class="article-body">
      <ArticleSection
        v-for="(section, i) in topic.article.sections"
        :key="i"
        :heading="section.heading"
        :body="section.body"
        @term-click="emit('term-click', $event)"
      />
    </div>

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
