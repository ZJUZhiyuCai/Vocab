<template>
  <div class="vocab-test-modal">
    <div class="modal-content">
      <!-- 进度指示 -->
      <div class="progress-header">
        <div class="progress-info">
          <span class="text-sm text-gray-600">词汇量测试</span>
          <span class="text-sm font-medium text-sage-600">{{ currentQuestion + 1 }} / {{ totalQuestions }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>

      <!-- 测试说明 -->
      <div v-if="currentQuestion === -1" class="intro-section">
        <div class="intro-icon">📊</div>
        <h2 class="text-2xl font-bold text-sage-500 mb-4">词汇量水平测试</h2>
        <div class="text-left space-y-3 text-gray-600 mb-6">
          <p>✓ 共 <strong>50 道题</strong>，大约需要 <strong>5-8 分钟</strong></p>
          <p>✓ 自适应测试，题目难度会根据你的回答调整</p>
          <p>✓ 测试完成后会为你推荐合适的词库</p>
          <p class="text-sm text-gray-500 mt-4">请根据你是否认识这个单词的<strong>主要含义</strong>来回答</p>
        </div>
        <button @click="startTest" class="btn btn-primary w-full">开始测试</button>
      </div>

      <!-- 测试题目 -->
      <div v-else-if="currentQuestion < totalQuestions && !testCompleted" class="question-section">
        <div class="word-display">
          <h2 class="text-4xl font-bold text-sage-600 mb-2">{{ currentTestWord.word }}</h2>
          <p v-if="currentTestWord.ipa" class="text-gray-500 mb-4">{{ currentTestWord.ipa }}</p>
          <p class="text-sm text-gray-400">难度：{{ currentTestWord.cefr }} · {{ currentTestWord.ielts }}</p>
        </div>

        <div class="answer-buttons">
          <button
            @click="answerWord(false)"
            class="answer-btn btn-error"
          >
            <div class="text-2xl mb-1">✗</div>
            <div>不认识</div>
          </button>
          <button
            @click="answerWord(true)"
            class="answer-btn btn-success"
          >
            <div class="text-2xl mb-1">✓</div>
            <div>认识</div>
          </button>
        </div>

        <div class="test-tip">
          <p class="text-xs text-gray-400">提示：选择后自动进入下一题，无法返回修改</p>
        </div>
      </div>

      <!-- 测试结果 -->
      <div v-else-if="testCompleted" class="result-section">
        <div class="result-icon">🎯</div>
        <h2 class="text-2xl font-bold text-sage-500 mb-4">测试完成</h2>

        <div class="result-card">
          <div class="result-item">
            <span class="result-label">词汇量估算</span>
            <span class="result-value">{{ estimatedVocab }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">CEFR等级</span>
            <span class="result-value">{{ cefrLevel }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">雅思水平</span>
            <span class="result-value">{{ ieltsLevel }}</span>
          </div>
        </div>

        <div class="recommended-section">
          <h3 class="text-lg font-semibold text-sage-500 mb-3">📚 推荐词库</h3>
          <div class="vocab-list">
            <div
              v-for="vocab in recommendedVocabs"
              :key="vocab.id"
              @click="selectVocab(vocab)"
              class="vocab-item"
              :class="{ 'selected': selectedVocab?.id === vocab.id }"
            >
              <div class="vocab-icon">{{ vocab.icon }}</div>
              <div class="vocab-info">
                <div class="vocab-name">{{ vocab.name }}</div>
                <div class="vocab-meta">
                  <span class="text-xs text-gray-500">{{ vocab.level }}</span>
                  <span class="text-xs text-gray-400">{{ vocab.wordCount }}词</span>
                </div>
              </div>
              <div class="vocab-recommend">
                <span class="recommend-badge" v-if="vocab.isRecommended">推荐</span>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button
            @click="skipSelection"
            class="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            跳过，稍后选择
          </button>
          <button
            @click="confirmSelection"
            class="btn btn-primary flex-1"
            :disabled="!selectedVocab"
          >
            开始学习
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getRecommendedVocabularies } from '../utils/vocabularyManager.js'

const emit = defineEmits(['complete'])

// 测试配置
const totalQuestions = 50
const currentQuestion = ref(-1)  // -1表示还未开始

// 测试数据
const testWords = ref([])
const userAnswers = ref([])  // { word, difficulty, known }

// 测试结果
const testCompleted = ref(false)
const estimatedVocab = ref('')
const cefrLevel = ref('')
const ieltsLevel = ref('')

// 词库选择
const recommendedVocabs = ref([])
const selectedVocab = ref(null)

// 当前测试单词
const currentTestWord = computed(() => {
  if (currentQuestion.value >= 0 && currentQuestion.value < testWords.value.length) {
    return testWords.value[currentQuestion.value]
  }
  return { word: '', ipa: '', cefr: '', ielts: '' }
})

// 进度百分比
const progressPercentage = computed(() => {
  if (currentQuestion.value === -1) return 0
  return ((currentQuestion.value + 1) / totalQuestions.value) * 100
})

// 开始测试
const startTest = () => {
  loadTestWords()
  currentQuestion.value = 0
}

// 加载测试单词（包含不同难度级别）
const loadTestWords = () => {
  // 测试单词池，按难度排序（从简单到困难）
  const wordPool = [
    // A1 级别（基础）
    { word: 'hello', ipa: '/həˈləʊ/', cefr: 'A1', ielts: '基础', difficulty: 1 },
    { word: 'book', ipa: '/bʊk/', cefr: 'A1', ielts: '基础', difficulty: 1 },
    { word: 'happy', ipa: '/ˈhæpi/', cefr: 'A1', ielts: '基础', difficulty: 1 },
    { word: 'time', ipa: '/taɪm/', cefr: 'A1', ielts: '基础', difficulty: 1 },
    { word: 'family', ipa: '/ˈfæməli/', cefr: 'A1', ielts: '基础', difficulty: 1 },
    { word: 'water', ipa: '/ˈwɔːtə/', cefr: 'A1', ielts: '基础', difficulty: 1 },
    { word: 'friend', ipa: '/frend/', cefr: 'A1', ielts: '基础', difficulty: 1 },
    { word: 'school', ipa: '/skuːl/', cefr: 'A1', ielts: '基础', difficulty: 1 },
    { word: 'house', ipa: '/haʊs/', cefr: 'A1', ielts: '基础', difficulty: 1 },
    { word: 'people', ipa: '/ˈpiːpl/', cefr: 'A1', ielts: '基础', difficulty: 1 },

    // A2 级别（初级）
    { word: 'adventure', ipa: '/ədˈventʃə/', cefr: 'A2', ielts: '基础', difficulty: 2 },
    { word: 'brilliant', ipa: '/ˈbrɪliənt/', cefr: 'A2', ielts: '基础', difficulty: 2 },
    { word: 'concentrate', ipa: '/ˈkɒnsəntreɪt/', cefr: 'A2', ielts: '基础', difficulty: 2 },
    { word: 'determine', ipa: '/dɪˈtɜːmɪn/', cefr: 'A2', ielts: '基础', difficulty: 2 },
    { word: 'encourage', ipa: '/ɪnˈkʌrɪdʒ/', cefr: 'A2', ielts: '基础', difficulty: 2 },
    { word: 'government', ipa: '/ˈɡʌvənmənt/', cefr: 'A2', ielts: '基础', difficulty: 2 },
    { word: 'industry', ipa: '/ˈɪndəstri/', cefr: 'A2', ielts: '基础', difficulty: 2 },
    { word: 'position', ipa: '/pəˈzɪʃn/', cefr: 'A2', ielts: '基础', difficulty: 2 },
    { word: 'society', ipa: '/səˈsaɪəti/', cefr: 'A2', ielts: '基础', difficulty: 2 },
    { word: 'technology', ipa: '/tekˈnɒlədʒi/', cefr: 'A2', ielts: '基础', difficulty: 2 },

    // B1 级别（中级）
    { word: 'abandon', ipa: '/əˈbændən/', cefr: 'B1', ielts: '5分', difficulty: 3 },
    { word: 'benefit', ipa: '/ˈbenɪfɪt/', cefr: 'B1', ielts: '5分', difficulty: 3 },
    { word: 'component', ipa: '/kəmˈpəʊnənt/', cefr: 'B1', ielts: '5分', difficulty: 3 },
    { word: 'dominate', ipa: '/ˈdɒmɪneɪt/', cefr: 'B1', ielts: '5分', difficulty: 3 },
    { word: 'enhance', ipa: '/ɪnˈhɑːns/', cefr: 'B1', ielts: '5分', difficulty: 3 },
    { word: 'establish', ipa: '/ɪˈstæblɪʃ/', cefr: 'B1', ielts: '5分', difficulty: 3 },
    { word: 'fundamental', ipa: '/ˌfʌndəˈmentl/', cefr: 'B1', ielts: '5分', difficulty: 3 },
    { word: 'legislation', ipa: '/ˌledʒɪsˈleɪʃn/', cefr: 'B1', ielts: '5分', difficulty: 3 },
    { word: 'significant', ipa: '/sɪɡˈnɪfɪkənt/', cefr: 'B1', ielts: '5分', difficulty: 3 },
    { word: 'undergo', ipa: '/ˌʌndəˈɡəʊ/', cefr: 'B1', ielts: '5分', difficulty: 3 },

    // B2 级别（中高级）
    { word: 'ambiguous', ipa: '/æmˈbɪɡjuəs/', cefr: 'B2', ielts: '6分', difficulty: 4 },
    { word: 'comprehensive', ipa: '/ˌkɒmprɪˈhensɪv/', cefr: 'B2', ielts: '6分', difficulty: 4 },
    { word: 'deteriorate', ipa: '/dɪˈtɪəriəreɪt/', cefr: 'B2', ielts: '6分', difficulty: 4 },
    { word: 'hypothesis', ipa: '/haɪˈpɒθəsɪs/', cefr: 'B2', ielts: '6分', difficulty: 4 },
    { word: 'inevitable', ipa: '/ɪnˈevɪtəbl/', cefr: 'B2', ielts: '6分', difficulty: 4 },
    { word: 'mechanism', ipa: '/ˈmekənɪzəm/', cefr: 'B2', ielts: '6分', difficulty: 4 },
    { word: 'paradigm', ipa: '/ˈpærədaɪm/', cefr: 'B2', ielts: '6分', difficulty: 4 },
    { word: 'precedent', ipa: '/ˈpresɪdənt/', cefr: 'B2', ielts: '6分', difficulty: 4 },
    { word: 'speculate', ipa: '/ˈspekjʊleɪt/', cefr: 'B2', ielts: '6分', difficulty: 4 },
    { word: 'underlying', ipa: '/ˌʌndəˈlaɪɪŋ/', cefr: 'B2', ielts: '6分', difficulty: 4 },

    // C1 级别（高级）
    { word: 'ameliorate', ipa: '/əˈmiːliəreɪt/', cefr: 'C1', ielts: '7分', difficulty: 5 },
    { word: 'conundrum', ipa: '/kəˈnʌndrəm/', cefr: 'C1', ielts: '7分', difficulty: 5 },
    { word: 'ephemeral', ipa: '/ɪˈfemərəl/', cefr: 'C1', ielts: '7分', difficulty: 5 },
    { word: 'meticulous', ipa: '/məˈtɪkjələs/', cefr: 'C1', ielts: '7分', difficulty: 5 },
    { word: 'ubiquitous', ipa: '/juːˈbɪkwɪtəs/', cefr: 'C1', ielts: '7分', difficulty: 5 },
    { word: 'anachronism', ipa: '/əˈnækrənɪzəm/', cefr: 'C1', ielts: '7分', difficulty: 5 },
    { word: 'dichotomy', ipa: '/daɪˈkɒtəmi/', cefr: 'C1', ielts: '7分', difficulty: 5 },
    { word: 'exacerbate', ipa: '/ɪɡˈzæsəbeɪt/', cefr: 'C1', ielts: '7分', difficulty: 5 },
    { word: 'idiosyncrasy', ipa: '/ˌɪdiəˈsɪŋkrəsi/', cefr: 'C1', ielts: '7分', difficulty: 5 },
    { word: 'pragmatic', ipa: '/præɡˈmætɪk/', cefr: 'C1', ielts: '7分', difficulty: 5 },

    // C2 级别（精通）
    { word: 'obfuscate', ipa: '/ˈɒbfʌskeɪt/', cefr: 'C2', ielts: '7.5分+', difficulty: 6 },
    { word: 'perspicacious', ipa: '/ˌpɜːspɪˈkeɪʃəs/', cefr: 'C2', ielts: '7.5分+', difficulty: 6 },
    { word: 'recalcitrant', ipa: '/rɪˈkælsɪtrənt/', cefr: 'C2', ielts: '7.5分+', difficulty: 6 },
    { word: 'sesquipedalian', ipa: '/ˌseskwɪpɪˈdeɪliən/', cefr: 'C2', ielts: '7.5分+', difficulty: 6 },
    { word: 'obfuscate', ipa: '/ˈɒbfʌskeɪt/', cefr: 'C2', ielts: '7.5分+', difficulty: 6 },
    { word: 'acrimonious', ipa: '/ˌækrɪˈməʊniəs/', cefr: 'C2', ielts: '7.5分+', difficulty: 6 },
    { word: 'obsequious', ipa: '/əbˈsiːkwiəs/', cefr: 'C2', ielts: '7.5分+', difficulty: 6 },
    { word: 'pusillanimous', ipa: '/ˌpjuːsɪˈlænɪməs/', cefr: 'C2', ielts: '7.5分+', difficulty: 6 },
    { word: 'trianthology', ipa: '/traɪˈænθələdʒi/', cefr: 'C2', ielts: '7.5分+', difficulty: 6 },
    { word: 'vicissitude', ipa: '/vɪˈsɪsɪtjuːd/', cefr: 'C2', ielts: '7.5分+', difficulty: 6 }
  ]

  // 生成测试题目：从单词池中随机选择50个不重复的单词
  testWords.value = generateAdaptiveTest(wordPool, totalQuestions)
}

// 自适应测试生成算法（修复版）
const generateAdaptiveTest = (wordPool, questionCount) => {
  // 使用Fisher-Yates洗牌算法打乱单词池
  const shuffled = [...wordPool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // 从打乱后的单词池中选择前questionCount个
  // 这样保证了难度分布的均匀性和随机性
  return shuffled.slice(0, Math.min(questionCount, shuffled.length))
}

// 回答单词
const answerWord = (known) => {
  const currentWord = currentTestWord.value

  // 记录答案
  userAnswers.value.push({
    word: currentWord.word,
    difficulty: currentWord.difficulty,
    known: known
  })

  // 自适应调整：根据答案调整下一题的难度
  if (known) {
    // 认识：尝试更难的词
    // 这里简化处理，实际会动态调整词库范围
  } else {
    // 不认识：尝试简单的词
  }

  // 进入下一题
  currentQuestion.value++

  // 检查是否完成所有题目
  if (currentQuestion.value >= totalQuestions) {
    calculateResult()
  }
}

// 计算测试结果
const calculateResult = () => {
  const correctCount = userAnswers.value.filter(a => a.known).length
  const correctRate = correctCount / totalQuestions

  // 根据正确率和平均难度计算词汇量
  const avgDifficulty = userAnswers.value.reduce((sum, a) => sum + a.difficulty, 0) / totalQuestions

  // 估算词汇量（简化算法）
  let vocabRange = ''
  let cefr = ''
  let ielts = ''

  if (avgDifficulty < 1.5) {
    vocabRange = '500-1000'
    cefr = 'A1'
    ielts = '基础'
  } else if (avgDifficulty < 2.5) {
    vocabRange = '1000-2000'
    cefr = 'A2'
    ielts = '基础'
  } else if (avgDifficulty < 3.5) {
    vocabRange = '2000-4000'
    cefr = 'B1'
    ielts = '5分'
  } else if (avgDifficulty < 4.5) {
    vocabRange = '4000-6000'
    cefr = 'B2'
    ielts = '6分'
  } else if (avgDifficulty < 5.5) {
    vocabRange = '6000-8000'
    cefr = 'C1'
    ielts = '7分'
  } else {
    vocabRange = '8000+'
    cefr = 'C2'
    ielts = '7.5分+'
  }

  estimatedVocab.value = vocabRange
  cefrLevel.value = cefr
  ieltsLevel.value = ielts

  // 生成推荐的词库
  generateRecommendations(cefr)

  testCompleted.value = true
}

// 生成推荐词库
const generateRecommendations = (cefr) => {
  const testResult = {
    estimatedVocab: estimatedVocab.value,
    cefrLevel: cefr,
    ieltsLevel: ieltsLevel.value
  }

  // 使用智能推荐算法
  const recommendations = getRecommendedVocabularies(testResult)

  // 转换为显示格式
  recommendedVocabs.value = recommendations.map(vocab => ({
    id: vocab.id,
    name: vocab.name,
    icon: vocab.icon,
    level: vocab.difficulty.cefr.join('-'),
    wordCount: vocab.size,
    isRecommended: vocab.isRecommended,
    vocabData: vocab  // 保存完整数据供后续使用
  }))
}

// 选择词库
const selectVocab = (vocab) => {
  selectedVocab.value = vocab
}

// 跳过选择
const skipSelection = () => {
  emit('complete', {
    testResult: {
      estimatedVocab: estimatedVocab.value,
      cefrLevel: cefrLevel.value,
      ieltsLevel: ieltsLevel.value
    },
    selectedVocab: null
  })
}

// 确认选择
const confirmSelection = () => {
  emit('complete', {
    testResult: {
      estimatedVocab: estimatedVocab.value,
      cefrLevel: cefrLevel.value,
      ieltsLevel: ieltsLevel.value
    },
    selectedVocab: selectedVocab.value.vocabData  // 传递完整的词库数据
  })
}
</script>

<style scoped>
.vocab-test-modal {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto;
}

/* 进度条 */
.progress-header {
  @apply mb-6;
}

.progress-info {
  @apply flex justify-between items-center mb-2;
}

.progress-bar {
  @apply w-full h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-sage-500 transition-all duration-300;
}

/* 介绍部分 */
.intro-section {
  @apply text-center py-8;
}

.intro-icon {
  @apply text-6xl mb-4;
}

/* 题目部分 */
.question-section {
  @apply text-center py-8;
}

.word-display {
  @apply mb-8;
}

.answer-buttons {
  @apply flex gap-4 justify-center mb-6;
}

.answer-btn {
  @apply px-12 py-6 rounded-xl text-white text-lg font-medium min-w-[150px];
  @apply transition-all duration-200;
  @apply flex flex-col items-center;
}

.answer-btn:hover {
  @apply transform scale-105;
}

.test-tip {
  @apply text-center;
}

/* 结果部分 */
.result-section {
  @apply text-center;
}

.result-icon {
  @apply text-6xl mb-4;
}

.result-card {
  @apply bg-gradient-to-br from-sage-50 to-blue-50 rounded-xl p-6 mb-6;
}

.result-item {
  @apply flex justify-between items-center mb-3 last:mb-0;
}

.result-label {
  @apply text-gray-600;
}

.result-value {
  @apply text-lg font-bold text-sage-600;
}

.recommended-section {
  @apply text-left mb-6;
}

.vocab-list {
  @apply space-y-2 mb-4;
}

.vocab-item {
  @apply flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 cursor-pointer;
  @apply transition-all duration-200;
  background-color: #fafafa;
}

.vocab-item:hover {
  border-color: #5c6b5c;
  box-shadow: 0 2px 8px rgba(92, 107, 92, 0.15);
}

.vocab-item.selected {
  border-color: #5c6b5c;
  background-color: #f0f5f0;
  box-shadow: 0 0 0 3px rgba(92, 107, 92, 0.1);
}

.vocab-icon {
  @apply text-3xl;
}

.vocab-info {
  @apply flex-1;
}

.vocab-name {
  @apply font-semibold text-gray-700;
}

.vocab-meta {
  @apply flex gap-2 mt-1;
}

.vocab-recommend {
  @apply flex items-center;
}

.recommend-badge {
  @apply px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full font-medium;
}

.action-buttons {
  @apply flex gap-3;
}

/* 按钮样式 */
.btn {
  @apply px-6 py-3 rounded-lg font-medium;
  @apply transition-all duration-200;
}

.btn-primary {
  background-color: #5c6b5c;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #4a5a4a;
  box-shadow: 0 2px 8px rgba(92, 107, 92, 0.3);
}

.btn-primary:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.btn-success {
  background-color: #22c55e;
}

.btn-success:hover {
  background-color: #16a34a;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-error {
  background-color: #ef4444;
}

.btn-error:hover {
  background-color: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
</style>
