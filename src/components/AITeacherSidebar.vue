<template>
  <div class="ai-teacher-sidebar">
    <!-- 收起状�?- 浮动按钮 -->
    <Transition name="slide">
      <button
        v-if="!isOpen"
        @click="toggleOpen"
        class="float-button"
        title="AI 学习老师"
      >
        <span class="float-icon">🤖</span>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
      </button>
    </Transition>

    <!-- 展开状�?- 侧边�?-->
    <Transition name="slide">
      <div v-if="isOpen" class="sidebar-panel">
        <!-- 头部 -->
        <div class="sidebar-header">
          <div class="header-info">
            <span class="header-icon">🤖</span>
            <div>
              <h3 class="header-title">AI 学习老师</h3>
              <p v-if="currentWord" class="header-subtitle">
                正在学习：{{ currentWord.word }}
              </p>
              <p v-else class="header-subtitle">随时为你解答</p>
            </div>
          </div>
          <button @click="toggleOpen" class="close-btn" title="收起">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- API 警告 -->
        <div v-if="!isAvailable" class="api-warning">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>请先配置 API 密钥</span>
          <button @click="$emit('openSettings')" class="text-btn">去设�?/button>
        </div>

        <!-- 快捷问题 -->
        <div v-if="isAvailable && currentWord && !isLoading" class="quick-questions">
          <p class="quick-label">你可以问�?/p>
          <div class="quick-buttons">
            <button
              v-for="(question, idx) in quickQuestions"
              :key="idx"
              @click="askQuestion(question)"
              class="quick-btn"
              :disabled="isSending"
            >
              {{ question }}
            </button>
          </div>
        </div>

        <!-- 对话历史 -->
        <div ref="messagesContainer" class="messages-container">
          <div
            v-for="(message, index) in conversationHistory"
            :key="index"
            :class="['message', message.role]"
          >
            <div class="message-avatar">
              {{ message.role === 'user' ? '👤' : '🤖' }}
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>

          <!-- 加载�?-->
          <div v-if="isLoading" class="message assistant">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <!-- 欢迎消息 -->
          <div v-if="conversationHistory.length === 0 && !isLoading" class="welcome-message">
            <p class="welcome-text">👋 你好！我是你�?AI 学习老师</p>
            <p class="welcome-hint">关于单词学习的问题，随时问我</p>
          </div>
        </div>

        <!-- 输入�?-->
        <div class="input-area">
          <textarea
            v-model="userInput"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.shift.prevent="userInput += '\n'"
            placeholder="输入问题... (Enter 发送，Shift+Enter 换行)"
            class="message-input"
            rows="2"
            :disabled="isSending || !isAvailable"
          ></textarea>
          <button
            @click="sendMessage"
            class="send-btn"
            :disabled="!userInput.trim() || isSending || !isAvailable"
            title="发�?(Enter)"
          >
            <svg v-if="!isSending" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { getAIAgent } from '../utils/aiAgent.js'

