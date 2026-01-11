# 技术栈说明
# VocabContext 语境词汇学习工具

## 一、技术栈选择

### 核心技术栈

```yaml
前端框架:    Vue 3 + Vite
UI样式:      Tailwind CSS
状态管理:    Vue Composition API
数据存储:    LocalStorage（MVP阶段）
AI服务:      硅基流动 API
部署平台:    Vercel / Netlify（免费）
```

---

## 二、技术选型理由

### 2.1 为什么选择 Vue 3 + Vite？

#### Vue 3 优势

✅ **学习曲线友好**
- 语法直观，上手快
- 模板语法接近原生HTML
- 组合式API逻辑清晰

✅ **单文件组件**
- .vue 文件包含 HTML/CSS/JS
- 不需要切来切去
- 小项目开发效率高

✅ **体积适中**
- 运行时约 40KB（gzipped）
- 比React小，比Svelte大
- 适合小工具项目

✅ **中文文档完善**
- 国内社区活跃
- 问题容易找到解决方案

#### Vite 优势

✅ **极速开发体验**
- 冷启动秒级
- 热更新几乎瞬时
- 不用等打包

✅ **开箱即用**
- 无需复杂配置
- 支持Vue 3、TypeScript、JSX等
- 内置CSS预处理器支持

---

### 2.2 为什么选择 Tailwind CSS？

✅ **与Design Token完美契合**
- 配置一次，全局使用
- 莫兰迪色系直接注入
- 无需手写CSS文件

✅ **开发速度快**
- 不用切文件写样式
- 类名即样式
- 响应式超简单

✅ **体积小**
- JIT模式只打包用到的样式
- 最终CSS可能只有几KB

✅ **一致性高**
- 强制使用设计系统
- 不会出现"魔法数字"
- 团队协作友好

---

### 2.3 为什么选择纯前端架构？

#### 优势

✅ **零运维**
- 不需要管理服务器
- 不用担心 downtime
- 没有后端bug

✅ **一键部署**
- 推代码到GitHub
- Vercel自动构建部署
- 30秒完成更新

✅ **完全免费**
- Vercel免费额度：100GB/月
- Netlify免费额度：100GB/月
- 小范围使用绰绰有余

✅ **全球CDN**
- Vercel/Netlify全球节点
- 访问速度有保障
- 自动HTTPS

#### 风险与对策

⚠️ **API Key暴露**
- 风险：前端代码可见，API Key会暴露
- 对策：
  - 硅基流动API可以设置额度限制
  - 小范围使用，风险可控
  - 后期如需加强，可加轻量后端

⚠️ **数据持久化**
- 风险：LocalStorage有容量限制（5-10MB）
- 对策：
  - MVP阶段够用
  - 后期可升级到IndexedDB或加后端

---

## 三、项目结构

```
vocab-context/
├── docs/                           # 文档目录
│   ├── 01-PRD.md                   # 产品需求文档
│   ├── 02-Design-Token.md          # 设计系统
│   └── 03-Tech-Stack.md            # 技术栈说明（本文件）
│
├── public/                         # 静态资源
│   ├── words-data.json             # 词库数据
│   └── icons/                      # 图标资源
│
├── src/                            # 源代码
│   ├── main.js                     # 入口文件
│   ├── App.vue                     # 根组件
│   │
│   ├── components/                 # 组件目录
│   │   ├── WordCard.vue            # 单词卡片
│   │   ├── ProgressBar.vue         # 顶部进度条
│   │   ├── Feedback.vue            # 答对/答错反馈
│   │   ├── Confetti.vue            # 彩带动画
│   │   └── SettingsPanel.vue       # 设置面板
│   │
│   ├── composables/                # 组合式函数（逻辑复用）
│   │   ├── useWord.js              # 单词逻辑
│   │   ├── useProgress.js          # 进度逻辑
│   │   ├── useAI.js                # AI例句生成
│   │   └── useStorage.js           # LocalStorage封装
│   │
│   ├── utils/                      # 工具函数
│   │   ├── storage.js              # 存储工具
│   │   ├── confetti.js             # 彩带动画工具
│   │   └── constants.js            # 常量定义
│   │
│   └── assets/                     # 资源文件
│       └── styles/
│           └── index.css           # 全局样式
│
├── index.html                      # HTML入口
├── vite.config.js                  # Vite配置
├── tailwind.config.js              # Tailwind配置
├── postcss.config.js               # PostCSS配置
├── package.json                    # 依赖管理
└── README.md                       # 项目说明
```

