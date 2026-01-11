# VocabContext - 语境词汇学习工具

> 通过真实语境 + AI个性化例句 + 间隔重复，让雅思词汇从"认识"到"会用"

## 项目简介

这是一个基于CEFR分级（A1-C2）的智能词汇学习系统，通过语境学习、AI个性化例句和间隔重复算法，帮助学习者高效掌握雅思词汇。

### 核心特性

- 📚 **完整词库**：103,962个词汇，按CEFR分级（A1-C2）和雅思难度分类
- 🎯 **语境优先**：从雅思真题和真实语料中提取语境例句
- 🤖 **AI个性化**：基于用户学习目的（雅思/职场/兴趣）生成定制例句
- 🎲 **智能随机**：真正的全局随机学习，避免字母顺序带来的记忆偏差
- ⚡ **性能优化**：大文件懒加载，C1词库（80,012词，37MB）秒级启动
- 🔄 **间隔重复**：智能复习算法，巩固记忆效果
- 🎨 **莫兰迪配色**：温柔护眼，长时间学习不累
- 💾 **本地存储**：无需注册，数据完全私有
- 📱 **响应式设计**：完美支持桌面和移动端

### 技术亮点

- **懒加载架构**：大词库按需加载，预加载300词确保流畅体验
- **全局随机算法**：Fisher-Yates洗牌 + 随机索引映射，真正的随机分布
- **智能缓存管理**：自动清理过期缓存，防止localStorage溢出
- **Proxy拦截器**：透明懒加载，对业务逻辑无侵入

---

## 技术栈

- **前端框架**：Vue 3 (Composition API) + Vite
- **UI样式**：Tailwind CSS（莫兰迪配色）
- **AI服务**：硅基流动 API（Qwen/Qwen2.5-72B-Instruct）
- **数据存储**：LocalStorage（带自动清理）
- **动画效果**：canvas-confetti
- **部署平台**：Vercel

---

## 项目结构

```
vocab-context/
├── public/                         # 静态资源
│   └── data/                       # 词库数据
│       ├── vocab-a2-basic.json           # A1-A2（3,561词）
│       ├── vocab-b1-intermediate.json    # B1（6,451词）
│       ├── vocab-b2-upper-intermediate.json # B2（11,894词）
│       ├── vocab-c1-advanced.json        # C1（80,012词）
│       └── vocab-c2-proficiency.json     # C2（2,044词）
│
├── scripts/                        # 构建脚本
│   └── build-vocab-libraries.js    # 词库生成工具
│
├── src/                            # 源代码
│   ├── components/                 # 组件
│   │   ├── Sidebar.vue            # 桌面侧边栏
│   │   ├── MobileTabBar.vue       # 移动端底部导航
│   │   ├── VocabularySelector.vue # 词库选择器
│   │   ├── ReviewQueue.vue        # 复习列表
│   │   ├── Wordbook.vue           # 单词本
│   │   ├── Quiz.vue               # 测验模式
│   │   └── Settings.vue           # 设置面板
│   │
│   ├── composables/                # 组合式函数
│   │   └── useConfetti.js         # 彩带动画
│   │
│   ├── utils/                      # 工具函数
│   │   ├── aiService.js           # AI服务（带缓存）
│   │   ├── storage.js             # 存储管理（带配额清理）
│   │   ├── vocabularyLoader.js    # 懒加载器
│   │   ├── vocabularyManager.js   # 词库管理
│   │   └── constants.js           # 常量定义
│   │
│   └── App.vue                     # 根组件
│
├── docs/                           # 项目文档
│   ├── 01-PRD.md                   # 产品需求文档
│   ├── 02-Design-Token.md          # 设计系统
│   └── 03-Tech-Stack.md            # 技术栈说明
│
└── database/                       # 原始数据库
    ├── vocabulary.json             # 103,975个单词
    └── examples.json               # 141,724条例句
```

---

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 生成词库（可选）

如果需要从原始数据库重新生成词库：

```bash
npm run convert
```

---

## 词库说明

### CEFR分级体系

| 级别 | 单词数 | 雅思分数 | 描述 |
|------|--------|----------|------|
| A1-A2 | 3,561 | 基础-4分 | 基础词汇，日常交流 |
| B1 | 6,451 | 4-5分 | 进阶词汇，简单话题 |
| B2 | 11,894 | 5-6分 | 中级词汇，学术基础 |
| C1 | 80,012 | 6-7分 | 高级词汇，深度理解 |
| C2 | 2,044 | 7-8分 | 精通词汇，接近母语 |

**总计：103,962个单词**

### 词汇数据结构

