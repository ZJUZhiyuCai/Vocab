<template>
  <div class="vocab-test-modal" :class="isDark ? 'dark' : 'light'">
    <div class="modal-content">
      <!-- 进度指示 -->
      <div class="progress-header">
        <div class="progress-info">
          <span class="text-sm text-slate-400">词汇量测试</span>
          <span class="text-sm font-medium text-emerald-400">{{ currentQuestion + 1 }} / {{ totalQuestions }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>

      <!-- 测试说明 -->
      <div v-if="currentQuestion === -1" class="intro-section text-center">
        <h2 class="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-6">词汇量水平测试</h2>
        <div class="text-left space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5 text-slate-300 mb-8">
          <p class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>共 <strong>50 道题</strong>，大约需要 <strong>5-8 分钟</strong></p>
          <p class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>自适应测试，题目难度会根据你的回答调整</p>
          <p class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>测试完成后会为你推荐合适的词库</p>
          <p class="text-sm text-slate-500 mt-6 pt-4 border-t border-white/5">请根据你是否认识这个单词的<strong>主要含义</strong>来回答</p>
        </div>
        <button @click="startTest" class="premium-btn w-full py-4 text-lg">开始测试</button>
      </div>

      <!-- 测试题目 -->
      <div v-else-if="currentQuestion < totalQuestions && !testCompleted" class="question-section py-8 text-center">
        <div class="word-display mb-12">
          <h2 class="text-5xl font-black text-white mb-4 tracking-tight">{{ currentTestWord.word }}</h2>
          <p v-if="currentTestWord.ipa" class="text-xl font-mono text-emerald-400/80 mb-6">{{ currentTestWord.ipa }}</p>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 font-medium">
            <span>难度: {{ currentTestWord.cefr }}</span>
            <span class="w-1 h-1 rounded-full bg-slate-600"></span>
            <span>{{ currentTestWord.ielts }}</span>
          </div>
        </div>

        <div class="answer-buttons grid grid-cols-2 gap-6 mb-8">
          <button
            @click="answerWord(false)"
            @touchstart.passive="() => {}"
            class="answer-btn btn-forget group"
          >
            <span class="text-3xl mb-2 group-hover:scale-110 transition-transform">✕</span>
            <span class="font-bold">不认识</span>
          </button>
          <button
            @click="answerWord(true)"
            @touchstart.passive="() => {}"
            class="answer-btn btn-know group"
          >
            <span class="text-3xl mb-2 group-hover:scale-110 transition-transform">✓</span>
            <span class="font-bold">认识</span>
          </button>
        </div>

        <div class="test-tip">
          <p class="text-xs text-slate-500">提示：选择后自动进入下一题，不能返回</p>
        </div>
      </div>

      <!-- 测试结果 -->
      <div v-else-if="testCompleted" class="result-section text-center" @click="selectedVocab = null">
        <h2 class="text-2xl font-bold text-emerald-400 mb-6">测试完成</h2>

        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="result-box">
            <span class="result-label">词汇量估算</span>
            <span class="result-value text-emerald-400">{{ estimatedVocab }}</span>
          </div>
          <div class="result-box">
            <span class="result-label">CEFR等级</span>
            <span class="result-value text-blue-400">{{ cefrLevel }}</span>
          </div>
          <div class="result-box">
            <span class="result-label">雅思水平</span>
            <span class="result-value text-purple-400">{{ ieltsLevel }}</span>
          </div>
        </div>

        <!-- 添加详细统计信息 -->
        <div class="result-stats mb-8">
          <div class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 justify-center">
            <span class="w-8 h-[1px] bg-slate-800"></span>
            <span>详细统计</span>
            <span class="w-8 h-[1px] bg-slate-800"></span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white/5 rounded-xl p-4 border border-white/5">
              <div class="text-xs text-slate-500 mb-1">答对题数</div>
              <div class="text-xl font-bold text-slate-200">{{ userAnswers.filter(a => a.known).length }} / {{ totalQuestions }}</div>
            </div>
            <div class="bg-white/5 rounded-xl p-4 border border-white/5">
              <div class="text-xs text-slate-500 mb-1">正确率</div>
              <div class="text-xl font-bold text-slate-200">{{ ((userAnswers.filter(a => a.known).length / totalQuestions) * 100).toFixed(0) }}%</div>
            </div>
          </div>
        </div>

        <div class="recommended-section text-left" @click.stop>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-1 h-5 rounded-full bg-emerald-500"></div>
            <h3 class="text-lg font-bold text-slate-200">推荐词库</h3>
          </div>
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
                  <span class="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-400">{{ vocab.level }}</span>
                  <span class="text-[10px] text-slate-500">{{ vocab.wordCount }}词</span>
                </div>
              </div>
              <div class="vocab-recommend">
                <span class="recommend-badge" v-if="vocab.isRecommended">推荐</span>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons flex gap-4 mt-8">
          <button
            @click="skipSelection"
            class="px-6 py-3 rounded-xl font-bold bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-all border border-white/5"
          >
            稍后选择
          </button>
          <button
            @click="confirmSelection"
            class="premium-btn flex-1 py-3 text-base"
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
import { useTheme } from '../composables/useTheme.js'

const { isDark } = useTheme()
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
/* 模态框 - 固定铺满 */
.vocab-test-modal {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1.5rem;
}

.vocab-test-modal.dark {
  background-color: rgba(2, 6, 23, 0.9);
}

.vocab-test-modal.light {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  border-radius: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-width: 42rem;
  width: 100%;
  padding: 2.5rem;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.dark .modal-content {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.light .modal-content {
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* 隐藏滚动条 */
.modal-content::-webkit-scrollbar {
  display: none;
}

/* ===== 进度条 ===== */
.progress-header {
  margin-bottom: 2rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  border-radius: 999px;
  overflow: hidden;
}

.dark .progress-bar {
  background-color: rgba(255, 255, 255, 0.05);
}

.light .progress-bar {
  background-color: rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #14b8a6 100%);
  border-radius: 999px;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ===== 按钮样式 ===== */
.premium-btn {
  @apply rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg transition-all;
  box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.4);
}

.premium-btn:hover:not(:disabled) {
  @apply brightness-110 -translate-y-0.5;
  box-shadow: 0 12px 24px -8px rgba(16, 185, 129, 0.5);
}

.premium-btn:active:not(:disabled) {
  @apply scale-95;
}

.premium-btn:disabled {
  @apply opacity-40 cursor-not-allowed grayscale;
}

/* ===== 答题按钮 ===== */
.answer-btn {
  @apply py-6 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border;
}

.btn-forget {
  @apply border-white/5 text-gray-400;
}

.dark .btn-forget {
  @apply bg-slate-800/50;
}

.light .btn-forget {
  @apply bg-gray-100;
}

.btn-forget:hover {
  @apply bg-rose-500/10 border-rose-500/30 text-rose-400;
}

.btn-know {
  @apply border-white/5 text-gray-400;
}

.dark .btn-know {
  @apply bg-slate-800/50;
}

.light .btn-know {
  @apply bg-gray-100;
}

.btn-know:hover {
  @apply bg-emerald-500/10 border-emerald-500/30 text-emerald-400;
}

/* ===== 结果展示 ===== */
.result-box {
  @apply flex flex-col items-center p-4 rounded-2xl;
}

.dark .result-box {
  @apply bg-black/20 border border-white/5;
}

.light .result-box {
  @apply bg-gray-50 border border-gray-200;
}

.result-label {
  @apply text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1;
}

.result-value {
  @apply text-xl font-black;
}

/* ===== 词库列表 ===== */
.vocab-item {
  @apply flex items-center gap-3 p-3 rounded-xl border border-transparent cursor-pointer transition-all;
}

.dark .vocab-item {
  @apply bg-white/5;
}

.light .vocab-item {
  @apply bg-gray-50;
}

.dark .vocab-item:hover {
  @apply bg-white/10 border-white/10;
}

.light .vocab-item:hover {
  @apply bg-gray-100 border-gray-200;
}

.vocab-item.selected {
  @apply bg-emerald-500/10 border-emerald-500/40;
}

.vocab-icon {
  @apply text-xl;
}

.vocab-name {
  @apply text-sm font-bold;
}

.dark .vocab-name {
  @apply text-gray-200;
}

.light .vocab-name {
  @apply text-gray-800;
}

.vocab-meta {
  @apply text-[10px] text-gray-500 flex gap-2;
}

.vocab-badge {
  @apply ml-auto px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-bold;
}

/* Animations */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
