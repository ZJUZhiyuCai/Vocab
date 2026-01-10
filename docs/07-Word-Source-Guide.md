# 雅思词库数据源分析
# VocabContext 语境词汇学习工具

## 📊 GitHub资源分析

### 🏆 推荐资源1：zhenghaoyang24/english-vocabulary（最佳选择）

**仓库地址**：https://github.com/zhenghaoyang24/english-vocabulary

**包含内容**：
- ✅ **10万+单词**：双音音标、中文释义、单词频率
- ✅ **14万+例句**：中英文对照，例句热度
- ✅ **雅思词汇念念不忘乱序版**：直接可用！
- ✅ **托福高频词汇**：备用资源
- ✅ **数据格式**：SQL + JSON

**数据结构**：
```json
{
  "wordid": 77856,
  "spelling": "retract",
  "UKphonetic": "rɪˈtrækt",
  "USphonetic": "rɪˈtrækt",
  "paraphrase": "vt.& vi.撤回或撤消,缩回,缩进",
  "frequency": 0.420117543636206
}
```

**例句数据**：
```json
{
  "exapid": 141774,
  "wordid": 32667,
  "en": "You look fabulous — you'll knock 'em dead tonight.",
  "cn": "你看上去漂亮极了——今晚肯定把他们迷倒。",
  "heat": 0,
  "adddate": "2024-4-8"
}
```

**优势**：
- ✅ 数据丰富：音标、释义、例句齐全
- ✅ 有频率字段：可以按重要性排序
- ✅ 直接有雅思词书：不需要自己筛选
- ✅ JSON格式：直接可用

**Star数**：41⭐
**Fork数**：7

---

### 🥈 推荐资源2：KyleBing/english-vocabulary

**仓库地址**：https://github.com/KyleBing/english-vocabulary

**包含内容**：
- ✅ 四级词汇：7508个
- ✅ 六级词汇：5651个
- ✅ 考研词汇：9602个
- ✅ 托福词汇：13477个
- ✅ SAT词汇：8887个

**数据格式**：
- 乱序txt版本：`单词\t释义`
- 顺序json版本：包含词组搭配

**JSON数据示例**：
```json
{
  "word": "ability",
  "translations": [
    {"translation": "能力，能耐；才能", "type": "n"}
  ],
  "phrases": [
    {"phrase": "innovation ability", "translation": "创新能力"},
    {"phrase": "learning ability", "translation": "学习能力"},
    {"phrase": "ability to pay", "translation": "支付能力"}
  ]
}
```

**优势**：
- ✅ 词组搭配丰富
- ✅ 分类明确（四六级、托福等）
- ✅ 数据量适中

**Star数**：1.4k⭐（更受欢迎）

---

### 🥉 推荐资源3：lpmi-13/machine_readable_wordlists

**仓库地址**：https://github.com/lpmi-13/machine_readable_wordlists

**包含内容**：
- ✅ **Academic Word List (AWL)**：570个学术词族
- ✅ **GSL (General Service List)**：常用词汇
- ✅ 数据格式：YAML + JSON

**适用场景**：
- 学术英语基础
- 雅思阅读词汇

---

## 🎯 最佳方案推荐

### 方案A：直接使用（推荐MVP阶段）

**数据源**：zhenghaoyang24/english-vocabulary

**步骤**：
1. 下载仓库中的JSON文件
2. 提取雅思词汇部分（`雅思词汇念念不忘乱序版`）
3. 转换为我们的数据格式
4. 选择前100个高频词作为MVP

**优点**：
- ⚡ 最快速：数据已经整理好
- 🎯 最准确：直接是雅思词书
- 💎 最丰富：有音标、例句

---

### 方案B：组合使用（推荐完整版）

**数据源组合**：
1. 主数据源：zhenghaoyang24/english-vocabulary（词库+例句）
2. 补充搭配：KyleBing/english-vocabulary（词组）
3. 学术词汇：lpmi-13/machine_readable_wordlists（AWL）

**数据整合**：
```
基础词库（zhenghaoyang24）
  ├─ 单词信息
  ├─ 音标
  ├─ 释义
  └─ 例句

补充搭配（KyleBing）
  └─ 词组短语

学术词汇（lpmi-13）
  └─ 学术标记
```

---

## 📋 数据转换方案

### 从GitHub数据到我们的格式

**原数据结构**（zhenghaoyang24）：
```json
{
  "wordid": 77856,
  "spelling": "comprehensive",
  "UKphonetic": "/kəmˈprehensɪv/",
  "USphonetic": "/kəmˈprehensɪv/",
  "paraphrase": "adj. 全面的，综合的",
  "frequency": 0.8
}
```

