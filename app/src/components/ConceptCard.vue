<script setup>
defineProps({
  item: { type: Object, required: true },
  topics: { type: Array, default: () => [] },
  allTerms: { type: Array, default: () => [] }
})

const emit = defineEmits(['jump-to-term'])

const parentTopic = (item, topics) => {
  return topics.find(t => t.id === item.topicId)
}

const relatedTerms = (item, allTerms) => {
  if (!item.relatedTermIds?.length) return []
  return allTerms.filter(t => item.relatedTermIds.includes(t.id))
}
</script>

<template>
  <div class="concept-card">
    <div class="concept-header">
      <span class="concept-term">{{ item.term }}</span>
    </div>
    <p v-if="item.termJa" class="concept-term-ja">{{ item.termJa }}</p>
    <p v-if="parentTopic(item, topics)" class="concept-parent">
      Topic: {{ parentTopic(item, topics).termJa || parentTopic(item, topics).term }}
    </p>
    <p class="concept-meaning">{{ item.meaning }}</p>
    <div v-if="relatedTerms(item, allTerms).length" class="related-terms">
      <span class="related-label">関連用語:</span>
      <button
        v-for="term in relatedTerms(item, allTerms)"
        :key="term.id"
        class="term-link"
        @click="emit('jump-to-term', term.id)"
      >
        {{ term.termJa || term.term }} →
      </button>
    </div>
    <div v-if="item.sourceUrl" class="concept-footer">
      <a :href="item.sourceUrl" target="_blank" rel="noopener" class="source-link">Paper</a>
    </div>
  </div>
</template>

<style scoped>
.concept-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
  background: #fff;
  border-left: 3px solid #00838f;
}

.concept-header {
  margin-bottom: 4px;
}

.concept-term {
  font-size: 1.05rem;
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.concept-term-ja {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 4px;
}

.concept-parent {
  font-size: 0.8rem;
  color: #6a1b9a;
  margin: 0 0 4px;
}

.concept-meaning {
  color: #333;
  margin: 4px 0;
  line-height: 1.6;
}

.related-terms {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.related-label {
  font-size: 0.8rem;
  color: #888;
}

.term-link {
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 12px;
  background: #fff3e0;
  color: #e65100;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.term-link:hover {
  background: #ffe0b2;
}

.concept-footer {
  margin-top: 8px;
}

.source-link {
  font-size: 0.8rem;
  color: #00838f;
  text-decoration: none;
}

.source-link:hover {
  text-decoration: underline;
}
</style>
