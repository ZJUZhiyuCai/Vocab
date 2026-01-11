/**
 * 词库管理器
 */

// 词库配置
export const VOCABULARIES = [
  {
    id: 'vocab-a2-basic',
    name: '基础词汇 (A1-A2)',
    description: '英语基础词汇，适合初学者',
    size: 3561,
    level: 'basic',
    category: 'GENERAL',
    file: '/data/vocab-a2-basic.json',
    icon: '📖',
    color: '#8da892',
    difficulty: {
      cefr: ['A1', 'A2'],
      ielts: '基础-4分',
      vocabRange: '500-2000',
      stars: 1
    }
  },
  {
    id: 'vocab-b1-intermediate',
    name: '中级词汇 (B1)',
    description: '中级词汇，适合雅思5分水平',
    size: 6451,
    level: 'intermediate',
    category: 'IELTS',
    file: '/data/vocab-b1-intermediate.json',
    icon: '📚',
    color: '#5c6b5c',
    difficulty: {
      cefr: ['B1'],
      ielts: '5-5.5分',
      vocabRange: '2000-4000',
      stars: 3
    }
  },
  {
    id: 'vocab-b2-upper-intermediate',
    name: '中高级词汇 (B2)',
    description: '中高级词汇，适合雅思6分水平',
    size: 11894,
    level: 'upper-intermediate',
    category: 'IELTS',
    file: '/data/vocab-b2-upper-intermediate.json',
    icon: '🎯',
    color: '#52667c',
    difficulty: {
      cefr: ['B2'],
      ielts: '6-6.5分',
      vocabRange: '4000-6000',
      stars: 4
    }
  },
  {
    id: 'vocab-c1-advanced',
    name: '高级词汇 (C1)',
    description: '高级词汇，适合雅思7分水平',
    size: 80012,
    level: 'advanced',
    category: 'IELTS',
    file: '/data/vocab-c1-advanced.json',
    icon: '🏆',
    color: '#7c6f62',
    difficulty: {
      cefr: ['C1'],
      ielts: '7-7.5分',
      vocabRange: '6000-8000',
      stars: 5
    }
  },
  {
    id: 'vocab-c2-proficiency',
    name: '精通词汇 (C2)',
    description: '精通级词汇，适合雅思8分及以上',
    size: 2044,
    level: 'proficiency',
    category: 'IELTS',
    file: '/data/vocab-c2-proficiency.json',
    icon: '💎',
    color: '#6b5c7c',
    difficulty: {
      cefr: ['C2'],
      ielts: '8分+',
      vocabRange: '8000-10000+',
      stars: 6
    }
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

/**
 * 根据词汇测试结果推荐词库（精准匹配版）
 * @param {Object} testResult - 测试结果 { estimatedVocab, cefrLevel, ieltsLevel }
 * @returns {Array} 推荐的词库列表（按推荐度排序）
 */
export function getRecommendedVocabularies(testResult) {
  if (!testResult) {
    // 如果没有测试结果，返回默认推荐（中等难度）
    return VOCABULARIES.filter(v => v.difficulty.stars === 3).map(v => ({ ...v, isRecommended: true }));
  }

  const { cefrLevel, estimatedVocab } = testResult;

  // 精准匹配策略：优先选择完全匹配CEFR等级的词库
  const scoredVocabs = VOCABULARIES.map(vocab => {
    let score = 0;
    const diff = vocab.difficulty;

    // 1. 精确CEFR等级匹配（权重：60%）
    if (diff.cefr.includes(cefrLevel)) {
      score += 60;  // 完全匹配，高分
    } else {
      // 检查相邻等级
      const cefrOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const userLevelIndex = cefrOrder.indexOf(cefrLevel);
      const minDiff = Math.min(
        ...diff.cefr.map(level => Math.abs(cefrOrder.indexOf(level) - userLevelIndex))
      );
      if (minDiff === 1) score += 35;  // 相邻等级，仍然比较适合
      if (minDiff === 2) score += 15;  // 隔一个等级，勉强可以
    }

    // 2. 词汇量范围匹配（权重：25%）
    if (estimatedVocab) {
      const [min, max] = estimatedVocab.split('-').map(Number);
      const userVocab = (min + max) / 2;

      // 解析词库的词汇量范围
      const vocabMin = diff.vocabRange.includes('-')
        ? parseInt(diff.vocabRange.split('-')[0])
        : parseInt(diff.vocabRange);
      const vocabMax = diff.vocabRange.includes('-')
        ? parseInt(diff.vocabRange.split('-')[1])
        : parseInt(diff.vocabRange);
      const vocabAvg = (vocabMin + vocabMax) / 2;

      // 计算词汇量重合度
      const userMax = max;
      const userMin = min;

      // 检查范围是否有重合
      const hasOverlap = !(userMax < vocabMin || userMin > vocabMax);

      if (hasOverlap) {
        // 计算重合比例
        const overlapMin = Math.max(userMin, vocabMin);
        const overlapMax = Math.min(userMax, vocabMax);
        const overlapRange = overlapMax - overlapMin;
        const userRange = userMax - userMin;
        const overlapPercent = overlapRange / userRange;

        if (overlapPercent > 0.5) score += 25;
        else if (overlapPercent > 0.3) score += 20;
        else if (overlapPercent > 0.1) score += 10;
        else score += 5;
      } else {
        // 没有重合，计算距离
        const distance = Math.min(
          Math.abs(userVocab - vocabMin),
          Math.abs(userVocab - vocabMax)
        );
        const distanceThreshold = 1000;
        if (distance < distanceThreshold) score += 10;
        else score -= 10;  // 差距太大，扣分
      }
    }

    // 3. 理想难度星级匹配（权重：15%）
    // 对于不同水平，推荐策略不同：
    // - A1-A2: 推荐同级或高一级
    // - B1-B2: 推荐同级或高一级
    // - C1-C2: 推荐同级或低一级（避免太难）
    const idealStarsMap = {
      'A1': [1, 2],
      'A2': [1, 2, 3],
      'B1': [3, 4],
      'B2': [4, 5],
      'C1': [5, 6],
      'C2': [5, 6]
    };

    const idealStars = idealStarsMap[cefrLevel] || [3];

    if (idealStars.includes(diff.stars)) {
      score += 15;
    } else {
      const starDiff = Math.min(...idealStars.map(s => Math.abs(diff.stars - s)));
      if (starDiff === 1) score += 10;
      else if (starDiff === 2) score += 5;
      else score -= 5;  // 差距太大，扣分
    }

    return { ...vocab, recommendScore: score };
  });

  // 按推荐分数排序，返回所有词库（让用户有更多选择）
  return scoredVocabs
    .sort((a, b) => b.recommendScore - a.recommendScore)
    .map(({ recommendScore, ...vocab }) => ({
      ...vocab,
      isRecommended: recommendScore >= 60,  // 提高推荐标准：60分以上才标记为推荐
      recommendScore: recommendScore  // 保留分数供调试使用
    }));
}
