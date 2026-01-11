<template>
  <div class="vocabulary-selector">
    <!-- 词库卡片网格 - 改为2列确保一屏显示 -->
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div
        v-for="vocab in vocabularies"
        :key="vocab.id"
        class="vocab-card"
        :class="{ 'active': vocab.id === currentVocabId }"
        @click="selectVocabulary(vocab)"
      >
        <!-- 词库图标 -->
        <div class="vocab-icon" :style="{ backgroundColor: vocab.color + '20' }">
          <span class="text-2xl">{{ vocab.icon }}</span>
        </div>

        <!-- 词库信息 -->
        <div class="vocab-info">
          <div class="flex items-center justify-between mb-1">
            <h3 class="vocab-title">{{ vocab.name }}</h3>
            <div v-if="vocab.id === currentVocabId" class="check-badge">✓</div>
          </div>

          <!-- 词库统计 -->
          <div class="vocab-stats">
            <span class="vocab-badge">{{ vocab.size }}词</span>
            <span class="vocab-badge">{{ vocab.difficulty.label }}</span>
          </div>

          <!-- 学习进度 -->
          <div v-if="getProgress(vocab.id)" class="vocab-progress">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
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

    <!-- 精简提示 -->
    <div class="text-xs text-gray-500 text-center">
      切换词典会自动保存当前进度
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  VOCABULARIES,
  getCurrentVocabulary,
  setCurrentVocabulary,
  getVocabularyProgress
} from '../utils/vocabularyManager.js'

const emit = defineEmits(['select'])

const vocabularies = ref(VOCABULARIES)
const currentVocabId = ref(getCurrentVocabulary().id)
const progressMap = ref({})

// 选择词典
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
  @apply bg-white rounded-lg shadow-sm p-3 cursor-pointer border-2 border-transparent;
  @apply transition-all duration-200;
  @apply hover:shadow-md hover:border-sage-200;
}

.vocab-card.active {
  @apply border-sage-500 shadow-md;
}

.vocab-icon {
  @apply w-12 h-12 rounded-lg flex items-center justify-center mb-2;
}

.vocab-info {
  @apply flex flex-col;
}

.vocab-title {
  @apply text-sm font-bold text-sage-600;
}

.vocab-stats {
  @apply flex gap-1 mb-2;
}

.vocab-badge {
  @apply text-xs px-2 py-0.5 rounded-full;
  @apply bg-sage-100 text-sage-700;
}

.vocab-progress {
  @apply mt-auto pt-2 border-t border-gray-100;
}

.check-badge {
  @apply text-sage-500 font-bold text-lg flex-shrink-0;
}

.progress-bar {
  @apply w-full h-1.5 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full transition-all duration-300 ease-out;
}
</style>
