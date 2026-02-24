<script setup>
import { computed } from 'vue'

const props = defineProps({
  heading: { type: String, required: true },
  body: { type: String, required: true }
})

const emit = defineEmits(['term-click'])

const parsedBody = computed(() => {
  const parts = []
  const regex = /\[\[([^\]|]+)\|([^\]]+)\]\]/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(props.body)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: props.body.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'link', id: match[1], text: match[2] })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < props.body.length) {
    parts.push({ type: 'text', content: props.body.slice(lastIndex) })
  }

  return parts
})
</script>

<template>
  <section class="article-section">
    <h3 class="section-heading">{{ heading }}</h3>
    <p class="section-body">
      <template v-for="(part, i) in parsedBody" :key="i">
        <span v-if="part.type === 'text'">{{ part.content }}</span>
        <a
          v-else
          class="term-link"
          href="#"
          @click.prevent="emit('term-click', part.id)"
        >{{ part.text }}</a>
      </template>
    </p>
  </section>
</template>

<style scoped>
.article-section {
  margin-bottom: 24px;
}

.section-heading {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.section-body {
  color: #333;
  line-height: 1.8;
  font-size: 0.95rem;
}

.term-link {
  color: #6a1b9a;
  text-decoration: none;
  border-bottom: 1px dashed #6a1b9a;
  cursor: pointer;
  font-weight: 500;
}

.term-link:hover {
  background: #f3e5f5;
  border-bottom-style: solid;
}
</style>
