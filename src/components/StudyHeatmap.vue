<template>
  <div class="study-heatmap">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div class="stat-card">
        <div class="text-2xl mb-1">📚</div>
        <div class="text-lg font-bold text-sage-700">{{ totalWords }}</div>
        <div class="text-xs text-gray-500">总学习单词</div>
      </div>
      <div class="stat-card">
        <div class="text-2xl mb-1">🔥</div>
        <div class="text-lg font-bold text-orange-600">{{ streakDays }}</div>
        <div class="text-xs text-gray-500">连续天数</div>
      </div>
      <div class="stat-card">
        <div class="text-2xl mb-1">📅</div>
        <div class="text-lg font-bold text-blue-600">{{ totalStudyDays }}</div>
        <div class="text-xs text-gray-500">总学习天数</div>
      </div>
      <div class="stat-card">
        <div class="text-2xl mb-1">⭐</div>
        <div class="text-lg font-bold text-yellow-600">{{ averageWords }}</div>
        <div class="text-xs text-gray-500">日均单词</div>
      </div>
    </div>

    <!-- 学习热力图 -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-4">📊 学习热力图（最近14天）</h3>
      <div class="overflow-x-auto">
        <div class="flex gap-1 min-w-max">
          <div
            v-for="(day, index) in recentDays"
            :key="day.date"
            class="flex flex-col items-center gap-2"
          >
            <div
              class="heatmap-cell w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all duration-200 hover:scale-110 cursor-pointer"
              :class="getHeatmapClass(day.count)"
              :title="`${day.label}: ${day.count}个单词`"
            >
              {{ day.count || '' }}
            </div>
            <div class="text-xs text-gray-400">
              {{ day.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 图例 -->
      <div class="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
        <span>少</span>
        <div class="flex gap-1">
          <div class="w-4 h-4 rounded bg-gray-100"></div>
          <div class="w-4 h-4 rounded bg-green-100"></div>
          <div class="w-4 h-4 rounded bg-green-300"></div>
          <div class="w-4 h-4 rounded bg-green-500"></div>
          <div class="w-4 h-4 rounded bg-green-700"></div>
        </div>
        <span>多</span>
      </div>
    </div>

    <!-- 月度趋势 -->
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-4">📈 学习趋势</h3>
      <div class="h-48 flex items-end gap-1">
        <div
          v-for="(day, index) in recentDays"
          :key="day.date"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <div
            class="w-full bg-gradient-to-t from-sage-500 to-sage-300 rounded-t transition-all duration-300 hover:from-sage-600 hover:to-sage-400"
            :style="{ height: getBarHeight(day.count) + '%' }"
            :title="`${day.label}: ${day.count}个单词`"
          ></div>
          <div class="text-xs text-gray-400 transform -rotate-45 origin-top-left">
            {{ day.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getStudyHistory, getRecentStudyDays, getStreakDays, getTotalStudyDays } from '../utils/studyHistory.js'

const recentDays = ref([])
const totalWords = ref(0)
const streakDays = ref(0)
const totalStudyDays = ref(0)
const averageWords = ref(0)

const loadData = () => {
  // 加载最近14天的数据
  recentDays.value = getRecentStudyDays(14)

  // 计算统计数据
  const history = getStudyHistory()
  const counts = Object.values(history)

  totalWords.value = counts.reduce((sum, count) => sum + count, 0)
  streakDays.value = getStreakDays()
  totalStudyDays.value = getTotalStudyDays()
  averageWords.value = totalStudyDays.value > 0
    ? Math.round(totalWords.value / totalStudyDays.value)
    : 0
}

const getHeatmapClass = (count) => {
  if (count === 0) return 'bg-gray-100 text-gray-300'
  if (count < 10) return 'bg-green-100 text-green-700'
  if (count < 20) return 'bg-green-300 text-green-800'
  if (count < 50) return 'bg-green-500 text-white'
  return 'bg-green-700 text-white'
}

const getBarHeight = (count) => {
  const maxCount = Math.max(...recentDays.value.map(d => d.count), 1)
  return Math.max(5, (count / maxCount) * 100)
}

onMounted(() => {
  loadData()
})

// 暴露刷新方法
defineExpose({
  refresh: loadData
})
</script>

<style scoped>
.stat-card {
  @apply bg-white rounded-lg border border-gray-200 p-4 text-center;
}

.heatmap-cell {
  min-width: 32px;
  min-height: 32px;
}
</style>
