# 组件设计文档
# VocabContext 语境词汇学习工具

## 目录
- [一、组件架构](#一组件架构)
- [二、核心组件](#二核心组件)
- [三、状态管理](#三状态管理)
- [四、交互流程](#四交互流程)
- [五、组件间通信](#五组件间通信)

---

## 一、组件架构

### 1.1 组件树

```
App
├── Header
│   ├── Logo
│   └── UserStats
│
├── ProgressBar
│   └── ProgressSegment
│
├── WordCard (核心)
│   ├── WordHeader
│   │   ├── WordText
│   │   ├── Phonetic
│   │   └── PartOfSpeech
│   ├── ContextExample
│   │   ├── SentenceText
│   │   └── HighlightedWord
│   ├── AIExample
│   │   ├── AILabel
│   │   ├── AISentence
│   │   └── LoadMoreButton
│   └── ActionButtons
│       ├── KnowButton
│       └── ForgetButton
│
├── Feedback (答对/答错反馈)
│   ├── SuccessFeedback
│   │   ├── CheckIcon
│   │   ├── WordDetail
│   │   └── Collocations
│   └── ErrorFeedback
│       ├── CrossIcon
│       │   ├── CorrectAnswer
│       │   └── MemoryTip
│
├── Confetti (彩带动画)
│   └── ConfettiParticle
│
├── SettingsPanel
│   ├── TagSelector
│   ├── DailyGoalInput
│   └── DifficultySelector
│
└── Footer
    ├── NavigationButtons
    └── Links
```

### 1.2 组件分类

**布局组件**：
- `App.vue` - 根组件
- `Header.vue` - 顶部导航
- `Footer.vue` - 底部信息

**功能组件**：
- `ProgressBar.vue` - 顶部进度条
- `WordCard.vue` - 单词卡片（核心）
- `Feedback.vue` - 答对/答错反馈
- `Confetti.vue` - 彩带动画

**设置组件**：
- `SettingsPanel.vue` - 设置面板

---

## 二、核心组件

### 2.1 ProgressBar.vue（顶部进度条）

**功能**：显示当前学习进度

**Props**：
```javascript
{
  current: Number,    // 当前进度 (如: 3)
  total: Number,      // 总数 (如: 10)
  showCount: Boolean  // 是否显示数字 (默认 true)
}
```

**UI设计**：
```
┌────────────────────────────────────────┐
│ ████████░░░░░░░░░░  ⟫ 3/10             │  ← 4px高，固定顶部
└────────────────────────────────────────┘
```

**状态变化**：
- 初始：`current: 0, total: 10`
- 学习1个后：`current: 1, total: 10` + 进度条跳动动画
- 完成：`current: 10, total: 10` + 完成庆祝动画

**关键代码**：
```vue
<template>
  <div class="progress-bar-container">
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: `${progressPercent}%` }"
        :class="{ bump: justCompleted }"
      ></div>
    </div>
    <span v-if="showCount" class="progress-text">
      {{ current }}/{{ total }}
    </span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  current: Number,
  total: Number,
  showCount: { type: Boolean, default: true }
})

const justCompleted = ref(false)

const progressPercent = computed(() => {
  return (props.current / props.total) * 100
})

watch(() => props.current, (newVal, oldVal) => {
  if (newVal > oldVal) {
    justCompleted.value = true
    setTimeout(() => justCompleted.value = false, 300)
  }
})
</script>

<style scoped>
.progress-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--neutral-200);
  z-index: 100;
}

.progress-fill {
  height: 100%;
  background: var(--primary-500);
  transition: width 250ms cubic-bezier(0.33, 1, 0.68, 1);
}

.progress-fill.bump {
  animation: progressBump 300ms ease-out;
}

@keyframes progressBump {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.3); }
}
</style>
```

---

### 2.2 WordCard.vue（单词卡片 - 核心）

**功能**：展示单词、音标、语境例句、AI例句

**Props**：
```javascript
{
  word: Object,      // 单词数据对象
  aiExample: Object, // AI生成的例句
  loadingAI: Boolean // AI生成中
}
```

**Events**：
```javascript
{
  know: () => {},      // 用户点击"认识"
  forget: () => {},    // 用户点击"不认识"
  generateAI: () => {} // 请求生成AI例句
}
```

**UI设计**：
```
┌─────────────────────────────────────┐
│  comprehensive                      │  ← 28px, 加粗, 鼠尾绿
│  /kəmˈprehensɪv/  adj.             │  ← 13px, 灰色
│                                     │
│  📖 语境例句:                       │
│  The government's **comprehensive** │
│  strategy addresses both economic   │
│  and environmental concerns.        │
│  （政府全面的战略同时解决了经济      │
│   和环境问题。）                      │
│                                     │
│  🤖 AI例句:                         │
│  [生成例句按钮] 或 [已生成内容]      │
│                                     │
│  ┌─────────┐  ┌─────────┐           │
│  │  认识 ✓  │  │  不认识 ✗  │        │
│  └─────────┘  └─────────┘           │
└─────────────────────────────────────┘
   背景：#f5f0eb
   圆角：8px
   阴影：0 1px 2px rgba(0,0,0,0.04)
```

**关键代码**：
```vue
<template>
  <div class="word-card">
    <!-- 单词头部 -->
    <div class="word-header">
      <h2 class="word-text">{{ word.word }}</h2>
      <div class="word-meta">
        <span class="phonetic">{{ word.ipa }}</span>
        <span class="pos">{{ word.partOfSpeech }}</span>
      </div>
    </div>

    <!-- 语境例句 -->
    <div class="context-section">
      <div class="section-label">📖 语境例句</div>
      <p class="sentence">
        <HighlightWord :word="word.word" :sentence="word.examples[0].sentence" />
      </p>
      <p class="translation">{{ word.examples[0].translation }}</p>
    </div>

    <!-- AI例句 -->
    <div class="ai-section">
      <div class="section-label">🤖 AI例句</div>

      <div v-if="loadingAI" class="ai-loading">
        <Spinner /> 生成中...
      </div>

      <div v-else-if="aiExample" class="ai-content">
        <p class="ai-sentence">{{ aiExample.english }}</p>
        <p class="ai-translation">{{ aiExample.chinese }}</p>
      </div>

      <button
        v-else
        @click="$emit('generateAI')"
        class="generate-btn"
      >
        生成个性化例句
      </button>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button
        @click="$emit('know')"
        class="btn-know"
      >
        认识 ✓
      </button>
      <button
        @click="$emit('forget')"
        class="btn-forget"
      >
        不认识 ✗
      </button>
    </div>
  </div>
</template>

<script setup>
import HighlightWord from './HighlightWord.vue'
import Spinner from './Spinner.vue'

defineProps({
  word: Object,
  aiExample: Object,
  loadingAI: Boolean
})

defineEmits(['know', 'forget', 'generateAI'])
</script>

<style scoped>
.word-card {
  background: var(--neutral-100);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  max-width: 600px;
  margin: 0 auto;
  animation: fadeIn 250ms ease-out;
}

.word-text {
  font-size: var(--font-size-word);
  font-weight: var(--font-weight-word);
  color: var(--primary-500);
  margin-bottom: var(--space-2);
}

.word-meta {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.phonetic, .pos {
  font-size: var(--font-size-caption);
  color: var(--text-tertiary);
}

.section-label {
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-caption);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.sentence {
  font-size: var(--font-size-sentence);
  line-height: var(--line-height-sentence);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.translation {
  font-size: var(--font-size-caption);
  color: var(--text-tertiary);
  margin-bottom: var(--space-4);
}

.actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.btn-know, .btn-forget {
  flex: 1;
  padding: var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms;
}

.btn-know {
  background: var(--success-bg);
  color: var(--success-text);
}

.btn-know:hover {
  background: #d0e8d0;
}

.btn-forget {
  background: var(--error-bg);
  color: var(--error-text);
}

.btn-forget:hover {
  background: #e0d0d0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
```

---

### 2.3 Feedback.vue（反馈组件）

**功能**：显示答对/答错的反馈信息

**Props**：
```javascript
{
  type: String,    // 'success' | 'error'
  word: Object,    // 单词数据
  show: Boolean    // 是否显示
}
```

**UI设计 - 成功**：
```
┌─────────────────────────────────────┐
│  ✓ 正确！                            │  ← 浅绿背景
│                                     │
│  comprehensive = 全面的，综合的      │
│                                     │
│  常见搭配：                          │
│  • comprehensive study              │
│  • comprehensive plan               │
│  • comprehensive analysis           │
│                                     │
│  同义词：                            │
│  complete, thorough, extensive      │
└─────────────────────────────────────┘
```

**UI设计 - 错误**：
```
┌─────────────────────────────────────┐
│  ✗ 不太对                            │  ← 浅红背景
│                                     │
│  正确答案：comprehensive             │
│                                     │
│  💡 记忆技巧：                       │
│  com(一起) + prehen(抓住) + sive    │
│  = 全部抓住 → 全面的                 │
│                                     │
│  想想看：这个句子中应该填什么？       │
│  This project needs a ______ test.  │
└─────────────────────────────────────┘
   晃动动画：200ms
```

**关键代码**：
```vue
<template>
  <Transition name="feedback">
    <div v-if="show" class="feedback" :class="type">
      <!-- 成功反馈 -->
      <div v-if="type === 'success'" class="success-feedback">
        <div class="feedback-icon">✓</div>
        <h3>正确！</h3>

        <div class="word-meaning">
          <strong>{{ word.word }}</strong> = {{ word.meaning }}
        </div>

        <div v-if="word.collocations" class="collocations">
          <h4>常见搭配</h4>
          <ul>
            <li v-for="col in word.collocations" :key="col">
              {{ col }}
            </li>
          </ul>
        </div>

        <div v-if="word.synonyms" class="synonyms">
          <h4>同义词</h4>
          <p>{{ word.synonyms.join(', ') }}</p>
        </div>
      </div>

      <!-- 错误反馈 -->
      <div v-else class="error-feedback">
        <div class="feedback-icon">✗</div>
        <h3>不太对</h3>

        <div class="correct-answer">
          正确答案：<strong>{{ word.word }}</strong>
        </div>

        <div v-if="word.memoryTip" class="memory-tip">
          <h4>💡 记忆技巧</h4>
          <p>{{ word.memoryTip }}</p>
        </div>

        <div class="quiz">
          <p>想想看：这个句子中应该填什么？</p>
          <p class="quiz-sentence">{{ word.quizSentence }}</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  type: { type: String, required: true },
  word: { type: Object, required: true },
  show: { type: Boolean, default: false }
})
</script>

<style scoped>
.feedback {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  margin-top: var(--space-4);
  animation: slideIn 200ms ease-out;
}

.success-feedback {
  background: var(--success-bg);
  border: 1px solid var(--success-border);
}

.error-feedback {
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  animation: shake 200ms ease-in-out;
}

.feedback-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: var(--space-3);
}

.word-meaning {
  font-size: 18px;
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: rgba(255,255,255,0.5);
  border-radius: var(--radius-md);
}

.collocations, .synonyms {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid rgba(0,0,0,0.1);
}

.collocations h4, .synonyms h4 {
  font-size: var(--font-size-caption);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.collocations ul {
  list-style: none;
  padding: 0;
}

.collocations li {
  padding: var(--space-1) 0;
  color: var(--text-primary);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feedback-enter-active,
.feedback-leave-active {
  transition: all 250ms ease;
}

.feedback-enter-from,
.feedback-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
```

---

### 2.4 Confetti.vue（彩带动画）

**功能**：答对时的庆祝动画

**Props**：
```javascript
{
  show: Boolean,      // 是否显示
  count: Number       // 彩带数量 (默认 8)
}
```

**触发时机**：
- 第1个词答对
- 第3个词答对
- 第5个词答对
- 最后一个词答对

**实现方式**：
```vue
<template>
  <Teleport to="body">
    <Transition name="confetti">
      <div v-if="show" class="confetti-container">
        <div
          v-for="i in count"
          :key="i"
          class="confetti-piece"
          :style="getConfettiStyle(i)"
        ></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  count: { type: Number, default: 8 }
})

const colors = [
  '#9caf9c', // 鼠尾绿
  '#9badbd', // 石板蓝
  '#d4c4b0', // 米棕
  '#7d9c7d', // 深绿
  '#73889c'  // 深蓝
]

function getConfettiStyle(index) {
  const randomLeft = Math.random() * 100
  const randomDelay = Math.random() * 0.5
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomRotation = Math.random() * 360

  return {
    left: `${randomLeft}%`,
    animationDelay: `${randomDelay}s`,
    backgroundColor: randomColor,
    transform: `rotate(${randomRotation}deg)`
  }
}
</script>

<style scoped>
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}

.confetti-piece {
  position: absolute;
  top: -20px;
  width: 10px;
  height: 10px;
  animation: confettiFall 0.8s ease-out forwards;
}

@keyframes confettiFall {
  0% {
    transform: translateY(-100%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
</style>
```

---

### 2.5 SettingsPanel.vue（设置面板）

**功能**：用户偏好设置

**设置项**：
```javascript
{
  tags: [],           // 兴趣标签 ['程序员', '科技']
  dailyGoal: 10,      // 每日目标（单词数）
  difficulty: 'medium' // 难度 'easy' | 'medium' | 'hard'
}
```

**UI设计**：
```
┌─────────────────────────────────────┐
│  ⚙️ 设置                             │
│                                     │
│  🏷️ 兴趣标签                        │
│  ☑ 程序员  ☑ 科技  ☐ 学生          │
│  ☐ 商务    ☐ 艺术  ☐ 其他          │
│                                     │
│  🎯 每日目标                        │
│  [ 5 ]  个单词                      │
│                                     │
│  📊 学习难度                        │
│  ○ 简单  ● 中等  ○ 困难            │
│                                     │
│  ┌─────────┐                        │
│  │  保存    │                        │
│  └─────────┘                        │
└─────────────────────────────────────┘
```

---

## 三、状态管理

### 3.1 全局状态

使用 `reactive` 管理全局状态：

```javascript
// src/composables/useAppState.js
import { reactive } from 'vue'

export const appState = reactive({
  // 当前单词队列
  wordQueue: [],

  // 当前单词索引
  currentIndex: 0,

  // 用户设置
  settings: {
    tags: [],
    dailyGoal: 10,
    difficulty: 'medium'
  },

  // 学习进度
  progress: {
    todayLearned: 0,
    totalLearned: 0,
    streak: 0
  },

  // 用户学习记录
  wordRecords: {},

  // UI状态
  ui: {
    showSettings: false,
    showFeedback: false,
    feedbackType: null
  }
})
```

### 3.2 本地持久化

```javascript
// src/composables/useAppState.js (续)
import { userStorage } from '@/utils/storage'

// 初始化：从LocalStorage加载
export function initAppState() {
  const savedSettings = userStorage.getSettings('default')
  Object.assign(appState.settings, savedSettings)

  const savedProgress = userStorage.getProgress('default')
  Object.assign(appState.progress, savedProgress)

  const savedRecords = userStorage.getWords('default')
  appState.wordRecords = savedRecords
}

// 保存设置
export function saveSettings() {
  userStorage.saveSettings('default', appState.settings)
}

// 保存进度
export function saveProgress() {
  userStorage.saveProgress('default', appState.progress)
  userStorage.saveWords('default', appState.wordRecords)
}
```

---

## 四、交互流程

### 4.1 完整学习流程

```
1. 用户打开应用
   ↓
2. 加载今日单词队列（10个）
   ↓
3. 显示第1个单词卡片
   ↓
4. 用户阅读单词、例句
   ↓
5. 用户可选择：
   a) 点击"生成AI例句" → 显示AI例句
   b) 直接判断
   ↓
6. 用户点击"认识"或"不认识"
   ↓
7. 显示反馈（答对/答错）
   - 如果是第1/3/5/10个词 → 显示彩带
   - 进度条跳动
   ↓
8. 延迟1.5秒后自动跳转下一个词
   ↓
9. 重复步骤3-8，直到完成10个词
   ↓
10. 显示今日学习总结
```

### 4.2 状态机

```javascript
const LEARNING_STATES = {
  IDLE: 'idle',           // 空闲
  LOADING: 'loading',     // 加载中
  SHOWING_WORD: 'showing_word',  // 显示单词
  WAITING_INPUT: 'waiting_input', // 等待用户判断
  SHOWING_FEEDBACK: 'showing_feedback', // 显示反馈
  COMPLETED: 'completed'  // 完成
}
```

---

## 五、组件间通信

### 5.1 Props down, Events up

```
App (父组件)
 ↓ props
WordCard (子组件)
 ↑ emit
App (父组件)
```

### 5.2 Provide / Inject

对于深层嵌套组件：

```javascript
// App.vue
import { provide } from 'vue'

provide('appState', appState)
provide('updateProgress', saveProgress)

// 深层子组件
import { inject } from 'vue'

const appState = inject('appState')
```

### 5.3 Composables共享逻辑

```javascript
// 使用共享的composable
import { useWord } from '@/composables/useWord'
import { useAI } from '@/composables/useAI'

// 在多个组件中使用相同的逻辑
const { currentWord, nextWord, markAsKnown } = useWord()
const { generateExample, loading: aiLoading } = useAI()
```

---

## 六、性能优化

### 6.1 组件懒加载

```javascript
// App.vue
import { defineAsyncComponent } from 'vue'

const SettingsPanel = defineAsyncComponent(() =>
  import('./components/SettingsPanel.vue')
)
```

### 6.2 列表虚拟化

如果单词列表很长，使用虚拟滚动：

```javascript
import { useVirtualList } from '@vueuse/core'

const { list, containerProps, wrapperProps } = useVirtualList(
  longWordList,
  { itemHeight: 200 }
)
```

### 6.3 防抖与节流

```javascript
import { useDebounceFn } from '@vueuse/core'

const debouncedSave = useDebounceFn(() => {
  saveProgress()
}, 1000)
```

---

**文档版本**：v1.0
**最后更新**：2026-01-10
**维护者**：VocabContext Team
