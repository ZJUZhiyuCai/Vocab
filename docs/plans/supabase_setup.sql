-- 1. user_settings - 用户设置
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_goal INTEGER DEFAULT 20,
  study_mode TEXT DEFAULT 'random' CHECK (study_mode IN ('random', 'sequence')),
  purpose TEXT DEFAULT 'exam' CHECK (purpose IN ('exam', 'work', 'academic', 'daily')),
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  current_vocab_id TEXT DEFAULT 'vocab-cet4-basic',
  api_key TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. vocabulary_progress - 词库学习进度
CREATE TABLE vocabulary_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vocab_id TEXT NOT NULL,
  learned_words JSONB DEFAULT '[]'::jsonb,
  forgotten_words JSONB DEFAULT '[]'::jsonb,
  current_index INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vocab_id)
);

-- 3. word_review_states - 间隔重复复习状态
CREATE TABLE word_review_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vocab_id TEXT NOT NULL,
  word_id INTEGER NOT NULL,
  interval_level INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  next_review TIMESTAMPTZ,
  last_review TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vocab_id, word_id)
);

-- 4. wordbook - 生词本
CREATE TABLE wordbook (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL,
  vocab_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id, vocab_id)
);

-- 5. study_history - 学习历史
CREATE TABLE study_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  words_learned INTEGER DEFAULT 0,
  study_time_seconds INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 6. achievements - 成就解锁
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 启用 RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_review_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can access own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own progress" ON vocabulary_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own review states" ON word_review_states FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own wordbook" ON wordbook FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own history" ON study_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own achievements" ON achievements FOR ALL USING (auth.uid() = user_id);
