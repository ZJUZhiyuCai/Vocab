<template>
  <Transition name="achievement-pop">
    <div
      v-if="show"
      class="achievement-notification fixed top-20 right-4 z-50 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg shadow-2xl p-4 max-w-sm"
    >
      <div class="flex items-start gap-3">
        <div class="text-4xl animate-bounce">
          {{ achievement.icon }}
        </div>
        <div class="flex-1">
          <div class="text-xs text-amber-600 font-semibold mb-1">
            🎉 成就解锁！
          </div>
          <div class="text-base font-bold text-gray-800 mb-1">
            {{ achievement.name }}
          </div>
          <div class="text-sm text-gray-600 mb-2">
            {{ achievement.description }}
          </div>
          <div v-if="achievement.reward" class="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded inline-block">
            {{ achievement.reward }}
          </div>
        </div>
        <button
          @click="close"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  achievement: {
    type: Object,
    required: true
  },
  autoClose: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 5000 // 5秒后自动关闭
  }
})

const emit = defineEmits(['close'])

const show = ref(true)
let closeTimer = null

const close = () => {
  show.value = false
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  emit('close')
}

// 自动关闭
if (props.autoClose) {
  closeTimer = setTimeout(() => {
    close()
  }, props.duration)
}

// 监听成就变化
watch(() => props.achievement, (newAchievement) => {
  if (newAchievement) {
    show.value = true
    if (props.autoClose) {
      if (closeTimer) clearTimeout(closeTimer)
      closeTimer = setTimeout(close, props.duration)
    }
  }
})
</script>

<style scoped>
.achievement-pop-enter-active {
  animation: slideInRight 0.5s ease-out;
}

.achievement-pop-leave-active {
  animation: slideOutRight 0.3s ease-in;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
