/**
 * 词库构建脚本
 * 从 vocabulary.json 和 examples.json 提取数据，生成按难度分级的词库
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CEFR 等级定义
const CEFR_LEVELS = {
  A1: { minFreq: 0.8, maxWordLen: 6, vocabRange: '500-2000', ielts: '基础-4分', stars: 1 },
  A2: { minFreq: 0.6, maxWordLen: 8, vocabRange: '2000-3000', ielts: '4-5分', stars: 2 },
  B1: { minFreq: 0.4, maxWordLen: 10, vocabRange: '3000-5000', ielts: '5-5.5分', stars: 3 },
  B2: { minFreq: 0.2, maxWordLen: 12, vocabRange: '5000-7000', ielts: '6-6.5分', stars: 4 },
  C1: { minFreq: 0.1, maxWordLen: 14, vocabRange: '7000-9000', ielts: '7-7.5分', stars: 5 },
  C2: { minFreq: 0.0, maxWordLen: 100, vocabRange: '9000-12000+', ielts: '8分+', stars: 6 }
};

// 单词复杂度评分
function calculateComplexity(word) {
  const len = word.spelling.length;
  const syllables = estimateSyllables(word.spelling);
  const hasHyphen = word.spelling.includes('-');
  const hasApostrophe = word.spelling.includes("'");
  const freq = word.frequency || 0;

  // 基础分数：频率越低，分数越高（越难）
  let score = (1 - freq) * 100;

  // 长度加分
  score += Math.max(0, len - 5) * 2;

  // 音节加分
  score += Math.max(0, syllables - 2) * 5;

  // 特殊字符加分
  if (hasHyphen) score += 10;
  if (hasApostrophe) score += 5;

  return score;
}

// 估算音节数（简化版）
function estimateSyllables(word) {
  word = word.toLowerCase();
  const vowels = 'aeiouy';
  let count = 0;
  let prevVowel = false;

  for (let char of word) {
    const isVowel = vowels.includes(char);
    if (isVowel && !prevVowel) {
      count++;
    }
    prevVowel = isVowel;
  }

  // 词尾的e不发音
  if (word.endsWith('e') && count > 1) {
    count--;
  }

  return Math.max(1, count);
}

// 确定CEFR等级
function determineCEFRLevel(word, complexityScore) {
  const freq = word.frequency || 0;
  const len = word.spelling.length;

  // 基于频率和长度的分级规则
  if (freq >= 0.8 && len <= 6) return 'A1';
  if (freq >= 0.6 && len <= 8) return 'A2';
  if (freq >= 0.4 && len <= 10) return 'B1';
  if (freq >= 0.2 && len <= 12) return 'B2';
  if (freq >= 0.1 || len <= 14) return 'C1';
  return 'C2';
}

// 清理释义
function cleanMeaning(paraphrase) {
  if (!paraphrase) return '';
  // 移除过长的释义
  if (paraphrase.length > 200) {
    return paraphrase.substring(0, 200) + '...';
  }
  return paraphrase;
}

// 确定词性
function determinePartOfSpeech(paraphrase) {
  if (!paraphrase) return 'n.';
  const lower = paraphrase.toLowerCase();

  if (lower.startsWith('v.') || lower.includes('vi.') || lower.includes('vt.')) return 'v.';
  if (lower.startsWith('adj.') || lower.startsWith('a.')) return 'adj.';
  if (lower.startsWith('adv.') || lower.startsWith('ad.')) return 'adv.';
  if (lower.startsWith('n.')) return 'n.';
  if (lower.startsWith('prep.')) return 'prep.';
  if (lower.startsWith('conj.')) return 'conj.';
  if (lower.startsWith('pron.')) return 'pron.';
  if (lower.startsWith('art.')) return 'art.';
  if (lower.startsWith('int.')) return 'int.';

  return 'n.'; // 默认名词
}

// 主函数
async function buildVocabularies() {
  console.log('📚 开始构建词库...\n');

  // 读取数据
  console.log('📖 读取 vocabulary.json...');
  const vocabPath = path.join(__dirname, '../data/vocabulary.json');
  const vocabularyData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
  console.log(`✅ 已读取 ${vocabularyData.length} 个单词\n`);

  console.log('📖 读取 examples.json...');
  const examplesPath = path.join(__dirname, '../data/examples.json');
  const examplesData = JSON.parse(fs.readFileSync(examplesPath, 'utf-8'));
  console.log(`✅ 已读取 ${examplesData.length} 条例句\n`);

  // 建立例句索引（wordid -> examples）
  console.log('🔍 建立例句索引...');
  const examplesIndex = new Map();
  for (const ex of examplesData) {
    if (!examplesIndex.has(ex.wordid)) {
      examplesIndex.set(ex.wordid, []);
    }
    if (examplesIndex.get(ex.wordid).length < 3) { // 每个单词最多3条例句
      examplesIndex.get(ex.wordid).push({
        sentence: ex.en,
        translation: ex.cn
      });
    }
  }
  console.log('✅ 例句索引建立完成\n');

  // 过滤和分级单词
  console.log('🎯 开始分级单词...');
  const gradedWords = {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
    C1: [],
    C2: []
  };

  let processedCount = 0;
  const skippedWords = new Set();

  for (const word of vocabularyData) {
    // 跳过无效单词
    if (!word.spelling || word.spelling.length < 2) continue;
    if (skippedWords.has(word.spelling)) continue;

    // 跳过纯数字、缩写等
    if (/^\d+$/.test(word.spelling)) continue;
    if (word.spelling.includes('.') && word.spelling.length < 5) continue;

    const complexity = calculateComplexity(word);
    const level = determineCEFRLevel(word, complexity);

    // 获取例句
    const examples = examplesIndex.get(word.wordid) || [];

    // 构建单词对象
    const wordObj = {
      id: `${level.toLowerCase()}_${String(gradedWords[level].length + 1).padStart(4, '0')}`,
      word: word.spelling,
      ipa: word.USphonetic || word.UKphonetic || '',
      partOfSpeech: determinePartOfSpeech(word.paraphrase),
      meaning: cleanMeaning(word.paraphrase),
      cefr: level,
      ielts: CEFR_LEVELS[level].ielts,
      frequency: Math.round((word.frequency || 0) * 10),
      examples: examples
    };

    gradedWords[level].push(wordObj);
    processedCount++;

    if (processedCount % 10000 === 0) {
      console.log(`   已处理 ${processedCount} 个单词...`);
    }
  }

  console.log(`✅ 分级完成：共处理 ${processedCount} 个单词\n`);

  // 生成词库文件（包含所有单词，不限数量）
  const outputDir = path.join(__dirname, '../public/data');

  const vocabConfigs = [
    { file: 'vocab-a2-basic.json', levels: ['A1', 'A2'], name: '基础词汇 (A1-A2)' },
    { file: 'vocab-b1-intermediate.json', levels: ['B1'], name: '中级词汇 (B1)' },
    { file: 'vocab-b2-upper-intermediate.json', levels: ['B2'], name: '中高级词汇 (B2)' },
    { file: 'vocab-c1-advanced.json', levels: ['C1'], name: '高级词汇 (C1)' },
    { file: 'vocab-c2-proficiency.json', levels: ['C2'], name: '精通词汇 (C2)' }
  ];

  console.log('💾 生成词库文件...\n');

  for (const config of vocabConfigs) {
    const words = [];
    for (const level of config.levels) {
      words.push(...gradedWords[level]);
    }

    // 使用所有单词，不限制数量
    const selectedWords = words;

    const vocabLibrary = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      totalWords: selectedWords.length,
      level: config.levels.join('-'),
      cefr: config.levels,
      ielts: CEFR_LEVELS[config.levels[0]].ielts,
      description: config.name.replace(' (', '，适合').replace(')', '水平'),
      words: selectedWords
    };

    const outputPath = path.join(outputDir, config.file);
    fs.writeFileSync(outputPath, JSON.stringify(vocabLibrary, null, 2), 'utf-8');
    console.log(`✅ ${config.file}: ${selectedWords.length} 个单词`);
  }

  console.log('\n🎉 词库构建完成！\n');

  // 输出统计
  console.log('📊 统计信息：');
  for (const level of Object.keys(gradedWords)) {
    console.log(`   ${level}: ${gradedWords[level].length} 个单词`);
  }
}

// 运行
buildVocabularies().catch(console.error);
