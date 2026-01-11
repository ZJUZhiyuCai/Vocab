<template>
  <div class="achievements-panel">
    <!-- 成就统计 -->
    <div class="mb-6 p-4 bg-gradient-to-br from-sage-50 to-beige-50 rounded-lg">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold text-sage-700">🏆 成就系统</h3>
        <span class="text-sm text-sage-600">{{ stats.unlocked }}/{{ stats.total }}</span>
      </div>
      <div class="w-full bg-beige-200 rounded-full h-3">
        <div
          class="bg-sage-500 h-3 rounded-full transition-all duration-500"
          :style="{ width: stats.percentage + '%' }"
        ></div>
      </div>
      <p class="text-xs text-sage-600 mt-2 text-center">
        已解锁 {{ stats.percentage }}% 的成就
      </p>
    </div>

    <!-- 成就列表 -->
    <div class="space-y-3">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">成就列表</h4>

      <!-- 分类标签 -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectedCategory = category.id"
          class="px-3 py-1 rounded-full text-xs font-medium transition-all"
          :class="selectedCategory === category.id
            ? 'bg-sage-500 text-white'
            : 'bg-beige-100 text-gray-600 hover:bg-beige-200'"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- 成就网格 -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div
          v-for="achievement in filteredAchievements"
          :key="achievement.id"
          class="achievement-card"
          :class="{ 'unlocked': achievement.unlocked, 'locked': !achievement.unlocked }"
        >
          <div class="text-3xl mb-2" :class="{ 'grayscale opacity-30': !achievement.unlocked }">
            {{ achievement.icon }}
          </div>
          <div class="font-semibold text-sm mb-1" :class="achievement.unlocked ? 'text-sage-700' : 'text-gray-500'">
            {{ achievement.name }}
          </div>
          <div class="text-xs mb-2" :class="achievement.unlocked ? 'text-gray-600' : 'text-gray-400'">
            {{ achievement.description }}
          </div>
          <div v-if="achievement.reward" class="text-xs text-sage-500 bg-sage-50 px-2 py-1 rounded">
            {{ achievement.reward }}
          </div>
          <div v-if="achievement.unlocked" class="mt-2 text-xs text-green-600 font-medium">
            ✅ 已解锁
          </div>
          <div v-else class="mt-2 text-xs text-gray-400">
            🔒 未解锁
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredAchievements.length === 0" class="text-center py-8 text-gray-400">
        <p>该分类暂无成就</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAchievementsList, getAchievementStats } from '../utils/achievements.js'

const selectedCategory = ref('all')

const categories = [
  { id: 'all', name: '全部' },
  { id: 'count', name: '学习数量' },
  { id: 'streak', name: '连续学习' },
  { id: 'vocabulary', name: '词库成就' },
  { id: 'accuracy', name: '正确率' },
  { id: 'special', name: '特殊成就' }
]

const achievements = ref([])
const stats = ref({ unlocked: 0, total: 0, percentage: 0 })

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return achievements.value
  }
  return achievements.value.filter(a => a.type === selectedCategory.value)
})

const loadData = () => {
  achievements.value = getAchievementsList()
  stats.value = getAchievementStats()
}

onMounted(() => {
  loadData()
})

// 暴露刷新方法供父组件调用
defineExpose({
  refresh: loadData
})
</script>

<style scoped>
.achievement-card {
  @apply p-3 rounded-lg border-2 transition-all duration-300;
}

.achievement-card.unlocked {
  @apply bg-white border-sage-200 shadow-sm hover:shadow-md hover:border-sage-400;
}

.achievement-card.locked {
  @apply bg-gray-50 border-gray-200;
}

.achievement-card.locked .text-3xl {
  filter: grayscale(100%);
  opacity: 0.3;
}
</style>
