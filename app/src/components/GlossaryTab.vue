<script setup>
import { computed } from 'vue'
import TopicCard from './TopicCard.vue'
import ConceptCard from './ConceptCard.vue'
import TermCard from './TermCard.vue'

const props = defineProps({
  categoryData: { type: Object, default: null },
  searchQuery: { type: String, default: '' },
  selectedType: { type: String, default: 'all' }
})

const emit = defineEmits(['jump-to-term'])

const filteredTerms = computed(() => {
  if (!props.categoryData?.terms) return []
  const query = props.searchQuery.toLowerCase()
  return props.categoryData.terms.filter(term => {
    const matchesSearch = !props.searchQuery ||
      term.term.toLowerCase().includes(query) ||
      (term.termJa && term.termJa.includes(props.searchQuery)) ||
      term.meaning.includes(props.searchQuery)
    const matchesType = props.selectedType === 'all' || term.type === props.selectedType
    return matchesSearch && matchesType
  })
})

const allTerms = computed(() => props.categoryData?.terms || [])

function scrollToConcept(conceptId) {
  const el = document.getElementById(`concept-${conceptId}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('highlight')
    setTimeout(() => el.classList.remove('highlight'), 2000)
  }
}
</script>

<template>
  <div v-if="categoryData" class="glossary-tab">
    <p v-if="categoryData.description" class="description">{{ categoryData.description }}</p>

    <section v-if="categoryData.topics?.length" class="section">
      <h3 class="section-title">トピック</h3>
      <TopicCard
        v-for="topic in categoryData.topics"
        :key="topic.id"
        :item="topic"
        :concepts="categoryData.concepts || []"
        @scroll-to-concept="scrollToConcept"
      />
    </section>

    <section v-if="categoryData.concepts?.length" class="section">
      <h3 class="section-title">概念</h3>
      <div
        v-for="concept in categoryData.concepts"
        :key="concept.id"
        :id="`concept-${concept.id}`"
        class="concept-wrapper"
      >
        <ConceptCard
          :item="concept"
          :topics="categoryData.topics || []"
          :allTerms="allTerms"
          @jump-to-term="emit('jump-to-term', $event)"
        />
      </div>
    </section>

    <section v-if="filteredTerms.length" class="section">
      <h3 class="section-title">用語</h3>
      <TermCard
        v-for="term in filteredTerms"
        :key="term.id"
        :item="term"
      />
    </section>

    <p v-if="!categoryData.topics?.length && !categoryData.concepts?.length && !filteredTerms.length" class="empty">
      このカテゴリにはまだデータがありません
    </p>

    <div v-if="filteredTerms.length" class="stats">
      全 {{ filteredTerms.length }}件
    </div>
  </div>
  <div v-else class="empty">
    <p>カテゴリデータがありません</p>
  </div>
</template>

<style scoped>
.glossary-tab {
  padding-top: 8px;
}

.description {
  color: #555;
  margin-bottom: 20px;
  line-height: 1.6;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #555;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.concept-wrapper {
  transition: background 0.3s;
  border-radius: 8px;
}

.stats {
  text-align: center;
  color: #888;
  font-size: 0.85rem;
  padding: 12px 0;
  border-top: 1px solid #eee;
}

.empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
</style>