const props = defineProps({
  currentWord: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['openSettings'])

const agent = getAIAgent()
const isOpen = ref(false)
const userInput = ref('')
const isLoading = ref(false)
const isSending = ref(false)
const messagesContainer = ref(null)
const conversationHistory = ref([])

const isAvailable = computed(() => agent.isAvailable())
const unreadCount = computed(() => 0) // 暂时未实现未读消息功�?

// 快捷问题
const quickQuestions = computed(() => {
  if (!props.currentWord) return []

  const word = props.currentWord.word
  return [
    `"${word}" 的记忆技巧`,
    `"${word}" 的词源`,
    `"${word}" 的同义词`,
    `�?"${word}" 造句`
  ]
})

// 切换开�?
function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 发送消�?
async function sendMessage() {
  const message = userInput.value.trim()
  if (!message || isSending.value) return

  if (!isAvailable.value) {
    alert('请先配置 API 密钥')
    return
  }

  // 添加用户消息
  conversationHistory.value.push({
    role: 'user',
    content: message,
    timestamp: Date.now()
  })

  userInput.value = ''
  isSending.value = true
  scrollToBottom()

  try {
    // 构建上下�?
    let context = ''
    if (props.currentWord) {
      context = `当前正在学习单词�?{props.currentWord.word}�?{props.currentWord.meaning}）`
    }

    // 调用 AI
    const response = await agent.chat(context + '\n\n用户问题�? + message)

    conversationHistory.value.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('AI 回复失败:', error)
    conversationHistory.value.push({
      role: 'assistant',
      content: '抱歉，我遇到了一些问题。请稍后再试�?,
      timestamp: Date.now()
    })
  } finally {
    isSending.value = false
    scrollToBottom()
  }
}

// 快捷提问
function askQuestion(question) {
  userInput.value = question
  nextTick(() => {
    sendMessage()
  })
}

// 滚动到底�?
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 格式化时�?
function formatTime(timestamp) {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 监听当前单词变化
watch(() => props.currentWord, (newWord) => {
  if (newWord && isOpen.value && conversationHistory.value.length === 0) {
    // 如果是第一次打开，且切换了新单词，可以考虑添加提示
    // 但由于是纯被动，所以不主动提示
  }
})

// 加载历史对话
onMounted(() => {
  // 可以�?localStorage 加载历史对话
  try {
    const saved = localStorage.getItem('vocabcontext_ai_teacher_history')
    if (saved) {
      const history = JSON.parse(saved)
      // 只加载最近的消息
      conversationHistory.value = history.slice(-20)
    }
  } catch (error) {
    console.error('加载对话历史失败:', error)
  }
})

// 保存对话历史
watch(conversationHistory, (newHistory) => {
  try {
    localStorage.setItem('vocabcontext_ai_teacher_history', JSON.stringify(newHistory))
  } catch (error) {
    console.error('保存对话历史失败:', error)
  }
}, { deep: true })

// 暴露打开方法给父组件
defineExpose({
  open: () => {
    isOpen.value = true
  }
})
</script>

<style scoped>
.ai-teacher-sidebar {
  @apply relative z-50;
}

/* 浮动按钮 */
.float-button {
  @apply fixed right-6 bottom-6 w-14 h-14 rounded-full;
  @apply bg-gradient-to-br from-md-primary to-md-primary/80;
  @apply text-white shadow-lg hover:shadow-xl;
  @apply flex items-center justify-center;
  @apply transition-all duration-300;
  @apply hover:scale-110 active:scale-95;
}

.float-icon {
  @apply text-2xl;
}

.unread-badge {
  @apply absolute -top-1 -right-1;
  @apply bg-error text-white;
  @apply text-xs w-5 h-5 rounded-full;
  @apply flex items-center justify-center;
}

/* 侧边栏面�?*/
.sidebar-panel {
  @apply fixed right-0 top-0 bottom-0 w-96;
  @apply bg-white shadow-2xl border-l border-gray-200;
  @apply flex flex-col;
  @apply transform transition-transform duration-300;
}

/* 头部 */
.sidebar-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
  @apply bg-gradient-to-r from-md-primary-container/30 to-beige-50;
}

.header-info {
  @apply flex items-center gap-3;
}

.header-icon {
  @apply text-3xl;
}

.header-title {
  @apply text-lg font-bold text-md-primary;
}

.header-subtitle {
  @apply text-sm text-gray-600;
}

.close-btn {
  @apply p-2 rounded-lg hover:bg-white/50 text-gray-600;
  @apply transition-colors duration-200;
}

/* API 警告 */
.api-warning {
  @apply flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm;
  @apply border-b border-amber-200;
}

.text-btn {
  @apply ml-auto text-amber-700 hover:text-amber-800 underline;
}

/* 快捷问题 */
.quick-questions {
  @apply p-4 border-b border-gray-200;
}

.quick-label {
  @apply text-xs text-gray-500 mb-2;
}

.quick-buttons {
  @apply flex flex-wrap gap-2;
}

.quick-btn {
  @apply px-3 py-1.5 text-sm bg-md-primary-container/50 hover:bg-md-primary-container text-md-primary;
  @apply rounded-lg transition-colors duration-200;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* 消息容器 */
.messages-container {
  @apply flex-1 overflow-y-auto p-4 space-y-4;
  @apply bg-gray-50;
}

.message {
  @apply flex gap-3;
}

.message.user {
  @apply flex-row-reverse;
}

.message-avatar {
  @apply w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0;
  @apply bg-white shadow;
}

.message-content {
  @apply max-w-[80%];
}

.message.user .message-content {
  @apply flex flex-col items-end;
}

.message-text {
  @apply px-4 py-2 rounded-2xl text-sm leading-relaxed;
}

.message.user .message-text {
  @apply bg-md-primary text-white rounded-br-md;
}

.message.assistant .message-text {
  @apply bg-white text-gray-800 border border-gray-200 rounded-bl-md;
}

.message-time {
  @apply text-xs text-gray-400 mt-1 px-1;
}

/* 输入指示�?*/
.typing-indicator {
  @apply flex gap-1 px-4 py-3;
  @apply bg-white border border-gray-200 rounded-2xl rounded-bl-md;
}

.typing-indicator span {
  @apply w-2 h-2 bg-gray-400 rounded-full;
  @apply animate-bounce;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.1s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.2s;
}

/* 欢迎消息 */
.welcome-message {
  @apply text-center py-8;
}

.welcome-text {
  @apply text-lg font-medium text-gray-700 mb-2;
}

.welcome-hint {
  @apply text-sm text-gray-500;
}

/* 输入�?*/
.input-area {
  @apply flex gap-2 p-4 border-t border-gray-200 bg-white;
}

.message-input {
  @apply flex-1 px-4 py-3 border border-gray-300 rounded-2xl resize-none;
  @apply focus:outline-none focus:ring-2 focus:ring-md-primary focus:border-transparent;
  @apply text-sm;
  @apply disabled:bg-gray-100 disabled:cursor-not-allowed;
}

.send-btn {
  @apply p-3 bg-md-primary hover:bg-md-primary/90 text-white rounded-full;
  @apply transition-colors duration-200;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply flex-shrink-0 self-end;
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
