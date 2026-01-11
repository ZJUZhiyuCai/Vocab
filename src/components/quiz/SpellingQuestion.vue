<template>
  <div class="spelling-question">
    <!-- 释义展示 -->
    <div class="meaning-display">
      <h2 class="meaning-text">{{ word.meaning }}</h2>
      <div v-if="word.example" class="example-text">
        {{ word.example }}
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        class="spelling-input"
        :class="{ 'correct': answered && isCorrect, 'wrong': answered && !isCorrect }"
        :disabled="answered"
        placeholder="输入单词拼写..."
        @keyup.enter="handleSubmit"
      >
      <button
        v-if="!answered"
        @click="handleSubmit"
        class="submit-button"
        :disabled="!inputValue.trim()"
      >
        提交
      </button>
    </div>

    <!-- 反馈信息 -->
    <div v-if="answered" class="feedback-area">
      <div v-if="isCorrect" class="feedback-correct">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="ml-2 font-medium">正确！</span>
      </div>
      <div v-else class="feedback-wrong">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="ml-2">
          <span class="font-medium">错误</span>
          <div class="text-sm mt-1">
            正确答案：<span class="font-bold text-sage-600">{{ word.word }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示 -->
    <div v-if="!answered" class="hint-area">
      <span class="text-sm text-gray-500">
        按 Enter 键快速提交
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  word: {
    type: Object,
    required: true
  },
  answered: {
    type: Boolean,
    default: false
  },
  userInput: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['input', 'submit'])

const inputRef = ref(null)
const inputValue = ref('')

// 是否正确
const isCorrect = computed(() => {
  return inputValue.value.toLowerCase().trim() === props.word.word.toLowerCase()
})

// 监听userInput prop变化
watch(() => props.userInput, (newValue) => {
  inputValue.value = newValue
})

// 监听inputValue变化
watch(inputValue, (newValue) => {
  emit('input', newValue)
})

// 提交答案
const handleSubmit = () => {
  if (!inputValue.value.trim() || props.answered) return
  emit('submit')
}

// 聚焦输入框
const focus = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 暴露focus方法
defineExpose({ focus })

// 自动聚焦
watch(() => props.word, () => {
  inputValue.value = ''
  focus()
}, { immediate: true })
</script>

<style scoped>
.spelling-question {
  @apply space-y-6;
}

.meaning-display {
  @apply text-center pb-6 border-b border-gray-200;
}

.meaning-text {
  @apply text-2xl font-bold text-sage-600 mb-3;
}

.example-text {
  @apply text-lg text-gray-600 italic;
}

.input-area {
  @apply flex gap-3 items-center;
}

.spelling-input {
  @apply flex-1 px-4 py-3 text-lg border-2 rounded-lg;
  @apply focus:outline-none focus:border-sage-500;
  @apply disabled:bg-gray-50 disabled:cursor-default;
  @apply transition-colors duration-200;
}

.spelling-input.default {
  @apply border-gray-200;
}

.spelling-input.correct {
  @apply border-green-500 bg-green-50 text-green-700;
}

.spelling-input.wrong {
  @apply border-red-500 bg-red-50 text-red-700;
}

.submit-button {
  @apply px-6 py-3 bg-sage-600 text-white rounded-lg;
  @apply hover:bg-sage-700 active:bg-sage-800 disabled:bg-gray-300 disabled:cursor-not-allowed;
  @apply transition-colors duration-200;
  @apply font-medium;
}

.feedback-area {
  @apply p-4 rounded-lg;
}

.feedback-correct {
  @apply flex items-center bg-green-50 text-green-700;
}

.feedback-wrong {
  @apply flex items-center bg-red-50 text-red-700;
}

.hint-area {
  @apply text-center;
}
</style>
