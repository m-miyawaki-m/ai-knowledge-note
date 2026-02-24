<script setup>
import { ref } from 'vue'

const props = defineProps({
  node: { type: Object, required: true },
  selectedId: { type: String, default: '' },
  depth: { type: Number, default: 0 }
})

const emit = defineEmits(['select'])

const expanded = ref(false)

const borderColors = {
  category: '#6a1b9a',
  topic: '#6a1b9a',
  concept: '#00838f',
  term: '#e65100'
}

function toggle() {
  if (props.node.children?.length) {
    expanded.value = !expanded.value
  }
  emit('select', {
    type: props.node.type,
    id: props.node.id,
    categoryKey: props.node.categoryKey
  })
}
</script>

<template>
  <div class="tree-node">
    <div
      class="node-label"
      :class="{
        selected: node.id && node.id === selectedId,
        'is-category': node.type === 'category'
      }"
      :style="{
        paddingLeft: (depth * 16 + 8) + 'px',
        borderLeftColor: borderColors[node.type] || '#999'
      }"
      @click="toggle"
    >
      <span v-if="node.children?.length" class="toggle">{{ expanded ? '\u25BC' : '\u25B6' }}</span>
      <span v-else class="toggle-spacer"></span>
      <span class="label-text">{{ node.label }}</span>
    </div>
    <div v-if="expanded && node.children?.length" class="children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id || child.label"
        :node="child"
        :selectedId="selectedId"
        :depth="depth + 1"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.node-label {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.85rem;
  border-left: 3px solid #999;
  overflow: hidden;
}

.node-label:hover {
  background: #f0f0f0;
}

.node-label.selected {
  background: #e8e0f0;
}

.node-label.is-category {
  font-size: 0.9rem;
  font-weight: 700;
}

.toggle {
  flex-shrink: 0;
  width: 14px;
  font-size: 0.7rem;
  text-align: center;
  user-select: none;
}

.toggle-spacer {
  flex-shrink: 0;
  width: 14px;
}

.label-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