---

## 四、核心依赖

```json
{
  "dependencies": {
    "vue": "^3.4.0"                    // Vue 3核心
  },
  "devDependencies": {
    "vite": "^5.0.0"                  // 构建工具
    "@vitejs/plugin-vue": "^5.0.0"    // Vue 3插件
    "tailwindcss": "^3.4.0"           // CSS框架
    "postcss": "^8.4.0"               // CSS处理
    "autoprefixer": "^10.4.0"         // CSS自动前缀
  }
}
```

---

## 五、关键配置文件

### 5.1 vite.config.js

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})
```

### 5.2 tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 莫兰迪色系配置
        // 详见 Design-Token.md
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: []
}
```

---

## 六、硅基流动 API 集成

### 6.1 API 配置

```javascript
// src/utils/constants.js
export const API_CONFIG = {
  baseURL: 'https://api.siliconflow.cn/v1',
  model: 'Qwen/Qwen2.5-7B-Instruct', // 或其他模型
  apiKey: '你的API Key', // 生产环境建议用环境变量
}

// AI例句生成Prompt模板
export const AI_PROMPTS = {
  generateExample: (word, tags) => `
请为单词"${word}"生成一个例句，要求：
1. 场景：${tags.join('、')}
2. 难度：雅思水平
3. 英文例句+中文翻译
4. 只返回例句，不要其他内容
5. 例句要自然地道，不要生硬

格式：
英文例句
中文翻译
  `
}
```

### 6.2 API 调用封装

```javascript
// src/composables/useAI.js
import { ref } from 'vue'
import { API_CONFIG, AI_PROMPTS } from '@/utils/constants'

export function useAI() {
  const loading = ref(false)
  const error = ref(null)

  async function generateExample(word, userTags) {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: API_CONFIG.model,
          messages: [{
            role: 'user',
            content: AI_PROMPTS.generateExample(word, userTags)
          }],
          temperature: 0.7,
          max_tokens: 200
        })
      })

      if (!response.ok) {
        throw new Error('API请求失败')
      }

      const data = await response.json()
      return data.choices[0].message.content

    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    generateExample
  }
}
```

---

## 七、数据结构设计

### 7.1 词库数据结构

```json
{
  "words": [
    {
      "id": "word_001",
      "word": "comprehensive",
      "ipa": "/kəmˈprehensɪv/",
      "partOfSpeech": "adj.",
      "meaning": "全面的，综合的",
      "level": "core",
      "frequency": 8.5,
      "collocations": [
        "comprehensive study",
        "comprehensive plan",
        "comprehensive analysis"
      ],
      "synonyms": ["complete", "thorough", "extensive"],
      "examples": [
        {
          "sentence": "The government's comprehensive strategy addresses both economic and environmental concerns.",
          "source": "IELTS Reading",
          "translation": "政府全面的战略同时解决了经济和环境问题。"
        }
      ]
    }
  ]
}
```

### 7.2 用户学习记录

