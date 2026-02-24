<script setup>
import { computed } from 'vue'
import TreeNode from './TreeNode.vue'

const props = defineProps({
  dataMap: { type: Object, required: true },
  selectedId: { type: String, default: '' }
})

defineEmits(['select'])

const treeData = computed(() => {
  return Object.entries(props.dataMap).map(([key, data]) => {
    const topics = (data.topics || []).map(topic => {
      const concepts = (data.concepts || [])
        .filter(c => c.topicId === topic.id)
        .map(concept => {
          const terms = (concept.relatedTermIds || [])
            .map(termId => (data.terms || []).find(t => t.id === termId))
            .filter(Boolean)
            .map(term => ({
              label: term.termJa || term.term,
              type: 'term',
              id: term.id,
              categoryKey: key
            }))

          return {
            label: concept.termJa || concept.term,
            type: 'concept',
            id: concept.id,
            categoryKey: key,
            children: terms.length ? terms : undefined
          }
        })

      return {
        label: topic.termJa || topic.term,
        type: 'topic',
        id: topic.id,
        categoryKey: key,
        children: concepts.length ? concepts : undefined
      }
    })

    return {
      label: data.displayName,
      type: 'category',
      id: key,
      categoryKey: key,
      children: topics.length ? topics : undefined
    }
  })
})
</script>

<template>
  <aside class="tree-sidebar">
    <div class="sidebar-header">
      <h2>目次</h2>
    </div>
    <nav class="tree-nav">
      <TreeNode
        v-for="node in treeData"
        :key="node.id"
        :node="node"
        :selectedId="selectedId"
        @select="$emit('select', $event)"
      />
    </nav>
  </aside>
</template>

<style scoped>
.tree-sidebar {
  width: 250px;
  height: 100vh;
  overflow-y: auto;
  background: #fafafa;
  border-right: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.sidebar-header h2 {
  font-size: 1rem;
  color: #333;
}

.tree-nav {
  padding: 8px 0;
}
</style>