```json
{
  "id": "a1_0001",
  "word": "able",
  "ipa": "/ˈebəl/",
  "partOfSpeech": "adj.",
  "meaning": "adj.能够的,有能力的...",
  "cefr": "A1",
  "ielts": "基础-4分",
  "frequency": 9,
  "examples": [
    {
      "sentence": "Chantal was lucky to be able to salvage her career.",
      "translation": "尚塔尔能保住她的事业算是走了运。"
    }
  ],
  "collocations": ["be able to", "able to do"],
  "synonyms": ["capable", "competent"],
  "etymology": {
    "root": "abil",
    "suffix": "-able",
    "mnemonic": "able = 能够"
  }
}
```

---

## 配置说明

### 1. Tailwind 配置

项目使用莫兰迪色系，配置在 `tailwind.config.js`：

```javascript
theme: {
  extend: {
    colors: {
      sage: {
        50: '#f5f5f0',
        100: '#e8e8dc',
        200: '#d4ddd4',
        300: '#b3c2b3',
        400: '#8da892',
        500: '#5c6b5c',     // 主色
        600: '#4a564a',
        700: '#3d473d',
      },
      beige: {
        50: '#fcfbf9',
        100: '#f5f0eb',    // 背景色
        200: '#ebe4dd',
      }
    }
  }
}
```

### 2. AI服务配置

在应用设置中配置硅基流动API密钥：

1. 点击右侧"⚙️ 设置"
2. 输入API密钥（从 https://siliconflow.cn 获取）
3. 选择学习目的（雅思/职场/兴趣）
4. 保存设置

**支持的模型**：Qwen/Qwen2.5-72B-Instruct

### 3. 学习模式

- **顺序学习**：按字母顺序学习（A→Z）
- **随机学习**：全局随机打乱，避免字母聚集

---

## 功能特性

### ✅ 当前版本（v1.3.0）

#### 核心功能
- [x] 5个难度分级词库（103,962词）
- [x] 语境例句展示
- [x] AI生成个性化例句（基于学习目的）
- [x] 智能复习系统（间隔重复算法）
- [x] 学习模式切换（顺序/随机）
- [x] 全局随机算法（真正的随机分布）
- [x] 单词本功能
- [x] 测验模式
- [x] 学习数据统计
- [x] 词根词缀解析
- [x] 词汇水平测试

#### 成就系统 🆕
- [x] 24个成就激励学习
- [x] 5大类成就：学习量、连续天数、词库进度、正确率、特殊成就
- [x] 成就解锁动画（彩带+通知）
- [x] 成就面板展示

#### 数据可视化 🆕
- [x] 学习热力图（14天活动可视化）
- [x] 学习趋势图（柱状图）
- [x] 统计卡片（总单词、连续天数、学习天数、日均单词）
- [x] 实时统计更新

#### 云端同步 🆕
- [x] GitHub Gist集成
- [x] 跨设备数据同步
- [x] 自动冲突解决（基于时间戳）
- [x] 同步状态显示

#### 性能优化
- [x] 大文件懒加载（C1词库37MB优化）
- [x] 全局缓存管理
- [x] localStorage配额自动清理
- [x] 预加载机制（300词）
- [x] 构建优化（代码分割、压缩）

#### 用户体验
- [x] 彩带动画激励
- [x] 移动端完美适配
- [x] 快捷键支持（空格/回车/方向键）
- [x] 进度持久化保存
- [x] 重新开始功能
- [x] PWA支持（可安装到桌面）

#### 词库管理
- [x] 词库选择器
- [x] 学习进度独立保存
- [x] 复习队列管理
- [x] 已学/忘记状态追踪

---

## 部署

### 快速部署

#### 方案A：Vercel（推荐）

```bash
# 1. 推送到GitHub
git add .
git commit -m "Release v1.3.0"
git push

# 2. 在 vercel.com 导入项目
# 3. 自动检测Vite配置，点击Deploy
# 4. ✅ 30秒后部署完成
```

#### 方案B：Netlify

```bash
# 1. 拖拽dist文件夹到 netlify.com/drop
# 2. 或连接GitHub仓库自动部署
# 3. Netlify对大文件支持更好（无25MB限制）
```

#### 方案C：自建服务器 + CDN

```
前端 → Vercel/Netlify
词库 → Cloudflare R2 / AWS S3（免费CDN）
```

### 部署前准备

#### 1. 生成PWA图标（必需）

```bash
# 打开图标生成工具
open scripts/generate-icons.html

# 点击下载按钮，将图标放到public目录：
# - icon-192.png
# - icon-512.png
```

#### 2. 处理大词库文件（可选）

C1词库（37MB）超过Vercel免费版限制，有以下方案：

**方案1：压缩词库**
```bash
# 使用gzip压缩（Vercel会自动处理）
# 压缩后约12MB，可以直接部署
```

**方案2：分离部署**
```javascript
// 将C1词库放到CDN
// 修改 vocabularyLoader.js 中的URL
const CDN_BASE = 'https://your-cdn.com/data'
```

**方案3：暂时不包含C1词库**
```bash
# 部署A2-B2词库（约16MB）
# C1词库后续添加
```

#### 3. 环境变量（可选）

