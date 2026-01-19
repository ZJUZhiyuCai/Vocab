# Vocab-Context 后端设计方案

> **For Claude:** REQUIRED SUB-SKILL: 完成设计后使用 superpowers:writing-plans 创建实施计划。

**目标：** 为 Vocab-Context 添加 Supabase 后端，实现用户数据跨设备同步

**技术栈：** Vue 3 + Vite + Supabase (PostgreSQL + Auth + Realtime)

**日期：** 2026-01-19

---

## 一、需求摘要

| 需求项 | 选择 |
|--------|------|
| 同步内容 | 全部（进度 + 设置 + 自定义内容 + 成就） |
| 用户规模 | 100+ 用户（公开产品） |
| 预算 | 完全免费（使用 Supabase 免费额度） |
| 登录方式 | 第三方登录（Google / GitHub） |
| 复杂度 | 尽量简单（使用托管服务） |

---

## 二、技术方案

### 2.1 为什么选择 Supabase？

| 特点 | 说明 |
|------|------|
| ✅ 免费额度 | 50,000 MAU、500MB 数据库、5GB 带宽/月 |
| ✅ 内置认证 | 支持 Google、GitHub、微信等 OAuth |
| ✅ 实时同步 | PostgreSQL + Realtime 订阅 |
| ✅ 简单易用 | JavaScript SDK，无需写后端代码 |
| ✅ 开源 | 可自行部署，无厂商锁定 |

### 2.2 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户设备                                │
├─────────────────┬─────────────────┬─────────────────────────────┤
│      手机       │      电脑       │        平板                 │
│  (Vue App)      │   (Vue App)     │     (Vue App)              │
└────────┬────────┴────────┬────────┴────────────┬────────────────┘
         │                 │                      │
         └─────────────────┼──────────────────────┘
                           │ HTTPS
                           ▼
              ┌────────────────────────┐
              │      Supabase         │
              ├────────────────────────┤
              │  Auth (认证)           │ ← Google/GitHub OAuth
              │  Database (PostgreSQL) │ ← 用户数据存储
              │  Realtime (实时同步)   │ ← 跨设备实时更新
              │  Storage (可选)        │ ← 未来扩展：用户头像等
              └────────────────────────┘
```

---

## 三、数据库设计

### 3.1 表结构

#### 1. `user_settings` - 用户设置
```sql
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_goal INTEGER DEFAULT 20,
  study_mode TEXT DEFAULT 'random' CHECK (study_mode IN ('random', 'sequence')),
  purpose TEXT DEFAULT 'exam' CHECK (purpose IN ('exam', 'work', 'academic', 'daily')),
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  current_vocab_id TEXT DEFAULT 'vocab-cet4-basic',
  api_key TEXT, -- 硅基流动 API Key（加密存储）
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. `vocabulary_progress` - 词库学习进度
```sql
CREATE TABLE vocabulary_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vocab_id TEXT NOT NULL,
  learned_words JSONB DEFAULT '[]'::jsonb,     -- [1, 2, 3, ...]
  forgotten_words JSONB DEFAULT '[]'::jsonb,
  current_index INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vocab_id)
);
```

#### 3. `word_review_states` - 间隔重复复习状态
```sql
CREATE TABLE word_review_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vocab_id TEXT NOT NULL,
  word_id INTEGER NOT NULL,
  interval_level INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  next_review TIMESTAMPTZ,
  last_review TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vocab_id, word_id)
);
```

#### 4. `wordbook` - 生词本
```sql
CREATE TABLE wordbook (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL,
  vocab_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id, vocab_id)
);
```

#### 5. `study_history` - 学习历史（热力图/统计）
```sql
CREATE TABLE study_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  words_learned INTEGER DEFAULT 0,
  study_time_seconds INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

#### 6. `achievements` - 成就解锁
```sql
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

### 3.2 行级安全策略 (RLS)

```sql
-- 启用 RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_review_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can access own data" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own data" ON vocabulary_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own data" ON word_review_states
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own data" ON wordbook
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own data" ON study_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own data" ON achievements
  FOR ALL USING (auth.uid() = user_id);
```

---

## 四、前端集成设计

### 4.1 新增文件结构

```
src/
├── utils/
│   ├── supabase.js          # Supabase 客户端初始化
│   ├── authService.js       # 登录/登出/用户状态管理
│   └── syncService.js       # 数据同步逻辑
├── composables/
│   └── useAuth.js           # 认证状态 Composable
└── components/
    └── AuthButton.vue       # 登录/用户信息组件
```

### 4.2 同步策略

```
┌──────────────────────────────────────────────────────────────────┐
│                        同步流程                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 用户登录                                                     │
│     ↓                                                            │
│  2. 检查云端是否有数据                                           │
│     ├─ 有 → 合并本地和云端数据（云端优先 or 最新优先）           │
│     └─ 无 → 上传本地数据到云端                                   │
│     ↓                                                            │
│  3. 订阅实时更新                                                  │
│     ↓                                                            │
│  4. 本地修改 → 自动同步到云端                                     │
│     ↓                                                            │
│  5. 云端变化 → 自动更新本地                                       │
│                                                                  │
│  离线支持：                                                       │
│  - 本地 localStorage 始终保留完整数据                             │
│  - 联网后自动同步                                                 │
└──────────────────────────────────────────────────────────────────┘
```

### 4.3 核心代码预览

```javascript
// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// 登录示例
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
  return { data, error }
}

// 同步进度示例
export async function syncProgress(vocabId, progress) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data, error } = await supabase
    .from('vocabulary_progress')
    .upsert({
      user_id: user.id,
      vocab_id: vocabId,
      learned_words: progress.learned,
      forgotten_words: progress.forgotten,
      current_index: progress.currentIndex,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,vocab_id'
    })
  
  return { data, error }
}
```

---

## 五、实施步骤概览

### 阶段一：环境准备 (30分钟)
1. 注册 Supabase 账号
2. 创建新项目
3. 配置 Google/GitHub OAuth
4. 创建数据库表

### 阶段二：前端集成 (2-3小时)
1. 安装 Supabase SDK
2. 创建认证服务
3. 实现登录/登出 UI
4. 创建数据同步服务

### 阶段三：迁移现有逻辑 (2-3小时)
1. 修改 storage.js 支持云端同步
2. 修改 vocabularyManager.js
3. 修改 studyHistory.js
4. 修改 achievements.js

### 阶段四：测试与优化 (1-2小时)
1. 本地测试
2. 多设备同步测试
3. 离线/在线切换测试

---

## 六、费用估算

| 资源 | 免费额度 | 预估使用量 | 是否足够 |
|------|----------|------------|----------|
| MAU (月活用户) | 50,000 | ~100-500 | ✅ 充足 |
| 数据库存储 | 500 MB | ~10-50 MB | ✅ 充足 |
| 带宽 | 5 GB/月 | ~500 MB | ✅ 充足 |
| Auth 请求 | 无限 | - | ✅ 无限 |
| Realtime 连接 | 200 并发 | ~10-50 | ✅ 充足 |

**结论：免费额度完全够用，无需付费。**

---

## 七、下一步行动

设计已完成，准备进入实施阶段：

1. **立即开始** → 我将创建详细的实施计划（使用 writing-plans 技能）
2. **稍后开始** → 保存此设计文档，随时可以继续

---

*设计文档由 Brainstorming 技能生成*
