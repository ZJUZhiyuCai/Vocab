# 数据结构文档
# VocabContext 语境词汇学习工具

## 目录
- [一、词库数据结构](#一词库数据结构)
- [二、用户数据结构](#二用户数据结构)
- [三、词库JSON示例](#三词库json示例)
- [四、数据准备指南](#四数据准备指南)

---

## 一、词库数据结构

### 1.1 单词对象（Word）

```typescript
interface Word {
  // 基础信息
  id: string              // 单词唯一ID，如 "word_001"
  word: string            // 单词本身，如 "comprehensive"
  ipa: string            // 音标，如 "/kəmˈprehensɪv/"
  partOfSpeech: string   // 词性，如 "adj."
  meaning: string        // 中文释义，如 "全面的，综合的"

  // 分级信息
  level: 'core' | 'advanced' | 'challenge'  // 难度分级
  frequency: number      // 频率分数 0-10，如 8.5

  // 搭配与关联
  collocations: string[] // 常见搭配，如 ["comprehensive study", ...]
  synonyms: string[]     // 同义词，如 ["complete", "thorough"]
  antonyms: string[]     // 反义词（可选）
  rootWord?: string      // 词根（可选）

  // 例句
  examples: Example[]    // 例句列表

  // 记忆辅助
  memoryTip?: string     // 记忆技巧（可选）
  quizSentence?: string  // 测试句子（可选）

  // 元数据
  source: string         // 数据来源，如 "IELTS Reading T1"
  tags: string[]         // 标签，如 ["学术", "环境"]
  createdAt: string      // 创建时间（ISO 8601）
}
```

### 1.2 例句对象（Example）

```typescript
interface Example {
  id: string              // 例句ID
  sentence: string        // 英文例句
  translation: string     // 中文翻译
  source: string          // 来源，如 "IELTS Reading Test 1"
  difficulty: number      // 难度 1-5
  tags: string[]          // 标签，如 ["环境", "政府"]

  // 可选字段
  audioUrl?: string       // 音频URL（未来功能）
  highlightedRange?: {    // 高亮位置
    start: number
    end: number
  }
}
```

### 1.3 词库对象（WordDatabase）

```typescript
interface WordDatabase {
  version: string         // 数据版本，如 "1.0.0"
  lastUpdated: string     // 最后更新时间
  totalWords: number      // 总词数

  // 分级词库
  words: {
    core: Word[]          // 核心词汇（2000个）
    advanced: Word[]      // 进阶词汇（3000个）
    challenge: Word[]     // 冲刺词汇（2000个）
  }

  // 索引
  indexes: {
    byAlphabet: Record<string, string[]>   // 按字母索引
    byFrequency: Record<string, string[]>  // 按频率索引
    byTag: Record<string, string[]>        // 按标签索引
  }
}
```

---

## 二、用户数据结构

### 2.1 用户配置（UserSettings）

```typescript
interface UserSettings {
  // 基础设置
  userId: string           // 用户ID
  dailyGoal: number        // 每日目标（单词数），如 10
  difficulty: 'easy' | 'medium' | 'hard'  // 学习难度

  // 个性化标签
  tags: string[]           // 兴趣标签，如 ["程序员", "科技", "AI"]

  // 学习偏好
  preferences: {
    autoAdvance: boolean   // 自动跳转下一个
    showIPA: boolean       // 显示音标
    showTranslation: boolean // 显示翻译
    aiExampleFirst: boolean // 优先显示AI例句
  }

  // 通知设置
  notifications: {
    enabled: boolean       // 启用通知
    reminderTime: string   // 提醒时间，如 "20:00"
  }

  // 元数据
  createdAt: string        // 创建时间
  lastUpdated: string      // 最后更新
}
```

### 2.2 学习进度（UserProgress）

```typescript
interface UserProgress {
  userId: string

  // 整体统计
  stats: {
    totalLearned: number       // 总学习单词数
    totalReviews: number       // 总复习次数
    streak: number             // 连续学习天数
    longestStreak: number      // 最长连续天数
    lastStudyDate: string      // 最后学习日期
  }

  // 今日进度
  today: {
    date: string               // 日期 "YYYY-MM-DD"
    learned: number            // 今日已学
    reviewed: number           // 今日已复习
    goal: number               // 今日目标
    completed: boolean         // 是否完成今日目标
  }

  // 词汇掌握分布
  mastery: {
    unknown: number            // 未学习
    learning: number           // 学习中
    familiar: number           // 熟悉
    mastered: number           // 掌握
  }
}
```

### 2.3 单词学习记录（WordRecord）

```typescript
interface WordRecord {
  wordId: string              // 单词ID
  userId: string              // 用户ID

  // 学习状态
  status: 'new' | 'learning' | 'familiar' | 'mastered'

  // 学习历程
  history: {
    firstSeen: string         // 首次学习时间
    lastReview: string        // 最后复习时间
    reviewCount: number       // 复习次数
  }

  // 学习效果
  performance: {
    correctCount: number      // 答对次数
    incorrectCount: number    // 答错次数
    accuracy: number          // 正确率 0-1
  }

  // 复习调度
  review: {
    nextReview: string        // 下次复习时间（ISO 8601）
    interval: number          // 当前间隔（天数）
    easeFactor: number        // 难度因子
  }

  // AI例句缓存
  aiExamples: {
    tags: string[]            // 生成时使用的标签
    example: string           // AI生成的例句
    translation: string       // 翻译
    createdAt: string         // 生成时间
  }[]
}
```

### 2.4 今日单词队列（TodayQueue）

```typescript
interface TodayQueue {
  date: string                // 日期 "YYYY-MM-DD"
  userId: string

  // 队列
  newWords: string[]          // 新学单词ID列表（10个）
  reviewWords: string[]       // 复习单词ID列表

  // 进度
  currentIndex: number        // 当前索引
  completed: boolean          // 是否完成

  // 统计
  stats: {
    newCount: number          // 新学数量
    reviewCount: number       // 复习数量
    correctCount: number      // 答对数量
  }
}
```

---

## 三、词库JSON示例

### 3.1 单个单词完整示例

```json
{
  "id": "word_001",
  "word": "comprehensive",
  "ipa": "/kəmˈprehensɪv/",
  "partOfSpeech": "adj.",
  "meaning": "全面的，综合的；详尽的",

  "level": "core",
  "frequency": 8.7,

  "collocations": [
    "comprehensive study",
    "comprehensive plan",
    "comprehensive analysis",
    "comprehensive review",
    "comprehensive coverage"
  ],

  "synonyms": [
    "complete",
    "thorough",
    "extensive",
    "all-inclusive",
    "exhaustive"
  ],

  "antonyms": [
    "incomplete",
    "partial",
    "limited"
  ],

  "examples": [
    {
      "id": "ex_001_1",
      "sentence": "The government's comprehensive strategy addresses both economic and environmental concerns.",
      "translation": "政府全面的战略同时解决了经济和环境问题。",
      "source": "IELTS Reading Test 1, Passage 2",
      "difficulty": 3,
      "tags": ["政府", "环境", "政策"]
    },
    {
      "id": "ex_001_2",
      "sentence": "Students need a comprehensive understanding of the subject to pass the exam.",
      "translation": "学生需要全面理解这门学科才能通过考试。",
      "source": "IELTS Writing Task 2",
      "difficulty": 2,
      "tags": ["教育", "学习"]
    },
    {
      "id": "ex_001_3",
      "sentence": "The report provides a comprehensive analysis of the market trends.",
      "translation": "该报告提供了对市场趋势的全面分析。",
      "source": "Business English Corpus",
      "difficulty": 3,
      "tags": ["商业", "分析"]
    }
  ],

  "memoryTip": "com(一起) + prehen(抓住) + sive = 全部抓住 → 全面的",
  "quizSentence": "This project needs a ______ test plan before we launch.",

  "source": "IELTS Academic Word List",
  "tags": ["学术", "高频", "必备"],
  "createdAt": "2026-01-10T00:00:00.000Z"
}
```

### 3.2 简化版单词示例（MVP阶段）

```json
{
  "id": "word_001",
  "word": "comprehensive",
  "ipa": "/kəmˈprehensɪv/",
  "partOfSpeech": "adj.",
  "meaning": "全面的，综合的",

  "level": "core",
  "frequency": 8.7,

  "collocations": [
    "comprehensive study",
    "comprehensive plan"
  ],

  "synonyms": ["complete", "thorough"],

  "examples": [
    {
      "sentence": "The government's comprehensive strategy addresses both economic and environmental concerns.",
      "translation": "政府全面的战略同时解决了经济和环境问题。",
      "source": "IELTS Reading"
    }
  ],

  "memoryTip": "com(一起) + prehen(抓住) + sive = 全部抓住 → 全部的"
}
```

### 3.3 完整词库结构

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-01-10T00:00:00.000Z",
  "totalWords": 7000,

  "words": {
    "core": [
      { "id": "word_001", "word": "comprehensive", ... },
      { "id": "word_002", "word": "significant", ... },
      ...
    ],
    "advanced": [
      { "id": "word_2001", "word": "meticulous", ... },
      ...
    ],
    "challenge": [
      { "id": "word_5001", "word": "ubiquitous", ... },
      ...
    ]
  },

  "indexes": {
    "byAlphabet": {
      "a": ["word_010", "word_025", ...],
      "b": ["word_003", "word_089", ...],
      ...
    },
    "byFrequency": {
      "9-10": ["word_001", "word_005", ...],
      "8-9": ["word_002", "word_010", ...],
      ...
    },
    "byTag": {
      "学术": ["word_001", "word_015", ...],
      "环境": ["word_001", "word_023", ...],
      ...
    }
  }
}
```

---

## 四、数据准备指南

### 4.1 数据来源

**推荐来源**：

1. **雅思真题语料**
   - Cambridge IELTS 4-18
   - 雅思阅读原文
   - 雅思听力原文

2. **开源词库**
   - GitHub: ielts-word-list
   - GitHub: academic-word-list
   - English Vocabulary Profile

3. **词典数据**
   - Oxford Learner's Dictionaries
   - Cambridge Dictionary
   - Collins COBUILD

### 4.2 MVP阶段数据准备（100个词）

**步骤1：选择高频词**
```
从雅思核心词汇中选择100个最高频的词
参考：Academic Word List (AWL) 前100词
```

**步骤2：准备数据格式**

使用工具生成基础数据：

```javascript
// data-generator.js
const fs = require('fs')

const words = [
  {
    word: 'comprehensive',
    ipa: '/kəmˈprehensɪv/',
    partOfSpeech: 'adj.',
    meaning: '全面的，综合的',
    level: 'core',
    frequency: 8.7,
    collocations: ['comprehensive study', 'comprehensive plan'],
    synonyms: ['complete', 'thorough'],
    examples: [{
      sentence: 'The comprehensive study covered all aspects.',
      translation: '这项全面的研究涵盖了所有方面。',
      source: 'IELTS'
    }]
  },
  // ... 更多单词
]

fs.writeFileSync(
  'public/words-data.json',
  JSON.stringify({ words }, null, 2)
)
```

**步骤3：数据质量检查**

检查项：
- [ ] 音标准确
- [ ] 例句地道
- [ ] 翻译通顺
- [ ] 搭配典型
- [ ] JSON格式正确

### 4.3 批量数据生成（后期）

**使用ChatGPT/Claude批量生成**：

```javascript
// 批量生成Prompt模板
const BATCH_PROMPT = `
请为以下10个雅思单词生成数据，JSON格式：

单词列表：
[单词1, 单词2, ..., 单词10]

每个单词包含：
{
  "word": "单词",
  "ipa": "音标",
  "partOfSpeech": "词性",
  "meaning": "中文释义",
  "collocations": ["搭配1", "搭配2"],
  "synonyms": ["同义词1", "同义词2"],
  "examples": [{
    "sentence": "例句",
    "translation": "翻译",
    "source": "IELTS"
  }]
}

只返回JSON，不要其他内容。
`
```

### 4.4 数据验证工具

```javascript
// utils/validateData.js

export function validateWord(word) {
  const errors = []

  // 必填字段检查
  if (!word.word) errors.push('缺少word字段')
  if (!word.ipa) errors.push('缺少ipa字段')
  if (!word.meaning) errors.push('缺少meaning字段')
  if (!word.examples || word.examples.length === 0) {
    errors.push('缺少examples字段')
  }

  // 格式检查
  if (word.word && !/^[a-zA-Z]+$/.test(word.word)) {
    errors.push('word格式错误')
  }

  if (word.frequency && (word.frequency < 0 || word.frequency > 10)) {
    errors.push('frequency范围错误，应为0-10')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// 批量验证
export function validateWordDatabase(db) {
  const results = {
    total: 0,
    valid: 0,
    invalid: 0,
    errors: []
  }

  Object.values(db.words).forEach(wordList => {
    wordList.forEach(word => {
      results.total++

      const validation = validateWord(word)
      if (validation.valid) {
        results.valid++
      } else {
        results.invalid++
        results.errors.push({
          word: word.word || 'unknown',
          errors: validation.errors
        })
      }
    })
  })

  return results
}
```

### 4.5 数据导入工具

```javascript
// utils/importData.js

export async function importWordData(jsonFile) {
  try {
    const response = await fetch(jsonFile)
    const data = await response.json()

    // 验证数据
    const validation = validateWordDatabase(data)

    if (validation.invalid > 0) {
      console.error('数据验证失败：', validation.errors)
      return null
    }

    // 存储到IndexedDB（未来功能）
    // await saveToIndexedDB(data)

    return data

  } catch (error) {
    console.error('导入失败：', error)
    return null
  }
}
```

### 4.6 数据更新策略

**版本控制**：
```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-01-10",
  "changelog": [
    "1.0.0 - 初始版本，包含100个核心词汇"
  ]
}
```

**增量更新**：
- 不每次更新整个词库
- 只更新变化的单词
- 使用版本号追踪

---

## 五、LocalStorage数据结构

### 5.1 存储Key规范

```javascript
// 前缀规范：vocab_

vocab_progress_default      // 用户进度
vocab_words_default         // 单词学习记录
vocab_settings_default      // 用户设置
vocab_queue_2026-01-10      // 今日单词队列
vocab_cache_ai_examples     // AI例句缓存
```

### 5.2 数据示例

```javascript
// LocalStorage 完整结构
{
  "vocab_progress_default": {
    "stats": {
      "totalLearned": 156,
      "streak": 7,
      "lastStudyDate": "2026-01-10"
    },
    "today": {
      "date": "2026-01-10",
      "learned": 3,
      "goal": 10
    }
  },

  "vocab_words_default": {
    "word_001": {
      "status": "learning",
      "reviewCount": 2,
      "correctCount": 1
    }
  },

  "vocab_settings_default": {
    "tags": ["程序员", "科技"],
    "dailyGoal": 10,
    "difficulty": "medium"
  },

  "vocab_queue_2026-01-10": {
    "newWords": ["word_001", "word_002", ...],
    "currentIndex": 2
  }
}
```

---

## 六、数据清理与维护

### 6.1 清理过期数据

```javascript
// 定期清理30天前的学习队列
function cleanupOldQueues() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('vocab_queue_')) {
      const dateStr = key.replace('vocab_queue_', '')
      const queueDate = new Date(dateStr)

      if (queueDate < thirtyDaysAgo) {
        localStorage.removeItem(key)
      }
    }
  })
}
```

### 6.2 数据备份

```javascript
// 导出用户数据
function exportUserData() {
  const data = {
    progress: storage.get('progress_default'),
    words: storage.get('words_default'),
    settings: storage.get('settings_default'),
    exportDate: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vocab-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
}
```

---

**文档版本**：v1.0
**最后更新**：2026-01-10
**维护者**：VocabContext Team
