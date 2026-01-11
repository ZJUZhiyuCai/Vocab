/**
 * 重新生成按CEFR级别排序的累计词库
 *
 * 策略：
 * 1. 读取所有词库文件（按CEFR分级）
 * 2. 按CEFR级别排序：A1 → A2 → B1 → B2 → C1 → C2
 * 3. 按累计词汇量分段
 *    - 四级基础：4500词 (A1 + A2 + 部分B1)
 *    - 六级进阶：1500词 (剩余B1)
 *    - 雅思6.0：1000词 (部分B2)
 *    - 雅思7.0：2000词 (剩余B2 + 部分C1)
 *    - 雅思8.0+：剩余词 (剩余C1 + C2)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CEFR级别排序权重
const CEFR_ORDER = {
  'A1': 1,
  'A2': 2,
  'B1': 3,
  'B2': 4,
  'C1': 5,
  'C2': 6
};

// Fisher-Yates 洗牌算法
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

console.log('📚 开始重新生成累计词库...\n');

// 读取所有CEFR分级的词库
const dataDir = path.join(__dirname, '../public/data');

const a1Data = JSON.parse(fs.readFileSync(path.join(dataDir, 'vocab-a2-basic.json'), 'utf8'));
const b1Data = JSON.parse(fs.readFileSync(path.join(dataDir, 'vocab-b1-intermediate.json'), 'utf8'));
const b2Data = JSON.parse(fs.readFileSync(path.join(dataDir, 'vocab-b2-upper-intermediate.json'), 'utf8'));
const c1Data = JSON.parse(fs.readFileSync(path.join(dataDir, 'vocab-c1-advanced.json'), 'utf8'));
const c2Data = JSON.parse(fs.readFileSync(path.join(dataDir, 'vocab-c2-proficiency.json'), 'utf8'));

// A1词包含在A2文件中，需要提取并打乱
const a1Words = shuffleArray(a1Data.words.filter(w => w.cefr === 'A1'));
const a2Words = shuffleArray(a1Data.words.filter(w => w.cefr === 'A2'));
const b1Words = shuffleArray(b1Data.words);
const b2Words = shuffleArray(b2Data.words);
const c1Words = shuffleArray(c1Data.words);
const c2Words = shuffleArray(c2Data.words);

console.log('📖 读取并打乱词库文件:');
console.log(`   - A1: ${a1Words.length} 词`);
console.log(`   - A2: ${a2Words.length} 词`);
console.log(`   - B1: ${b1Words.length} 词`);
console.log(`   - B2: ${b2Words.length} 词`);
console.log(`   - C1: ${c1Words.length} 词`);
console.log(`   - C2: ${c2Words.length} 词`);
console.log('');

// 合并所有单词并按CEFR级别排序
const allWords = [
  ...a1Words.map(w => ({...w, sortKey: CEFR_ORDER[w.cefr]})),
  ...a2Words.map(w => ({...w, sortKey: CEFR_ORDER[w.cefr]})),
  ...b1Words.map(w => ({...w, sortKey: CEFR_ORDER[w.cefr]})),
  ...b2Words.map(w => ({...w, sortKey: CEFR_ORDER[w.cefr]})),
  ...c1Words.map(w => ({...w, sortKey: CEFR_ORDER[w.cefr]})),
  ...c2Words.map(w => ({...w, sortKey: CEFR_ORDER[w.cefr]}))
];

console.log(`📊 总词数: ${allWords.length}\n`);

// 配置分段：按实际考试词汇量要求
const CONFIG = [
  {
    id: 'cet4-basic',
    name: '四级基础',
    file: 'vocab-cet4-basic.json',
    icon: '📖',
    color: '#8da892',
    cefrLevels: ['A1', 'A2'],
    extraB1: 939,  // A1+A2=3561, 还需要939个B1才能到4500
    targetExam: '四级'
  },
  {
    id: 'cet6-advanced',
    name: '六级进阶',
    file: 'vocab-cet6-advanced.json',
    icon: '📚',
    color: '#5c6b5c',
    cefrLevels: [], // 只包含剩余的B1
    b1Count: 1500,
    targetExam: '六级'
  },
  {
    id: 'ielts6-breakthrough',
    name: '雅思6.0突破',
    file: 'vocab-ielts6-breakthrough.json',
    icon: '🎯',
    color: '#52667c',
    cefrLevels: ['B2'],
    b2Count: 500,  // 雅思6.0累计6000左右，从6000-6500
    targetExam: '雅思6.0'
  },
  {
    id: 'ielts7-sprint',
    name: '雅思7.0冲刺',
    file: 'vocab-ielts7-sprint.json',
    icon: '🏆',
    color: '#7c6f62',
    cefrLevels: ['B2', 'C1'],
    extraB2: 1000,  // 再取1000个B2
    extraC1: 500,   // 加上500个C1，累计约8000
    targetExam: '雅思7.0'
  },
  {
    id: 'ielts8-mastery',
    name: '雅思8.0通关',
    file: 'vocab-ielts8-mastery.json',
    icon: '💎',
    color: '#6b5c7c',
    cefrLevels: ['C1', 'C2'],  // 剩余的C1和所有C2
    c1Limit: 2000,  // 再取2000个C1（雅思8.0+累计10000+）
    targetExam: '雅思8.0+'
  }
];

// 生成累计词库
let usedB1Count = 0;
let usedB2Count = 0;
let usedC1Count = 0;
let cumulativeCount = 0;

CONFIG.forEach((config) => {
  const levelWords = [];

  // 处理各级别单词
  if (config.cefrLevels.includes('A1')) {
    levelWords.push(...a1Words);
  }
  if (config.cefrLevels.includes('A2')) {
    levelWords.push(...a2Words);
  }

  // 处理B1单词
  if (config.extraB1) {
    levelWords.push(...b1Words.slice(usedB1Count, usedB1Count + config.extraB1));
    usedB1Count += config.extraB1;
  }
  if (config.b1Count) {
    levelWords.push(...b1Words.slice(usedB1Count, usedB1Count + config.b1Count));
    usedB1Count += config.b1Count;
  }

  // 处理B2单词
  if (config.b2Count) {
    levelWords.push(...b2Words.slice(usedB2Count, usedB2Count + config.b2Count));
    usedB2Count += config.b2Count;
  }
  if (config.extraB2) {
    levelWords.push(...b2Words.slice(usedB2Count, usedB2Count + config.extraB2));
    usedB2Count += config.extraB2;
  }
  if (config.b2Remaining) {
    levelWords.push(...b2Words.slice(usedB2Count));
    usedB2Count = b2Words.length;
  }

  // 处理C1单词
  if (config.extraC1) {
    levelWords.push(...c1Words.slice(usedC1Count, usedC1Count + config.extraC1));
    usedC1Count += config.extraC1;
  }
  if (config.c1Count) {
    levelWords.push(...c1Words.slice(usedC1Count, usedC1Count + config.c1Count));
    usedC1Count += config.c1Count;
  }

  // 处理C1剩余和C2
  if (config.cefrLevels.includes('C1') && !config.c1Count && !config.extraC1) {
    const c1Limit = config.c1Limit || c1Words.length;
    levelWords.push(...c1Words.slice(usedC1Count, usedC1Count + c1Limit));
    usedC1Count += c1Limit;
  }
  if (config.cefrLevels.includes('C2')) {
    levelWords.push(...c2Words);
  }

  cumulativeCount += levelWords.length;

  // 统计CEFR分布
  const cefrStats = {};
  levelWords.forEach(w => {
    cefrStats[w.cefr] = (cefrStats[w.cefr] || 0) + 1;
  });

  console.log(`📦 生成 ${config.name}:`);
  console.log(`   - 单词数: ${levelWords.length}`);
  console.log(`   - 累计数: ${cumulativeCount}`);
  console.log(`   - CEFR分布: ${Object.entries(cefrStats).map(([k,v]) => `${k}:${v}`).join(', ')}`);
  console.log(`   - 对应考试: ${config.targetExam}`);

  // 生成词典数据
  const vocabData = {
    version: '3.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    totalWords: levelWords.length,
    level: config.targetExam,
    description: config.name,
    cumulativeRange: `${cumulativeCount - levelWords.length}-${cumulativeCount}`,
    words: levelWords.map(({sortKey, ...rest}) => rest)
  };

  // 写入文件
  const outputPath = path.join(dataDir, config.file);
  fs.writeFileSync(outputPath, JSON.stringify(vocabData, null, 2), 'utf8');

  const fileSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(2);
  console.log(`   - 文件大小: ${fileSizeKB} KB`);
  console.log(`   - 输出: ${config.file}`);
  console.log('');
});

console.log('✅ 词库生成完成！\n');
console.log('📊 使用统计:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`B1使用: ${usedB1Count}/${b1Words.length}`);
console.log(`B2使用: ${usedB2Count}/${b2Words.length}`);
console.log(`C1使用: ${usedC1Count}/${c1Words.length}`);
console.log(`C2使用: ${c2Words.length}/${c2Words.length}`);
console.log(`总计分配: ${cumulativeCount}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
