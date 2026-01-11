# VocabContext - 智能雅思词汇学习工具

> 语境优先 + AI个性化 + 间隔重复的高效学习系统

**在线体验**: https://scintillating-dragon-3ef634.netlify.app/

## 特性

- 📚 **13,670精选词汇** - 按难度分为5个级别（CET-4至雅思8.0+）
- 🎯 **真实语境例句** - 基于真实语料，贴近实际应用
- 🤖 **AI个性化例句** - 根据学习目的生成定制例句
- ⏰ **间隔重复算法** - 科学的复习系统，长期记忆巩固
- 🎲 **真正随机学习** - Fisher-Yates算法，避免顺序偏差
- 🏆 **成就系统** - 24个成就激励持续学习
- 📊 **数据可视化** - 学习热力图和趋势分析
- ☁️ **云端同步** - GitHub Gist跨设备备份
- 📱 **完美响应式** - 支持桌面端和移动端
- 🎨 **莫兰迪配色** - 护眼舒适的学习界面

## 技术栈

- **前端**: Vue 3 + Vite + Tailwind CSS
- **AI服务**: 硅基流动 API (Qwen2.5-72B-Instruct)
- **存储**: LocalStorage + GitHub Gist
- **部署**: Netlify / Vercel

## 快速开始

### 在线使用

直接访问: https://scintillating-dragon-3ef634.netlify.app/

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-username/vocab-context.git
cd vocab-context

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 构建

```bash
npm run build
```

## 词库分级

| 级别 | 单词数 | 累计 | 对应考试 |
|------|--------|------|----------|
| 四级基础 | 4,500 | 4,500 | CET-4 (A2-B1) |
| 六级进阶 | 1,500 | 6,000 | CET-6 (B1-B2) |
| 雅思6.0 | 1,000 | 7,000 | IELTS 6.0 (B2) |
| 雅思7.0 | 2,000 | 9,000 | IELTS 7.0 (C1) |
| 雅思8.0+ | 4,670 | 13,670 | IELTS 8.0+ (C2) |

## 配置说明

### AI 功能

1. 注册 [硅基流动](https://docs.siliconflow.cn/cn/userguide/quickstart) 获取免费API密钥
2. 在设置中输入API密钥
3. 选择学习目的（备考/职场/兴趣/日常）

### 学习模式

- **顺序学习**: 按词库顺序
- **随机学习**: 打乱顺序（推荐）

## 部署

### Netlify 拖拽部署

```bash
npm run build
# 将 dist 文件夹拖拽到 https://app.netlify.com/drop
```

### Git 集成

```bash
# 推送到 GitHub
git push origin main

# 在 Netlify/Vercel 导入项目
# 构建命令: npm run build
# 发布目录: dist
```

## 项目结构

```
vocab-context/
├── public/
│   └── data/          # 5个词库JSON文件
├── src/
│   ├── components/    # Vue组件
│   ├── utils/         # 工具函数（AI、存储、算法）
│   └── App.vue
├── docs/              # 设计文档
└── package.json
```

## 版本历史

- **v1.3.0** - 成就系统、数据可视化、云端同步
- **v1.2.0** - 全局随机算法
- **v1.1.0** - AI个性化例句
- **v1.0.0** - 初始版本

## 常见问题

**Q: AI功能收费吗？**
A: 硅基流动提供免费额度，足够日常学习使用。

**Q: 数据会丢失吗？**
A: 数据保存在浏览器本地，建议开启云端同步备份。

**Q: 如何选择合适的词库？**
A: 使用词汇水平测试功能快速评估。

## License

MIT License

---

**在线地址**: https://scintillating-dragon-3ef634.netlify.app/
