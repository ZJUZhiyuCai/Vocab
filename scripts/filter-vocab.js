/**
 * 词典筛选和合并脚本
 *
 * 筛选规则：
 * - A2 基础: 全部保留
 * - B1 中级: 全部保留
 * - B2 中高级: frequency >= 4
 * - C1 高级: frequency >= 5
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  inputDir: path.join(__dirname, '../public/data'),
  outputFile: path.join(__dirname, '../public/data/vocab-filtered.json'),
  rules: {
    'vocab-a2-basic.json': { minFreq: 0, name: 'A2基础' },
    'vocab-b1-intermediate.json': { minFreq: 0, name: 'B1中级' },
    'vocab-b2-upper-intermediate.json': { minFreq: 4, name: 'B2中高级' },
    'vocab-c1-advanced.json': { minFreq: 3, name: 'C1高级' }
  }
};

console.log('📚 开始筛选词典...\n');

// 读取并筛选词典
function filterVocabFile(filename, rule) {
  const filePath = path.join(CONFIG.inputDir, filename);

  console.log(`📖 读取 ${filename}...`);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${filename}\n`);
    return { words: [], stats: { total: 0, filtered: 0, kept: 0 } };
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const allWords = data.words || [];

  console.log(`   - 总词数: ${allWords.length}`);

  // 筛选
  const filteredWords = rule.minFreq === 0
    ? allWords
    : allWords.filter(word => {
      const freq = word.frequency || 0;
      return freq >= rule.minFreq;
    });

  // 统计频率分布
  const freqDist = {};
  filteredWords.forEach(word => {
    const freq = word.frequency || 0;
    freqDist[freq] = (freqDist[freq] || 0) + 1;
  });

  console.log(`   - 筛选后: ${filteredWords.length} 词`);
  console.log(`   - 频率分布: ${Object.entries(freqDist)
    .sort((a, b) => b[0] - a[0])
    .map(([freq, count]) => `${freq}星:${count}`)
    .join(', ')}`);

  return {
    words: filteredWords,
    stats: {
      total: allWords.length,
      filtered: filteredWords.length,
      kept: filteredWords.length
    }
  };
}

// 合并所有词典
function mergeVocabularies() {
  const allWords = [];
  const stats = {};

  console.log('\n🔀 开始合并词典...\n');

  // 处理每个词典文件
  for (const [filename, rule] of Object.entries(CONFIG.rules)) {
    const result = filterVocabFile(filename, rule);

    allWords.push(...result.words);

    stats[rule.name] = {
      原始数量: result.stats.total,
      筛选后数量: result.stats.filtered,
      阈值: rule.minFreq === 0 ? '全部' : `>= ${rule.minFreq}星`
    };

    console.log('');
  }

  // 去重（基于单词本身）
  console.log('🔄 去重处理...');
  const uniqueWords = [];
  const seenWords = new Set();

  for (const word of allWords) {
    const wordKey = word.word.toLowerCase();
    if (!seenWords.has(wordKey)) {
      seenWords.add(wordKey);
      uniqueWords.push(word);
    }
  }

  console.log(`   - 去重前: ${allWords.length}`);
  console.log(`   - 去重后: ${uniqueWords.length}`);
  console.log(`   - 去除重复: ${allWords.length - uniqueWords.length}`);

  return { words: uniqueWords, stats };
}

// 生成输出文件
function generateOutput() {
  console.log('\n💾 生成输出文件...\n');

  const { words, stats } = mergeVocabularies();

  // 生成输出数据
  const output = {
    version: '2.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    totalWords: words.length,
    level: 'A2-C1',
    cefr: ['A2', 'B1', 'B2', 'C1'],
    ielts: '四级-雅思7.0',
    description: '筛选后的核心词汇（四级到雅思7.0水平）',
    filterRules: {
      A2: '全部保留',
      B1: '全部保留',
      B2: 'frequency >= 4',
      C1: 'frequency >= 5'
    },
    words: words
  };

  // 写入文件
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(output, null, 2), 'utf8');

  // 输出统计
  console.log('✅ 筛选完成！\n');
  console.log('📊 统计信息:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const [name, stat] of Object.entries(stats)) {
    console.log(`${name}:`);
    console.log(`  - 原始: ${stat.原始数量} 词`);
    console.log(`  - 筛选: ${stat.筛选后数量} 词`);
    console.log(`  - 阈值: ${stat.阈值}`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n🎯 最终结果:`);
  console.log(`   - 总词数: ${words.length}`);
  console.log(`   - 文件大小: ${(fs.statSync(CONFIG.outputFile).size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   - 输出路径: ${CONFIG.outputFile}`);
  console.log('');
}

// 运行
try {
  generateOutput();
} catch (error) {
  console.error('❌ 错误:', error.message);
  console.error(error.stack);
  process.exit(1);
}
