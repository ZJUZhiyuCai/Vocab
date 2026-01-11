<template>
  <div class="review-queue-page">
    <!-- 头部 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">复习列表</h1>
        <p class="page-desc">基于艾宾浩斯记忆曲线的智能复习</p>
      </div>
      <button v-if="hasWords" @click="startReview" class="btn-primary">
        开始复习
      </button>
    </div>

    <!-- 统计卡片 -->
    <div v-if="hasWords" class="stats-grid">
      <div class="stat-box">
        <div class="stat-label">待复习</div>
        <div class="stat-value">{{ dueCount }}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">已学习</div>
        <div class="stat-value">{{ totalCount }}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">正确率</div>
        <div class="stat-value">{{ accuracy }}%</div>
      </div>
    </div>

    <!-- 单词列表 -->
    <div v-if="hasWords" class="word-list">
      <div
        v-for="(item, index) in sortedWords"
        :key="item.word.id"
        class="word-card"
        @click="selectWord(item)"
      >
        <div class="word-main">
          <div class="word-header">
            <h3 class="word-text">{{ item.word.word }}</h3>
            <span v-if="item.word.ipa" class="word-ipa">{{ item.word.ipa }}</span>
          </div>
          <p class="word-meaning">{{ item.word.meaning }}</p>
        </div>

        <div class="word-meta">
          <div class="meta-item">
            <span class="meta-label">复习</span>
            <span class="meta-value">{{ item.reviewState.reviewCount || 0 }}次</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">正确率</span>
            <span class="meta-value" :class="getAccuracyClass(item.reviewState)">
              {{ getAccuracy(item.reviewState) }}%
            </span>
          </div>
          <div class="meta-item" v-if="isOverdue(item.reviewState)">
            <span class="meta-label overdue">待复习</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">—</div>
      <h3 class="empty-title">还没有学习过的单词</h3>
      <p class="empty-desc">先去今日学习页面学习一些新单词</p>
      <button @click="$emit('navigate', 'today')" class="btn-primary">开始学习</button>
    </div>

    <!-- 复习会话弹窗 -->
    <div v-if="showReview" class="modal-overlay" @click.self="showReview = false">
      <div class="modal-container">
        <ReviewSession
          :words="reviewWords"
          :mode="reviewMode"
          :start-index="reviewIndex"
          @complete="handleReviewComplete"
          @exit="showReview = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ReviewSession from './quiz/ReviewSession.vue'

