<template>
  <div class="vocabulary-selector">
    <!-- 词库卡片网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="vocab in vocabularies"
        :key="vocab.id"
        class="vocab-card"
        :class="{ 'active': vocab.id === currentVocabId }"
        @click="selectVocabulary(vocab)"
      >
        <!-- 词库图标 -->
        <div class="vocab-icon" :style="{ backgroundColor: vocab.color + '20' }">
          <span class="text-3xl">{{ vocab.icon }}</span>
        </div>

        <!-- 词库信息 -->
        <div class="vocab-info">
          <div class="flex items-start justify-between mb-2">
            <h3 class="vocab-title">{{ vocab.name }}</h3>
            <div v-if="vocab.id === currentVocabId" class="check-badge">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <p class="vocab-description">{{ vocab.description }}</p>

          <!-- 词库统计 -->
          <div class="vocab-stats">
            <span class="vocab-badge">{{ vocab.size }} 词</span>
            <span class="vocab-badge">{{ getLevelLabel(vocab.level) }}</span>
            <span class="vocab-badge">{{ vocab.category }}</span>
          </div>

          <!-- 学习进度 -->
          <div v-if="getProgress(vocab.id)" class="vocab-progress">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span>学习进度</span>
              <span>{{ getProgressPercent(vocab.id) }}%</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{
                  width: getProgressPercent(vocab.id) + '%',
                  backgroundColor: vocab.color
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示信息 -->
    <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div class="text-sm text-blue-700">
          <p class="font-medium mb-1">切换词库说明</p>
          <p class="opacity-75">每个词库的学习进度是独立的。切换到新词库时，之前的进度会自动保存。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  VOCABULARIES,
  getCurrentVocabulary,
  setCurrentVocabulary,
  getVocabularyProgress,
  LEVEL_LABELS
} from '../utils/vocabularyManager.js'

const emit = defineEmits(['select'])

const vocabularies = ref(VOCABULARIES)
const currentVocabId = ref(getCurrentVocabulary().id)
const progressMap = ref({})

// 获取难度标签
const getLevelLabel = (level) => {
  return LEVEL_LABELS[level] || level
}

// 选择词库
const selectVocabulary = (vocab) => {
  if (vocab.id === currentVocabId.value) return

  currentVocabId.value = vocab.id
  setCurrentVocabulary(vocab.id)
  emit('select', vocab)
}

// 获取词库进度
const getProgress = (vocabId) => {
  return progressMap.value[vocabId]
}

// 获取进度百分比
const getProgressPercent = (vocabId) => {
  const progress = progressMap.value[vocabId]
  if (!progress) return 0

  const learned = new Set(progress.learned || [])
  const vocab = VOCABULARIES.find(v => v.id === vocabId)
  if (!vocab) return 0

  return Math.round((learned.size / vocab.size) * 100)
}

// 加载所有词库的进度
const loadAllProgress = () => {
  VOCABULARIES.forEach(vocab => {
    progressMap.value[vocab.id] = getVocabularyProgress(vocab.id)
  })
}

onMounted(() => {
  loadAllProgress()
})
</script>

<style scoped>
.vocab-card {
  @apply bg-white rounded-lg shadow-sm p-4 cursor-pointer border-2 border-transparent;
  @apply transition-all duration-200;
  @apply hover:shadow-md hover:border-sage-200;
}

.vocab-card.active {
  @apply border-sage-500 shadow-md;
}

.vocab-icon {
  @apply w-16 h-16 rounded-lg flex items-center justify-center mb-3;
}

.vocab-info {
  @apply flex flex-col;
}

.vocab-title {
  @apply text-base font-bold text-sage-600;
}

.vocab-description {
  @apply text-sm text-gray-600 mb-3;
}

.vocab-stats {
  @apply flex flex-wrap gap-2 mb-3;
}

.vocab-badge {
  @apply text-xs px-2 py-1 rounded-full;
  @apply bg-sage-100 text-sage-700;
}

.vocab-progress {
  @apply mt-auto pt-3 border-t border-gray-100;
}

.check-badge {
  @apply text-sage-500 flex-shrink-0;
}

.progress-bar {
  @apply w-full h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full transition-all duration-300 ease-out;
}
</style>
