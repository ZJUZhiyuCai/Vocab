<template>
  <div class="quiz-page">
    <!-- 主页面：选择学习模式 -->
    <div v-if="!currentMode" class="mode-selection">
      <!-- 统计概览 -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-value">{{ learnedCount }}</div>
          <div class="stat-label">学习过</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ reviewAccuracy }}%</div>
          <div class="stat-label">正确率</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalReviewed }}</div>
          <div class="stat-label">复习次数</div>
        </div>
      </div>

      <!-- 学习模式 -->
      <div class="mode-section">
        <h2 class="section-title">学习模式</h2>
        <p class="section-description">选择你的学习方式</p>

        <div v-if="learnedCount > 0" class="mode-options">
          <button @click="startSession('flashcard')" class="mode-card">
            <h3 class="mode-title">闪卡学习</h3>
            <p class="mode-desc">快速浏览单词，点击翻转查看释义</p>
          </button>
          <button @click="startSession('spelling')" class="mode-card">
            <h3 class="mode-title">拼写练习</h3>
            <p class="mode-desc">根据释义拼写单词，强化记忆</p>
          </button>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">—</div>
          <h3 class="empty-title">还没有学习过的单词</h3>
          <p class="empty-desc">先去今日学习页面学习一些新单词</p>
          <button @click="$emit('navigate', 'today')" class="btn-primary">开始学习</button>
        </div>
      </div>

      <!-- 单词列表 -->
      <div class="list-section">
        <div class="list-header">
          <div>
            <h2 class="section-title">单词列表</h2>
            <p class="section-description">查看所有学习过的单词</p>
          </div>
          <button @click="openWordList" class="btn-secondary">
            查看列表
          </button>
        </div>
      </div>
    </div>

    <!-- 学习进行中 -->
    <div v-if="currentMode === 'session'" class="session-container">
      <ReviewSession
        :words="learnedWords"
        :mode="sessionMode"
        :start-index="startIndex"
        @complete="handleSessionComplete"
        @exit="exitSession"
      />
    </div>

    <!-- 单词列表弹窗 -->
    <div v-if="showWordList" class="modal-overlay" @click.self="showWordList = false">
      <div class="modal-container">
        <ReviewQueuePreview
          :words="wordListData"
          @close="showWordList = false"
          @start="startSessionFromList"
          @startFromIndex="startSessionFromIndex"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ReviewSession from './quiz/ReviewSession.vue'
import ReviewQueuePreview from './ReviewQueuePreview.vue'

const props = defineProps({
  words: {
    type: Array,
    required: true
  },
  learned: {
    type: Set,
    required: true
  },
  reviewStates: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['navigate'])

// 当前模式：null（选择页面）, 'session'（学习中）
const currentMode = ref(null)
const sessionMode = ref('flashcard')
const showWordList = ref(false)
const startIndex = ref(0)

// 调试：打印传入的数据
onMounted(() => {
  console.log('Quiz收到的数据:', {
    wordsCount: props.words.length,
    reviewStatesKeys: Object.keys(props.reviewStates),
    reviewStates: props.reviewStates
  })
})

// 计算统计数据
const learnedCount = computed(() => {
  return Object.keys(props.reviewStates).length
})

const totalReviewed = computed(() => {
  return Object.values(props.reviewStates).filter(state => state.reviewCount > 0).length
})

const reviewAccuracy = computed(() => {
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

// 获取学习过的单词（按优先级排序）
const learnedWords = computed(() => {
  const learnedWordIds = Object.keys(props.reviewStates)

  return props.words.filter(w => learnedWordIds.includes(w.id))
    .sort((a, b) => {
      const stateA = props.reviewStates[a.id]
      const stateB = props.reviewStates[b.id]

      // 按优先级排序：已到期 > 未到期
      const isDueA = stateA.nextReview && Date.now() >= stateA.nextReview
      const isDueB = stateB.nextReview && Date.now() >= stateB.nextReview

      if (isDueA && !isDueB) return -1
      if (!isDueA && isDueB) return 1

      // 都到期或都没到期时，按超时程度排序
      if (isDueA && isDueB) {
        const overdueA = Date.now() - stateA.nextReview
        const overdueB = Date.now() - stateB.nextReview
        return overdueB - overdueA
      }

      // 都没到期，按下次复习时间排序
      return stateA.nextReview - stateB.nextReview
    })
})

// 获取单词列表详细数据
const wordListData = computed(() => {
  console.log('计算wordListData:', {
    learnedWordsCount: learnedWords.value.length,
    firstWord: learnedWords.value[0]
  })

  return learnedWords.value.map(word => {
    const reviewState = props.reviewStates[word.id]
    return { word, reviewState }
  })
})

// 打开单词列表
const openWordList = () => {
  console.log('打开单词列表，数据:', wordListData.value)
  showWordList.value = true
}

// 开始学习
const startSession = (mode) => {
  sessionMode.value = mode
  startIndex.value = 0
  currentMode.value = 'session'
}

// 从列表开始学习
const startSessionFromList = () => {
  showWordList.value = false
  sessionMode.value = 'flashcard'
  startIndex.value = 0
  currentMode.value = 'session'
}

// 从指定索引开始学习
const startSessionFromIndex = (index) => {
  showWordList.value = false
  sessionMode.value = 'flashcard'
  startIndex.value = index
  currentMode.value = 'session'
}

// 学习完成
const handleSessionComplete = (result) => {
  console.log('学习完成:', result)
  currentMode.value = null
}

// 退出当前会话
const exitSession = () => {
  currentMode.value = null
}
</script>

<style scoped>
.quiz-page {
  @apply max-w-5xl mx-auto p-8;
}

.mode-selection {
  @apply space-y-6;
}

/* 统计概览 */
.stats-overview {
  @apply grid grid-cols-3 gap-4;
}

.stat-card {
  @apply bg-white rounded-lg p-5;
  @apply border border-gray-200;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.stat-value {
  @apply text-3xl font-semibold;
  color: #3d4a3d;
}

.stat-label {
  @apply text-sm mt-1;
  color: #6b7280;
}

/* 区块 */
.mode-section,
.list-section {
  @apply bg-white rounded-lg p-6;
  @apply border border-gray-200;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.section-title {
  @apply text-xl font-semibold;
  color: #3d4a3d;
  margin-bottom: 0.25rem;
}

.section-description {
  @apply text-sm;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* 学习模式卡片 */
.mode-options {
  @apply grid grid-cols-2 gap-4;
}

.mode-card {
  @apply p-6 rounded-lg border-2 border-gray-200;
  @apply transition-all duration-200;
  background-color: #fafafa;
}

.mode-card:hover {
  border-color: #5c6b5c;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(92, 107, 92, 0.15);
}

.mode-title {
  @apply text-lg font-semibold mb-2;
  color: #3d4a3d;
}

.mode-desc {
  @apply text-sm;
  color: #6b7280;
  line-height: 1.5;
}

/* 空状态 */
.empty-state {
  @apply text-center py-16;
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

.btn-secondary {
  @apply px-5 py-2 rounded-lg font-medium border;
  background-color: white;
  border-color: #d1d5db;
  color: #374151;
  @apply transition-all duration-200;
}

.btn-secondary:hover {
  border-color: #5c6b5c;
  color: #5c6b5c;
  background-color: #fafafa;
}

/* 列表区块 */
.list-header {
  @apply flex items-center justify-between;
}

/* 会话容器 */
.session-container {
  @apply bg-white rounded-lg;
  @apply border border-gray-200;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
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
