# 多设备同步方案设计文档

## 一、需求概述

### 核心需求
- 支持多设备间数据同步（电脑、平板、手机）
- 数据包括：学习进度、单词本、学习时长、设置、AI例句
- 实时同步或准实时同步
- 支持离线使用，联网后自动同步

### 用户场景
1. **日常使用**：在电脑上学习单词，在手机上复习
2. **离线学习**：无网络时仍可学习，联网后自动同步
3. **数据安全**：用户数据云端备份，不会丢失

---

## 二、技术方案选型

### 方案对比

| 方案 | 优点 | 缺点 | 成本 |
|------|------|------|------|
| **A. Supabase** | 开源、PostgreSQL、实时订阅、Auth | 需要部署 | 免费额度慷慨 |
| **B. Firebase** | Google支持、实时数据库、Firestore | 学习曲线陡 | 免费额度有限 |
| **C. 自建后端** | 完全控制、可定制 | 需要维护、部署成本高 | 需要服务器 |
| **D. JSONbin + GitHub** | 简单、无需后端 | 不适合频繁写入、有延迟 | 免费 |

### 推荐方案：**Supabase**

**选择理由**：
1. ✅ 开源免费，慷慨的免费额度（500MB数据库）
2. ✅ 内置PostgreSQL数据库，支持关系型数据
3. ✅ 实时订阅功能，支持多设备同步
4. ✅ 内置用户认证（Email、OAuth）
5. ✅ Row Level Security，数据安全
6. ✅ 边缘函数，可执行自定义逻辑
7. ✅ 自动生成API（REST、GraphQL）

---

## 三、数据库设计

### 数据表结构

#### 1. 用户表 (auth.users - Supabase内置)
```sql
-- Supabase自动管理
-- id, email, encrypted_password, created_at, updated_at 等
```

