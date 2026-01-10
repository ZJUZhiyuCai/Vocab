/**
 * 数据转换脚本
 * 从 zhenghaoyang24/english-vocabulary 格式转换为我们的格式
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 输入文件路径
const INPUT_DIR = path.join(__dirname, '../data');
const VOCAB_FILE = path.join(INPUT_DIR, 'vocabulary.json');
const EXAMPLES_FILE = path.join(INPUT_DIR, 'examples.json');
const BOOKS_FILE = path.join(INPUT_DIR, 'books.json');

// 输出文件路径
const OUTPUT_DIR = path.join(__dirname, '../public/data');

// 雅思词书ID
const IELTS_BOOK_ID = 4; // "雅思词汇念念不忘乱序版"

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始数据转换...\n');

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 读取数据
  console.log('📖 读取数据文件...');
  const vocabulary = readJSON(VOCAB_FILE);
  const examples = readJSON(EXAMPLES_FILE);
  const books = readJSON(BOOKS_FILE);

  console.log(`✓ 词汇表：${vocabulary.length} 条`);
  console.log(`✓ 例句表：${examples.length} 条`);
  console.log(`✓ 词书表：${books.length} 本`);

  // 查找雅思词书
  const ieltsBook = books.find(b => b.bookname.includes('雅思'));
  if (!ieltsBook) {
    console.error('❌ 未找到雅思词书！');
    process.exit(1);
  }
  console.log(`\n📚 找到雅思词书：${ieltsBook.bookname} (ID: ${ieltsBook.bookid})`);

  // 提取雅思词汇（这里简化处理，实际需要根据词书关联表）
  console.log('\n🔍 提取雅思高频词汇...');
  const ieltsWords = extractIeltsWords(vocabulary, 100);

  console.log(`✓ 提取了 ${ieltsWords.length} 个雅思高频词`);

  // 构建例句索引
  console.log('\n📝 构建例句索引...');
  const examplesMap = buildExamplesMap(examples);
  console.log(`✓ 例句索引构建完成`);

  // 转换为我们的格式
  console.log('\n🔄 转换数据格式...');
  const convertedWords = ieltsWords.map((word, index) => {
    const wordExamples = examplesMap.get(word.wordid) || [];

    return convertWordFormat(word, wordExamples, index);
  });

  // 保存MVP数据（100词）
  console.log('\n💾 保存MVP数据...');
  const mvpData = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    totalWords: convertedWords.length,
    words: convertedWords
  };

  const outputFile = path.join(OUTPUT_DIR, 'words-data.json');
  fs.writeFileSync(outputFile, JSON.stringify(mvpData, null, 2), 'utf-8');

  console.log(`✓ MVP数据已保存：${outputFile}`);
  console.log(`\n📊 数据统计：`);
  console.log(`   - 总词数：${mvpData.totalWords}`);
  console.log(`   - 有例句的词：${convertedWords.filter(w => w.examples.length > 0).length}`);
  console.log(`   - 文件大小：${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);

  console.log('\n✅ 数据转换完成！');
}

/**
 * 提取雅思高频词汇
 * 优化筛选逻辑，过滤简单词，保留真正有价值的雅思词汇
 */
