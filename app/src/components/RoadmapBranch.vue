<script setup>
import RoadmapNode from './RoadmapNode.vue'

defineProps({
  branch: { type: Object, required: true }
})
</script>

<template>
  <div class="roadmap-branch">
    <RoadmapNode :node="{ ...branch.topic, level: 'topic' }" />
    <div class="branch-children">
      <div v-for="concept in branch.concepts" :key="concept.id" class="concept-group">
        <RoadmapNode :node="{ ...concept, level: 'concept' }" />
        <div class="term-children">
          <RoadmapNode
            v-for="term in concept.terms"
            :key="term.id"
            :node="{ ...term, level: 'term' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.roadmap-branch {
  margin-bottom: 16px;
}

.branch-children {
  margin-left: 20px;
  border-left: 2px solid #e0e0e0;
  padding-left: 12px;
}

.concept-group {
  margin-bottom: 4px;
}

.term-children {
  margin-left: 20px;
  border-left: 2px solid #f0f0f0;
  padding-left: 12px;
}
</style>
