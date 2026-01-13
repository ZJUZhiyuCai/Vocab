<template>
  <div class="review-queue-page">
    <!-- 头部 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">复习列表</h1>
        <p class="page-desc">优先复习不认识的单词</p>
      </div>
      <button v-if="hasWords" @click="startReview" class="btn-primary">
        开始复习
      </button>
    </div>

    <!-- 统计卡片 -->
    <div v-if="hasWords" class="stats-grid">
      <div class="stat-box">
        <div class="stat-label">待复习</div>
        <div class="stat-value">{{ reviewData.length }}</div>
      </div>
      <div class="stat-box stat-box-warning">
        <div class="stat-label">不认识</div>
        <div class="stat-value">{{ forgottenCount }}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">已学习</div>
        <div class="stat-value">{{ totalCount }}</div>
      </div>
    </div>

    <!-- 单词列表 -->
    <div v-if="hasWords" class="word-list">
      <div
        v-for="(item, index) in reviewData"
        :key="item.word.id"
        class="word-card"
        :class="{ 'word-card-forgotten': item.type === 'forgotten' }"
        @click="selectWord(item)"
      >
        <div class="word-main">
          <div class="word-header">
            <h3 class="word-text">{{ item.word.word }}</h3>
            <span v-if="item.word.ipa" class="word-ipa">{{ item.word.ipa }}</span>
          </div>
          <p class="word-meaning">{{ item.word.meaning }}</p>
          <!-- 🔥 添加英文例句作为英文参考 -->
          <div v-if="item.word.examples && item.word.examples.length > 0" class="word-example">
            <span class="example-text">{{ item.word.examples[0].sentence }}</span>
          </div>
        </div>

        <div class="word-meta">
          <!-- 不认识标记 -->
          <div v-if="item.type === 'forgotten'" class="meta-item meta-tag meta-tag-forgotten">
            <span class="tag-icon">⚠️</span>
            <span class="tag-text">不认识</span>
          </div>

          <!-- 复习信息 -->
          <div v-else class="meta-item">
            <span class="meta-label">复习</span>
            <span class="meta-value">{{ item.reviewState?.reviewCount || 0 }}次</span>
          </div>

          <!-- 正确率 -->
          <div v-if="item.reviewState" class="meta-item">
            <span class="meta-label">正确率</span>
            <span class="meta-value" :class="getAccuracyClass(item.reviewState)">
              {{ getAccuracy(item.reviewState) }}%
            </span>
          </div>

          <!-- 优先级标记 -->
          <div class="meta-item">
            <span class="meta-label priority-badge" :class="getPriorityClass(item.priority)">
              优先级 {{ item.priority }}
            </span>
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
  reviewData: {
    type: Array,
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
    reviewDataCount: props.reviewData.length,
    reviewData: props.reviewData
  })
})

// 是否有单词
const hasWords = computed(() => {
  return props.reviewData.length > 0
})

// 不认识单词数量
const forgottenCount = computed(() => {
  return props.reviewData.filter(item => item.type === 'forgotten').length
})

// 总数
const totalCount = computed(() => {
  return props.reviewData.length
})

// 获取优先级样式类
const getPriorityClass = (priority) => {
  if (priority >= 100) return 'priority-high' // 不认识的单词
  if (priority >= 70) return 'priority-medium'
  return 'priority-low'
}

// 获取正确率
const getAccuracy = (reviewState) => {
  if (!reviewState || reviewState.reviewCount === 0) return 0
  return Math.round((reviewState.correctCount / reviewState.reviewCount) * 100)
}

// 获取正确率样式类
const getAccuracyClass = (reviewState) => {
  const accuracy = getAccuracy(reviewState)
  if (accuracy >= 80) return 'accuracy-high'
  if (accuracy >= 60) return 'accuracy-medium'
  return 'accuracy-low'
}

// 是否已到期复习
const isOverdue = (reviewState) => {
  return reviewState && reviewState.nextReview && Date.now() >= reviewState.nextReview
}

// 复习单词
const reviewWords = computed(() => {
  return props.reviewData.map(item => item.word)
})

// 选择单词
const selectWord = (item) => {
  const index = props.reviewData.indexOf(item)
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
  margin-bottom: 0.5rem;
}

/* 🔥 英文例句样式 */
.word-example {
  @apply mt-2 pt-2 border-t border-gray-100;
}

.example-text {
  @apply text-sm italic;
  color: #5c6b5c;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

/* 不认识单词特殊样式 */
.word-card-forgotten {
  @apply border-red-200 bg-red-50;
}

.word-card-forgotten:hover {
  border-color: #ef4444;
}

/* 警告统计框 */
.stat-box-warning {
  @apply bg-orange-50 border-orange-200;
}

.stat-box-warning .stat-value {
  color: #ea580c;
}

/* 标签样式 */
.meta-tag {
  @apply px-2.5 py-1 rounded-full text-xs font-medium;
  @apply flex items-center gap-1;
}

.meta-tag-forgotten {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.tag-icon {
  @apply text-sm;
}

.tag-text {
  @apply font-medium;
}

/* 优先级徽章 */
.priority-badge {
  @apply px-2 py-0.5 rounded text-xs font-medium;
}

.priority-high {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.priority-medium {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.priority-low {
  background-color: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

/* 正确率样式 */
.accuracy-high {
  color: #059669;
}

.accuracy-medium {
  color: #d97706;
}

.accuracy-low {
  color: #dc2626;
}
</style>
