<script setup>
defineProps({
  searchQuery: { type: String, default: '' },
  selectedType: { type: String, default: 'all' }
})

defineEmits([
  'update:searchQuery',
  'update:selectedType'
])

const types = [
  { value: 'all', label: 'すべて' },
  { value: 'theory', label: '理論' },
  { value: 'technique', label: '手法' },
  { value: 'model', label: 'モデル' },
  { value: 'metric', label: '評価指標' },
  { value: 'tool', label: 'ツール' }
]
</script>

<template>
  <div class="search-filter">
    <div class="filter-row">
      <input
        type="text"
        class="search-input"
        placeholder="用語を検索..."
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
      />
      <select
        class="type-select"
        :value="selectedType"
        @change="$emit('update:selectedType', $event.target.value)"
      >
        <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.search-filter {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #6a1b9a;
}

.type-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fff;
}
</style>
