<template>
  <div class="wordbook-page">
    <!-- 顶部导航栏 -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
      <button
        @click="$emit('back')"
        class="flex items-center gap-2 text-sage-600 hover:text-sage-700 transition-colors"
      >
        <span>←</span>
        <span>返回今日学习</span>
      </button>
      <h1 class="text-xl font-bold text-sage-500">📓 单词本</h1>
      <div class="w-24"></div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="wordbookWords.length > 0" class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="selectAll"
              @change="handleSelectAll"
              class="w-4 h-4 text-sage-500 rounded focus:ring-sage-500"
            >
            <span class="text-sm text-gray-600">全选</span>
          </label>
          <span class="text-sm text-gray-500">
            已选 {{ selectedIds.size }} / {{ wordbookWords.length }} 个
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="selectedIds.size > 0"
            @click="handleBatchRemove"
            class="px-4 py-2 text-sm text-error hover:bg-error-light rounded-md transition-colors"
          >
            批量删除
          </button>
          <div class="relative">
            <button
              @click="showExportMenu = !showExportMenu"
              class="px-4 py-2 text-sm bg-sage-500 text-white hover:bg-sage-600 rounded-md transition-colors"
            >
              导出 ↓
            </button>
            <div
              v-if="showExportMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
            >
              <button
                @click="exportToAnki"
                class="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-beige-50 transition-colors flex items-center gap-2"
              >
                <span>📇</span>
                <span>导出为 Anki 格式</span>
              </button>
              <button
                @click="exportToJSON"
                class="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-beige-50 transition-colors flex items-center gap-2"
              >
                <span>📄</span>
                <span>导出为 JSON 格式</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="wordbookWords.length === 0" class="card text-center py-16">
      <div class="text-6xl mb-4">📓</div>
      <h2 class="text-2xl font-bold text-sage-500 mb-2">单词本为空</h2>
      <p class="text-gray-600 mb-6">在单词卡片上点击星标按钮收藏单词</p>
      <button @click="$emit('back')" class="btn btn-primary">
        去学习单词
      </button>
    </div>

    <!-- 单词列表 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="word in wordbookWords"
        :key="word.id"
        class="card word-card animate-fade-in hover:shadow-md transition-shadow"
      >
        <!-- 复选框和收藏按钮 -->
        <div class="flex justify-between items-start mb-3">
          <input
            type="checkbox"
            :checked="selectedIds.has(word.id)"
            @change="toggleSelection(word.id)"
            class="w-4 h-4 text-sage-500 rounded focus:ring-sage-500 mt-1"
          >
          <button
            @click="handleRemove(word.id)"
            class="text-2xl transition-transform hover:scale-110"
            title="从单词本移除"
          >
            ⭐
          </button>
        </div>

        <!-- 单词标题 -->
        <h3 class="word-display mb-2">{{ word.word }}</h3>

        <!-- 音标和词性 -->
        <div class="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
          <span v-if="word.ipa" class="flex items-center gap-1">
            <span>🔊</span>{{ word.ipa }}
          </span>
          <span v-if="word.partOfSpeech" class="tag">{{ word.partOfSpeech }}</span>
        </div>

        <!-- 释义 -->
        <p class="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-2">
          {{ word.meaning }}
        </p>

        <!-- 收藏时间 -->
        <div class="text-xs text-gray-400">
          收藏于 {{ getFavoriteTime(word.id) }}
        </div>

        <!-- 标签 -->
        <div v-if="word.tags && word.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="(tag, index) in word.tags.slice(0, 3)"
            :key="index"
            class="tag text-xs bg-blue-100 text-blue-700"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- 导出成功提示 -->
    <div
      v-if="exportSuccess"
      class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-success text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up"
    >
      {{ exportSuccess }}
    </div>

    <!-- 确认删除弹窗 -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-sage-500 mb-2">确认删除</h3>
        <p class="text-gray-600 mb-6">
          确定要删除选中的 {{ selectedIds.size }} 个单词吗？
        </p>
        <div class="flex gap-3">
          <button
            @click="confirmBatchRemove"
            class="flex-1 btn bg-error text-white hover:bg-error-dark"
          >
            确认删除
          </button>
          <button
            @click="showDeleteConfirm = false"
            class="flex-1 btn bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  words: {
    type: Array,
    default: () => []
  },
  wordbook: {
    type: Set,
    required: true
  }
})

const emit = defineEmits(['back', 'remove', 'batchRemove'])

