/**
 * 词库管理器
 */

// 词库配置
export const VOCABULARIES = [
  {
    id: 'ielts-100',
    name: '雅思高频100词',
    description: '精选雅思考试高频词汇',
    size: 100,
    level: 'intermediate',
    category: 'IELTS',
    file: '/data/words-data.json',
    icon: '🎯',
    color: '#5c6b5c'
  },
  {
    id: 'toefl-200',
    name: '托福核心200词',
    description: '托福考试必备核心词汇',
    size: 200,
    level: 'upper-intermediate',
    category: 'TOEFL',
    file: '/data/toefl-200.json',
    icon: '📚',
    color: '#52667c'
  },
  {
    id: 'gre-300',
    name: 'GRE进阶300词',
    description: 'GRE考试高频学术词汇',
    size: 300,
    level: 'advanced',
    category: 'GRE',
    file: '/data/gre-300.json',
    icon: '🎓',
    color: '#7c6f62'
  },
  {
    id: 'cet4-500',
    name: '四级基础500词',
    description: '大学英语四级基础词汇',
    size: 500,
    level: 'pre-intermediate',
    category: 'CET',
    file: '/data/cet4-500.json',
    icon: '📖',
    color: '#8da892'
  },
  {
    id: 'cet6-600',
    name: '六级进阶600词',
    description: '大学英语六级进阶词汇',
    size: 600,
    level: 'intermediate',
    category: 'CET',
    file: '/data/cet6-600.json',
    icon: '✨',
    color: '#6b8ac2'
  }
]

// 难度等级映射
export const LEVEL_LABELS = {
  'beginner': '初级',
  'pre-intermediate': '初中级',
  'intermediate': '中级',
  'upper-intermediate': '中高级',
  'advanced': '高级'
}

// 当前选择的词库
let currentVocabulary = VOCABULARIES[0]

/**
 * 获取所有词库
 */
export function getAllVocabularies() {
  return VOCABULARIES;
}

/**
 * 获取当前词库
 */
export function getCurrentVocabulary() {
  return currentVocabulary;
}

/**
 * 设置当前词库
 */
export function setCurrentVocabulary(vocabId) {
  const vocab = VOCABULARIES.find(v => v.id === vocabId);
  if (vocab) {
    currentVocabulary = vocab;
    saveCurrentVocabulary(vocabId);
    return vocab;
  }
  return null;
}

/**
 * 从localStorage加载当前词库设置
 */
export function loadCurrentVocabulary() {
  try {
    const saved = localStorage.getItem('vocabcontext_current_vocab');
    if (saved) {
      const vocab = setCurrentVocabulary(saved);
      if (vocab) return vocab;
    }
  } catch (error) {
    console.error('加载词库设置失败:', error);
  }
  return currentVocabulary;
}

/**
 * 保存当前词库设置
 */
export function saveCurrentVocabulary(vocabId) {
  try {
    localStorage.setItem('vocabcontext_current_vocab', vocabId);
    return true;
  } catch (error) {
    console.error('保存词库设置失败:', error);
    return false;
  }
}

/**
 * 获取词库学习进度
 */
export function getVocabularyProgress(vocabId) {
  try {
    const key = `vocabcontext_progress_${vocabId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载词库进度失败:', error);
  }
  return {
    learned: [],
    forgotten: [],
    currentIndex: 0
  };
}

/**
 * 保存词库学习进度
 */
export function saveVocabularyProgress(vocabId, progress) {
  try {
    const key = `vocabcontext_progress_${vocabId}`;
    localStorage.setItem(key, JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('保存词库进度失败:', error);
    return false;
  }
}
