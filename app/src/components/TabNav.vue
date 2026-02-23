<script setup>
defineProps({
  activeTab: { type: String, default: 'glossary' }
})
defineEmits(['update:activeTab'])

const tabs = [
  { value: 'glossary', label: '用語辞書' },
  { value: 'learning-path', label: '学習パス' }
]
</script>

<template>
  <div class="tab-nav">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="tab-btn"
      :class="{ active: activeTab === tab.value }"
      @click="$emit('update:activeTab', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.tab-nav {
  display: flex;
  border-bottom: 2px solid #eee;
  margin-bottom: 16px;
}

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: none;
  font-size: 0.95rem;
  color: #888;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #6a1b9a;
}

.tab-btn.active {
  color: #6a1b9a;
  border-bottom-color: #6a1b9a;
  font-weight: 600;
}
</style>
