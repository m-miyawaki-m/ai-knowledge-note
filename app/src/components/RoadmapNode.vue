<script setup>
defineProps({
  node: { type: Object, required: true }
})

const levelColors = {
  topic: '#6a1b9a',
  concept: '#00838f',
  term: '#e65100'
}
</script>

<template>
  <div class="roadmap-node" :style="{ borderLeftColor: levelColors[node.level] || '#999' }">
    <span class="node-term">{{ node.term }}</span>
    <span v-if="node.termJa" class="node-term-ja">{{ node.termJa }}</span>
    <span v-if="node.type" class="node-type">{{ node.type }}</span>
  </div>
</template>

<style scoped>
.roadmap-node {
  padding: 8px 12px;
  margin: 4px 0;
  background: #fff;
  border-radius: 6px;
  border-left: 3px solid #999;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.node-term {
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.node-term-ja {
  color: #666;
  font-size: 0.8rem;
}

.node-type {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 8px;
  background: #f0f0f0;
  color: #777;
  margin-left: auto;
}
</style>
