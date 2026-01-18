<template>
  <div class="review-queue-page animate-slide-right" :class="isDark ? 'dark' : 'light'">
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
        class="word-card group"
        :class="{ 'word-card-forgotten': item.type === 'forgotten' }"
        @click="selectWord(item)"
      >
        <div class="word-main">
          <div class="word-header">
            <h3 class="word-text group-hover:text-emerald-400 transition-colors">{{ item.word.word }}</h3>
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
import { useTheme } from '../composables/useTheme.js'

const { isDark } = useTheme()

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

// Is overdue
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
  @apply max-w-4xl mx-auto p-4 md:p-8;
}

/* 头部 */
.page-header {
  @apply flex items-center justify-between mb-8;
}

.page-title {
  @apply text-2xl font-bold;
  margin-bottom: 0.25rem;
}

.dark .page-title {
  @apply text-white;
}

.light .page-title {
  @apply text-gray-800;
}

.page-desc {
  @apply text-sm;
}

.dark .page-desc {
  @apply text-gray-400;
}

.light .page-desc {
  @apply text-gray-600;
}

/* 统计卡片 */
.stats-grid {
  @apply grid grid-cols-3 gap-4 mb-8;
}

.stat-box {
  @apply backdrop-blur-sm rounded-2xl p-5;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.dark .stat-box {
  @apply bg-slate-800/50 border border-white/10;
}

.light .stat-box {
  @apply bg-white border border-gray-200;
}

.stat-label {
  @apply text-sm text-gray-500 mb-2;
}

.stat-value {
  @apply text-2xl font-bold;
}

.dark .stat-value {
  @apply text-white;
}

.light .stat-value {
  @apply text-gray-800;
}

/* 单词列表 */
.word-list {
  @apply space-y-3;
}

.word-card {
  @apply backdrop-blur-sm rounded-2xl p-5;
  @apply cursor-pointer;
  @apply transition-all duration-200;
}

.dark .word-card {
  @apply bg-slate-800/80 border border-white/5;
}

.light .word-card {
  @apply bg-white border border-gray-200 shadow-sm;
}

.dark .word-card:hover {
  @apply border-emerald-500/30 bg-slate-800;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15);
  transform: translateY(-2px);
}

.light .word-card:hover {
  @apply border-emerald-400 shadow-lg;
  transform: translateY(-2px);
}

.word-main {
  @apply mb-3;
}

.word-header {
  @apply flex items-center gap-3 mb-2;
}

.word-text {
  @apply text-lg font-bold;
}

.dark .word-text {
  @apply text-gray-200;
}

.light .word-text {
  @apply text-gray-800;
}

.word-ipa {
  @apply text-sm text-gray-500 font-mono;
}

.word-meaning {
  @apply text-sm leading-relaxed mb-2;
}

.dark .word-meaning {
  @apply text-gray-300;
}

.light .word-meaning {
  @apply text-gray-600;
}

/* 🔥 英文例句样式 */
.word-example {
  @apply mt-2 pt-2 border-t border-white/5;
}

.example-text {
  @apply text-sm italic text-emerald-400/80;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.word-meta {
  @apply flex items-center gap-4;
  @apply pt-3 border-t border-white/10;
}

.meta-item {
  @apply flex items-center gap-1.5;
}

.meta-label {
  @apply text-xs text-gray-500;
}

.meta-value {
  @apply text-sm font-medium text-gray-300;
}

.meta-value.text-green-600 {
  @apply text-emerald-400;
}

.meta-value.text-yellow-600 {
  @apply text-amber-400;
}

.meta-value.text-red-600 {
  @apply text-rose-400;
}

/* 空状态 */
.empty-state {
  @apply text-center py-20 rounded-3xl;
}

.dark .empty-state {
  @apply bg-slate-800/30 border border-white/5;
}

.light .empty-state {
  @apply bg-gray-50 border border-gray-200;
}

.dark .empty-icon {
  @apply text-slate-700;
}

.light .empty-icon {
  @apply text-gray-400;
}

.empty-icon {
  @apply text-6xl mb-4 font-thin;
}

.empty-title {
  @apply text-lg font-bold mb-2;
}

.dark .empty-title {
  @apply text-white;
}

.light .empty-title {
  @apply text-gray-800;
}

.empty-desc {
  @apply text-sm mb-6;
}

.dark .empty-desc {
  @apply text-gray-500;
}

.light .empty-desc {
  @apply text-gray-600;
}

/* 按钮 */
.btn-primary {
  @apply px-6 py-2.5 rounded-xl font-bold;
  @apply bg-gradient-to-r from-emerald-500 to-teal-500 text-white;
  @apply shadow-lg shadow-emerald-500/20;
  @apply transition-all duration-200;
}

.btn-primary:hover {
  @apply shadow-emerald-500/40 scale-[1.02];
}

/* 弹窗 */
.modal-overlay {
  @apply fixed inset-0 bg-black/80 backdrop-blur-sm;
  @apply flex items-center justify-center z-50 p-4;
}

.modal-container {
  @apply w-full max-w-4xl rounded-3xl overflow-hidden;
}

.dark .modal-container {
  @apply bg-slate-900 border border-white/10;
}

.light .modal-container {
  @apply bg-white border border-gray-200 shadow-2xl;
}

/* 不认识单词特殊样式 */
.word-card-forgotten {
  @apply border-rose-500/20 bg-rose-500/5;
}

.word-card-forgotten:hover {
  @apply border-rose-500/40;
}

/* 警告统计框 */
.stat-box-warning {
  @apply bg-rose-500/10 border-rose-500/20;
}

.stat-box-warning .stat-value {
  @apply text-rose-400;
}

/* 标签样式 */
.meta-tag {
  @apply px-2.5 py-1 rounded-full text-xs font-medium;
  @apply flex items-center gap-1;
}

.meta-tag-forgotten {
  @apply bg-rose-500/10 border border-rose-500/30 text-rose-400;
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
  @apply bg-rose-500/10 text-rose-400 border border-rose-500/30;
}

.priority-medium {
  @apply bg-amber-500/10 text-amber-400 border border-amber-500/30;
}

.priority-low {
  @apply bg-slate-700 text-gray-400 border border-slate-600;
}

/* 正确率样式 */
.accuracy-high {
  @apply text-emerald-400;
}

.accuracy-medium {
  @apply text-amber-400;
}

.accuracy-low {
  @apply text-rose-400;
}
</style>
