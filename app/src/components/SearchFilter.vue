<script setup>
defineProps({
  searchQuery: { type: String, default: '' },
  selectedType: { type: String, default: 'all' },
  categories: { type: Array, default: () => [] },
  selectedCategory: { type: String, default: '' }
})

defineEmits([
  'update:searchQuery',
  'update:selectedType',
  'update:selectedCategory'
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
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.value"
        class="category-tab"
        :class="{ active: selectedCategory === cat.value }"
        @click="$emit('update:selectedCategory', cat.value)"
      >
        {{ cat.label }}
      </button>
    </div>
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

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.category-tab {
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: #fff;
  color: #555;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.category-tab:hover {
  border-color: #6a1b9a;
  color: #6a1b9a;
}

.category-tab.active {
  background: #6a1b9a;
  border-color: #6a1b9a;
  color: #fff;
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
