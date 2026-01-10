<template>
  <div class="min-h-screen bg-beige-50">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-2xl mx-auto px-4 py-4">
        <h1 class="text-2xl font-bold text-sage-500">
          VocabContext
          <span class="text-sm font-normal text-gray-500 ml-2">语境词汇学习</span>
        </h1>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="max-w-2xl mx-auto px-4 py-6">
      <!-- 进度条 -->
      <div class="mb-6">
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>学习进度</span>
          <span>{{ progress.learned }} / {{ progress.total }}</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>

      <!-- 单词卡片 -->
      <div v-if="currentWord" class="card animate-fade-in flex flex-col" style="min-height: 520px;">
        <!-- 单词标题 -->
        <div class="mb-4">
          <h2 class="word-display mb-2">{{ currentWord.word }}</h2>
          <div class="flex gap-3 text-sm text-gray-600">
            <span v-if="currentWord.ipa">{{ currentWord.ipa }}</span>
            <span v-if="currentWord.partOfSpeech">{{ currentWord.partOfSpeech }}</span>
            <span v-if="currentWord.frequency" class="text-sage-500">
              频率: {{ currentWord.frequency }}/10
            </span>
          </div>
        </div>

        <!-- 释义 -->
        <div class="mb-4 flex-shrink-0">
          <p class="text-gray-700 text-sm leading-relaxed">{{ currentWord.meaning }}</p>
        </div>

        <!-- 语境例句 -->
        <div v-if="currentWord.examples && currentWord.examples.length > 0" class="sentence-box flex-grow mb-4">
          <div class="text-xs text-gray-600 mb-2">📖 语境例句</div>
          <p class="text-sm text-gray-800 leading-relaxed mb-2">
            <span
              v-html="highlightWord(currentWord.examples[0].sentence, currentWord.word)"
            ></span>
          </p>
          <p class="text-xs text-gray-500">
            {{ currentWord.examples[0].translation }}
          </p>
        </div>

        <!-- 搭配 -->
        <div v-if="currentWord.collocations && currentWord.collocations.length > 0" class="mb-4 flex-shrink-0">
          <div class="text-xs text-gray-600 mb-2">🔗 常用搭配</div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(collocation, index) in currentWord.collocations.slice(0, 3)"
              :key="index"
              class="tag"
            >
              {{ collocation }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 - 固定在底部 -->
        <div class="flex gap-3 mt-auto pt-4">
          <button
            @click="handleKnow"
            class="flex-1 btn btn-success"
          >
            认识 ✓
          </button>
          <button
            @click="handleForget"
            class="flex-1 btn btn-error"
          >
            不认识 ✗
          </button>
        </div>
      </div>

      <!-- 完成状态 -->
      <div v-else class="card text-center py-12">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-2xl font-bold text-sage-500 mb-2">恭喜完成！</h2>
        <p class="text-gray-600 mb-6">
          你已经学习了 {{ progress.learned }} 个单词
        </p>
        <button @click="restart" class="btn btn-primary">
          重新开始
        </button>
      </div>
    </main>

    <!-- 底部统计 -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-2xl mx-auto px-4 py-6">
        <div class="flex justify-around text-center">
          <div>
            <div class="text-2xl font-bold text-sage-500">{{ stats.learned }}</div>
            <div class="text-sm text-gray-600">已掌握</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-error">{{ stats.forgotten }}</div>
            <div class="text-sm text-gray-600">需复习</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-blue-500">{{ stats.accuracy }}%</div>
            <div class="text-sm text-gray-600">正确率</div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 状态
const words = ref([])
const currentIndex = ref(0)
const learned = ref(new Set())
const forgotten = ref(new Set())

// 当前单词
const currentWord = computed(() => {
  return words.value[currentIndex.value] || null
})

// 进度
const progress = computed(() => ({
  total: words.value.length,
  learned: learned.value.size,
}))

// 进度百分比
const progressPercentage = computed(() => {
  if (progress.value.total === 0) return 0
  return Math.round((progress.value.learned / progress.value.total) * 100)
})

// 统计数据
const stats = computed(() => {
  const total = learned.value.size + forgotten.value.size
  const accuracy = total > 0 ? Math.round((learned.value.size / total) * 100) : 0
  return {
    learned: learned.value.size,
    forgotten: forgotten.value.size,
    accuracy,
  }
})

// 高亮单词
const highlightWord = (sentence, word) => {
  const regex = new RegExp(`\\b${word}\\b`, 'gi')
  return sentence.replace(regex, `<span class="text-highlight">${word}</span>`)
}

// 处理"认识"
const handleKnow = () => {
  if (currentWord.value) {
    learned.value.add(currentWord.value.id)
    nextWord()
  }
}

// 处理"不认识"
const handleForget = () => {
  if (currentWord.value) {
    forgotten.value.add(currentWord.value.id)
    nextWord()
  }
}

// 下一个单词
const nextWord = () => {
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++
  }
}

// 重新开始
const restart = () => {
  currentIndex.value = 0
  learned.value.clear()
  forgotten.value.clear()
}

// 加载数据
const loadData = async () => {
  try {
    const response = await fetch('/data/words-data.json')
    const data = await response.json()
    words.value = data.words || []
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 初始化
onMounted(() => {
  loadData()
})
</script>
