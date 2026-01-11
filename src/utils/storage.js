/**
 * 本地存储工具
 * 用于保存和加载用户设置
 */

const SETTINGS_KEY = 'vocabcontext_settings';

/**
 * 从localStorage加载用户设置
 * @returns {Object|null} 用户设置对象或null
 */
export function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('加载设置失败:', error);
    return null;
  }
}

/**
 * 保存用户设置到localStorage
 * @param {Object} settings - 用户设置对象
 * @returns {boolean} 保存是否成功
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('保存设置失败:', error);
    return false;
  }
}

/**
 * 清除用户设置
 */
export function clearSettings() {
  localStorage.removeItem(SETTINGS_KEY);
}

/**
 * 保存单词本到localStorage
 * @param {Set} wordbook - 单词本Set
 * @returns {boolean} 保存是否成功
 */
export function saveWordbook(wordbook) {
  try {
    localStorage.setItem('vocabcontext_wordbook', JSON.stringify([...wordbook]));
    return true;
  } catch (error) {
    console.error('保存单词本失败:', error);
    return false;
  }
}

/**
 * 从localStorage加载单词本
 * @returns {Set} 单词本Set
 */
export function loadWordbook() {
  try {
    const saved = localStorage.getItem('vocabcontext_wordbook');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch (error) {
    console.error('加载单词本失败:', error);
    return new Set();
  }
}