```javascript
{
  userId: "user_001",
  progress: {
    totalLearned: 156,        // 总学习词汇数
    dailyGoal: 10,            // 每日目标
    todayLearned: 3,          // 今日已学
    streak: 7                 // 连续学习天数
  },
  words: {
    "word_001": {
      status: "learning",     // learning / mastered / review
      firstSeen: "2026-01-10",
      lastReview: "2026-01-10",
      reviewCount: 2,
      correctCount: 1,
      nextReview: "2026-01-11"
    }
  },
  settings: {
    tags: ["程序员", "科技"],
    dailyGoal: 10,
    difficulty: "medium"
  }
}
```

---

## 八、LocalStorage 封装

```javascript
// src/utils/storage.js

const STORAGE_PREFIX = 'vocab_'

export const storage = {
  // 保存数据
  set(key, value) {
    try {
      const data = JSON.stringify(value)
      localStorage.setItem(STORAGE_PREFIX + key, data)
      return true
    } catch (error) {
      console.error('Storage save error:', error)
      return false
    }
  },

  // 读取数据
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error('Storage read error:', error)
      return defaultValue
    }
  },

  // 删除数据
  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key)
  },

  // 清空所有数据
  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key))
  }
}

// 专用存储方法
export const userStorage = {
  saveProgress(userId, progress) {
    storage.set(`progress_${userId}`, progress)
  },

  getProgress(userId) {
    return storage.get(`progress_${userId}`, {
      totalLearned: 0,
      todayLearned: 0,
      streak: 0
    })
  },

  saveWords(userId, words) {
    storage.set(`words_${userId}`, words)
  },

  getWords(userId) {
    return storage.get(`words_${userId}`, {})
  },

  saveSettings(userId, settings) {
    storage.set(`settings_${userId}`, settings)
  },

  getSettings(userId) {
    return storage.get(`settings_${userId}`, {
      tags: [],
      dailyGoal: 10,
      difficulty: 'medium'
    })
  }
}
```

---

## 九、开发流程

### 9.1 项目初始化

```bash
# 1. 创建项目
npm create vite@latest vocab-context -- --template vue
cd vocab-context

# 2. 安装依赖
npm install

# 3. 安装Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. 配置Tailwind
# 编辑 tailwind.config.js 和 postcss.config.js

# 5. 启动开发服务器
npm run dev
```

### 9.2 开发阶段

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

---

## 十、部署方案

### 10.1 部署到 Vercel

```bash
# 1. 推代码到GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/vocab-context.git
git push -u origin main

# 2. 在 vercel.com 导入项目
# - 点击 "New Project"
# - 选择你的GitHub仓库
# - 框架预设自动检测为 "Vite"
# - 点击 "Deploy"

# 3. 部署完成，获得域名
# https://vocab-context.vercel.app
```

### 10.2 部署到 Netlify

```bash
# 方式1：拖拽部署
# 1. 运行 npm run build
# 2. 将 dist 文件夹拖拽到 netlify.com/drop

# 方式2：GitHub集成（推荐）
# 1. 在 netlify.com 导入GitHub仓库
# 2. 配置：
#    Build command: npm run build
#    Publish directory: dist
# 3. 点击 "Deploy site"
```

---

## 十一、性能优化

### 11.1 代码分割

```javascript
// 路由懒加载
const SettingsPanel = defineAsyncComponent(() =>
  import('./components/SettingsPanel.vue')
)
```

### 11.2 图片优化

```javascript
// 使用WebP格式
// 响应式图片
// 懒加载
```

### 11.3 打包优化

```javascript
// vite.config.js
export default defineConfig({
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue'],
          'utils': ['./src/utils']
        }
      }
    }
  }
})
```

---

## 十二、后续升级路径

### 阶段2：加轻量后端

```yaml
后端框架:    Bun + Hono（或 Node.js + Express）
数据库:      SQLite
部署:        Railway / Render（免费套餐）
```

### 阶段3：全栈升级

```yaml
后端框架:    SvelteKit / Next.js
数据库:      PostgreSQL + Prisma
部署:        Vercel (全栈)
```

---

**文档版本**：v1.0
**最后更新**：2026-01-10
**技术原则**：简单、快速、免费
