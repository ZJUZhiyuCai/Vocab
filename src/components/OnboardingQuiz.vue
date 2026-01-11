<template>
  <div class="onboarding-modal">
    <div class="modal-content">
      <!-- 进度指示 -->
      <div class="progress-bar">
        <div
          v-for="i in totalSteps"
          :key="i"
          class="progress-dot"
          :class="{ 'active': i <= currentStep, 'completed': i < currentStep }"
        ></div>
      </div>

      <!-- 问题区域 -->
      <div class="question-area">
        <transition name="fade" mode="out-in">
          <div :key="currentStep">
            <!-- Step 1: 欢迎 -->
            <div v-if="currentStep === 0" class="step-content">
              <div class="welcome-icon">🎯</div>
              <h2 class="step-title">欢迎使用 VocabContext</h2>
              <p class="step-desc">为了给你提供更个性化的学习体验，请回答几个简单问题</p>
              <p class="step-note">⏱️ 只需30秒</p>
            </div>

            <!-- Step 2: 词汇水平测试 -->
            <div v-if="currentStep === 1" class="step-content">
              <div class="test-intro-icon">📊</div>
              <h2 class="step-title">词汇量水平测试</h2>
              <p class="step-desc">了解你的词汇量，为你推荐合适的词库</p>

              <div class="test-info-box">
                <div class="test-info-item">
                  <div class="test-info-icon">✓</div>
                  <div class="test-info-text">共 50 道题，约 5-8 分钟</div>
                </div>
                <div class="test-info-item">
                  <div class="test-info-icon">✓</div>
                  <div class="test-info-text">自适应测试，题目难度动态调整</div>
                </div>
                <div class="test-info-item">
                  <div class="test-info-icon">✓</div>
                  <div class="test-info-text">完成后推荐合适的学习词库</div>
                </div>
              </div>

              <button @click="startVocabTest" class="btn-primary w-full">
                🚀 开始测试
              </button>

              <button @click="skipTest" class="text-sage-500 text-sm mt-4 font-medium hover:text-sage-700 transition-colors">
                跳过测试，稍后再测
              </button>
            </div>

            <!-- Step 3: 学习目的 -->
            <div v-if="currentStep === 2" class="step-content">
              <h2 class="step-title">你学习英语的目的是什么？</h2>
              <p class="step-desc">选择与你目标最匹配的选项</p>

              <div class="options-grid">
                <button
                  v-for="option in purposeOptions"
                  :key="option.value"
                  @click="selectPurpose(option.value)"
                  class="option-card"
                  :class="{ 'selected': userProfile.purpose === option.value }"
                >
                  <div class="option-icon">{{ option.icon }}</div>
                  <div class="option-title">{{ option.title }}</div>
                  <div class="option-desc">{{ option.desc }}</div>
                </button>
              </div>
            </div>

            <!-- Step 4: 确认 -->
            <div v-if="currentStep === 3" class="step-content">
              <div class="summary-icon">✨</div>
              <h2 class="step-title">设置完成</h2>
              <p class="step-desc">我们已根据你的情况优化学习体验</p>

              <div class="summary-box">
                <div class="summary-item">
                  <span class="summary-label">📚 词汇量</span>
                  <span class="summary-value">{{ vocabTestResult ? vocabTestResult.estimatedVocab : '未测试' }}</span>
                </div>
                <div class="summary-item" v-if="vocabTestResult">
                  <span class="summary-label">📊 等级</span>
                  <span class="summary-value">{{ vocabTestResult.cefrLevel }} ({{ vocabTestResult.ieltsLevel }})</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">🎯 学习目的</span>
                  <span class="summary-value">{{ getPurposeLabel(userProfile.purpose) }}</span>
                </div>
              </div>

              <p class="step-note">💡 你随时可以在设置页面修改</p>
            </div>
          </div>
        </transition>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button
          v-if="currentStep === 2"
          @click="previousStep"
          class="btn-secondary"
        >
          ← 上一步
        </button>
        <button
          v-if="currentStep === 0"
          @click="nextStep"
          class="btn-primary"
        >
          开始 →
        </button>
        <button
          v-if="currentStep === 2"
          @click="nextStep"
          class="btn-primary"
          :disabled="!userProfile.purpose"
        >
          下一步 →
        </button>
        <button
          v-if="currentStep === 3"
          @click="completeOnboarding"
          class="btn-primary"
        >
          🚀 开始学习
        </button>
      </div>
    </div>

    <!-- 词汇测试弹窗 -->
    <VocabLevelTest
      v-if="showVocabTest"
      @complete="handleVocabTestComplete"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VocabLevelTest from './VocabLevelTest.vue'

const emit = defineEmits(['complete'])

const currentStep = ref(0)
const totalSteps = 4  // 增加到4步，添加词汇测试

const userProfile = ref({
  purpose: ''
})

// 词汇测试结果
const vocabTestResult = ref(null)
const showVocabTest = ref(false)

const purposeOptions = [
  {
    value: 'exam',
    icon: '📚',
    title: '备考',
    desc: '雅思、托福、GRE、四六级、考研'
  },
  {
    value: 'career',
    icon: '💼',
    title: '职场提升',
    desc: '商务英语、技术英语、专业英语'
  },
  {
    value: 'hobby',
    icon: '🎨',
    title: '兴趣爱好',
    desc: '阅读、影视、旅行、文化交流'
  },
  {
    value: 'daily',
    icon: '💬',
    title: '日常交流',
    desc: '日常生活、社交对话、购物饮食'
  }
]

