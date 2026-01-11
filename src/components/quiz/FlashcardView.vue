<template>
  <div class="flashcard-view">
    <!-- 单词卡片容器 -->
    <div class="flashcard-container">
      <div
        class="flashcard-inner"
        :class="{ 'flipped': showAnswer }"
        @click="$emit('toggle')"
      >
        <!-- 正面 -->
        <div class="flashcard-front">
          <h2 class="word-text">{{ word.word }}</h2>
          <div v-if="word.phonetic" class="phonetic-text">
            {{ word.phonetic }}
          </div>
          <div class="tap-hint">
            <svg class="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="ml-1 text-sm">点击查看释义</span>
          </div>
        </div>

        <!-- 背面 -->
        <div class="flashcard-back">
          <h3 class="meaning-text">{{ word.meaning }}</h3>
          <div v-if="word.example" class="example-text">
            {{ word.example }}
          </div>
          <div v-if="word.exampleTranslation" class="example-translation">
            {{ word.exampleTranslation }}
          </div>
        </div>
      </div>
    </div>

    <!-- 难度按钮 -->
    <div v-if="showAnswer" class="difficulty-buttons">
      <button @click.stop="$emit('rate', 'easy')" class="difficulty-button easy">
        😊 简单
      </button>
      <button @click.stop="$emit('rate', 'medium')" class="difficulty-button medium">
        🤔 一般
      </button>
      <button @click.stop="$emit('rate', 'hard')" class="difficulty-button hard">
        😓 困难
      </button>
    </div>

    <!-- 导航按钮 -->
    <div class="navigation-buttons">
      <button @click.stop="$emit('previous')" class="nav-button" :disabled="!hasPrevious">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        ⬅️ 上一个
      </button>
      <button @click.stop="$emit('next')" class="nav-button" :disabled="!hasNext">
        下一个 ➡️
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  word: {
    type: Object,
    required: true
  },
  showAnswer: {
    type: Boolean,
    default: false
  },
  hasPrevious: {
    type: Boolean,
    default: true
  },
  hasNext: {
    type: Boolean,
    default: true
  }
})

defineEmits(['toggle', 'previous', 'next', 'rate'])
</script>

<style scoped>
.flashcard-view {
  @apply space-y-6;
}

/* 卡片容器 - 提供3D透视 */
.flashcard-container {
  @apply relative w-full h-80;
  perspective: 1000px;
  /* 启用GPU加速 */
  -webkit-perspective: 1000px;
}

/* 卡片内层 - 执行翻转动画 */
.flashcard-inner {
  @apply relative w-full h-full;
  @apply text-center;
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-style: preserve-3d;
  /* 启用GPU加速 */
  will-change: transform;
  -webkit-transform-style: preserve-3d;
  -webkit-backface-visibility: hidden;
}

/* 翻转状态 */
.flashcard-inner.flipped {
  transform: rotateY(180deg);
  -webkit-transform: rotateY(180deg);
}

/* 正面和背面 - 共同样式 */
.flashcard-front,
.flashcard-back {
  @apply absolute w-full h-full;
  @apply bg-white rounded-lg shadow-lg p-8;
  @apply flex flex-col items-center justify-center;
  @apply border-2 border-sage-200;
  /* 隐藏背面，启用GPU加速 */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  /* 提升到独立的合成层 */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

/* 正面 - 初始显示 */
.flashcard-front {
  z-index: 2;
}

/* 背面 - 初始隐藏（旋转180度） */
.flashcard-back {
  @apply bg-sage-50;
  transform: rotateY(180deg);
  -webkit-transform: rotateY(180deg);
  z-index: 1;
}

.word-text {
  @apply text-5xl font-bold text-sage-600 mb-3;
  /* 优化文本渲染 */
  transform: translateZ(20px);
  -webkit-transform: translateZ(20px);
}

.phonetic-text {
  @apply text-2xl text-gray-500 mb-6;
  transform: translateZ(10px);
  -webkit-transform: translateZ(10px);
}

.tap-hint {
  @apply flex items-center text-sage-500 mt-4;
  transform: translateZ(15px);
  -webkit-transform: translateZ(15px);
}

.meaning-text {
  @apply text-2xl font-bold text-sage-700 mb-4;
  transform: translateZ(20px);
  -webkit-transform: translateZ(20px);
}

.example-text {
  @apply text-lg text-gray-700 mb-2 italic;
  transform: translateZ(10px);
  -webkit-transform: translateZ(10px);
}

.example-translation {
  @apply text-base text-gray-600;
  transform: translateZ(10px);
  -webkit-transform: translateZ(10px);
}

.difficulty-buttons {
  @apply flex gap-3 justify-center;
}

.difficulty-button {
  @apply px-6 py-3 rounded-lg font-medium;
  @apply transition-all duration-200;
  /* 启用GPU加速的按钮动画 */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform;
}

.difficulty-button:active {
  transform: scale(0.95);
  -webkit-transform: scale(0.95);
}

.difficulty-button.easy {
  @apply bg-green-100 text-green-700 hover:bg-green-200;
}

.difficulty-button.medium {
  @apply bg-yellow-100 text-yellow-700 hover:bg-yellow-200;
}

.difficulty-button.hard {
  @apply bg-red-100 text-red-700 hover:bg-red-200;
}

.navigation-buttons {
  @apply flex justify-between gap-4;
}

.nav-button {
  @apply flex-1 flex items-center justify-center gap-2;
  @apply py-3 px-4 bg-white border-2 border-sage-200 rounded-lg;
  @apply text-sage-600 font-medium;
  @apply hover:bg-sage-50 hover:border-sage-300;
  @apply disabled:opacity-40 disabled:cursor-not-allowed;
  @apply transition-all duration-200;
  /* 启用GPU加速 */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0) translateZ(15px);
  }
  50% {
    transform: translateY(-5px) translateZ(15px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

/* 移动端优化 - 触摸反馈 */
@media (hover: none) and (pointer: coarse) {
  .flashcard-inner:active {
    transform: scale(0.98);
    -webkit-transform: scale(0.98);
  }

  .flashcard-inner.flipped:active {
    transform: rotateY(180deg) scale(0.98);
    -webkit-transform: rotateY(180deg) scale(0.98);
  }
}

/* 减少动画以尊重用户偏好 */
@media (prefers-reduced-motion: reduce) {
  .flashcard-inner {
    transition: transform 0.3s ease-out;
  }

  .animate-bounce {
    animation: none;
  }
}
</style>
