<script setup>
defineProps({
  item: { type: Object, required: true },
  concepts: { type: Array, default: () => [] }
})

const emit = defineEmits(['scroll-to-concept'])

const relatedConcepts = (item, concepts) => {
  if (!item.relatedConceptIds?.length) return []
  return concepts.filter(c => item.relatedConceptIds.includes(c.id))
}
</script>

<template>
  <div class="topic-card">
    <div class="topic-header">
      <span class="topic-term">{{ item.term }}</span>
    </div>
    <p v-if="item.termJa" class="topic-term-ja">{{ item.termJa }}</p>
    <p class="topic-meaning">{{ item.meaning }}</p>
    <div v-if="relatedConcepts(item, concepts).length" class="related-concepts">
      <span class="related-label">関連概念:</span>
      <button
        v-for="concept in relatedConcepts(item, concepts)"
        :key="concept.id"
        class="concept-link"
        @click="emit('scroll-to-concept', concept.id)"
      >
        {{ concept.termJa || concept.term }}
      </button>
    </div>
    <div v-if="item.sourceUrl" class="topic-footer">
      <a :href="item.sourceUrl" target="_blank" rel="noopener" class="source-link">Paper</a>
    </div>
  </div>
</template>

<style scoped>
.topic-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
  background: #fff;
  border-left: 3px solid #6a1b9a;
}

.topic-header {
  margin-bottom: 4px;
}

.topic-term {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.topic-term-ja {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 4px;
}

.topic-meaning {
  color: #333;
  margin: 4px 0;
  line-height: 1.6;
}

.related-concepts {
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

.concept-link {
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 12px;
  background: #e0f2f1;
  color: #00695c;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.concept-link:hover {
  background: #b2dfdb;
}

.topic-footer {
  margin-top: 8px;
}

.source-link {
  font-size: 0.8rem;
  color: #6a1b9a;
  text-decoration: none;
}

.source-link:hover {
  text-decoration: underline;
}
</style>