#### 2. 学习记录表 (user_progress)
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'learned', 'forgotten'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- 索引
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_word_id ON user_progress(word_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
```

#### 3. 单词本表 (user_wordbook)
```sql
CREATE TABLE user_wordbook (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

CREATE INDEX idx_user_wordbook_user_id ON user_wordbook(user_id);
```

#### 4. 学习时长表 (user_study_time)
```sql
CREATE TABLE user_study_time (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_seconds INTEGER NOT NULL,
  sessions JSONB, -- 记录每次学习会话
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_user_study_time_user_date ON user_study_time(user_id, date);
```

#### 5. 用户设置表 (user_settings)
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key TEXT,
  interests JSONB,
  daily_goal INTEGER DEFAULT 20,
  study_mode VARCHAR(50) DEFAULT 'sequence',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

#### 6. AI例句缓存表 (user_ai_examples)
```sql
CREATE TABLE user_ai_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id VARCHAR(50) NOT NULL,
  sentence TEXT NOT NULL,
  translation TEXT NOT NULL,
  based_on_interests JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

CREATE INDEX idx_user_ai_examples_user_word ON user_ai_examples(user_id, word_id);
```

---

## 四、前端集成方案

### 4.1 安装依赖

```bash
npm install @supabase/supabase-js
```

### 4.2 配置Supabase客户端

**src/utils/supabaseClient.js**:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 4.3 环境变量配置

**.env.local**:
```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4.4 认证流程

```javascript
// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// 注册
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// 登出
await supabase.auth.signOut()

// 监听认证状态变化
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // 用户已登录
  } else if (event === 'SIGNED_OUT') {
    // 用户已登出
  }
})
```

### 4.5 数据同步逻辑

#### 同步策略
1. **实时同步**：监听Supabase实时订阅，其他设备的更改立即反映
2. **写入优先级**：最后写入优先（Last Write Wins）
3. **冲突解决**：基于时间戳判断

#### 核心同步代码示例

```javascript
// 监听学习进度变化
const subscribeToProgress = () => {
  return supabase
    .channel('user_progress_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_progress',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        handleProgressChange(payload)
      }
    )
    .subscribe()
}

// 处理远程更改
const handleProgressChange = (payload) => {
  const { eventType, new: newRecord, old: oldRecord } = payload

  if (eventType === 'INSERT') {
    // 新增学习记录
    if (newRecord.status === 'learned') {
      learned.value.add(newRecord.word_id)
    } else {
      forgotten.value.add(newRecord.word_id)
    }
  } else if (eventType === 'UPDATE') {
    // 更新学习记录
    // 处理状态变更
  } else if (eventType === 'DELETE') {
    // 删除学习记录
    learned.value.delete(oldRecord.word_id)
    forgotten.value.delete(oldRecord.word_id)
  }
}

// 上传本地数据到云端
const syncLocalToCloud = async () => {
  const user = supabase.auth.user()

  // 同步学习进度
  for (const wordId of learned.value) {
    await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        word_id: wordId,
        status: 'learned'
      }, { onConflict: 'user_id,word_id' })
  }

  // 同步单词本
  for (const wordId of wordbook.value) {
    await supabase
      .from('user_wordbook')
      .upsert({
        user_id: user.id,
        word_id: wordId
      }, { onConflict: 'user_id,word_id' })
  }
}

// 从云端下载数据
const syncCloudToLocal = async () => {
  const user = supabase.auth.user()
  if (!user) return

  // 下载学习进度
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)

  // 更新本地状态
  learned.value.clear()
  forgotten.value.clear()
  progress.forEach(p => {
    if (p.status === 'learned') {
      learned.value.add(p.word_id)
    } else {
      forgotten.value.add(p.word_id)
    }
  })
}
```

---

## 五、实施步骤

### 阶段1：基础架构（1-2天）
1. 在Supabase创建项目
2. 创建数据库表（运行SQL脚本）
3. 配置Row Level Security
4. 前端集成Supabase客户端
5. 实现用户认证（登录/注册/登出）

### 阶段2：数据同步（2-3天）
1. 实现数据上传功能
2. 实现数据下载功能
3. 实现实时订阅监听
4. 添加冲突解决逻辑
5. 测试多设备同步

### 阶段3：离线支持（1-2天）
1. 使用Service Worker缓存数据
2. 实现离线队列（离线时暂存操作）
3. 网络恢复后自动同步队列
4. 添加同步状态指示器

### 阶段4：测试优化（1天）
1. 功能测试
2. 性能优化
3. 错误处理完善
4. 用户体验优化

---

## 六、安全与隐私

### 数据安全
1. **Row Level Security (RLS)**：
   - 用户只能访问自己的数据
   - 服务器端验证，客户端无法绕过

2. **API密钥加密**：
   - 不将OpenAI API密钥明文存储
   - 使用Supabase Edge Functions调用AI API

3. **HTTPS**：
   - 所有通信使用HTTPS加密

### 隐私保护
1. **数据最小化**：只同步必要数据
2. **匿名选项**：允许用户使用邮箱别名注册
3. **数据导出**：用户可导出所有个人数据
4. **数据删除**：提供账户删除功能

---

## 七、成本估算

### Supabase免费额度
- **数据库**：500MB存储
- **带宽**：1GB/月
- **请求**：50,000/月
- **实时连接**：200并发
- **边缘函数**：500,000次调用/月

### 估算
- **月活跃用户**：< 100人 → ✅ 完全免费
- **月活用户**：100-1000人 → ✅ 基本免费（Pro计划 $25/月）
- **月活用户**：> 1000人 → Pro计划 $25/月 + Hobby计划 $5/月

**结论**：对于个人项目和小规模应用，免费额度完全足够！

---

## 八、替代方案（轻量级）

如果不想使用Supabase，可以考虑更简单的方案：

### 方案：JSONbin + 定期备份

**原理**：
1. 用户数据存储在localStorage
2. 定期自动上传到JSONbin（HTTPS API）
3. 其他设备从JSONbin下载数据
4. 使用GitHub作为备份

**优点**：
- ✅ 完全免费
- ✅ 无需后端
- ✅ 简单易实现

**缺点**：
- ❌ 非实时同步（手动或定期）
- ❌ 无用户认证
- ❌ JSONbin有API限制

**实现示例**：
```javascript
// 上传数据到JSONbin
const syncToJSONbin = async () => {
  const data = {
    learned: [...learned.value],
    forgotten: [...forgotten.value],
    wordbook: [...wordbook.value],
    settings: userSettings.value,
    timestamp: Date.now()
  }

  const response = await fetch('https://api.jsonbin.io/v3/b', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': YOUR_JSONBIN_KEY
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()
  localStorage.setItem('vocabcontext_sync_url', result.uri)
  return result.uri
}

// 从JSONbin下载数据
const syncFromJSONbin = async () => {
  const syncUrl = localStorage.getItem('vocabcontext_sync_url')
  if (!syncUrl) return

  const response = await fetch(syncUrl, {
    headers: {
      'X-Master-Key': YOUR_JSONBIN_KEY
    }
  })

  const data = await response.json()

  // 更新本地状态
  learned.value = new Set(data.learned)
  forgotten.value = new Set(data.forgotten)
  wordbook.value = new Set(data.wordbook)
  userSettings.value = data.settings
}
```

---

## 九、推荐实施方案

### 第一阶段（当前）：本地存储
- ✅ 使用localStorage存储所有数据
- ✅ 无需后端，快速开发
- ✅ 适合单设备使用

### 第二阶段：添加简单同步
- 使用JSONbin方案
- 手动/半自动同步
- 支持多设备基本同步

### 第三阶段：完整云同步（推荐）
- 集成Supabase
- 实时自动同步
- 支持离线使用
- 完整的用户认证

---

## 十、总结

### 推荐方案：**Supabase**

**理由**：
1. 开源免费，适合个人项目
2. 功能完整（数据库 + Auth + 实时订阅）
3. 开发体验好，文档清晰
4. 扩展性强，未来可添加更多功能

### 下一步行动

1. **立即开始**：
   - 注册Supabase账号：https://supabase.com
   - 创建新项目
   - 获取API凭证

2. **数据库设置**：
   - 在Supabase SQL Editor中运行上面的SQL脚本
   - 配置Row Level Security

3. **前端集成**：
   - 安装`@supabase/supabase-js`
   - 添加登录/注册页面
   - 实现数据同步逻辑

4. **测试验证**：
   - 测试多设备同步
   - 测试离线/在线切换
   - 性能测试

---

**文档版本**：v1.0
**创建时间**：2026-01-10
**作者**：ZJUZhiyuCai