const props = defineProps({
  words: {
    type: Array,
    required: true
  },
  reviewStates: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['navigate'])

const showReview = ref(false)
const reviewMode = ref('flashcard')
const reviewIndex = ref(0)

// 调试
onMounted(() => {
  console.log('ReviewQueue收到的数据:', {
    wordsCount: props.words.length,
    reviewStatesKeys: Object.keys(props.reviewStates),
    reviewStates: props.reviewStates
  })
})

// 是否有单词
const hasWords = computed(() => {
  const count = Object.keys(props.reviewStates).length
  console.log('hasWords计算:', count)
  return count > 0
})

// 总数
const totalCount = computed(() => {
  return Object.keys(props.reviewStates).length
})

// 待复习数量
const dueCount = computed(() => {
  return Object.values(props.reviewStates).filter(state => {
    return state.nextReview && Date.now() >= state.nextReview
  }).length
})

// 正确率
const accuracy = computed(() => {
  let total = 0
  let correct = 0
  Object.values(props.reviewStates).forEach(state => {
    if (state.reviewCount > 0) {
      total += state.reviewCount
      correct += (state.correctCount || 0)
    }
  })
  return total > 0 ? Math.round((correct / total) * 100) : 0
})

// 排序后的单词列表
const sortedWords = computed(() => {
  const learnedWordIds = Object.keys(props.reviewStates)

  return props.words
    .filter(w => learnedWordIds.includes(w.id))
    .map(word => ({
      word,
      reviewState: props.reviewStates[word.id]
    }))
    .sort((a, b) => {
      const stateA = a.reviewState
      const stateB = b.reviewState

      // 已到期优先
      const isDueA = stateA.nextReview && Date.now() >= stateA.nextReview
      const isDueB = stateB.nextReview && Date.now() >= stateB.nextReview

      if (isDueA && !isDueB) return -1
      if (!isDueA && isDueB) return 1

      // 按超时程度排序
      if (isDueA && isDueB) {
        const overdueA = Date.now() - stateA.nextReview
        const overdueB = Date.now() - stateB.nextReview
        return overdueB - overdueA
      }

      return stateA.nextReview - stateB.nextReview
    })
})

// 复习单词
const reviewWords = computed(() => {
  return sortedWords.value.map(item => item.word)
})

// 是否超时
const isOverdue = (reviewState) => {
  return reviewState.nextReview && Date.now() >= reviewState.nextReview
}

// 计算正确率
const getAccuracy = (reviewState) => {
  const total = (reviewState.correctCount || 0) + (reviewState.incorrectCount || 0)
  if (total === 0) return 100
  return Math.round((reviewState.correctCount / total) * 100)
}

// 获取正确率样式
const getAccuracyClass = (reviewState) => {
  const accuracy = getAccuracy(reviewState)
  if (accuracy >= 80) return 'text-green-600'
  if (accuracy >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

// 选择单词
const selectWord = (item) => {
  const index = sortedWords.value.indexOf(item)
  reviewIndex.value = index
  reviewMode.value = 'flashcard'
  showReview.value = true
}

// 开始复习
const startReview = () => {
  reviewIndex.value = 0
  reviewMode.value = 'flashcard'
  showReview.value = true
}

// 复习完成
const handleReviewComplete = (result) => {
  showReview.value = false
}
</script>

<style scoped>
.review-queue-page {
  @apply max-w-4xl mx-auto p-8;
}

/* 头部 */
.page-header {
  @apply flex items-center justify-between mb-8;
}

.page-title {
  @apply text-2xl font-semibold;
  color: #3d4a3d;
  margin-bottom: 0.25rem;
}

.page-desc {
  @apply text-sm;
  color: #6b7280;
}

/* 统计卡片 */
.stats-grid {
  @apply grid grid-cols-3 gap-4 mb-8;
}

.stat-box {
  @apply bg-white rounded-lg p-5;
  @apply border border-gray-200;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.stat-label {
  @apply text-sm;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  @apply text-2xl font-semibold;
  color: #3d4a3d;
}

/* 单词列表 */
.word-list {
  @apply space-y-3;
}

.word-card {
  @apply bg-white rounded-lg p-5;
  @apply border border-gray-200 cursor-pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  @apply transition-all duration-200;
}

.word-card:hover {
  border-color: #5c6b5c;
  box-shadow: 0 4px 12px rgba(92, 107, 92, 0.15);
}

.word-main {
  @apply mb-3;
}

.word-header {
  @apply flex items-center gap-3 mb-2;
}

.word-text {
  @apply text-lg font-semibold;
  color: #3d4a3d;
}

.word-ipa {
  @apply text-sm;
  color: #6b7280;
}

.word-meaning {
  @apply text-sm;
  color: #6b7280;
  line-height: 1.5;
}

.word-meta {
  @apply flex items-center gap-4;
  @apply pt-3 border-t border-gray-100;
}

.meta-item {
  @apply flex items-center gap-1.5;
}

.meta-label {
  @apply text-xs;
  color: #6b7280;
}

.meta-value {
  @apply text-sm font-medium;
  color: #3d4a3d;
}

.meta-value.text-green-600 {
  color: #059669;
}

.meta-value.text-yellow-600 {
  color: #d97706;
}

.meta-value.text-red-600 {
  color: #dc2626;
}

.meta-label.overdue {
  @apply px-2 py-0.5 rounded-full;
  background-color: #fef2f2;
  color: #dc2626;
}

/* 空状态 */
.empty-state {
  @apply text-center py-20;
}

.empty-icon {
  @apply text-6xl text-gray-300 mb-4;
}

.empty-title {
  @apply text-lg font-semibold mb-2;
  color: #3d4a3d;
}

.empty-desc {
  @apply text-sm mb-6;
  color: #6b7280;
}

/* 按钮 */
.btn-primary {
  @apply px-6 py-2.5 rounded-lg font-medium;
  background-color: #5c6b5c;
  color: white;
  @apply transition-all duration-200;
}

.btn-primary:hover {
  background-color: #4a5a4a;
  box-shadow: 0 2px 8px rgba(92, 107, 92, 0.3);
}

/* 弹窗 */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50;
  @apply flex items-center justify-center z-50 p-4;
}

.modal-container {
  @apply w-full max-w-4xl;
}
</style>