**目标数据结构**（我们的）：
```json
{
  "id": "word_001",
  "word": "comprehensive",
  "ipa": "/kəmˈprehensɪv/",
  "partOfSpeech": "adj.",
  "meaning": "全面的，综合的",
  "level": "core",
  "frequency": 8.7,
  "collocations": ["comprehensive study", "comprehensive plan"],
  "synonyms": ["complete", "thorough"],
  "examples": [{
    "sentence": "The comprehensive strategy...",
    "translation": "全面的战略...",
    "source": "IELTS Reading"
  }]
}
```

**转换脚本**（需要编写）：
```javascript
// scripts/convertVocabulary.js

function convertToOurFormat(sourceData) {
  return {
    id: `word_${sourceData.wordid}`,
    word: sourceData.spelling,
    ipa: sourceData.UKphonetic,
    partOfSpeech: extractPOS(sourceData.paraphrase),
    meaning: cleanMeaning(sourceData.paraphrase),
    level: determineLevel(sourceData.frequency),
    frequency: normalizeFrequency(sourceData.frequency),
    examples: sourceData.examples || []
  }
}
```

---

## 🚀 实施计划

### 阶段1：数据获取（1小时）

```bash
# 1. 克隆仓库
git clone https://github.com/zhenghaoyang24/english-vocabulary.git temp_vocab

# 2. 查看文件结构
cd temp_vocab
ls -la

# 关键文件：
# - tb_vocabulary.json (词汇表)
# - tb_voc_examples.json (例句表)
# - tb_book.json (词书表)
```

### 阶段2：数据清洗（2-3小时）

**任务**：
1. 提取雅思词汇（通过词书ID）
2. 匹配例句
3. 格式转换
4. 数据验证

### 阶段3：数据补充（可选，1-2小时）

**从KyleBing补充**：
- 提取词组搭配
- 合并到主词库

### 阶段4：MVP数据准备（1小时）

**最终产物**：
- 100个雅思高频词
- 每个词包含：
  - 单词 + 音标 + 释义
  - 1个语境例句
  - （AI生成个性化例句 - 运行时生成）

---

## 📦 文件下载地址

### 直接下载链接

**zhenghaoyang24/english-vocabulary**：
- 词汇表：https://github.com/zhenghaoyang24/english-vocabulary/blob/master/tb_vocabulary.json
- 例句表：https://github.com/zhenghaoyang24/english-vocabulary/blob/master/tb_voc_examples.json
- 词书表：https://github.com/zhenghaoyang24/english-vocabulary/blob/master/tb_voc_book.json

**KyleBing/english-vocabulary**：
- 托福JSON：https://github.com/KyleBing/english-vocabulary/blob/master/托福.json
- 六级JSON：https://github.com/KyleBing/english-vocabulary/blob/master/六级.json

---

## 💡 快速开始脚本

```bash
# 创建数据目录
mkdir -p D:/my-projects/vocab-context/data

# 下载数据（使用curl）
# 方法1：词汇表
curl -o data/vocabulary.json https://raw.githubusercontent.com/zhenghaoyang24/english-vocabulary/master/tb_vocabulary.json

# 方法2：例句表
curl -o data/examples.json https://raw.githubusercontent.com/zhenghaoyang24/english-vocabulary/master/tb_voc_examples.json

# 方法3：词书表
curl -o data/books.json https://raw.githubusercontent.com/zhenghaoyang24/english-vocabulary/master/tb_book.json
```

---

## ⚠️ 注意事项

### 数据质量检查

1. **音标准确性**：抽查10个单词
2. **翻译准确性**：抽查10个例句
3. **格式一致性**：检查JSON格式
4. **重复数据**：检查是否有重复单词

### 版权问题

- 这些数据来自开源项目
- 个人使用没问题
- 如果公开部署，需要查看LICENSE
- zhenghaoyang24的仓库没有明确的LICENSE文件

### 数据大小估算

**zhenghaoyang24数据**：
- 词汇表JSON：约10MB
- 例句表JSON：约50MB
- 总计：约60MB

**优化方案**：
- MVP阶段：只取雅思词书（约2MB）
- 生产环境：使用数据库分页加载

---

## 🎯 MVP数据清单

**必需字段**（100词）：
- ✅ 单词
- ✅ 音标
- ✅ 词性
- ✅ 中文释义
- ✅ 1个例句（英文+中文）

**可选字段**（后续添加）：
- ⏸️ 搭配
- ⏸️ 同义词
- ⏸️ 记忆技巧
- ⏸️ 词频

---

## 📚 参考链接

- [GitHub仓库对比](https://github.com/topics/english-vocabulary)
- [Academic Word List官网](https://www.academicvocabularyexercises.com/awl/)
- [雅思词汇官方指南](https://www.ielts.org/for-organisations/ielts-scoring-in-detail)

---

**文档版本**：v1.0
**最后更新**：2026-01-10
**下一步**：下载数据并开始转换
