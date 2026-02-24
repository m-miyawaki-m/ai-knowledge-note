<script setup>
import { ref, watch, nextTick } from 'vue'
import TermCard from './TermCard.vue'

const props = defineProps({
  terms: { type: Array, default: () => [] },
  highlightTermId: { type: String, default: null },
  collapsed: { type: Boolean, default: true }
})

const emit = defineEmits(['update:collapsed'])

const localCollapsed = ref(props.collapsed)

watch(() => props.collapsed, (v) => { localCollapsed.value = v })

function toggleCollapsed() {
  localCollapsed.value = !localCollapsed.value
  emit('update:collapsed', localCollapsed.value)
}

watch(() => props.highlightTermId, async (id) => {
  if (!id) return
  localCollapsed.value = false
  emit('update:collapsed', false)
  await nextTick()
  const el = document.getElementById(`term-sidebar-${id}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('highlight')
    setTimeout(() => el.classList.remove('highlight'), 2000)
  }
})
</script>

<template>
  <aside class="term-sidebar">
    <div class="sidebar-header desktop-only">
      <h3>関連用語</h3>
      <span class="count">{{ terms.length }}</span>
    </div>

    <button class="collapse-toggle mobile-only" @click="toggleCollapsed">
      <span>{{ localCollapsed ? '▶' : '▼' }} 関連用語 ({{ terms.length }})</span>
    </button>

    <div class="term-list" :class="{ collapsed: localCollapsed }">
      <div
        v-for="term in terms"
        :key="term.id"
        :id="`term-sidebar-${term.id}`"
        class="term-wrapper"
        :class="{ active: highlightTermId === term.id }"
      >
        <TermCard :item="term" />
      </div>
      <p v-if="!terms.length" class="empty">この記事に関連する用語はありません</p>
    </div>
  </aside>
</template>

<style scoped>
.term-sidebar {
  padding: 12px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
}

.sidebar-header h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #555;
}

.count {
  font-size: 0.75rem;
  background: #f0f0f0;
  color: #666;
  padding: 1px 8px;
  border-radius: 10px;
}

.term-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.term-wrapper {
  transition: background 0.3s;
  border-radius: 8px;
}

.term-wrapper.active {
  background: #f3e5f5;
}

.collapse-toggle {
  display: none;
  width: 100%;
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #333;
  cursor: pointer;
  text-align: left;
}

.collapse-toggle:hover {
  background: #f0f0f0;
}

.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

.empty {
  color: #999;
  font-size: 0.85rem;
  text-align: center;
  padding: 16px 0;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .term-list.collapsed {
    display: none;
  }
}

:deep(.highlight) {
  animation: highlightFade 2s ease;
}

@keyframes highlightFade {
  0% { background: #f3e5f5; }
  100% { background: transparent; }
}
</style>
