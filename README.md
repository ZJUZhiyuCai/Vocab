# VocabContext - 语境词汇学习工具

> 通过真实语境 + AI个性化例句，让雅思词汇从"认识"到"会用"

## 项目简介

这是一个专为雅思备考设计的词汇学习工具，通过语境学习和AI个性化例句，帮助学习者从六级509分提升到雅思7.0水平。

### 核心特性

- 🎯 **语境优先**：从雅思真题中提取真实语境例句
- 🤖 **AI个性化**：基于用户背景生成定制例句
- ⚡ **快速学习**：5分钟碎片化时间，每天3个词
- 🎨 **莫兰迪配色**：温柔护眼，长时间学习不累
- 💾 **本地存储**：无需注册，数据完全私有

### 差异化优势

| 产品 | 方式 | 问题 |
|------|------|------|
| 百词斩 | 图片记忆 | 只记得图不记得词 |
| 墨墨 | 记忆曲线 | 传统死记硬背 |
| Anki | 自定义卡片 | 制作成本高 |
| **VocabContext** | **语境+AI** | **真实场景，深度掌握** |

---

## 技术栈

- **前端框架**：Vue 3 + Vite
- **UI样式**：Tailwind CSS（莫兰迪配色）
- **AI服务**：硅基流动 API
- **数据存储**：LocalStorage
- **部署平台**：Vercel

---

## 项目结构

```
vocab-context/
├── docs/                           # 项目文档
│   ├── 01-PRD.md                   # 产品需求文档
│   ├── 02-Design-Token.md          # 设计系统
│   └── 03-Tech-Stack.md            # 技术栈说明
│
├── public/                         # 静态资源
│   └── words-data.json             # 词库数据
│
└── src/                            # 源代码
    ├── components/                 # 组件
    ├── composables/                # 组合式函数
    ├── utils/                      # 工具函数
    └── App.vue                     # 根组件
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

---

## 配置说明

### 1. Tailwind 配置

项目使用莫兰迪色系，配置在 `tailwind.config.js`：

```javascript
theme: {
  extend: {
    colors: {
      sage: '#5c6b5c',      // 鼠尾绿
      slate: '#52667c',     // 石板蓝
      beige: '#f5f0eb',     // 米棕色
    }
  }
}
```

### 2. 硅基流动 API

在 `src/utils/constants.js` 配置你的API Key：

```javascript
export const API_CONFIG = {
  apiKey: '你的API Key',
  model: 'Qwen/Qwen2.5-7B-Instruct'
}
```

---

## 部署

### Vercel 部署（推荐）

1. 推送代码到GitHub
2. 在 [vercel.com](https://vercel.com) 导入项目
3. 自动检测为Vite项目，点击Deploy
4. 30秒后部署完成 ✅

### Netlify 部署

1. 运行 `npm run build`
2. 将 `dist` 文件夹拖拽到 [netlify.com/drop](https://netlify.com/drop)
3. 部署完成 ✅

---

## MVP 功能范围

### ✅ 第一版（当前）

- 雅思高频词库（2000核心词）
- 语境例句展示
- AI生成个性化例句
- 答对/答错反馈 + 彩带动画
- 顶部进度条
- 本地学习进度保存
- 移动端适配

### 📋 第二版（计划）

- 记忆曲线算法
- 学习数据统计
- 复习提醒系统
- 快速测试模式

### 🚀 第三版（未来）

- 词根词缀学习
- 同义词扩展
- 听力例句（发音）
- 社交功能

---

## 文档

详细文档请查看 `docs/` 目录：

- [产品需求文档](./docs/01-PRD.md)
- [设计系统](./docs/02-Design-Token.md)
- [技术栈说明](./docs/03-Tech-Stack.md)

---

## 开发计划

- [x] 产品需求文档
- [x] 设计系统
- [x] 技术栈选型
- [ ] 项目初始化
- [ ] 组件开发
- [ ] API集成
- [ ] 数据准备
- [ ] 测试部署

---

## License

MIT

---

**开发时间**：2026-01-10
**产品定位**：精品小工具（自用 + 小范围分享）
**目标**：六级509 → 雅思7.0
