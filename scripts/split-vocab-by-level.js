/**
 * 按难度分段词典脚本
 *
 * 将筛选后的词典拆分为：
 * - 四级（A2）
 * - 六级（B1）
 * - 雅思6.0（B2）
 * - 雅思6.5（C1 高频）
 * - 雅思7.0（C1 核心）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  inputFile: path.join(__dirname, '../public/data/vocab-filtered.json'),
  outputDir: path.join(__dirname, '../public/data'),
  levels: {
    cet4: {
      name: '四级词汇',
      cefr: ['A2'],
      description: '大学英语四级词汇',
      file: 'vocab-cet4.json',
      color: '#8da892',
      icon: '📖',
      difficulty: 1,
      ielts: '四级'
    },
    cet6: {
      name: '六级词汇',
      cefr: ['B1'],
      description: '大学英语六级词汇（不含四级）',
      file: 'vocab-cet6.json',
      color: '#5c6b5c',
      icon: '📚',
      difficulty: 2,
      ielts: '六级'
    },
    ielts6: {
      name: '雅思6.0词汇',
      cefr: ['B2'],
      description: '雅思6.0水平词汇（不含六级）',
      file: 'vocab-ielts6.json',
      color: '#52667c',
      icon: '🎯',
      difficulty: 3,
      ielts: '6.0'
    },
    ielts65: {
      name: '雅思6.5词汇',
      cefr: ['C1'],
      description: '雅思6.5水平词汇（高频）',
      file: 'vocab-ielts65.json',
      color: '#7c6f62',
      icon: '🏆',
      difficulty: 4,
      ielts: '6.5',
      minFreq: 4  // C1 高频词
    },
    ielts7: {
      name: '雅思7.0词汇',
      cefr: ['C1'],
      description: '雅思7.0水平核心词汇',
      file: 'vocab-ielts7.json',
      color: '#6b5c7c',
      icon: '💎',
      difficulty: 5,
      ielts: '7.0',
      minFreq: 5  // C1 核心词
    }
  }
};

console.log('📚 开始按难度分段词典...\n');

// 读取筛选后的词典
const filteredData = JSON.parse(fs.readFileSync(CONFIG.inputFile, 'utf8'));
const allWords = filteredData.words;

console.log(`📖 读取筛选词典: ${allWords.length} 个单词\n`);

// 按级别分组单词
const levelGroups = {};
const levelKeys = Object.keys(CONFIG.levels);

levelKeys.forEach(levelKey => {
  levelGroups[levelKey] = [];
});

// 遍历所有单词，根据 CEFR 等级和 frequency 分组
allWords.forEach(word => {
  const cefr = word.cefr || '';

  // 四级（A2）
  if (cefr === 'A2') {
    levelGroups.cet4.push(word);
  }
  // 六级（B1）
  else if (cefr === 'B1') {
    levelGroups.cet6.push(word);
  }
  // 雅思6.0（B2）
  else if (cefr === 'B2') {
    levelGroups.ielts6.push(word);
  }
  // 雅思6.5 和 7.0（C1）
  else if (cefr === 'C1') {
    const freq = word.frequency || 0;

    // 雅思7.0（核心，frequency >= 5）
    if (freq >= 5) {
      levelGroups.ielts7.push(word);
    }
    // 雅思6.5（其他 C1 词，frequency < 5）
    else {
      levelGroups.ielts65.push(word);
    }
  }
});

// 生成各级别词典文件
levelKeys.forEach(levelKey => {
  const config = CONFIG.levels[levelKey];
  const words = levelGroups[levelKey];

  console.log(`📦 生成 ${config.name}:`);
  console.log(`   - 单词数: ${words.length}`);

  // 生成词典数据
  const vocabData = {
    version: '2.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    totalWords: words.length,
    level: config.cefr.join('+'),
    cefr: config.cefr,
    ielts: config.ielts,
    description: config.description,
    words: words
  };

  // 写入文件
  const outputPath = path.join(CONFIG.outputDir, config.file);
  fs.writeFileSync(outputPath, JSON.stringify(vocabData, null, 2), 'utf8');

  const fileSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(2);
  console.log(`   - 文件大小: ${fileSizeKB} KB`);
  console.log(`   - 输出路径: ${outputPath}`);
  console.log('');
});

// 统计信息
console.log('✅ 分段完成！\n');
console.log('📊 统计信息:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

levelKeys.forEach(levelKey => {
  const config = CONFIG.levels[levelKey];
  const count = levelGroups[levelKey].length;
  console.log(`${config.name}: ${count} 词`);
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const total = Object.values(levelGroups).reduce((sum, words) => sum + words.length, 0);
console.log(`总计: ${total} 词\n`);
