/**
 * 英文释义API服务
 * 调用AI生成单词的英文释义
 */

// localStorage缓存前缀
const CACHE_KEY_PREFIX = 'vocabcontext_en_def_';

/**
 * 获取英文释义
 * @param {Object} options - 配置选项
 * @param {string} options.apiKey - API密钥
 * @param {string} options.word - 目标单词
 * @param {string} options.meaning - 中文释义（参考）
 * @returns {Promise<string>} 英文释义
 */
export async function getEnglishDefinition({ apiKey, word, meaning }) {
  // 检查缓存
  const cached = getFromCache(word);
  if (cached) {
    console.log(`✅ 使用缓存的英文释义: ${word}`);
    return cached;
  }

  const prompt = buildPrompt(word, meaning);

  const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen2.5-72B-Instruct',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
      top_p: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API调用失败: ${response.status}`);
  }

  const data = await response.json();
  const definition = parseResponse(data);

  // 存入缓存
  if (definition) {
    saveToCache(word, definition);
  }

  return definition;
}

/**
 * 构建AI Prompt
 * @param {string} word - 单词
 * @param {string} meaning - 中文释义
 * @returns {string} Prompt文本
 */
function buildPrompt(word, meaning) {
  return `你是一个专业的英语词典编辑。请为单词"${word}"提供简洁准确的英文释义。

【参考中文释义】
${meaning}

【要求】
1. 用简单易懂的英语解释这个词的含义
2. 避免使用这个词本身或其词根变化形式
3. 释义要简洁，通常10-30个单词
4. 使用类似韦氏词典或牛津词典的释义风格
5. 只提供主要含义，不需要例句

请直接返回英文释义，不要任何前缀或后缀，不要JSON格式，只要纯文本的释义。

例如：
- "happy" → "feeling or showing pleasure or contentment"
- "run" → "move at a speed faster than walking"
- "beautiful" → "pleasing to the senses or mind aesthetically"

现在请为"${word}"提供英文释义：`;
}

/**
 * 解析AI响应
 * @param {Object} data - API响应数据
 * @returns {string} 英文释义
 */
function parseResponse(data) {
  try {
    const content = data.choices[0].message.content;

    // 清理响应：移除可能的引号、标点等
    let definition = content.trim()
      .replace(/^["'`]|["'`]$/g, '') // 移除首尾引号
      .replace(/^(Definition:|English:|Meaning:)\s*/i, '') // 移除可能的前缀
      .trim();

    if (definition.length < 5) {
      throw new Error('释义过短');
    }

    return definition;
  } catch (error) {
    console.error('解析响应失败:', error);
    throw new Error('AI响应格式错误');
  }
}

/**
 * 从缓存获取
 * @param {string} word - 单词
 * @returns {string|null} 缓存的英文释义
 */
function getFromCache(word) {
  try {
    const key = `${CACHE_KEY_PREFIX}${word.toLowerCase()}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      const data = JSON.parse(cached);
      // 检查是否过期（30天）
      const age = Date.now() - (data.timestamp || 0);
      const maxAge = 30 * 24 * 60 * 60 * 1000;
      if (age < maxAge) {
        return data.definition;
      } else {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('读取缓存失败:', error);
  }
  return null;
}

/**
 * 保存到缓存
 * @param {string} word - 单词
 * @param {string} definition - 英文释义
 */
function saveToCache(word, definition) {
  try {
    const key = `${CACHE_KEY_PREFIX}${word.toLowerCase()}`;
    const data = {
      definition,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('保存缓存失败:', error);
  }
}

/**
 * 清除所有英文释义缓存
 * @returns {number} 清理的数量
 */
export function clearAllDefinitionCache() {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_KEY_PREFIX));

    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log(`🧹 清除了 ${cacheKeys.length} 条英文释义缓存`);
    return cacheKeys.length;
  } catch (error) {
    console.error('清除缓存失败:', error);
    return 0;
  }
}