// 状态
const selectedIds = ref(new Set())
const selectAll = ref(false)
const showExportMenu = ref(false)
const exportSuccess = ref(null)
const showDeleteConfirm = ref(false)
const favoriteTimes = ref(new Map())

// 计算属性：单词本中的单词列表
const wordbookWords = computed(() => {
  return props.words
    .filter(word => props.wordbook.has(word.id))
    .sort((a, b) => {
      // 按收藏时间倒序排列
      const timeA = favoriteTimes.value.get(a.id) || 0
      const timeB = favoriteTimes.value.get(b.id) || 0
      return timeB - timeA
    })
})

// 获取收藏时间
const getFavoriteTime = (wordId) => {
  const timestamp = favoriteTimes.value.get(wordId)
  if (!timestamp) return '未知'

  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }

  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 更早
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

// 全选/取消全选
const handleSelectAll = () => {
  if (selectAll.value) {
    wordbookWords.value.forEach(word => selectedIds.value.add(word.id))
  } else {
    selectedIds.value.clear()
  }
}

// 切换单个选择
const toggleSelection = (wordId) => {
  if (selectedIds.value.has(wordId)) {
    selectedIds.value.delete(wordId)
  } else {
    selectedIds.value.add(wordId)
  }

  // 更新全选状态
  selectAll.value = selectedIds.value.size === wordbookWords.value.length
}

// 移除单个单词
const handleRemove = (wordId) => {
  emit('remove', wordId)
  selectedIds.value.delete(wordId)
  selectAll.value = false
}

// 批量删除
const handleBatchRemove = () => {
  if (selectedIds.value.size === 0) return
  showDeleteConfirm.value = true
}

// 确认批量删除
const confirmBatchRemove = () => {
  emit('batchRemove', Array.from(selectedIds.value))
  selectedIds.value.clear()
  selectAll.value = false
  showDeleteConfirm.value = false
}

// 导出为 Anki 格式
const exportToAnki = () => {
  if (wordbookWords.value.length === 0) return

  const selectedWords = selectedIds.value.size > 0
    ? wordbookWords.value.filter(w => selectedIds.value.has(w.id))
    : wordbookWords.value

  // Anki 格式：正面\t背面\t标签
  let content = ''
  selectedWords.forEach(word => {
    const front = word.word
    const back = `${word.meaning}\n\n${word.ipa ? '发音: ' + word.ipa : ''}${word.examples && word.examples.length > 0 ? '\n\n例句:\n' + word.examples[0].sentence : ''}`
    const tags = word.tags ? word.tags.join(' ') : ''

    content += `${front}\t${back}\t${tags}\n`
  })

  downloadFile(content, 'vocab-context-anki.txt', 'text/plain')
  showExportSuccess(`已导出 ${selectedWords.length} 个单词到 Anki 格式`)
  showExportMenu.value = false
}

// 导出为 JSON 格式
const exportToJSON = () => {
  if (wordbookWords.value.length === 0) return

  const selectedWords = selectedIds.value.size > 0
    ? wordbookWords.value.filter(w => selectedIds.value.has(w.id))
    : wordbookWords.value

  const data = {
    exportDate: new Date().toISOString(),
    count: selectedWords.length,
    words: selectedWords.map(word => ({
      word: word.word,
      ipa: word.ipa,
      partOfSpeech: word.partOfSpeech,
      meaning: word.meaning,
      examples: word.examples,
      collocations: word.collocations,
      synonyms: word.synonyms,
      tags: word.tags,
      favoriteTime: favoriteTimes.value.get(word.id)
    }))
  }

  downloadFile(JSON.stringify(data, null, 2), 'vocab-context.json', 'application/json')
  showExportSuccess(`已导出 ${selectedWords.length} 个单词到 JSON 格式`)
  showExportMenu.value = false
}

// 下载文件
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 显示导出成功提示
const showExportSuccess = (message) => {
  exportSuccess.value = message
  setTimeout(() => {
    exportSuccess.value = null
  }, 3000)
}

// 点击外部关闭导出菜单
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showExportMenu.value = false
  }
}

// 初始化
onMounted(() => {
  // 加载收藏时间（从 localStorage）
  const saved = localStorage.getItem('vocab-context-favorite-times')
  if (saved) {
    try {
      favoriteTimes.value = new Map(JSON.parse(saved))
    } catch (e) {
      console.error('加载收藏时间失败:', e)
    }
  }

  // 添加点击外部事件监听
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // 移除点击外部事件监听
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.word-card {
  @apply relative;
}

.word-card:hover {
  @apply border-l-4 border-sage-400;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .wordbook-page {
    @apply px-2;
  }
}
</style>
