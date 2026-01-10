import fs from 'fs';

const vocabulary = JSON.parse(fs.readFileSync('./data/vocabulary.json', 'utf-8'));

// 统计频率分布
const freqDist = {};
vocabulary.forEach(w => {
  const freq = w.frequency;
  freqDist[freq] = (freqDist[freq] || 0) + 1;
});

console.log('频率分布:');
Object.keys(freqDist).sort((a, b) => b - a).slice(0, 20).forEach(freq => {
  console.log(`频率${freq}: ${freqDist[freq]}个词`);
});

// 查看频率为0.8-0.9的词（可能是真正的高频学术词）
console.log('\n频率0.8的词（前20个）:');
const freq08 = vocabulary.filter(w => Math.abs(w.frequency - 0.8) < 0.01).slice(0, 20);
freq08.forEach((w, i) => {
  console.log(`${i+1}. ${w.spelling} (${w.spelling.length}字母) - 频率:${w.frequency}`);
});

// 查看不同频率段的词
console.log('\n频率0.5-0.9的词样例（前20个）:');
const midFreq = vocabulary.filter(w => w.frequency >= 0.5 && w.frequency <= 0.9 && w.spelling.length >= 5).slice(0, 20);
midFreq.forEach((w, i) => {
  console.log(`${i+1}. ${w.spelling} (${w.spelling.length}字母) - 频率:${w.frequency} - ${w.paraphrase?.substring(0, 50)}`);
});
