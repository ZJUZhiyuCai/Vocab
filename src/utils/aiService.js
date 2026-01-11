/**
 * AI服务工具
 * 封装硅基流动API调用，生成个性化例句
 */

/**
 * 生成AI例句
 * @param {Object} options - 配置选项
 * @param {string} options.apiKey - API密钥
 * @param {string} options.word - 目标单词
 * @param {string} options.meaning - 单词释义
 * @param {Array<string>} options.interests - 用户兴趣标签
 * @returns {Promise<{sentence: string, translation: string}>} AI生成的例句
 */
export async function generateAIExample({ apiKey, word, meaning, interests }) {
  const prompt = buildPrompt(word, meaning, interests);

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
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API调用失败: ${response.status}`);
  }

  const data = await response.json();
  return parseResponse(data);
}

/**
 * 构建AI Prompt
 * @param {string} word - 单词
 * @param {string} meaning - 释义
 * @param {Array<string>} interests - 兴趣标签
 * @returns {string} Prompt文本
 */
function buildPrompt(word, meaning, interests) {
  const interestsContext = interests.length > 0
    ? `用户兴趣领域：${interests.join('、')}\n请结合这些领域生成例句。`
    : '';

  return `你是一个专业的英语教学助手。请为以下单词生成一个英语例句。

单词：${word}
释义：${meaning}

${interestsContext}

要求：
1. 例句要体现单词在实际场景中的使用
2. 句子难度适中，适合雅思学习者
3. 句子长度在15-25个单词之间
4. ${interests.length > 0 ? '例句场景要与用户的兴趣领域相关' : '例句场景要贴近日常生活'}

请以JSON格式返回，格式如下：
{
  "sentence": "英语例句",
  "translation": "中文翻译"
}

只返回JSON，不要其他内容。`;
}

/**
 * 解析AI响应
 * @param {Object} data - API响应数据
 * @returns {Object} 解析后的例句对象
 */
function parseResponse(data) {
  try {
    const content = data.choices[0].message.content;

    // 尝试提取JSON（可能包含代码块标记）
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                      content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('无法解析AI响应');
    }

    const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return {
      sentence: result.sentence,
      translation: result.translation
    };
  } catch (error) {
    console.error('解析响应失败:', error);
    throw new Error('AI响应格式错误');
  }
}

/**
 * 错误代码枚举
 */
export const ERROR_CODES = {
  INVALID_API_KEY: 'INVALID_API_KEY',
  RATE_LIMIT: 'RATE_LIMIT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * 获取友好的错误提示
 * @param {string} errorCode - 错误代码
 * @returns {string} 错误提示文本
 */
export function getErrorMessage(errorCode) {
  const messages = {
    [ERROR_CODES.INVALID_API_KEY]: 'API密钥无效，请检查设置',
    [ERROR_CODES.RATE_LIMIT]: 'API调用次数超限，请稍后再试',
    [ERROR_CODES.NETWORK_ERROR]: '网络连接失败，请检查网络',
    [ERROR_CODES.PARSE_ERROR]: 'AI响应解析失败',
    [ERROR_CODES.UNKNOWN_ERROR]: '未知错误，请重试'
  };
  return messages[errorCode] || messages[ERROR_CODES.UNKNOWN_ERROR];
}
