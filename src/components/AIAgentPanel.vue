<template>
  <div class="ai-learn-panel">
    <!-- 头部 -->
    <div class="panel-header">
      <h2 class="panel-title">🤖 AI 学习助手</h2>
      <div v-if="!isAvailable" class="api-warning">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>请配�?API 密钥</span>
      </div>
    </div>

    <!-- 标签�?-->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="tab"
        :class="{ active: activeTab === tab.key }"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- 内容�?-->
    <div class="panel-content">
      <!-- 单词深度分析 -->
      <div v-if="activeTab === 'word'" class="tab-content">
        <div v-if="!currentWord" class="empty-state">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
          </svg>
          <p class="text-gray-500">请先在学习页面选择一个单�?/p>
          <button @click="$emit('navigate', 'today')" class="btn-primary mt-4">
            前往学习
          </button>
        </div>

        <div v-else class="word-analysis">
          <!-- 单词标题 -->
          <div class="word-header">
            <h3 class="word-title">{{ currentWord.word }}</h3>
            <span v-if="currentWord.ipa" class="word-ipa">{{ currentWord.ipa }}</span>
          </div>

          <!-- AI 分析按钮 -->
          <div class="analysis-actions">
            <button
              @click="analyzeCurrentWord"
              :disabled="isLoadingAnalysis || !isAvailable"
              class="btn-analyze"
            >
              <svg v-if="!isLoadingAnalysis" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoadingAnalysis ? '分析�?..' : 'AI 深度分析' }}
            </button>
          </div>

          <!-- 分析结果 -->
          <div v-if="wordAnalysis" class="analysis-result">
            <!-- 词�?-->
            <div v-if="wordAnalysis.pos" class="info-card">
              <h4 class="info-label">词�?/h4>
              <p class="info-value">{{ wordAnalysis.pos }}</p>
            </div>

            <!-- 英英释义 -->
            <div v-if="wordAnalysis.definition" class="info-card">
              <h4 class="info-label">英英释义</h4>
              <p class="info-value">{{ wordAnalysis.definition }}</p>
            </div>

            <!-- 词源 -->
            <div v-if="wordAnalysis.etymology" class="info-card expanded">
              <h4 class="info-label">
                <span>📖 词源</span>
              </h4>
              <div class="info-content">
                <p v-if="wordAnalysis.etymology.origin" class="etymology-origin">
                  <strong>起源�?/strong>{{ wordAnalysis.etymology.origin }}
                </p>
                <p v-if="wordAnalysis.etymology.evolution" class="etymology-evolution">
                  <strong>演变�?/strong>{{ wordAnalysis.etymology.evolution }}
                </p>
                <p v-if="wordAnalysis.etymology.interesting_fact" class="etymology-fact">
                  <strong>💡 趣闻�?/strong>{{ wordAnalysis.etymology.interesting_fact }}
                </p>
              </div>
            </div>

            <!-- 同义�?-->
            <div v-if="wordAnalysis.synonyms && wordAnalysis.synonyms.length" class="info-card expanded">
              <h4 class="info-label">🔄 同义�?/h4>
              <div class="synonyms-list">
                <div v-for="(syn, idx) in wordAnalysis.synonyms" :key="idx" class="synonym-item">
                  <span class="synonym-word">{{ syn.word }}</span>
                  <span v-if="syn.nuance" class="synonym-nuance">{{ syn.nuance }}</span>
                </div>
              </div>
            </div>

            <!-- 反义�?-->
            <div v-if="wordAnalysis.antonyms && wordAnalysis.antonyms.length" class="info-card">
              <h4 class="info-label">�?反义�?/h4>
              <div class="antonyms-list">
                <span v-for="(ant, idx) in wordAnalysis.antonyms" :key="idx" class="antonym-tag">
                  {{ ant }}
                </span>
              </div>
            </div>

            <!-- 常用搭配 -->
            <div v-if="wordAnalysis.collocations && wordAnalysis.collocations.length" class="info-card expanded">
              <h4 class="info-label">🔗 常用搭配</h4>
              <div class="collocations-list">
                <div v-for="(col, idx) in wordAnalysis.collocations" :key="idx" class="collocation-item">
                  <p class="collocation-phrase"><strong>{{ col.phrase }}</strong></p>
                  <p v-if="col.meaning" class="collocation-meaning">{{ col.meaning }}</p>
                  <p v-if="col.example" class="collocation-example">{{ col.example }}</p>
                </div>
              </div>
            </div>

            <!-- 使用注意 -->
            <div v-if="wordAnalysis.usage_notes && wordAnalysis.usage_notes.length" class="info-card expanded">
              <h4 class="info-label">⚠️ 使用注意</h4>
              <ul class="usage-list">
                <li v-for="(note, idx) in wordAnalysis.usage_notes" :key="idx">{{ note }}</li>
              </ul>
            </div>

            <!-- 记忆技�?-->
            <div v-if="wordAnalysis.memory_hook" class="info-card memory-card">
              <h4 class="info-label">🧠 记忆技�?/h4>
              <p class="memory-content">{{ wordAnalysis.memory_hook }}</p>
            </div>

            <!-- 常见错误 -->
            <div v-if="wordAnalysis.common_mistakes && wordAnalysis.common_mistakes.length" class="info-card">
              <h4 class="info-label">�?常见错误</h4>
              <ul class="mistakes-list">
                <li v-for="(mistake, idx) in wordAnalysis.common_mistakes" :key="idx">{{ mistake }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习策略 -->
      <div v-if="activeTab === 'strategy'" class="tab-content">
        <div class="strategy-section">
          <h3 class="section-title">📊 学习分析</h3>

          <!-- 学习概览 -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ stats.learned || 0 }}</div>
              <div class="stat-label">已掌�?/div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.weak || 0 }}</div>
              <div class="stat-label">待复�?/div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.accuracy || 0 }}%</div>
              <div class="stat-label">正确�?/div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.streak || 0 }}</div>
              <div class="stat-label">连续天数</div>
            </div>
          </div>

          <!-- AI 建议按钮 -->
          <button
            @click="generateStrategy"
            :disabled="isLoadingStrategy || !isAvailable"
            class="btn-generate"
          >
            <svg v-if="!isLoadingStrategy" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoadingStrategy ? '生成�?..' : '生成学习建议' }}
          </button>

          <!-- AI 建议结果 -->
          <div v-if="strategyResult" class="strategy-result">
            <div v-if="strategyResult.overall_assessment" class="info-card">
              <h4 class="info-label">📈 整体评估</h4>
              <p class="info-value">{{ strategyResult.overall_assessment }}</p>
            </div>

            <div v-if="strategyResult.priorities && strategyResult.priorities.length" class="info-card">
              <h4 class="info-label">🎯 优先�?/h4>
              <ul class="priority-list">
                <li v-for="(priority, idx) in strategyResult.priorities" :key="idx">{{ priority }}</li>
              </ul>
            </div>

            <div v-if="strategyResult.daily_plan" class="info-card expanded">
              <h4 class="info-label">📅 每日计划</h4>
              <div class="daily-plan">
                <div class="plan-item">
                  <span class="plan-label">新词学习�?/span>
                  <span class="plan-value">{{ strategyResult.daily_plan.new_words }}</span>
                </div>
                <div class="plan-item">
                  <span class="plan-label">复习单词�?/span>
                  <span class="plan-value">{{ strategyResult.daily_plan.review_words }}</span>
                </div>
                <div v-if="strategyResult.daily_plan.focus_areas" class="plan-item">
                  <span class="plan-label">重点领域�?/span>
                  <span class="plan-value">{{ strategyResult.daily_plan.focus_areas.join('�?) }}</span>
                </div>
              </div>
            </div>

            <div v-if="strategyResult.study_tips && strategyResult.study_tips.length" class="info-card expanded">
              <h4 class="info-label">💡 学习建议</h4>
              <ul class="tips-list">
                <li v-for="(tip, idx) in strategyResult.study_tips" :key="idx">{{ tip }}</li>
              </ul>
            </div>

            <div v-if="strategyResult.encouragement" class="info-card encouragement-card">
              <p class="encouragement-text">💪 {{ strategyResult.encouragement }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 薄弱单词 -->
      <div v-if="activeTab === 'weak'" class="tab-content">
        <div class="weak-section">
          <h3 class="section-title">📉 需要加强的单词</h3>

          <div v-if="weakWords.length === 0" class="empty-state">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <p class="text-gray-500">太棒了！没有薄弱单词</p>
          </div>

          <div v-else class="weak-words-list">
            <div
              v-for="word in weakWords.slice(0, 10)"
              :key="word.id"
              class="weak-word-card"
            >
              <div class="weak-word-header">
                <span class="weak-word-text">{{ word.word }}</span>
                <span class="weak-word-count">
                  遗忘 {{ getForgetCount(word.id) }} �?
                </span>
              </div>
              <p class="weak-word-meaning">{{ word.meaning }}</p>
              <button
                @click="analyzeWeakWord(word)"
                :disabled="isAnalyzingWeak || !isAvailable"
                class="btn-analyze-weak"
              >
                AI 分析
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAIAgent } from '../utils/aiAgent.js'

const props = defineProps({
  currentWord: {
    type: Object,
    default: null
  },
  weakWords: {
    type: Array,
    default: () => []
  },
  reviewStates: {
    type: Object,
    default: () => ({})
  },
  stats: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['navigate'])

const agent = getAIAgent()
const isAvailable = computed(() => agent.isAvailable())

// 标签�?
const activeTab = ref('word')
const tabs = [
  { key: 'word', label: '单词分析', icon: '🔍' },
  { key: 'strategy', label: '学习策略', icon: '📋' },
  { key: 'weak', label: '薄弱环节', icon: '📉' }
]

// 单词分析
const isLoadingAnalysis = ref(false)
const wordAnalysis = ref(null)

// 学习策略
const isLoadingStrategy = ref(false)
const strategyResult = ref(null)

// 薄弱单词分析
const isAnalyzingWeak = ref(false)

// 分析当前单词
async function analyzeCurrentWord() {
  if (!props.currentWord || !isAvailable.value) return

  isLoadingAnalysis.value = true
  wordAnalysis.value = null

  try {
    const result = await agent.analyzeWord(props.currentWord.word, {
      meaning: props.currentWord.meaning,
      example: props.currentWord.example
    })
    wordAnalysis.value = result
  } catch (error) {
    console.error('单词分析失败:', error)
    alert('分析失败�? + error.message)
  } finally {
    isLoadingAnalysis.value = false
  }
}

// 生成学习策略
async function generateStrategy() {
  if (!isAvailable.value) return

  isLoadingStrategy.value = true
  strategyResult.value = null

  try {
    const result = await agent.generateLearningStrategy(
      props.stats,
      props.weakWords.map(w => ({
        word: w.word,
        meaning: w.meaning
      }))
    )
    strategyResult.value = result
  } catch (error) {
    console.error('生成策略失败:', error)
    alert('生成失败�? + error.message)
  } finally {
    isLoadingStrategy.value = false
  }
}

// 分析薄弱单词
async function analyzeWeakWord(word) {
  if (!isAvailable.value) return

  isAnalyzingWeak.value = true

  try {
    const result = await agent.analyzeWord(word.word, {
      meaning: word.meaning
    })

    // 切换到单词分析标�?
    activeTab.value = 'word'
    wordAnalysis.value = result

    // 提示用户
    alert(`已加�?"${word.word}" 的分析结果`)
  } catch (error) {
    console.error('分析失败:', error)
    alert('分析失败�? + error.message)
  } finally {
    isAnalyzingWeak.value = false
  }
}

// 获取单词遗忘次数
function getForgetCount(wordId) {
  const state = props.reviewStates[wordId]
  return state ? (state.mistakeCount || 0) : 0
}
</script>

<style scoped>
.ai-learn-panel {
  @apply flex flex-col h-full bg-white;
}

.panel-header {
  @apply flex items-center justify-between px-6 py-4 border-b border-gray-200;
}

.panel-title {
  @apply text-xl font-bold text-md-primary;
}

.api-warning {
  @apply flex items-center gap-2 text-amber-600 text-sm;
}

.tab-bar {
  @apply flex border-b border-gray-200;
}

.tab {
  @apply flex-1 flex items-center justify-center gap-2 px-4 py-3;
  @apply text-gray-500 hover:text-gray-700;
  @apply transition-colors duration-200;
  @apply border-b-2 border-transparent;
}

.tab.active {
  @apply text-md-primary border-md-primary;
}

.tab-icon {
  @apply text-lg;
}

.tab-label {
  @apply text-sm font-medium;
}

.panel-content {
  @apply flex-1 overflow-y-auto;
}

.tab-content {
  @apply p-6;
}

/* 空状�?*/
.empty-state {
  @apply flex flex-col items-center justify-center py-16;
  @apply text-center;
}

.btn-primary {
  @apply px-6 py-2 bg-md-primary hover:bg-md-primary/90 text-white rounded-lg;
  @apply transition-colors duration-200;
}

/* 单词分析 */
.word-header {
  @apply mb-6 pb-4 border-b border-gray-200;
}

.word-title {
  @apply text-3xl font-bold text-md-primary mb-2;
}

.word-ipa {
  @apply text-lg text-gray-500;
}

.analysis-actions {
  @apply mb-6;
}

.btn-analyze {
  @apply w-full flex items-center justify-center gap-2 px-4 py-3;
  @apply bg-gradient-to-r from-md-primary to-md-primary/80 hover:from-md-primary/80 hover:to-md-primary/70;
  @apply text-white rounded-lg font-medium;
  @apply transition-all duration-200;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.analysis-result {
  @apply space-y-4;
}

.info-card {
  @apply p-4 bg-gray-50 rounded-lg;
}

.info-card.expanded {
  @apply p-5;
}

.info-label {
  @apply text-sm font-bold text-gray-700 mb-2;
}

.info-value {
  @apply text-gray-800 leading-relaxed;
}

.info-content {
  @apply space-y-2;
}

/* 词源 */
.etymology-origin,
.etymology-evolution,
.etymology-fact {
  @apply text-gray-700;
}

/* 同义�?*/
.synonyms-list {
  @apply space-y-2;
}

.synonym-item {
  @apply p-3 bg-white rounded border border-gray-200;
}

.synonym-word {
  @apply font-bold text-md-primary;
}

.synonym-nuance {
  @apply block mt-1 text-sm text-gray-600;
}

/* 反义�?*/
.antonyms-list {
  @apply flex flex-wrap gap-2;
}

.antonym-tag {
  @apply px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm;
}

/* 搭配 */
.collocations-list {
  @apply space-y-3;
}

.collocation-item {
  @apply p-3 bg-white rounded border border-gray-200;
}

.collocation-phrase {
  @apply text-md-primary font-medium mb-1;
}

.collocation-meaning {
  @apply text-sm text-gray-600 mb-1;
}

.collocation-example {
  @apply text-sm text-gray-500 italic;
}

/* 使用注意 */
.usage-list {
  @apply space-y-2;
}

.usage-list li {
  @apply text-gray-700;
  @apply pl-4 relative;
}

.usage-list li::before {
  content: '�?;
  @apply absolute left-0 text-md-primary;
}

/* 记忆技�?*/
.memory-card {
  @apply bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200;
}

.memory-content {
  @apply text-amber-900 font-medium;
}

/* 常见错误 */
.mistakes-list {
  @apply space-y-2;
}

.mistakes-list li {
  @apply text-red-700;
  @apply pl-4 relative;
}

.mistakes-list li::before {
  content: '�?;
  @apply absolute left-0 text-red-500;
}

/* 学习策略 */
.section-title {
  @apply text-lg font-bold text-gray-800 mb-4;
}

.stats-grid {
  @apply grid grid-cols-2 gap-3 mb-6;
}

.stat-card {
  @apply p-4 bg-gradient-to-br from-md-primary-container/30 to-beige-50 rounded-lg text-center;
}

.stat-value {
  @apply text-2xl font-bold text-md-primary;
}

.stat-label {
  @apply text-sm text-gray-600 mt-1;
}

.btn-generate {
  @apply w-full flex items-center justify-center gap-2 px-4 py-3 mb-6;
  @apply bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700;
  @apply text-white rounded-lg font-medium;
  @apply transition-all duration-200;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.strategy-result {
  @apply space-y-4;
}

.priority-list,
.tips-list {
  @apply space-y-2;
}

.priority-list li,
.tips-list li {
  @apply text-gray-700;
  @apply pl-4 relative;
}

.priority-list li::before {
  content: '🎯';
  @apply absolute left-0;
}

.tips-list li::before {
  content: '💡';
  @apply absolute left-0;
}

.daily-plan {
  @apply space-y-2;
}

.plan-item {
  @apply flex;
}

.plan-label {
  @apply text-gray-600 flex-shrink-0;
}

.plan-value {
  @apply text-gray-800 font-medium;
}

.encouragement-card {
  @apply bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200;
}

.encouragement-text {
  @apply text-green-800 font-medium text-center;
}

/* 薄弱单词 */
.weak-words-list {
  @apply space-y-3;
}

.weak-word-card {
  @apply p-4 bg-red-50 border border-red-200 rounded-lg;
}

.weak-word-header {
  @apply flex items-center justify-between mb-2;
}

.weak-word-text {
  @apply font-bold text-md-primary;
}

.weak-word-count {
  @apply text-sm text-red-600;
}

.weak-word-meaning {
  @apply text-gray-700 mb-3;
}

.btn-analyze-weak {
  @apply w-full px-4 py-2;
  @apply bg-white hover:bg-gray-50 text-md-primary border border-md-primary/50;
  @apply rounded-lg text-sm font-medium;
  @apply transition-colors duration-200;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* 动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
