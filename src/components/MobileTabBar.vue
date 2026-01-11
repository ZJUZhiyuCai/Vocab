<template>
  <nav class="mobile-tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="$emit('navigate', tab.key)"
      class="tab-item"
      :class="{ active: currentTab === tab.key }"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
      <span v-if="tab.badge && tab.badge > 0" class="tab-badge">{{ tab.badge }}</span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentTab: {
    type: String,
    default: 'today'
  },
  reviewCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['navigate'])

const tabs = computed(() => [
  {
    key: 'today',
    label: '今日学习',
    icon: '📖'
  },
  {
    key: 'review',
    label: '复习',
    icon: '🔄',
    badge: props.reviewCount
  },
  {
    key: 'wordbook',
    label: '单词本',
    icon: '⭐'
  },
  {
    key: 'quiz',
    label: '测验',
    icon: '🎯'
  },
  {
    key: 'achievements',
    label: '成就',
    icon: '🏆'
  },
  {
    key: 'settings',
    label: '设置',
    icon: '⚙️'
  }
])
</script>

<style scoped>
.mobile-tab-bar {
  @apply fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200;
  @apply flex justify-around items-center;
  @apply lg:hidden;
  padding-bottom: max(env(safe-area-inset-bottom, 0), 16px);
  z-index: 40;
}

.tab-item {
  @apply relative flex flex-col items-center justify-center;
  @apply py-2 px-3;
  @apply text-gray-500;
  @apply transition-colors duration-200;
  min-height: 60px;
  flex: 1;
}

.tab-item.active {
  @apply text-sage-600;
}

.tab-icon {
  @apply text-2xl mb-1;
  line-height: 1;
}

.tab-label {
  @apply text-xs;
  line-height: 1;
}

.tab-badge {
  @apply absolute top-1 right-3;
  @apply bg-error text-white;
  @apply text-xs rounded-full;
  @apply min-w-[18px] h-[18px];
  @apply flex items-center justify-center;
  padding: 0 4px;
  line-height: 1;
}

/* 激活时的轻微放大效果 */
.tab-item:active {
  transform: scale(0.95);
}

.tab-item.active {
  transform: scale(1.02);
}
</style>
