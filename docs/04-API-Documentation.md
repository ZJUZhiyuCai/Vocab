# API 文档
# VocabContext 语境词汇学习工具

## 目录
- [一、硅基流动 API 概述](#一硅基流动-api-概述)
- [二、AI例句生成接口](#二ai例句生成接口)
- [三、API 错误处理](#三api-错误处理)
- [四、API 最佳实践](#四api-最佳实践)
- [五、成本控制](#五成本控制)
- [六、前端集成代码](#六前端集成代码)

---

## 一、硅基流动 API 概述

### 1.1 基本信息

**服务商**：硅基流动（SiliconFlow）

**官方文档**：https://docs.siliconflow.cn/

**API 基础地址**：
```
https://api.siliconflow.cn/v1
```

**认证方式**：Bearer Token

```javascript
headers: {
  'Authorization': 'Bearer sk-xxxxxxxxxxxx'
}
```

### 1.2 支持的模型

| 模型名称 | 模型ID | 适用场景 | 成本 |
|---------|--------|---------|------|
| Qwen2.5-7B | Qwen/Qwen2.5-7B-Instruct | 例句生成（推荐） | 低 |
| Qwen2.5-14B | Qwen/Qwen2.5-14B-Instruct | 更复杂的例句 | 中 |
| deepseek-llm | deepseek-ai/DeepSeek-V2.5 | 通用能力强 | 中 |
| Yi-1.5-9B | 01-ai/Yi-1.5-9B-Chat | 英文能力强 | 低 |

**推荐配置**：
- MVP阶段：`Qwen/Qwen2.5-7B-Instruct`（性价比高）
- 追求质量：`Qwen/Qwen2.5-14B-Instruct`

---

## 二、AI例句生成接口

### 2.1 接口定义

**接口地址**：
```
POST https://api.siliconflow.cn/v1/chat/completions
```

**请求头**：
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer sk-your-api-key'
}
```

**请求参数**：
```javascript
{
  "model": "Qwen/Qwen2.5-7B-Instruct",
  "messages": [
    {
      "role": "user",
      "content": "请为单词xxx生成例句..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 200,
  "top_p": 0.9,
  "stream": false
}
```

### 2.2 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| model | string | 是 | 模型ID |
| messages | array | 是 | 对话消息列表 |
| temperature | number | 否 | 随机性（0-1），默认0.7 |
| max_tokens | number | 否 | 最大生成长度，默认200 |
| top_p | number | 否 | 核采样，默认0.9 |
| stream | boolean | 否 | 是否流式输出，默认false |

### 2.3 响应格式

**成功响应**：
```json
{
  "id": "chatcmpl-123456789",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "Qwen/Qwen2.5-7B-Instruct",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "To ensure the project's success, we need a comprehensive test plan before launch.\n为了确保项目成功，我们在发布前需要全面的测试计划。"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 28,
    "total_tokens": 73
  }
}
```

**错误响应**：
```json
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

---

## 三、Prompt 模板设计

### 3.1 基础例句生成 Prompt

```javascript
const BASE_PROMPT = (word) => `
请为单词"${word}"生成一个英语例句，要求：

1. 难度水平：雅思7分（IELTS Band 7）
2. 句式复杂度：中等偏上，包含从句或复杂结构
3. 语境真实性：类似雅思阅读或学术文章
4. 单词用法：展示该词的典型搭配和用法

输出格式（严格遵循）：
英文例句
中文翻译

只返回例句和翻译，不要其他解释。
`;
```

### 3.2 个性化例句生成 Prompt

```javascript
const PERSONALIZED_PROMPT = (word, userTags, userContext) => `
请为单词"${word}"生成一个个性化英语例句，要求：

1. 用户标签：${userTags.join('、')}
2. 用户背景：${userContext || '通用场景'}
3. 难度水平：雅思7分
4. 关联性：例句要与用户背景强相关
5. 自然度：例句要地道自然，避免生硬

示例场景：
- 程序员：代码审查、技术文档、项目开发
- 学生：考试、论文、课程学习
- 商务：会议、报告、项目管理

输出格式（严格遵循）：
英文例句
中文翻译

只返回例句和翻译，不要其他内容。
`;
```

### 3.3 多样化例句生成 Prompt

```javascript
const DIVERSE_PROMPT = (word, existingExamples) => `
请为单词"${word}"生成一个新的英语例句，要求：

1. 避免与以下例句重复：
${existingExamples.map((ex, i) => `   ${i + 1}. ${ex}`).join('\n')}

2. 使用不同的搭配和场景
3. 保持雅思7分难度
4. 句式结构要有所不同

输出格式：
英文例句
中文翻译
`;
```

### 3.4 难度调节 Prompt

```javascript
const getDifficultyPrompt = (word, difficulty) => {
  const difficultyConfig = {
    easy: {
      level: '雅思5-6分',
      description: '基础词汇使用，句式相对简单',
      length: '10-15词'
    },
    medium: {
      level: '雅思6.5-7分',
      description: '中等复杂度，包含从句',
      length: '15-25词'
    },
    hard: {
      level: '雅思7.5-8分',
      description: '复杂句式，学术性强',
      length: '20-30词'
    }
  };

  const config = difficultyConfig[difficulty] || difficultyConfig.medium;

  return `
请为单词"${word}"生成一个例句，要求：

1. 难度：${config.level}
2. 特点：${config.description}
3. 长度：${config.length}
4. 用法：展示该词的典型搭配

输出格式：
英文例句
中文翻译
`;
};
```

---

## 四、API 错误处理

### 4.1 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 401 | API Key无效 | 检查Key是否正确 |
| 429 | 请求过于频繁 | 添加重试机制 |
| 500 | 服务器错误 | 重试或换模型 |
| 503 | 服务不可用 | 稍后重试 |

### 4.2 错误处理代码

```javascript
class APIError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function callAIWithRetry(word, userTags, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await generateExample(word, userTags);
      return result;
    } catch (error) {
      lastError = error;

      // 401错误不重试
      if (error.status === 401) {
        throw new APIError('API Key无效，请检查配置', 'INVALID_KEY', 401);
      }

      // 429错误：等待后重试
      if (error.status === 429) {
        const waitTime = Math.pow(2, i) * 1000; // 指数退避
        await sleep(waitTime);
        continue;
      }

      // 其他错误也重试
      if (i < maxRetries - 1) {
        await sleep(1000);
        continue;
      }
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 4.3 用户友好的错误提示

```javascript
const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络',
  API_ERROR: 'AI服务暂时不可用，请稍后重试',
  RATE_LIMIT: '请求过于频繁，请稍后再试',
  INVALID_KEY: 'API配置错误，请联系管理员',
  TIMEOUT: '请求超时，请重试',
  UNKNOWN_ERROR: '发生未知错误，请重试'
};

function getErrorMessage(error) {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (error.status === 429) {
    return ERROR_MESSAGES.RATE_LIMIT;
  }

  if (error.status === 401) {
    return ERROR_MESSAGES.INVALID_KEY;
  }

  if (error.message.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}
```

---

## 五、API 最佳实践

### 5.1 缓存策略

```javascript
// 简单的内存缓存
const exampleCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时

function getCachedExample(word, userTags) {
  const key = `${word}_${userTags.sort().join('_')}`;
  const cached = exampleCache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  return null;
}

function setCachedExample(word, userTags, data) {
  const key = `${word}_${userTags.sort().join('_')}`;
  exampleCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// 使用缓存
async function getExampleWithCache(word, userTags) {
  // 先查缓存
  const cached = getCachedExample(word, userTags);
  if (cached) {
    return cached;
  }

  // 缓存未命中，调用API
  const result = await generateExample(word, userTags);

  // 存入缓存
  setCachedExample(word, userTags, result);

  return result;
}
```

### 5.2 请求队列

```javascript
class APIQueue {
  constructor(maxConcurrent = 3) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.run();
    });
  }

  async run() {
    while (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const { fn, resolve, reject } = this.queue.shift();
      this.running++;

      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        this.running--;
        this.run();
      }
    }
  }
}

// 使用队列
const aiQueue = new APIQueue(2); // 最多2个并发请求

function generateExampleWithQueue(word, userTags) {
  return aiQueue.add(() => generateExample(word, userTags));
}
```

### 5.3 超时控制

```javascript
function fetchWithTimeout(url, options, timeout = 10000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

// 使用
async function generateExample(word, userTags) {
  const response = await fetchWithTimeout(
    `${API_CONFIG.baseURL}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify({...})
    },
    10000 // 10秒超时
  );
  // ...
}
```

### 5.4 请求去重

```javascript
const pendingRequests = new Map();

async function generateExampleDeduped(word, userTags) {
  const key = `${word}_${userTags.sort().join('_')}`;

  // 如果有相同请求正在进行，等待其完成
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // 创建新请求
  const promise = generateExample(word, userTags)
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, promise);
  return promise;
}
```

---

## 六、成本控制

### 6.1 Token 使用估算

| 操作 | Prompt Tokens | Completion Tokens | 总计 |
|------|--------------|-------------------|------|
| 基础例句生成 | ~50 | ~30 | ~80 |
| 个性化例句 | ~80 | ~35 | ~115 |
| 多样化例句 | ~100 | ~35 | ~135 |

**每日估算**（每天学习10个词）：
- 基础方案：10词 × 80 tokens = 800 tokens/天
- 个性化方案：10词 × 115 tokens = 1150 tokens/天
- 月度：1150 × 30 = 34,500 tokens/月

### 6.2 硅基流动价格参考

**Qwen2.5-7B**（示例价格，请以官方为准）：
- 输入：¥0.001 / 1K tokens
- 输出：¥0.002 / 1K tokens

**月度成本估算**：
- 输入：17,250 tokens × ¥0.001 / 1K ≈ ¥0.02
- 输出：17,250 tokens × ¥0.002 / 1K ≈ ¥0.03
- **总计：约 ¥0.05/月**

**结论**：个人使用成本极低，完全可接受。

### 6.3 成本优化建议

1. **使用缓存**：避免重复生成相同例句
2. **批量生成**：一次生成多个词的例句
3. **选择合适模型**：7B模型性价比高
4. **控制长度**：max_tokens设为200足够
5. **预生成高频词**：提前生成并存储

---

## 七、前端集成代码

### 7.1 完整的 Composable

```javascript
// src/composables/useAI.js
import { ref } from 'vue'
import { API_CONFIG } from '@/utils/constants'
import { getErrorMessage } from '@/utils/errors'

// 缓存
const cache = new Map()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24小时

// 请求队列（防止并发请求）
const pendingRequests = new Map()

export function useAI() {
  const loading = ref(false)
  const error = ref(null)

  async function generateExample(word, userTags = [], difficulty = 'medium') {
    const cacheKey = `${word}_${userTags.sort().join('_')}_${difficulty}`

    // 检查缓存
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }

    // 检查是否有相同请求正在进行
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)
    }

    loading.value = true
    error.value = null

    try {
      // 构建Prompt
      const prompt = buildPrompt(word, userTags, difficulty)

      // 发起请求
      const promise = callAPI(prompt)
      pendingRequests.set(cacheKey, promise)

      const result = await promise

      // 存入缓存
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })

      return result

    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    } finally {
      loading.value = false
      pendingRequests.delete(cacheKey)
    }
  }

  async function callAPI(prompt) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

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
            content: prompt
          }],
          temperature: 0.7,
          max_tokens: 200
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'API请求失败')
      }

      const data = await response.json()
      return parseAIResponse(data.choices[0].message.content)

    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('请求超时')
      }
      throw err
    }
  }

  function parseAIResponse(content) {
    // 解析AI返回的内容
    const lines = content.trim().split('\n').filter(line => line.trim())

    if (lines.length >= 2) {
      return {
        english: lines[0].trim(),
        chinese: lines[1].trim()
      }
    }

    // 如果格式不对，返回原内容
    return {
      english: content,
      chinese: ''
    }
  }

  function buildPrompt(word, userTags, difficulty) {
    if (userTags.length > 0) {
      return PERSONALIZED_PROMPT(word, userTags, difficulty)
    } else {
      return BASE_PROMPT(word, difficulty)
    }
  }

  function clearCache() {
    cache.clear()
  }

  return {
    loading,
    error,
    generateExample,
    clearCache
  }
}
```

### 7.2 在组件中使用

```vue
<template>
  <div>
    <button
      @click="generateAIExample"
      :disabled="loading"
    >
      {{ loading ? '生成中...' : '生成AI例句' }}
    </button>

    <div v-if="aiExample" class="ai-example">
      <p>{{ aiExample.english }}</p>
      <p>{{ aiExample.chinese }}</p>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAI } from '@/composables/useAI'

const props = defineProps({
  word: String,
  userTags: Array
})

const { loading, error, generateExample } = useAI()
const aiExample = ref(null)

async function generateAIExample() {
  try {
    const result = await generateExample(props.word, props.userTags)
    aiExample.value = result
  } catch (err) {
    console.error('生成例句失败:', err)
  }
}
</script>
```

---

## 八、监控与日志

### 8.1 API 调用日志

```javascript
function logAPICall(word, userTags, result, duration) {
  const log = {
    timestamp: new Date().toISOString(),
    word,
    userTags,
    duration,
    success: !!result,
    tokensUsed: result?.usage?.total_tokens
  }

  // 存储到LocalStorage（最多保留100条）
  const logs = JSON.parse(localStorage.getItem('api_logs') || '[]')
  logs.push(log)

  if (logs.length > 100) {
    logs.shift() // 移除最老的日志
  }

  localStorage.setItem('api_logs', JSON.stringify(logs))
}
```

### 8.2 统计信息

```javascript
function getAPIStats() {
  const logs = JSON.parse(localStorage.getItem('api_logs') || '[]')

  const stats = {
    totalCalls: logs.length,
    successfulCalls: logs.filter(log => log.success).length,
    failedCalls: logs.filter(log => !log.success).length,
    totalTokens: logs.reduce((sum, log) => sum + (log.tokensUsed || 0), 0),
    avgDuration: logs.reduce((sum, log) => sum + log.duration, 0) / logs.length || 0
  }

  return stats
}
```

---

## 九、环境变量管理

### 9.1 开发环境

```bash
# .env.development
VITE_API_KEY=sk-your-development-key
VITE_API_MODEL=Qwen/Qwen2.5-7B-Instruct
VITE_API_BASE_URL=https://api.siliconflow.cn/v1
```

### 9.2 生产环境

```bash
# .env.production
VITE_API_KEY=sk-your-production-key
VITE_API_MODEL=Qwen/Qwen2.5-7B-Instruct
VITE_API_BASE_URL=https://api.siliconflow.cn/v1
```

### 9.3 配置文件

```javascript
// src/config/api.js
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.siliconflow.cn/v1',
  model: import.meta.env.VITE_API_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
  apiKey: import.meta.env.VITE_API_KEY || '',
  timeout: 10000,
  maxRetries: 3
}
```

---

**文档版本**：v1.0
**最后更新**：2026-01-10
**维护者**：VocabContext Team