如果需要配置API密钥等敏感信息：

```bash
# Vercel
vercel env add API_KEY

# Netlify
netlify env:set API_KEY xxx
```

### 部署配置

项目已包含以下配置文件：

- ✅ `vercel.json` - Vercel部署配置
- ✅ `vite.config.js` - 优化构建配置
- ✅ `public/manifest.json` - PWA配置
- ✅ `public/sw.js` - Service Worker

### 部署后检查

部署完成后，检查以下内容：

1. **基础功能**
   - [ ] 页面正常加载
   - [ ] 词库选择器工作
   - [ ] 学习/复习功能正常

2. **PWA功能**
   - [ ] 可以安装到桌面
   - [ ] 离线可用（Service Worker）
   - [ ] 图标正确显示

3. **性能**
   - [ ] 首屏加载<3秒
   - [ ] 单词切换流畅
   - [ ] 移动端适配

4. **AI功能**（需配置API密钥）
   - [ ] AI例句生成
   - [ ] 词根词缀获取

### 注意事项

⚠️ **词库文件较大**，部署时需要注意：
1. 确保`public/data/`目录下的JSON文件被正确上传
2. Vercel免费版有文件大小限制（单个文件<25MB）
3. C1词库（37MB）建议使用方案2或方案3

💡 **提示**：
- 首次部署建议只包含A2-B2词库
- 生产环境建议将词库放到CDN
- 定期备份GitHub Gist同步数据

---

## 技术架构

### 懒加载实现

```javascript
// 创建随机懒加载数组
const createRandomLazyWordArray = (loader, totalCount, randomIndices) => {
  // 1. 生成随机索引数组（Fisher-Yates洗牌）
  // 2. 预加载前300个随机位置的单词
  // 3. 使用Proxy拦截数组访问
  // 4. 按需加载其他位置
}

// 使用示例
const randomIndices = Array.from({ length: 80012 }, (_, i) => i);
for (let i = randomIndices.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [randomIndices[i], randomIndices[j]] = [randomIndices[j], randomIndices[i]];
}

words.value = createRandomLazyWordArray(loader, 80012, randomIndices);
```

### 缓存策略

```javascript
// AI例句缓存（30天TTL）
const CACHE_VERSION = 'v1';
const CACHE_KEY_PREFIX = 'vocabcontext_ai_example_';

// 自动清理机制
function cleanOldCache() {
  // 按时间戳排序
  // 删除最旧的50%
  // 防止localStorage溢出
}
```

---

## 文档

详细文档请查看 `docs/` 目录：

- [产品需求文档](./docs/01-PRD.md)
- [设计系统](./docs/02-Design-Token.md)
- [技术栈说明](./docs/03-Tech-Stack.md)

---

## 开发历程

- [x] 产品需求文档
- [x] 设计系统
- [x] 技术栈选型
- [x] 项目初始化（Vue 3 + Vite）
- [x] 词库构建（103,962词）
- [x] 核心功能开发
- [x] AI服务集成
- [x] 性能优化（懒加载）
- [x] 全局随机算法
- [x] 测试部署

---

## 版本历史

### v1.3.0（2026-01-11）

**重大更新**
- 🏆 成就系统：24个成就激励学习
- 📊 数据可视化：学习热力图和趋势分析
- ☁️ 云端同步：GitHub Gist备份学习数据

**新增功能**
- 成就系统：5大类成就（学习量、连续天数、词库进度、正确率、特殊成就）
- 学习热力图：14天学习活动可视化
- 学习趋势图：每日学习量柱状图
- 统计卡片：总单词、连续天数、学习天数、日均单词
- 云端同步：GitHub Gist集成，支持跨设备同步
- 自动冲突解决：基于时间戳的智能合并

**用户体验提升**
- 成就解锁动画（彩带+通知）
- 移动端优化：成就系统完美适配
- 数据持久化：同步状态保存

### v1.2.0（2026-01-11）

**重大更新**
- 🎲 实现真正的全局随机学习（解决字母聚集问题）
- ⚡ 大文件懒加载优化（C1词库37MB秒级启动）
- 🧠 智能缓存管理（自动清理过期数据）
- 🔄 完善的重新开始功能

**新增功能**
- 随机模式下的全局随机打乱
- 词库选择器（桌面侧边栏）
- localStorage配额检测与自动清理
- 学习进度随机索引映射

**性能提升**
- 预加载300个随机位置单词
- Proxy透明懒加载
- 全局词库缓存

### v1.1.0（2026-01-10）

**新增功能**
- 5个难度分级词库（103,962词）
- AI个性化例句
- 智能复习系统
- 测验模式

### v1.0.0（2026-01-10）

**初始版本**
- 基础词汇学习功能
- 语境例句展示
- 移动端适配

---

## License

MIT

---

**开发时间**：2026-01-10 至今
**产品定位**：精品学习工具（开源）
**适用人群**：雅思备考者、英语学习者

