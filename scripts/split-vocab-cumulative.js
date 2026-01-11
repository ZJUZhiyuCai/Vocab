/**
 * 按累计词汇量分段词典（方案 C - 混合命名）
 *
 * 基于实际考试的词汇量要求：
 * - 四级基础：0-4,500 词（A2）
 * - 六级进阶：4,501-6,000 词（六级新增）
 * - 雅思6.0突破：6,001-7,000 词（雅思6.0新增）
 * - 雅思7.0冲刺：7,001-9,000 词（雅思7.0新增）
 * - 雅思8.0通关：9,001+ 词（雅思8.0新增）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  inputFile: path.join(__dirname, '../public/data/vocab-filtered.json'),
  outputDir: path.join(__dirname, '../public/data'),
  levels: [
    {
      id: 'cet4-basic',
      name: '四级基础',
      description: '大学英语四级核心词汇',
      file: 'vocab-cet4-basic.json',
      icon: '📖',
      color: '#8da892',
      minIndex: 0,
      maxIndex: 4500,
      targetExam: '四级'
    },
    {
      id: 'cet6-advanced',
      name: '六级进阶',
      description: '大学英语六级新增词汇',
      file: 'vocab-cet6-advanced.json',
      icon: '📚',
      color: '#5c6b5c',
      minIndex: 4500,
      maxIndex: 6000,
      targetExam: '六级'
    },
    {
      id: 'ielts6-breakthrough',
      name: '雅思6.0突破',
      description: '雅思6.0水平新增词汇',
      file: 'vocab-ielts6-breakthrough.json',
      icon: '🎯',
      color: '#52667c',
      minIndex: 6000,
      maxIndex: 7000,
      targetExam: '雅思6.0'
    },
    {
      id: 'ielts7-sprint',
      name: '雅思7.0冲刺',
      description: '雅思7.0水平新增词汇',
      file: 'vocab-ielts7-sprint.json',
      icon: '🏆',
      color: '#7c6f62',
      minIndex: 7000,
      maxIndex: 9000,
      targetExam: '雅思7.0'
    },
    {
      id: 'ielts8-mastery',
      name: '雅思8.0通关',
      description: '雅思8.0及以上精通词汇',
      file: 'vocab-ielts8-mastery.json',
      icon: '💎',
      color: '#6b5c7c',
      minIndex: 9000,
      maxIndex: Infinity,
      targetExam: '雅思8.0+'
    }
  ]
};

console.log('📚 开始按累计词汇量分段词典...\n');

// 读取筛选后的词典
const filteredData = JSON.parse(fs.readFileSync(CONFIG.inputFile, 'utf8'));
const allWords = filteredData.words;

console.log(`📖 读取筛选词典: ${allWords.length} 个单词\n`);

// 按累计索引分段
CONFIG.levels.forEach((level, index) => {
  console.log(`📦 生成 ${level.name}:`);

  // 获取该级别的单词
  const levelWords = allWords.slice(level.minIndex, Math.min(level.maxIndex, allWords.length));

  console.log(`   - 单词数: ${levelWords.length}`);
  console.log(`   - 范围: 索引 ${level.minIndex} - ${Math.min(level.maxIndex, allWords.length - 1)}`);
  console.log(`   - 对应考试: ${level.targetExam}`);

  // 生成词典数据
  const vocabData = {
    version: '2.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    totalWords: levelWords.length,
    level: level.targetExam,
    description: level.description,
    cumulativeRange: `${level.minIndex}-${level.maxIndex === Infinity ? '∞' : level.maxIndex}`,
    words: levelWords
  };

  // 写入文件
  const outputPath = path.join(CONFIG.outputDir, level.file);
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

let cumulativeCount = 0;
CONFIG.levels.forEach((level, index) => {
  const count = Math.min(level.maxIndex, allWords.length) - level.minIndex;
  cumulativeCount += count;

  console.log(`${index + 1}. ${level.name}:`);
  console.log(`   - 新增词汇: ${count} 词`);
  console.log(`   - 累计词汇: ${Math.min(level.maxIndex, allWords.length)} 词`);
  console.log(`   - 对应考试: ${level.targetExam}`);
  console.log('');
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`总计: ${allWords.length} 词\n`);
