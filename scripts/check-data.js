import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./public/data/words-data.json', 'utf-8'));

console.log('当前前20个单词:');
console.log('序号. 单词 (长度) - 词性 - 频率');
console.log('━'.repeat(60));

data.words.slice(0, 20).forEach((w, i) => {
  console.log(`${String(i + 1).padStart(2)}. ${w.word.padEnd(10)} (${w.word.length}字母) - ${w.partOfSpeech.padEnd(5)} - 频率:${w.frequency}`);
});

console.log('\n统计信息:');
console.log(`总词数: ${data.totalWords}`);
console.log(`有例句的词: ${data.words.filter(w => w.examples.length > 0).length}`);
console.log(`平均词长: ${(data.words.reduce((sum, w) => sum + w.word.length, 0) / data.words.length).toFixed(1)}字母`);
