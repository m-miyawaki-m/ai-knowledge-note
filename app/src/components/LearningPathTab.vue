<script setup>
import { computed } from 'vue'
import RoadmapBranch from './RoadmapBranch.vue'

const props = defineProps({
  categoryData: { type: Object, default: null }
})

const learningTree = computed(() => {
  if (!props.categoryData) return []
  const { topics = [], concepts = [], terms = [] } = props.categoryData
  const placedTermIds = new Set()

  return topics.map(topic => {
    const topicConcepts = concepts
      .filter(c => c.topicId === topic.id)
      .map(concept => {
        const conceptTerms = (concept.relatedTermIds || [])
          .map(tid => terms.find(t => t.id === tid))
          .filter(t => t && !placedTermIds.has(t.id))
        conceptTerms.forEach(t => placedTermIds.add(t.id))
        return { ...concept, terms: conceptTerms }
      })
    return { topic, concepts: topicConcepts }
  })
})
</script>

<template>
  <div class="learning-path-tab">
    <p class="path-description">トピック → 概念 → 用語 の関係をツリー表示します。</p>
    <RoadmapBranch
      v-for="branch in learningTree"
      :key="branch.topic.id"
      :branch="branch"
    />
    <p v-if="!learningTree.length" class="empty">学習パスデータがありません</p>
  </div>
</template>

<style scoped>
.learning-path-tab {
  padding-top: 8px;
}

.path-description {
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
</style>
