<template>
  <div class="review-session">
    <!-- 顶部进度条 -->
    <div class="session-header">
      <div class="header-info">
        <h2 class="text-xl font-bold text-sage-600">
          {{ mode === 'flashcard' ? '🎴 闪卡复习' : '✍️ 拼写复习' }}
        </h2>
        <span class="text-sm text-gray-600">{{ currentIndex + 1 }} / {{ words.length }}</span>
      </div>
      <button @click="$emit('exit')" class="exit-button">退出</button>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <!-- 闪卡模式 -->
    <div v-if="mode === 'flashcard'" class="content-area">
      <FlashcardView
        :word="currentWord"
        :show-answer="showAnswer"
        :has-previous="currentIndex > 0"
        :has-next="currentIndex < words.length - 1"
        @toggle="toggleAnswer"
        @previous="previous"
        @next="next"
        @rate="handleRate"
      />
    </div>

    <!-- 拼写模式 -->
    <div v-else-if="mode === 'spelling'" class="content-area">
      <SpellingQuestion
        :word="currentWord"
        :answered="answered"
        :user-input="userInput"
        @input="handleInput"
        @submit="handleSubmit"
      />
      <div v-if="answered" class="action-buttons">
        <button @click="next" class="btn btn-primary">
          {{ isLast ? '完成复习' : '下一个' }}
        </button>
      </div>
    </div>

    <!-- 完成页面 -->
    <div v-if="currentIndex >= words.length" class="completion-view">
      <div class="text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-2xl font-bold text-sage-600 mb-2">复习完成！</h2>
        <p class="text-gray-600 mb-6">你复习了 {{ words.length }} 个单词</p>
        <button @click="handleComplete" class="btn btn-primary">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FlashcardView from './FlashcardView.vue'
import SpellingQuestion from './SpellingQuestion.vue'

const props = defineProps({
  words: {
    type: Array,
    required: true
  },
  mode: {
    type: String,
    default: 'flashcard'
  },
  startIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['complete', 'exit'])

const currentIndex = ref(props.startIndex)
const showAnswer = ref(false)
const answered = ref(false)
const userInput = ref('')

const currentWord = computed(() => {
  return props.words[currentIndex.value] || null
})

const progressPercent = computed(() => {
  return ((currentIndex.value + 1) / props.words.length) * 100
})

const isLast = computed(() => {
  return currentIndex.value >= props.words.length - 1
})

const toggleAnswer = () => {
  showAnswer.value = !showAnswer.value
}

const previous = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    showAnswer.value = false
    answered.value = false
    userInput.value = ''
  }
}

const next = () => {
  if (currentIndex.value < props.words.length - 1) {
    currentIndex.value++
    showAnswer.value = false
    answered.value = false
    userInput.value = ''
  }
}

const handleRate = (rating) => {
  // 可以记录评分
  console.log('评分:', rating)
  next()
}

const handleInput = (input) => {
  userInput.value = input
}

const handleSubmit = () => {
  answered.value = true
}

const handleComplete = () => {
  emit('complete', {
    total: props.words.length,
    reviewed: props.words.length
  })
}

// 🔥 键盘快捷键支持
const handleKeydown = (event) => {
  // 如果在输入框中,不触发快捷键(让输入框自己处理)
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    // 特殊处理:如果已回答,输入框已禁用,此时允许Space/Enter进入下一个
    if (answered.value && (event.key === ' ' || event.key === 'Space' || event.key === 'Enter')) {
      event.preventDefault()
      next()
    }
    return
  }

  // 拼写模式已回答状态下,按Space或Enter进入下一个
  if (props.mode === 'spelling' && answered.value) {
    if (event.key === ' ' || event.key === 'Space' || event.key === 'Enter') {
      event.preventDefault()
      next()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.review-session {
  @apply p-6;
}

.session-header {
  @apply flex justify-between items-center mb-4;
}

.header-info {
  @apply flex items-center gap-4;
}

.exit-button {
  @apply px-4 py-2 text-gray-600 hover:text-gray-800;
  @apply border border-gray-300 rounded-lg;
  @apply hover:bg-gray-50;
}

.progress-bar {
  @apply w-full h-2 bg-gray-200 rounded-full mb-6;
}

.progress-fill {
  @apply h-full bg-sage-500 rounded-full transition-all duration-300;
}

.content-area {
  @apply min-h-[400px];
}

.action-buttons {
  @apply flex justify-center mt-6;
}

.completion-view {
  @apply py-12;
}
</style>