const selectPurpose = (value) => {
  userProfile.value.purpose = value
}

const getPurposeLabel = (value) => {
  const option = purposeOptions.find(o => o.value === value)
  return option ? option.title : ''
}

const nextStep = () => {
  if (currentStep.value < totalSteps - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 词汇测试相关函数
const startVocabTest = () => {
  showVocabTest.value = true
}

const skipTest = () => {
  // 跳过测试，直接进入下一步
  vocabTestResult.value = null
  nextStep()
}

const handleVocabTestComplete = (result) => {
  vocabTestResult.value = result.testResult
  showVocabTest.value = false

  // 如果用户选择了词库，保存到用户设置中
  if (result.selectedVocab) {
    // TODO: 保存选中的词库到localStorage或发送给父组件
    console.log('用户选择了词库:', result.selectedVocab)
  }

  // 测试完成后进入下一步
  nextStep()
}

const completeOnboarding = () => {
  emit('complete', {
    ...userProfile.value,
    vocabTestResult: vocabTestResult.value
  })
}
</script>

<style scoped>
.onboarding-modal {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4;
  backdrop-filter: blur(4px);
}

.modal-content {
  @apply bg-white rounded-2xl shadow-xl max-w-lg w-full p-8;
  border: 1px solid rgba(141, 168, 146, 0.1);
}

/* 进度条 */
.progress-bar {
  @apply flex justify-center gap-2 mb-8;
}

.progress-dot {
  @apply w-2.5 h-2.5 rounded-full bg-gray-200 transition-all duration-300;
}

.progress-dot.active {
  @apply bg-sage-500 w-6;
}

.progress-dot.completed {
  @apply bg-sage-300;
}

/* 问题区域 */
.question-area {
  @apply min-h-[320px] flex items-center justify-center py-4;
}

.step-content {
  @apply text-center w-full;
}

.welcome-icon,
.summary-icon,
.test-intro-icon {
  @apply text-5xl mb-4;
}

.step-title {
  @apply text-2xl font-bold mb-3 text-sage-700;
}

.step-desc {
  @apply text-gray-600 mb-2 text-base leading-relaxed;
}

.step-note {
  @apply text-sm text-sage-400 font-medium;
}

/* 测试信息框 */
.test-info-box {
  @apply bg-gradient-to-br from-beige-50 to-sage-50 rounded-xl p-5 mt-6 mb-4 border border-sage-100;
}

.test-info-item {
  @apply flex items-start gap-3 mb-3 last:mb-0;
}

.test-info-icon {
  @apply w-5 h-5 rounded-full bg-sage-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5;
}

.test-info-text {
  @apply text-sm text-gray-700 text-left leading-relaxed;
}

/* 选项卡片 */
.options-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6;
}

.option-card {
  @apply p-5 rounded-xl border-2 cursor-pointer;
  @apply transition-all duration-200;
  @apply text-center;
  @apply relative overflow-hidden;
  background-color: #fafafa;
  border-color: #e5e7eb;
}

.option-card::before {
  content: '';
  @apply absolute inset-0 bg-gradient-to-br from-sage-50 to-transparent opacity-0 transition-opacity duration-200;
}

.option-card:hover {
  border-color: #8da892;
  box-shadow: 0 4px 12px rgba(141, 168, 146, 0.15);
  transform: translateY(-2px);
}

.option-card:hover::before {
  @apply opacity-100;
}

.option-card.selected {
  border-color: #5c6b5c;
  background: linear-gradient(135deg, #f0f5f0 0%, #e8efe8 100%);
  box-shadow: 0 0 0 3px rgba(141, 168, 146, 0.15);
}

.option-icon {
  @apply text-4xl mb-2;
}

.option-title {
  @apply font-semibold mb-1.5 text-sage-800;
}

.option-desc {
  @apply text-sm text-gray-600 leading-snug;
}

/* 总结区域 */
.summary-box {
  @apply bg-beige-50 rounded-xl p-6 mt-6 mb-4 border border-sage-100 text-left;
}

.summary-item {
  @apply flex justify-between items-center py-2 last:pb-0;
  @apply border-b border-sage-100 last:border-0;
}

.summary-label {
  @apply text-gray-600 font-medium;
}

.summary-value {
  @apply font-semibold text-sage-700;
}

/* 操作按钮 */
.action-buttons {
  @apply flex justify-center gap-3 mt-8 pt-6 border-t border-gray-100;
}

.btn-primary {
  @apply px-8 py-3 rounded-xl font-semibold text-white;
  background: linear-gradient(135deg, #5c6b5c 0%, #4a5a4a 100%);
  @apply transition-all duration-200;
  box-shadow: 0 2px 8px rgba(92, 107, 92, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(92, 107, 92, 0.3);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  @apply opacity-50 cursor-not-allowed;
  box-shadow: none;
}

.btn-secondary {
  @apply px-8 py-3 rounded-xl font-semibold border-2;
  @apply bg-white text-gray-700;
  border-color: #e5e7eb;
  @apply transition-all duration-200;
}

.btn-secondary:hover {
  border-color: #8da892;
  color: #5c6b5c;
  background-color: #fafafa;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  @apply transition-all duration-300 ease-out;
}

.fade-enter-from {
  @apply opacity-0 translate-y-4;
}

.fade-leave-to {
  @apply opacity-0 -translate-y-4;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .modal-content {
    @apply p-6;
  }

  .step-title {
    @apply text-xl;
  }

  .options-grid {
    @apply grid-cols-1;
  }
}
</style>
