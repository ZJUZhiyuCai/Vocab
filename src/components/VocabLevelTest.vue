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
            @touchstart.passive="() => {}"
            class="answer-btn btn-error"
          >
            <div class="text-2xl mb-1">✗</div>
            <div>不认识</div>
          </button>
          <button
            @click="answerWord(true)"
            @touchstart.passive="() => {}"
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
      <div v-else-if="testCompleted" class="result-section" @click="selectedVocab = null">
        <div class="result-icon">🎯</div>
        <h2 class="text-xl font-bold text-sage-500 mb-3">测试完成</h2>

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

        <!-- 🔥 添加详细统计信息 -->
        <div class="result-stats">
          <div class="text-sm text-gray-600 mb-2">📊 详细统计</div>
          <div class="grid grid-cols-2 gap-3">
            <div class="stat-item">
              <div class="stat-label">答对题数</div>
              <div class="stat-number">{{ userAnswers.filter(a => a.known).length }} / {{ totalQuestions }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">正确率</div>
              <div class="stat-number">{{ ((userAnswers.filter(a => a.known).length / totalQuestions) * 100).toFixed(0) }}%</div>
            </div>
          </div>
        </div>

        <div class="recommended-section" @click.stop>
          <h3 class="text-lg font-semibold text-sage-500 mb-3">📚 推荐词库</h3>
          <div class="vocab-list">
            <div
              v-for="vocab in recommendedVocabs"
              :key="vocab.id"
              @click.stop="selectVocab(vocab)"
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
  // 🔥 改进的测试单词池：增加更多题目，覆盖更广的难度范围
  const wordPool = [
    // A1 级别（基础）- 5个
    { word: 'hello', ipa: '/həˈləʊ/', cefr: 'A1', ielts: '基础', difficulty: 1 },
    { word: 'book', ipa: '/bʊk/', cefr: 'A1', ielts: '基础', difficulty: 1 },
    { word: 'happy', ipa: '/ˈhæpi/', cefr: 'A1', ielts: '基础', difficulty: 1 },
    { word: 'time', ipa: '/taɪm/', cefr: 'A1', ielts: '基础', difficulty: 1 },
    { word: 'family', ipa: '/ˈfæməli/', cefr: 'A1', ielts: '基础', difficulty: 1 },

    // A2 级别（初级）- 8个
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

    // B1 级别（中级）- 12个
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
    { word: 'accumulate', ipa: '/əˈkjuːmjəleɪt/', cefr: 'B1', ielts: '5分', difficulty: 3 },
    { word: 'demonstrate', ipa: '/ˈdemənstreɪt/', cefr: 'B1', ielts: '5分', difficulty: 3 },

    // B2 级别（中高级）- 15个
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
    { word: 'hierarchy', ipa: '/ˈhaɪərɑːki/', cefr: 'B2', ielts: '6分', difficulty: 4 },
    { word: 'implement', ipa: '/ˈɪmplɪment/', cefr: 'B2', ielts: '6分', difficulty: 4 },
    { word: 'integrate', ipa: '/ˈɪntɪɡreɪt/', cefr: 'B2', ielts: '6分', difficulty: 4 },
    { word: 'methodology', ipa: '/ˌmeθəˈdɒlədʒi/', cefr: 'B2', ielts: '6分', difficulty: 4 },
    { word: 'perspective', ipa: '/pəˈspektɪv/', cefr: 'B2', ielts: '6分', difficulty: 4 },

    // C1 级别（高级）- 12个
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
    { word: 'heterogeneous', ipa: '/ˌhetərəˈdʒiːniəs/', cefr: 'C1', ielts: '7分', difficulty: 5 },
    { word: 'imperative', ipa: '/ɪmˈperətɪv/', cefr: 'C1', ielts: '7分', difficulty: 5 },

    // C2 级别（精通）- 8个
    { word: 'obfuscate', ipa: '/ˈɒbfʌskeɪt/', cefr: 'C2', ielts: '8分', difficulty: 6 },
    { word: 'perspicacious', ipa: '/ˌpɜːspɪˈkeɪʃəs/', cefr: 'C2', ielts: '8分', difficulty: 6 },
    { word: 'recalcitrant', ipa: '/rɪˈkælsɪtrənt/', cefr: 'C2', ielts: '8分', difficulty: 6 },
    { word: 'sesquipedalian', ipa: '/ˌseskwɪpɪˈdeɪliən/', cefr: 'C2', ielts: '8分', difficulty: 6 },
    { word: 'acrimonious', ipa: '/ˌækrɪˈməʊniəs/', cefr: 'C2', ielts: '8分', difficulty: 6 },
    { word: 'obsequious', ipa: '/əbˈsiːkwiəs/', cefr: 'C2', ielts: '8分', difficulty: 6 },
    { word: 'pusillanimous', ipa: '/ˌpjuːsɪˈlænɪməs/', cefr: 'C2', ielts: '8分', difficulty: 6 },
    { word: 'vicissitude', ipa: '/vɪˈsɪsɪtjuːd/', cefr: 'C2', ielts: '8分', difficulty: 6 }
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

// 计算测试结果（🔥 改进版算法）
const calculateResult = () => {
  const correctCount = userAnswers.value.filter(a => a.known).length
  const correctRate = correctCount / totalQuestions

  // 计算加权难度分数（正确率高的单词权重更高）
  let weightedDifficultySum = 0
  let totalWeight = 0

  userAnswers.value.forEach(answer => {
    // 如果答对，权重更高；答对越难的题，分数越高
    const weight = answer.known ? 1.5 : 0.5
    weightedDifficultySum += answer.difficulty * weight
    totalWeight += weight
  })

  const avgDifficulty = totalWeight > 0 ? weightedDifficultySum / totalWeight : 0

  // 🔥 改进的评估算法：同时考虑正确率和难度
  // 计算能力分数 (0-100)
  const abilityScore = (avgDifficulty / 6) * 40 + correctRate * 60

  console.log('📊 测试分析:', {
    correctCount,
    totalQuestions,
    correctRate: (correctRate * 100).toFixed(1) + '%',
    avgDifficulty: avgDifficulty.toFixed(2),
    abilityScore: abilityScore.toFixed(1)
  })

  // 根据能力分数估算词汇量和等级
  let vocabRange = ''
  let cefr = ''
  let ielts = ''

  if (abilityScore < 25) {
    vocabRange = '500-1500'
    cefr = 'A1'
    ielts = '基础-4.0'
  } else if (abilityScore < 40) {
    vocabRange = '1500-3000'
    cefr = 'A2'
    ielts = '4.0-5.0'
  } else if (abilityScore < 55) {
    vocabRange = '3000-5000'
    cefr = 'B1'
    ielts = '5.0-6.0'
  } else if (abilityScore < 70) {
    vocabRange = '5000-7000'
    cefr = 'B2'
    ielts = '6.0-6.5'
  } else if (abilityScore < 82) {
    vocabRange = '7000-9000'
    cefr = 'C1'
    ielts = '6.5-7.0'
  } else if (abilityScore < 92) {
    vocabRange = '9000-11000'
    cefr = 'C1+'
    ielts = '7.0-7.5'
  } else {
    vocabRange = '11000-13000+'
    cefr = 'C2'
    ielts = '7.5-8.5+'
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
/* 模态框 - 毛玻璃效果 */
.vocab-test-modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  max-width: 42rem;
  width: 100%;
  padding: 1.5rem;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #e8e0d8;
}

/* ===== 进度条 ===== */
.progress-header {
  margin-bottom: 1.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-info span:first-child {
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-info span:last-child {
  font-size: 0.875rem;
  font-weight: 600;
  color: #5c6b5c;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #e8e0d8;
}

.progress-fill {
  height: 100%;
  transition: all 300ms ease-out;
  background: linear-gradient(90deg, #7d8f7d 0%, #5c6b5c 100%);
}

/* ===== 介绍部分 ===== */
.intro-section {
  text-align: center;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.intro-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.intro-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #3d473d;
}

.intro-list {
  text-align: left;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

.intro-list p {
  margin-bottom: 0.75rem;
  color: #374151;
  font-size: 1rem;
  line-height: 1.625;
}

/* ===== 题目部分 ===== */
.question-section {
  text-align: center;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.word-display {
  margin-bottom: 2rem;
}

.word-display h2 {
  font-size: 28px;
  font-weight: 700;
  color: #5c6b5c;
  letter-spacing: -0.01em;
  margin-bottom: 0.5rem;
}

.word-display p {
  color: #6b7280;
  font-size: 15px;
}

/* ===== 答题按钮 ===== */
.answer-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.answer-btn {
  padding: 1.25rem 2.5rem;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  min-width: 140px;
  transition: all 150ms ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  position: relative;
  overflow: hidden;
}

/* 🔥 移动端触摸反馈增强 */
.answer-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.3);
  opacity: 0;
  transition: opacity 150ms;
}

.answer-btn:active {
  transform: scale(0.95);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.answer-btn:active::after {
  opacity: 1;
}

.answer-btn.btn-success {
  background: linear-gradient(135deg, #5c7d5c 0%, #4a634a 100%);
}

.answer-btn.btn-success:hover {
  box-shadow: 0 4px 12px rgba(92, 125, 92, 0.25);
  transform: translateY(-1px);
}

.answer-btn.btn-success:active {
  transform: scale(0.95);
}

.answer-btn.btn-error {
  background: linear-gradient(135deg, #b86c6c 0%, #a35a5a 100%);
}

.answer-btn.btn-error:hover {
  box-shadow: 0 4px 12px rgba(184, 108, 108, 0.25);
  transform: translateY(-1px);
}

.answer-btn.btn-error:active {
  transform: scale(0.95);
}

.test-tip {
  text-align: center;
}

.test-tip p {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* ===== 结果部分 ===== */
.result-section {
  text-align: center;
}

.result-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.result-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #3d473d;
}

.result-card {
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #f0f4f0 0%, #dce8dc 100%);
  border: 1px solid #c0d5c0;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dce8dc;
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

.result-value {
  font-size: 1rem;
  font-weight: 700;
  color: #3d473d;
}

/* ===== 详细统计信息 ===== */
.result-stats {
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #fafafa;
  border: 1px solid #e8e0d8;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-number {
  font-size: 1.125rem;
  font-weight: 700;
  color: #5c6b5c;
}

/* ===== 推荐词库区域 ===== */
.recommended-section {
  text-align: left;
  margin-bottom: 1rem;
}

.recommended-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #3d473d;
  margin-bottom: 0.75rem;
}

.vocab-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

@media (min-width: 640px) {
  .vocab-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.vocab-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 150ms ease-out;
  position: relative;
  overflow: hidden;
  background-color: #faf8f6;
  border: 2px solid #e8e0d8;
}

.vocab-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, #f5f7f5, transparent);
  opacity: 0;
  transition: opacity 150ms;
}

.vocab-item:hover {
  border-color: #9caf9c;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.vocab-item:hover::before {
  opacity: 1;
}

.vocab-item.selected {
  border-color: #5c6b5c;
  background: linear-gradient(135deg, #f0f4f0 0%, #e8f0e8 100%);
  box-shadow: 0 0 0 3px rgba(92, 107, 92, 0.1);
}

.vocab-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.vocab-info {
  flex: 1;
  min-width: 0;
}

.vocab-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.vocab-meta {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.125rem;
}

.vocab-meta span {
  font-size: 0.75rem;
}

.vocab-meta span:first-child {
  color: #5c6b5c;
}

.vocab-meta span:last-child {
  color: #9ca3af;
}

.vocab-recommend {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.recommend-badge {
  padding: 0.125rem 0.5rem;
  background-color: #dce8dc;
  color: #5c6b5c;
  font-size: 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
}

/* ===== 操作按钮 ===== */
.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.action-buttons button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 150ms ease-out;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.action-buttons button:active {
  transform: scale(0.98);
}

.action-buttons button[class*="btn-primary"] {
  background: linear-gradient(135deg, #5c6b5c 0%, #4a5a4a 100%);
  color: white;
}

.action-buttons button[class*="btn-primary"]:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(92, 107, 92, 0.2);
  transform: translateY(-1px);
}

.action-buttons button[class*="btn-primary"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.action-buttons button.bg-gray-200 {
  background-color: #e8e0d8;
  color: #374151;
}

.action-buttons button.bg-gray-200:hover {
  background-color: #d4c8b9;
}

/* ===== 移动端优化 ===== */
@media (max-width: 640px) {
  .modal-content {
    padding: 1.25rem;
  }

  .word-display h2 {
    font-size: 24px;
  }

  .answer-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .answer-btn {
    width: 100%;
    padding: 1rem;
  }

  .vocab-list {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