function extractIeltsWords(vocabulary, count) {
  // 常见简单词黑名单（代词、介词、冠词、连词、常用动词等）
  const simpleWordsBlacklist = new Set([
    // 代词
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
    'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'whose',
    // 介词
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by', 'about', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between',
    // 冠词
    'a', 'an', 'the',
    // 连词
    'and', 'but', 'or', 'so', 'if', 'because', 'although', 'though', 'while',
    // 常用动词
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
    'get', 'got', 'go', 'goes', 'went', 'come', 'comes', 'came', 'make', 'makes',
    'see', 'saw', 'seen', 'know', 'knew', 'known', 'think', 'thought', 'take', 'took',
    // 口语化词汇
    'yeah', 'okay', 'gonna', 'wanna', 'gotta', 'kinda', 'sorta',
    // 其他超简单词
    'yes', 'no', 'not', 'very', 'more', 'most', 'some', 'any', 'all', 'each', 'every',
    'both', 'few', 'many', 'much', 'such', 'own', 'same', 'so', 'than', 'too',
    // 简单形容词和副词
    'good', 'bad', 'big', 'small', 'long', 'short', 'high', 'low', 'right', 'wrong',
    'well', 'just', 'like', 'time', 'back', 'look', 'down', 'off', 'out', 'up'
  ]);

  // 筛选有价值的词汇
  const validWords = vocabulary.filter(w => {
    // 频率必须在合理范围内（0.4-0.85），避开超高频基础词和低频生僻词
    if (w.frequency <= 0.4 || w.frequency >= 0.85) return false;

    // 单词长度 >= 6（过滤掉太短的词，要求更严格）
    if (w.spelling.length < 6) return false;

    // 单词长度 <= 15（过滤掉过长的词）
    if (w.spelling.length > 15) return false;

    // 不在黑名单中
    if (simpleWordsBlacklist.has(w.spelling.toLowerCase())) return false;

    // 必须是学术相关词性（名词、动词、形容词）
    const validPos = ['n.', 'v.', 'vi.', 'vt.', 'adj.', 'adv.'];
    const hasValidPos = validPos.some(pos => {
      const paraphrase = w.paraphrase || '';
      return paraphrase.includes(pos);
    });

    return hasValidPos;
  });

  // 按频率降序排序（高频在前）
  const sortedWords = validWords.sort((a, b) => b.frequency - a.frequency);

  // 取前N个
  return sortedWords.slice(0, count);
}

/**
 * 构建例句索引 Map<wordid, examples[]>
 */
function buildExamplesMap(examples) {
  const map = new Map();

  examples.forEach(ex => {
    if (!map.has(ex.wordid)) {
      map.set(ex.wordid, []);
    }
    map.get(ex.wordid).push(ex);
  });

  return map;
}

/**
 * 转换单词格式
 */
function convertWordFormat(sourceWord, examples, index) {
  // 提取词性
  const partOfSpeech = extractPartOfSpeech(sourceWord.paraphrase);

  // 清理释义
  const meaning = cleanMeaning(sourceWord.paraphrase);

  // 转换例句
  const convertedExamples = examples.slice(0, 3).map((ex, i) => ({
    id: `ex_${sourceWord.wordid}_${i + 1}`,
    sentence: ex.en,
    translation: ex.cn,
    source: 'IELTS Corpus',
    difficulty: 3,
    tags: []
  }));

  return {
    id: `word_${String(index + 1).padStart(3, '0')}`,
    word: sourceWord.spelling,
    ipa: sourceWord.UKphonetic || sourceWord.USphonetic || '',
    partOfSpeech: partOfSpeech,
    meaning: meaning,
    level: 'core',
    frequency: Math.round(sourceWord.frequency * 10), // 转换为1-10
    collocations: [], // 后续可以补充
    synonyms: [], // 后续可以补充
    examples: convertedExamples
  };
}

/**
 * 从释义中提取词性
 */
function extractPartOfSpeech(paraphrase) {
  if (!paraphrase) return '';

  const posMap = {
    'n.': 'n.',
    'v.': 'v.',
    'adj.': 'adj.',
    'adv.': 'adv.',
    'vi.': 'vi.',
    'vt.': 'vt.',
    'art.': 'art.',
    'prep.': 'prep.',
    'conj.': 'conj.',
    'pron.': 'pron.'
  };

  for (const [key, value] of Object.entries(posMap)) {
    if (paraphrase.includes(key)) {
      return value;
    }
  }

  return '';
}

/**
 * 清理释义（去除词性标记）
 */
function cleanMeaning(paraphrase) {
  if (!paraphrase) return '';

  return paraphrase
    .replace(/^(n\.|v\.|adj\.|adv\.|vi\.|vt\.|art\.|prep\.|conj\.|pron\.)\s*/, '')
    .trim();
}

/**
 * 读取JSON文件
 */
function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ 读取文件失败：${filePath}`);
    console.error(error.message);
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  console.error('❌ 发生错误：', error);
  process.exit(1);
});
