<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-beige-50 via-sage-50/30 to-blue-50/30">
    <!-- 入门测试弹窗 -->
    <OnboardingQuiz
      v-if="showOnboarding"
      @complete="handleOnboardingComplete"
    />

    <!-- 离线状态指示器 -->
    <div
      v-if="!isOnline"
      class="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-300 text-yellow-800 text-center py-2 px-4 z-50 flex items-center justify-center gap-2"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <span class="text-sm font-medium">离线模式</span>
    </div>

    <div class="flex flex-1" :class="{ 'mt-10': !isOnline }">
      <!-- 左侧边栏（桌面端显示） -->
      <Sidebar
        class="hidden lg:flex"
        :current-page="currentPage"
        :review-count="forgotten.size"
        :today-learned="learned.size"
        :today-target="userSettings.dailyGoal"
        :total-learned="learned.size"
        :accuracy="stats.accuracy"
        @navigate="handleNavigate"
        @open-settings="openSettings"
        @open-vocab-selector="showVocabSelector = true"
      />

      <!-- 主内容区 -->
      <main class="flex-1 overflow-y-auto">
        <!-- 今日学习页面 -->
        <div v-if="currentPage === 'today'" class="max-w-3xl mx-auto px-4 py-8">
          <!-- 移动端顶部导航 -->
          <header class="lg:hidden bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <h1 class="text-xl font-bold text-sage-500">VocabContext</h1>
              <button
                @click="showVocabSelector = true"
                class="text-xs px-2 py-1 rounded-full bg-sage-100 text-sage-700"
              >
                {{ currentVocab?.icon }} {{ currentVocab?.name || '加载中...' }}
              </button>
            </div>
            <button @click="openSettings" class="text-gray-500">⚙️</button>
          </header>

          <!-- 进度条卡片 -->
          <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span>学习进度</span>
              <span>{{ progress.learned }} / {{ progress.total }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>

          <!-- 骨架屏加载状态 -->
          <div v-if="isLoading" class="card">
            <div class="space-y-4">
              <!-- 单词标题骨架 -->
              <div class="flex justify-between items-start">
                <div class="flex-1 space-y-3">
                  <div class="skeleton-line h-8 w-32"></div>
                  <div class="skeleton-line h-4 w-48"></div>
                </div>
                <div class="skeleton-circle h-8 w-8"></div>
              </div>

              <!-- 释义骨架 -->
              <div class="space-y-2 pt-4">
                <div class="skeleton-line h-4 w-full"></div>
                <div class="skeleton-line h-4 w-5/6"></div>
                <div class="skeleton-line h-4 w-4/6"></div>
              </div>

              <!-- 例句骨架 -->
              <div class="space-y-2 pt-4">
                <div class="skeleton-line h-4 w-full"></div>
                <div class="skeleton-line h-4 w-3/4"></div>
              </div>

              <!-- 按钮骨架 -->
              <div class="flex gap-3 pt-6">
                <div class="skeleton-button flex-1 h-12"></div>
                <div class="skeleton-button flex-1 h-12"></div>
              </div>
            </div>
          </div>

          <!-- 单词卡片 -->
          <div
            v-if="!isLoading && currentWord"
            ref="wordCard"
            class="card"
            :class="{
              'animate-fade-in': !cardAnimation,
              'card-slide-left': cardAnimation === 'slide-left',
              'card-slide-right': cardAnimation === 'slide-right'
            }"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <!-- 触摸提示（仅移动端） -->
            <div class="lg:hidden text-center text-xs text-gray-400 mb-3 flex items-center justify-center gap-4">
              <span>← 认识</span>
              <span>左右滑动</span>
              <span>不认识 →</span>
            </div>

            <!-- 单词标题区 - 增强版 -->
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <h2 class="word-display mb-2">{{ currentWord.word }}</h2>
                <div class="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span v-if="currentWord.ipa" class="flex items-center gap-1">
                    <span>🔊</span>{{ currentWord.ipa }}
                  </span>
                  <span v-if="currentWord.partOfSpeech" class="tag">{{ currentWord.partOfSpeech }}</span>
                  <!-- 难度星级 -->
                  <div class="flex items-center gap-1">
                    <span v-for="i in 5" :key="i" class="text-sm"
                      :class="i <= (currentWord.frequency || 5) ? 'text-yellow-400' : 'text-gray-300'">★</span>
                  </div>
                </div>
              </div>
              <!-- 收藏按钮和场景标签 -->
              <div class="flex gap-2 items-center">
                <button
                  @click="toggleWordbook(currentWord.id)"
                  class="text-2xl favorite-btn"
                  :class="isWordbooked(currentWord.id) ? 'text-yellow-400' : 'text-gray-300'"
                  :title="isWordbooked(currentWord.id) ? '从单词本移除' : '添加到单词本'"
                >
                  {{ isWordbooked(currentWord.id) ? '⭐' : '☆' }}
                </button>
                <div class="flex gap-2">
                  <span class="tag text-xs bg-sage-100 text-sage-700">学术</span>
                  <span class="tag text-xs bg-blue-100 text-blue-700">雅思</span>
                </div>
              </div>
            </div>

            <!-- 释义 -->
            <div class="mb-4">
              <p class="text-gray-700 leading-relaxed">{{ currentWord.meaning }}</p>
            </div>

            <!-- 词根词缀区域 -->
            <div v-if="currentWord.etymology" class="mb-4 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <div class="text-xs text-purple-600 mb-1">🔤 词根词缀</div>
              <div class="text-sm text-gray-700 space-y-1">
                <div v-if="currentWord.etymology.root" class="flex items-center gap-2">
                  <span class="font-medium">词根:</span>
                  <span>{{ currentWord.etymology.root }}</span>
                </div>
                <div v-if="currentWord.etymology.prefix" class="flex items-center gap-2">
                  <span class="font-medium">前缀:</span>
                  <span>{{ currentWord.etymology.prefix }}</span>
                </div>
                <div v-if="currentWord.etymology.suffix" class="flex items-center gap-2">
                  <span class="font-medium">后缀:</span>
                  <span>{{ currentWord.etymology.suffix }}</span>
                </div>
                <div v-if="currentWord.etymology.mnemonic" class="text-xs text-purple-600 mt-2">
                  💡 {{ currentWord.etymology.mnemonic }}
                </div>
              </div>
            </div>
            <div v-else-if="userSettings.apiKey" class="mb-4">
              <button
                @click="loadEtymology(currentWord)"
                class="w-full py-2 px-4 rounded border border-dashed border-purple-300 text-purple-500 hover:bg-purple-50 text-sm"
                :disabled="loadingEtymology === currentWord.id"
              >
                {{ loadingEtymology === currentWord.id ? '⏳ 获取中...' : '🔤 查看词根词缀' }}
              </button>
            </div>

            <!-- 同义词 -->
            <div v-if="currentWord.synonyms && currentWord.synonyms.length > 0" class="mb-4">
              <div class="text-xs text-gray-600 mb-2">🔄 同义词</div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(synonym, index) in currentWord.synonyms.slice(0, 4)"
                  :key="index"
                  class="tag text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                >
                  {{ synonym }}
                </span>
              </div>
            </div>

            <!-- 语境例句 -->
            <div v-if="currentWord.examples && currentWord.examples.length > 0" class="sentence-box flex-grow mb-4">
              <div class="text-xs text-gray-600 mb-2">📖 语境例句</div>
              <p class="text-sm text-gray-800 leading-relaxed mb-2">
                <span v-html="highlightWord(currentWord.examples[0].sentence, currentWord.word)"></span>
              </p>
              <p class="text-xs text-gray-500">{{ currentWord.examples[0].translation }}</p>
            </div>

            <!-- AI例句区域 -->
            <div v-if="currentWord.aiExample" class="sentence-box flex-grow mb-4 border-l-4 border-sage-500 bg-gradient-to-r from-sage-50 to-white">
              <div class="flex items-center justify-between mb-2">
                <div class="text-xs text-sage-600 font-medium">🤖 AI个性化例句</div>
                <button
                  @click="generateExample(currentWord)"
                  class="text-xs text-sage-500 hover:text-sage-700"
                  :disabled="generatingWordId === currentWord.id"
                >
                  {{ generatingWordId === currentWord.id ? '生成中...' : '重新生成' }}
                </button>
              </div>
              <p class="text-sm text-gray-800 leading-relaxed mb-2">
                <span v-html="highlightWord(currentWord.aiExample.sentence, currentWord.word)"></span>
              </p>
              <p class="text-xs text-gray-500">{{ currentWord.aiExample.translation }}</p>
              <div v-if="currentWord.aiExample.basedOnPurpose" class="mt-2">
                <span class="text-xs text-gray-400">基于：{{ getPurposeLabel(currentWord.aiExample.basedOnPurpose) }}</span>
              </div>
            </div>

            <!-- 生成AI例句按钮 -->
            <div v-else class="mb-4">
              <button
                @click="generateExample(currentWord)"
                class="w-full py-3 px-4 rounded-md border-2 border-dashed border-sage-300 text-sage-500 hover:border-sage-500 hover:bg-sage-50 transition-all flex items-center justify-center gap-2"
                :disabled="generatingWordId === currentWord.id || !userSettings.apiKey"
              >
                <span v-if="generatingWordId === currentWord.id" class="animate-spin">⏳</span>
                <span v-else>✨</span>
                <span>{{ generatingWordId === currentWord.id ? '生成中...' : '生成AI例句' }}</span>
              </button>
              <p v-if="!userSettings.apiKey" class="text-xs text-gray-500 mt-2 text-center">
                请先在设置中配置API密钥
              </p>
            </div>

            <!-- 搭配 -->
            <div v-if="currentWord.collocations && currentWord.collocations.length > 0" class="mb-4">
              <div class="text-xs text-gray-600 mb-2">🔗 常用搭配</div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(collocation, index) in currentWord.collocations.slice(0, 3)"
                  :key="index"
                  class="tag"
                >
                  {{ collocation }}
                </span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-3 mt-auto pt-4">
              <button @click="handleKnow" class="flex-1 btn btn-success">认识 ✓</button>
              <button @click="handleForget" class="flex-1 btn btn-error">不认识 ✗</button>
            </div>

            <!-- 快捷键提示 -->
            <div class="mt-4 pt-4 border-t border-gray-100">
              <div class="text-xs text-gray-400 text-center space-y-1">
                <div>快捷键：<kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">空格</kbd> 认识 · <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">回车</kbd> 不认识 · <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">←</kbd> 上一个 · <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">→</kbd> 下一个</div>
                <div><kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">A</kbd> AI例句 <span class="hidden lg:inline">· <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">S</kbd> 设置</span></div>
                <div class="mt-2">
                  <button @click="restart" class="text-sage-500 hover:text-sage-700 underline">🔄 重新开始</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 完成状态 -->
          <div v-else-if="!isLoading" class="card text-center py-12">
            <div class="text-6xl mb-4">🎉</div>
            <h2 class="text-2xl font-bold text-sage-500 mb-2">恭喜完成！</h2>
            <p class="text-gray-600 mb-6">你已经学习了 {{ progress.learned }} 个单词</p>
            <button @click="restart" class="btn btn-primary">重新开始</button>
          </div>
        </div>

        <!-- 复习列表页面 -->
        <ReviewQueue
          v-else-if="currentPage === 'review'"
          :words="words"
          :review-states="reviewStates"
          @navigate="handleNavigate"
        />

        <!-- 单词本页面 -->
        <Wordbook
          v-else-if="currentPage === 'wordbook'"
          :words="words"
          :wordbook="wordbook"
          @back="currentPage = 'today'"
          @remove="removeFromWordbook"
          @batchRemove="handleBatchRemoveFromWordbook"
        />

        <!-- 测验页面 -->
        <Quiz
          v-else-if="currentPage === 'quiz'"
          :words="words"
          :learned="learned"
          :review-states="reviewStates"
          @navigate="handleNavigate"
        />

        <!-- 成就面板页面（包含成就和数据可视化） -->
        <div v-else-if="currentPage === 'achievements'" class="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <!-- 学习热力图 -->
          <StudyHeatmap />

          <!-- 成就系统 -->
          <AchievementsPanel />
        </div>
      </main>

      <!-- 右侧统计面板（桌面端显示） -->
      <StatsPanel
        class="hidden xl:block"
        :today-stats="todayStats"
      />
    </div>

    <!-- 词库选择弹窗 -->
    <div v-if="showVocabSelector" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-sage-500">选择词库</h2>
          <button @click="showVocabSelector = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <VocabularySelector @select="handleVocabularySelect" />
      </div>
    </div>

    <!-- 设置弹窗 -->
    <div v-if="showSettings" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-sage-500 mb-4">设置</h2>

        <!-- 学习计划 -->
        <div class="mb-6 pb-6 border-b border-gray-200">
          <h3 class="text-sm font-bold text-gray-700 mb-3">📚 学习计划</h3>

          <!-- 每日学习目标 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">每日学习目标</label>
            <div class="flex items-center gap-3">
              <input
                type="range"
                v-model.number="settingsForm.dailyGoal"
                min="5"
                max="100"
                step="5"
                class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sage-500"
              >
              <span class="text-sm font-medium text-sage-600 w-16 text-center">{{ settingsForm.dailyGoal }}个</span>
            </div>
          </div>

          <!-- 学习模式 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">学习模式</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="settingsForm.studyMode = 'sequence'"
                class="p-3 text-sm rounded-lg border transition-colors"
                :class="settingsForm.studyMode === 'sequence' ? 'border-sage-500 bg-sage-50 text-sage-700' : 'border-gray-200 text-gray-600 hover:border-sage-300'"
              >
                <div class="font-medium mb-1">📖 顺序学习</div>
                <div class="text-xs opacity-75">按顺序逐个学习</div>
              </button>
              <button
                @click="settingsForm.studyMode = 'random'"
                class="p-3 text-sm rounded-lg border transition-colors"
                :class="settingsForm.studyMode === 'random' ? 'border-sage-500 bg-sage-50 text-sage-700' : 'border-gray-200 text-gray-600 hover:border-sage-300'"
              >
                <div class="font-medium mb-1">🎲 随机学习</div>
                <div class="text-xs opacity-75">随机抽取单词</div>
              </button>
            </div>
          </div>
        </div>

        <!-- 学习目的 -->
        <div class="mb-6 pb-6 border-b border-gray-200">
          <h3 class="text-sm font-bold text-gray-700 mb-3">🎯 学习目的</h3>
          <p class="text-xs text-gray-500 mb-3">选择你的学习目的，AI会根据此生成个性化例句</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="settingsForm.purpose = 'exam'"
              class="p-3 text-sm rounded-lg border transition-colors"
              :class="settingsForm.purpose === 'exam' ? 'border-sage-500 bg-sage-50 text-sage-700' : 'border-gray-200 text-gray-600 hover:border-sage-300'"
            >
              <div class="font-medium mb-1">📚 备考</div>
              <div class="text-xs opacity-75">雅思、托福、GRE等</div>
            </button>
            <button
              @click="settingsForm.purpose = 'career'"
              class="p-3 text-sm rounded-lg border transition-colors"
              :class="settingsForm.purpose === 'career' ? 'border-sage-500 bg-sage-50 text-sage-700' : 'border-gray-200 text-gray-600 hover:border-sage-300'"
            >
              <div class="font-medium mb-1">💼 职场提升</div>
              <div class="text-xs opacity-75">商务、技术英语</div>
            </button>
            <button
              @click="settingsForm.purpose = 'hobby'"
              class="p-3 text-sm rounded-lg border transition-colors"
              :class="settingsForm.purpose === 'hobby' ? 'border-sage-500 bg-sage-50 text-sage-700' : 'border-gray-200 text-gray-600 hover:border-sage-300'"
            >
              <div class="font-medium mb-1">🎨 兴趣爱好</div>
              <div class="text-xs opacity-75">阅读、影视、旅行</div>
            </button>
            <button
              @click="settingsForm.purpose = 'daily'"
              class="p-3 text-sm rounded-lg border transition-colors"
              :class="settingsForm.purpose === 'daily' ? 'border-sage-500 bg-sage-50 text-sage-700' : 'border-gray-200 text-gray-600 hover:border-sage-300'"
            >
              <div class="font-medium mb-1">💬 日常交流</div>
              <div class="text-xs opacity-75">生活、社交对话</div>
            </button>
          </div>
        </div>

        <!-- AI设置 -->
        <div class="mb-4">
          <h3 class="text-sm font-bold text-gray-700 mb-3">🤖 AI功能</h3>

          <!-- API密钥输入 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">硅基流动API密钥</label>
            <input type="password" v-model="settingsForm.apiKey" placeholder="sk-..." class="input w-full">
            <p class="text-xs text-gray-500 mt-1">
              在<a href="https://docs.siliconflow.cn/cn/userguide/quickstart" target="_blank" class="text-sage-500 underline">硅基流动官网</a>获取免费API密钥
            </p>
          </div>
        </div>

        <!-- 云端同步 -->
        <div class="mb-4">
          <h3 class="text-sm font-bold text-gray-700 mb-3">☁️ 云端同步（GitHub Gist）</h3>

          <!-- GitHub Token -->
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-2">GitHub Personal Access Token</label>
            <input
              type="password"
              v-model="settingsForm.githubToken"
              placeholder="ghp_..."
              class="input w-full"
            >
            <p class="text-xs text-gray-500 mt-1">
              需要 <code>gist</code> 权限，
              <a href="https://github.com/settings/tokens/new" target="_blank" class="text-sage-500 underline">点击创建Token</a>
            </p>
          </div>

          <!-- 同步操作 -->
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="syncToCloud"
              :disabled="syncing || !settingsForm.githubToken"
              class="p-3 text-sm rounded-lg border border-gray-200 text-gray-600 hover:border-sage-300 hover:bg-sage-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div class="font-medium mb-1">🔄 立即同步</div>
              <div class="text-xs opacity-75">{{ syncing ? '同步中...' : '备份数据' }}</div>
            </button>
            <button
              @click="testGistConnection"
              :disabled="testingGist || !settingsForm.githubToken"
              class="p-3 text-sm rounded-lg border border-gray-200 text-gray-600 hover:border-sage-300 hover:bg-sage-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div class="font-medium mb-1">🔗 测试连接</div>
              <div class="text-xs opacity-75">{{ testingGist ? '测试中...' : '验证配置' }}</div>
            </button>
          </div>

          <!-- 同步状态 -->
          <div v-if="gistSyncStats.lastSync !== '从未同步'" class="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <span>上次同步: {{ gistSyncStats.lastSync }}</span>
            <span v-if="gistSyncStats.gistId" class="ml-2">ID: {{ gistSyncStats.gistId.slice(0, 8) }}...</span>
          </div>
        </div>

        <!-- 数据管理 -->
        <div class="mb-4">
          <h3 class="text-sm font-bold text-gray-700 mb-3">💾 数据管理</h3>

          <div class="grid grid-cols-2 gap-2 mb-3">
            <button
              @click="exportData"
              class="p-3 text-sm rounded-lg border border-gray-200 text-gray-600 hover:border-sage-300 hover:bg-sage-50 transition-colors"
            >
              <div class="font-medium mb-1">📄 导出数据</div>
              <div class="text-xs opacity-75">导出学习进度</div>
            </button>
            <button
              @click="exportToAnki"
              class="p-3 text-sm rounded-lg border border-gray-200 text-gray-600 hover:border-sage-300 hover:bg-sage-50 transition-colors"
            >
              <div class="font-medium mb-1">📇 导出Anki</div>
              <div class="text-xs opacity-75">导入到Anki</div>
            </button>
          </div>

          <!-- 重新测试按钮 -->
          <button
            @click="restartLevelTest"
            class="w-full p-3 text-sm rounded-lg border border-sage-300 text-sage-700 hover:bg-sage-50 transition-colors"
          >
            <div class="font-medium mb-1">📊 重新进行词汇测试</div>
            <div class="text-xs opacity-75">评估当前词汇量并推荐词库</div>
          </button>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="saveSettings" class="flex-1 btn btn-primary">保存</button>
          <button @click="closeSettings" class="flex-1 btn bg-gray-200 text-gray-700 hover:bg-gray-300">取消</button>
        </div>
      </div>
    </div>

    <!-- 成就解锁通知 -->
    <AchievementNotification
      v-if="currentAchievementNotification"
      :achievement="currentAchievementNotification"
      @close="onAchievementClose"
    />

    <!-- 词汇测试弹窗 -->
    <VocabLevelTest
      v-if="showVocabTest"
      @complete="handleVocabTestComplete"
    />

    <!-- 错误提示 -->
    <div v-if="error" class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-error text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up">
      {{ error }}
    </div>

    <!-- 移动端底部Tab栏 -->
    <MobileTabBar
      class="lg:hidden"
      :current-tab="currentPage"
      :review-count="forgotten.size"
      @navigate="handleMobileNavigate"
    />

    <!-- 底部致谢 -->
    <footer class="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-auto pb-20 lg:pb-6">
      <div class="max-w-6xl mx-auto px-4 py-6">
        <div class="text-center text-sm text-gray-600 space-y-2">
          <p class="font-medium text-sage-600">📚 数据来源致谢</p>
          <p>
            单词数据来自
            <a href="https://github.com/zhenghaoyang24/english-vocabulary" target="_blank" class="text-sage-500 hover:text-sage-700 underline">
              zhenghaoyang24/english-vocabulary
            </a>
            开源项目，感谢作者的辛勤贡献！
          </p>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-gray-500">
              Developed by
              <a href="https://github.com/ZJUZhiyuCai" target="_blank" class="text-sage-500 hover:text-sage-700 underline font-medium">
                ZJUZhiyuCai
              </a>
              · Powered by Vue 3 + Vite + Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { generateAIExample } from './utils/aiService.js'
import { getEtymology } from './utils/etymologyService.js'
import { loadSettings, saveSettings as saveSettingsToStorage, loadWordbook, saveWordbook, loadUserProfile, saveUserProfile, shouldShowOnboarding } from './utils/storage.js'
import { useConfetti } from './composables/useConfetti.js'
import Sidebar from './components/Sidebar.vue'
import StatsPanel from './components/StatsPanel.vue'
import Wordbook from './components/Wordbook.vue'
import ReviewQueue from './components/ReviewQueue.vue'
import MobileTabBar from './components/MobileTabBar.vue'
import VocabularySelector from './components/VocabularySelector.vue'
import Quiz from './components/Quiz.vue'
import OnboardingQuiz from './components/OnboardingQuiz.vue'
import VocabLevelTest from './components/VocabLevelTest.vue'
import {
  getCurrentVocabulary,
  loadCurrentVocabulary,
  getVocabularyProgress,
  saveVocabularyProgress
} from './utils/vocabularyManager.js'
import { getVocabularyLoader, clearVocabularyLoader } from './utils/vocabularyLoader.js'
import {
  createWordReviewState,
  needsReview,
  updateWordLevel,
  calculateNextReview,
  getReviewQueue,
  getTodayReviewStats
} from './utils/spacedRepetition.js'
import { recordTodayStudy, getStreakDays } from './utils/studyHistory.js'
import { checkAchievements } from './utils/achievements.js'
import AchievementsPanel from './components/AchievementsPanel.vue'
import AchievementNotification from './components/AchievementNotification.vue'
import StudyHeatmap from './components/StudyHeatmap.vue'
import {
  saveGistConfig,
  loadGistConfig,
  syncData,
  testGistConfig,
  getSyncStats
} from './utils/gistSync.js'

// 状态
const words = ref([])
const currentIndex = ref(0)
const learned = ref(new Set())
const forgotten = ref(new Set())
const wordbook = ref(new Set()) // 单词本
const wordCard = ref(null) // 单词卡片引用
const isLoading = ref(true) // 加载状态
const currentVocab = ref(null) // 当前词库
const showVocabSelector = ref(false) // 显示词库选择器

// 复习系统状态
const reviewStates = ref({}) // 单词ID -> 复习状态
const reviewQueue = ref([]) // 复习队列

// 卡片动画状态
const cardAnimation = ref('') // 'slide-left', 'slide-right', ''
const isCardAnimating = ref(false)

// 网络状态
const isOnline = ref(navigator.onLine)

// 触摸手势状态
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)
const isSwiping = ref(false)

// AI相关状态
const userSettings = ref({ apiKey: '', interests: [], dailyGoal: 20, studyMode: 'sequence' })
const settingsForm = ref({ apiKey: '', interests: [], dailyGoal: 20, studyMode: 'sequence', githubToken: '' })
const showSettings = ref(false)
const newInterest = ref('')
const generatingWordId = ref(null)
const loadingEtymology = ref(null)
const error = ref(null)

// 同步状态
const syncing = ref(false)
const testingGist = ref(false)
const gistSyncStats = ref({ lastSync: '从未同步', gistId: null, hasConfig: false })

// 用户画像状态
const userProfile = ref({ purpose: '' })
const showOnboarding = ref(false)
const showVocabTest = ref(false)  // 显示词汇测试弹窗

// 成就系统状态
const currentAchievementNotification = ref(null)
const sessionLearnCount = ref(0)  // 本次会话学习的单词数

// 页面状态
const currentPage = ref('today')

// 彩带动画
const { triggerConfetti } = useConfetti()

// 推荐标签
const recommendedTags = [
  '雅思考试', '托福', '商务英语',
  '计算机科学', '人工智能', '数据分析',
  '金融', '市场营销', '法律',
  '医学', '心理学', '教育学'
]

// 当前单词
const currentWord = computed(() => {
  return words.value[currentIndex.value] || null;
})

// 进度
const progress = computed(() => ({
  total: words.value.length,
  learned: learned.value.size,
}))

// 进度百分比
const progressPercentage = computed(() => {
  if (progress.value.total === 0) return 0
  return Math.round((progress.value.learned / progress.value.total) * 100)
})

// 统计数据
const stats = computed(() => {
  const total = learned.value.size + forgotten.value.size
  const accuracy = total > 0 ? Math.round((learned.value.size / total) * 100) : 0
  return {
    learned: learned.value.size,
    forgotten: forgotten.value.size,
    accuracy,
  }
})

// 今日统计
const todayStats = computed(() => ({
  newWords: learned.value.size,
  reviewWords: forgotten.value.size,
  aiExamples: words.value.filter(w => w.aiExample).length,
  duration: formatDuration(totalStudyTime.value + getSessionTime())
}))

// 学习时长统计
const sessionStartTime = ref(Date.now())
const totalStudyTime = ref(0) // 从localStorage加载的总时长（秒）
const isPageVisible = ref(true)

// 获取当前会话时长（秒）
const getSessionTime = () => {
  if (!isPageVisible.value) return 0
  return Math.floor((Date.now() - sessionStartTime.value) / 1000)
}

// 格式化时长显示
const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分` : `${hours}小时`
}

// 保存学习时长到localStorage
const saveStudyTime = () => {
  try {
    const currentSessionTime = getSessionTime()
    const totalTime = totalStudyTime.value + currentSessionTime
    localStorage.setItem('vocabcontext_study_time', totalTime.toString())
    totalStudyTime.value = totalTime
    sessionStartTime.value = Date.now() // 重置会话开始时间
  } catch (error) {
    console.error('保存学习时长失败:', error)
  }
}

// 加载学习时长
const loadStudyTime = () => {
  try {
    const saved = localStorage.getItem('vocabcontext_study_time')
    return saved ? parseInt(saved, 10) : 0
  } catch (error) {
    console.error('加载学习时长失败:', error)
    return 0
  }
};

// 高亮单词
const highlightWord = (sentence, word) => {
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  return sentence.replace(regex, `<span class="text-highlight">${word}</span>`);
};

// 处理"认识"
const handleKnow = () => {
  if (currentWord.value && !isCardAnimating.value) {
    // 创建或更新复习状态
    if (!reviewStates.value[currentWord.value.id]) {
      reviewStates.value[currentWord.value.id] = createWordReviewState();
    }
    const updated = updateWordLevel(
      reviewStates.value[currentWord.value.id].intervalLevel,
      true,
      reviewStates.value[currentWord.value.id].easeFactor
    );
    reviewStates.value[currentWord.value.id] = {
      ...reviewStates.value[currentWord.value.id],
      ...updated,
      nextReview: calculateNextReview(updated.intervalLevel, updated.easeFactor),
      lastReview: Date.now(),
      reviewCount: (reviewStates.value[currentWord.value.id].reviewCount || 0) + 1,
      correctCount: (reviewStates.value[currentWord.value.id].correctCount || 0) + 1
    };

    learned.value.add(currentWord.value.id);
    saveReviewStates();
    updateReviewQueue();

    // 记录学习历史（每次学习都记录）
    recordTodayStudy(1);
    sessionLearnCount.value++;

    // 检测成就
    checkAndUnlockAchievements();

    animateCardAndNext('slide-left');
    triggerHapticFeedback();
  }
};

// 处理"不认识"
const handleForget = () => {
  if (currentWord.value && !isCardAnimating.value) {
    // 创建或更新复习状态
    if (!reviewStates.value[currentWord.value.id]) {
      reviewStates.value[currentWord.value.id] = createWordReviewState();
    }
    const updated = updateWordLevel(
      reviewStates.value[currentWord.value.id].intervalLevel,
      false,
      reviewStates.value[currentWord.value.id].easeFactor
    );
    reviewStates.value[currentWord.value.id] = {
      ...reviewStates.value[currentWord.value.id],
      ...updated,
      nextReview: calculateNextReview(updated.intervalLevel, updated.easeFactor),
      lastReview: Date.now(),
      reviewCount: (reviewStates.value[currentWord.value.id].reviewCount || 0) + 1,
      incorrectCount: (reviewStates.value[currentWord.value.id].incorrectCount || 0) + 1
    };

    forgotten.value.add(currentWord.value.id);
    saveReviewStates();
    updateReviewQueue();

    // 记录学习历史（每次学习都记录）
    recordTodayStudy(1);
    sessionLearnCount.value++;
    console.log('不认识 - 记录学习历史 +1');

    // 检测成就
    checkAndUnlockAchievements();

    animateCardAndNext('slide-right');
    triggerHapticFeedback();
  }
};

// 卡片动画并切换到下一个
const animateCardAndNext = (animationType) => {
  isCardAnimating.value = true;
  cardAnimation.value = animationType;

  // 等待动画完成后切换到下一个单词
  setTimeout(() => {
    nextWord();
    cardAnimation.value = '';
    isCardAnimating.value = false;

    // 保存进度
    saveCurrentProgress();
  }, 300);
};

// 触觉反馈（震动）
const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10); // 轻微震动10ms
  }
};

// 下一个单词
const nextWord = () => {
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++;
  }
};

// 上一个单词
const previousWord = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

// 获取复习统计（用于测验页面）
const reviewStats = computed(() => {
  return getTodayReviewStats(reviewStates.value);
});

// 获取复习队列详细数据（用于预览）
const reviewQueueData = computed(() => {
  return reviewQueue.value.map(wordId => {
    const word = words.value.find(w => w.id === wordId);
    const reviewState = reviewStates.value[wordId];
    return { word, reviewState };
  }).filter(item => item.word); // 过滤掉找不到的单词
});

// ===== 成就系统 =====

// 检测并解锁成就
const checkAndUnlockAchievements = () => {
  const hour = new Date().getHours()

  // 准备统计数据（使用achievementStats避免与computed stats冲突）
  const achievementStats = {
    totalLearned: learned.value.size,
    streakDays: getStreakDays(),
    sessionCount: sessionLearnCount.value,
    accuracy: stats.value.accuracy,
    hour,
    vocabProgress: {}
  }

  // 添加各词库进度
  const vocabularies = ['vocab-a2-basic', 'vocab-b1-intermediate', 'vocab-b2-upper-intermediate', 'vocab-c1-advanced', 'vocab-c2-proficiency']
  vocabularies.forEach(vocabId => {
    try {
      const progress = getVocabularyProgress(vocabId)
      const totalWords = progress.total || 0
      const learnedCount = (progress.learned || []).length
      achievementStats.vocabProgress[vocabId] = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0
    } catch {
      achievementStats.vocabProgress[vocabId] = 0
    }
  })

  // 检查成就
  const newAchievements = checkAchievements(achievementStats)

  // 显示成就解锁通知
  if (newAchievements.length > 0) {
    newAchievements.forEach((achievement, index) => {
      setTimeout(() => {
        showAchievementNotification(achievement)
        triggerConfetti()
      }, index * 1000) // 每个成就间隔1秒显示
    })
  }
}

// 显示成就解锁通知
const showAchievementNotification = (achievement) => {
  currentAchievementNotification.value = achievement
  console.log('🏆 成就解锁:', achievement.name)
}

// 成就通知关闭回调
const onAchievementClose = () => {
  currentAchievementNotification.value = null
}

// ===== 单词本功能 =====

// 检查单词是否已收藏
const isWordbooked = (wordId) => {
  return wordbook.value.has(wordId);
};

// 添加到单词本
const addToWordbook = (wordId) => {
  wordbook.value.add(wordId);
  saveWordbook(wordbook.value);
};

// 从单词本移除
const removeFromWordbook = (wordId) => {
  wordbook.value.delete(wordId);
  saveWordbook(wordbook.value);
};

// 批量从单词本移除
const handleBatchRemoveFromWordbook = (wordIds) => {
  wordIds.forEach(wordId => {
    wordbook.value.delete(wordId);
  });
  saveWordbook(wordbook.value);
};

// 切换单词收藏状态
const toggleWordbook = (wordId) => {
  if (isWordbooked(wordId)) {
    removeFromWordbook(wordId);
  } else {
    addToWordbook(wordId);
  }
};

// 重新开始
const restart = async () => {
  console.log('🔄 重新开始学习');

  // 重置状态
  currentIndex.value = 0;
  learned.value.clear();
  forgotten.value.clear();

  // 清除当前词库的进度
  const key = `vocabcontext_progress_${currentVocab.value.id}`;
  localStorage.removeItem(key);
  console.log(`🗑️ 已清除词库进度: ${key}`);

  // 清除复习状态
  const reviewKey = `vocabcontext_review_${currentVocab.value.id}`;
  localStorage.removeItem(reviewKey);
  reviewStates.value = {};
  console.log(`🗑️ 已清除复习状态: ${reviewKey}`);

  // 重新加载数据（确保界面更新）
  await loadData();

  console.log('✅ 重新开始完成');
};

// 创建随机懒加载单词数组（真正从整个词库随机）
const createRandomLazyWordArray = (loader, totalCount, randomIndices) => {
  const loadedWords = new Map(); // 随机索引 -> 单词
  const loadingPromises = new Map(); // 随机索引 -> 加载Promise

  // 预加载前300个随机位置的单词
  const preloadSize = Math.min(300, totalCount);
  const preloadPromises = [];

  console.log(`🎲 随机模式：预加载前 ${preloadSize} 个随机单词...`);

  // 批量加载随机单词（优化性能）
  for (let i = 0; i < preloadSize; i++) {
    const randomIndex = randomIndices[i];
    const loadPromise = (async () => {
      try {
        const wordsSlice = await loader.getWordsRange(randomIndex, 1);
        if (wordsSlice && wordsSlice.length > 0) {
          loadedWords.set(randomIndex, wordsSlice[0]);
          return wordsSlice[0];
        }
      } catch (err) {
        console.error(`加载随机索引 ${randomIndex} 失败:`, err);
      }
    })();
    preloadPromises.push(loadPromise);
    loadingPromises.set(randomIndex, loadPromise);
  }

  // 等待预加载完成
  Promise.all(preloadPromises).then(() => {
    console.log(`✅ 随机预加载完成 (${preloadSize} 个单词)`);
  });

  // 创建懒加载函数
  const ensureLoaded = async (displayIndex) => {
    // displayIndex是用户看到的索引（0, 1, 2...）
    // randomIndex是实际词库中的索引
    const randomIndex = randomIndices[displayIndex];

    if (loadedWords.has(randomIndex)) {
      return loadedWords.get(randomIndex);
    }

    if (loadingPromises.has(randomIndex)) {
      return await loadingPromises.get(randomIndex);
    }

    const loadPromise = (async () => {
      try {
        const wordsSlice = await loader.getWordsRange(randomIndex, 1);
        if (wordsSlice && wordsSlice.length > 0) {
          loadedWords.set(randomIndex, wordsSlice[0]);
          return wordsSlice[0];
        }
        return null;
      } catch (err) {
        console.error(`加载随机索引 ${randomIndex} 失败:`, err);
        return null;
      }
    })();

    loadingPromises.set(randomIndex, loadPromise);
    const result = await loadPromise;
    loadingPromises.delete(randomIndex);

    return result;
  };

  // 返回一个类数组对象
  const arrayProxy = [];
  arrayProxy.length = totalCount;

  return new Proxy(arrayProxy, {
    get(target, prop) {
      if (prop === 'length') return totalCount;

      if (typeof prop === 'symbol') {
        return target[prop];
      }

      if (typeof prop === 'string' && prop in Array.prototype) {
        return target[prop];
      }

      const displayIndex = parseInt(prop);
      if (!isNaN(displayIndex) && displayIndex >= 0 && displayIndex < totalCount) {
        const randomIndex = randomIndices[displayIndex];
        const word = loadedWords.get(randomIndex);

        if (word) {
          // 预加载接下来的单词（后台进行）
          if (displayIndex > 0 && displayIndex % 50 === 0) {
            const preloadIndex = displayIndex + 50;
            if (preloadIndex < totalCount) {
              ensureLoaded(preloadIndex);
            }
          }
          return word;
        }

        // 未加载：触发异步加载，但不等待
        ensureLoaded(displayIndex);
        return null;
      }

      return target[prop];
    },

    set(target, prop, value) {
      const displayIndex = parseInt(prop);
      if (!isNaN(displayIndex) && displayIndex >= 0) {
        const randomIndex = randomIndices[displayIndex];
        loadedWords.set(randomIndex, value);
        return true;
      }
      return false;
    }
  });
};

// 随机打乱单词顺序（从整个词库随机）
const shuffleWords = async () => {
  if (!words.value || words.value.length === 0) return;

  const totalCount = words.value.length;
  console.log(`🔀 开始从 ${totalCount} 个单词中生成随机顺序...`);

  // 生成随机索引数组（Fisher-Yates洗牌算法）
  const randomIndices = Array.from({ length: totalCount }, (_, i) => i);

  for (let i = totalCount - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomIndices[i], randomIndices[j]] = [randomIndices[j], randomIndices[i]];
  }

  console.log(`🎲 随机索引数组生成完成，示例：`);
  console.log(`   - 前10个原始索引: ${randomIndices.slice(0, 10).join(', ')}`);
  console.log(`   - 涵盖范围: 0 - ${totalCount - 1}`);

  // 使用随机索引数组创建懒加载包装器
  const loader = getVocabularyLoader(currentVocab.value.file);

  // 创建随机懒加载数组
  words.value = createRandomLazyWordArray(loader, totalCount, randomIndices);

  // 重置到第一个单词
  currentIndex.value = 0;

  console.log(`✅ 已创建 ${totalCount} 个单词的随机学习顺序`);
};

// 加载数据
const loadData = async () => {
  isLoading.value = true;

  try {
    // 加载当前词库
    currentVocab.value = loadCurrentVocabulary();

    console.log('📚 开始加载词库:', currentVocab.value.name, currentVocab.value.file);

    // 懒加载：只加载元数据和第一批单词
    const loader = getVocabularyLoader(currentVocab.value.file);

    // 获取总单词数（用于显示进度）
    const totalCount = await loader.getTotalCount();
    console.log(`📊 词库总单词数: ${totalCount}`);

    // 加载该词库的学习进度
    const progress = getVocabularyProgress(currentVocab.value.id);
    learned.value = new Set(progress.learned || []);
    forgotten.value = new Set(progress.forgotten || []);
    currentIndex.value = progress.currentIndex || 0;

    console.log(`📍 当前进度: currentIndex=${currentIndex.value}, learned=${learned.value.size}`);

    // 检查是否是随机模式
    const isRandomMode = userSettings.value.studyMode === 'random';

    if (isRandomMode) {
      // 随机模式：直接生成随机索引数组并创建随机懒加载数组
      console.log('🎲 随机学习模式，从整个词库生成全局随机顺序...');

      // 生成随机索引数组（Fisher-Yates洗牌算法）
      const randomIndices = Array.from({ length: totalCount }, (_, i) => i);
      for (let i = totalCount - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomIndices[i], randomIndices[j]] = [randomIndices[j], randomIndices[i]];
      }

      console.log(`   前10个随机索引: ${randomIndices.slice(0, 10).join(', ')}`);

      // 创建随机懒加载数组
      words.value = createRandomLazyWordArray(loader, totalCount, randomIndices);
    } else {
      // 顺序模式：加载当前进度附近的单词
      const preloadSize = 300; // 预加载300个单词
      const startIdx = Math.max(0, currentIndex.value - 50);
      console.log(`🔜 准备预加载: start=${startIdx}, size=${preloadSize}`);

      const initialWords = await loader.getWordsRange(startIdx, preloadSize);
      console.log(`✅ 实际加载了 ${initialWords.length} 个单词`);
      console.log(`🎯 当前单词 (${currentIndex.value}):`, initialWords[currentIndex.value - startIdx]?.word || 'NOT FOUND');

      // 创建顺序懒加载包装数组
      words.value = createLazyWordArray(loader, totalCount, startIdx, initialWords);
    }

    console.log(`📦 words.value.length=${words.value.length}`);

    // 加载复习状态
    loadReviewStates();

    // 计算复习队列
    updateReviewQueue();
  } catch (error) {
    console.error('❌ 加载数据失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 创建懒加载单词数组（简化版）
const createLazyWordArray = (loader, totalCount, startIdx, initialWords) => {
  const loadedWords = new Map(); // 索引 -> 单词
  const loadingPromises = new Map(); // 索引 -> 加载Promise

  // 初始化已加载的单词
  initialWords.forEach((word, i) => {
    const globalIndex = startIdx + i;
    loadedWords.set(globalIndex, word);
  });

  console.log(`📦 已预加载 ${initialWords.length} 个单词 (索引 ${startIdx} - ${startIdx + initialWords.length - 1})`);

  // 创建懒加载函数
  const ensureLoaded = async (index) => {
    // 如果已加载，直接返回
    if (loadedWords.has(index)) {
      return loadedWords.get(index);
    }

    // 如果正在加载，等待完成
    if (loadingPromises.has(index)) {
      return await loadingPromises.get(index);
    }

    // 开始加载
    const loadPromise = (async () => {
      try {
        const wordsSlice = await loader.getWordsRange(index, 100);
        wordsSlice.forEach((word, i) => {
          loadedWords.set(index + i, word);
        });
        return loadedWords.get(index);
      } catch (err) {
        console.error(`加载单词 ${index} 失败:`, err);
        return null;
      }
    })();

    loadingPromises.set(index, loadPromise);
    const result = await loadPromise;
    loadingPromises.delete(index);

    return result;
  };

  // 返回一个类数组对象
  const arrayProxy = [];

  // 重写常用方法
  arrayProxy.length = totalCount;

  // 索引访问
  return new Proxy(arrayProxy, {
    get(target, prop) {
      // 处理 length 属性
      if (prop === 'length') return totalCount;

      // 处理 Symbol 属性（Vue 内部使用）
      if (typeof prop === 'symbol') {
        return target[prop];
      }

      // 处理数组方法（slice, map, forEach 等）
      if (typeof prop === 'string' && prop in Array.prototype) {
        return target[prop];
      }

      // 处理数字索引
      const index = parseInt(prop);
      if (!isNaN(index) && index >= 0 && index < totalCount) {
        const word = loadedWords.get(index);

        // 如果已加载，直接返回
        if (word) {
          // 预加载接下来的单词（后台进行）
          if (index > 0 && index % 50 === 0) {
            const preloadIndex = index + 50;
            if (preloadIndex < totalCount && !loadedWords.has(preloadIndex)) {
              ensureLoaded(preloadIndex);
            }
          }
          return word;
        }

        // 未加载：触发异步加载，但不等待
        ensureLoaded(index); // 不等待，后台加载
        return null; // 暂时返回null
      }

      return target[prop];
    },

    set(target, prop, value) {
      const index = parseInt(prop);
      if (!isNaN(index) && index >= 0) {
        loadedWords.set(index, value);
        return true;
      }
      return false;
    }
  });
};

// 加载复习状态
const loadReviewStates = () => {
  try {
    const key = `vocabcontext_review_${currentVocab.value.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      reviewStates.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载复习状态失败:', error);
    reviewStates.value = {};
  }
};

// 保存复习状态
const saveReviewStates = () => {
  try {
    const key = `vocabcontext_review_${currentVocab.value.id}`;
    localStorage.setItem(key, JSON.stringify(reviewStates.value));
  } catch (error) {
    console.error('保存复习状态失败:', error);
  }
};

// 更新复习队列
const updateReviewQueue = () => {
  reviewQueue.value = getReviewQueue(reviewStates.value, 50);
};

// 切换词库
const handleVocabularySelect = (vocab) => {
  // 保存当前词库的进度
  saveCurrentProgress();

  // 更新当前词库
  currentVocab.value = vocab;

  // 重新加载数据
  loadData();
};

// 保存当前词库进度
const saveCurrentProgress = () => {
  if (!currentVocab.value) return;

  const progress = {
    learned: Array.from(learned.value),
    forgotten: Array.from(forgotten.value),
    currentIndex: currentIndex.value
  };

  saveVocabularyProgress(currentVocab.value.id, progress);
};

// ===== 云端同步相关方法 =====

// 更新同步统计
const updateGistSyncStats = () => {
  gistSyncStats.value = getSyncStats()
};

// 同步到云端
const syncToCloud = async () => {
  if (!settingsForm.value.githubToken) {
    error.value = '请先配置GitHub Token'
    setTimeout(() => { error.value = null }, 3000)
    return
  }

  syncing.value = true
  error.value = null

  try {
    const result = await syncData(settingsForm.value.githubToken)
    console.log('✅ 同步成功:', result)

    // 显示成功提示
    error.value = `同步成功！Gist: ${result.gistId.slice(0, 8)}...`
    setTimeout(() => { error.value = null }, 3000)

    updateGistSyncStats()
  } catch (err) {
    console.error('❌ 同步失败:', err)
    error.value = `同步失败: ${err.message}`
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    syncing.value = false
  }
};

// 测试Gist连接
const testGistConnection = async () => {
  if (!settingsForm.value.githubToken) {
    error.value = '请先配置GitHub Token'
    setTimeout(() => { error.value = null }, 3000)
    return
  }

  testingGist.value = true
  error.value = null

  try {
    const result = await testGistConfig(settingsForm.value.githubToken)
    if (result.success) {
      error.value = `连接成功！GitHub用户: ${result.username}`
      setTimeout(() => { error.value = null }, 3000)
    } else {
      error.value = `连接失败: ${result.error}`
      setTimeout(() => { error.value = null }, 5000)
    }
  } catch (err) {
    error.value = `测试失败: ${err.message}`
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    testingGist.value = false
  }
};

// ===== 设置相关方法 =====
const openSettings = () => {
  settingsForm.value = {
    apiKey: userSettings.value.apiKey,
    interests: [...userSettings.value.interests],
    dailyGoal: userSettings.value.dailyGoal || 20,
    studyMode: userSettings.value.studyMode || 'sequence',
    purpose: userProfile.value.purpose || 'daily',
    githubToken: ''
  };

  // 从Gist配置加载GitHub Token
  const gistConfig = loadGistConfig()
  if (gistConfig && gistConfig.token) {
    settingsForm.value.githubToken = gistConfig.token
  }

  // 更新同步统计
  updateGistSyncStats()

  showSettings.value = true
};

const closeSettings = () => {
  showSettings.value = false;
};

const saveSettings = () => {
  userSettings.value = {
    apiKey: settingsForm.value.apiKey.trim(),
    interests: [...settingsForm.value.interests],
    dailyGoal: settingsForm.value.dailyGoal,
    studyMode: settingsForm.value.studyMode
  };
  saveSettingsToStorage(userSettings.value);

  // 保存GitHub Token到Gist配置
  if (settingsForm.value.githubToken) {
    const config = loadGistConfig() || {};
    config.token = settingsForm.value.githubToken.trim();
    saveGistConfig(config);
  }

  // 保存用户画像(学习目的)
  userProfile.value.purpose = settingsForm.value.purpose;
  saveUserProfile(userProfile.value);

  showSettings.value = false;

  // 如果学习模式是随机,重新洗牌单词
  if (userSettings.value.studyMode === 'random') {
    shuffleWords();
  }

  // 更新同步统计
  updateGistSyncStats();
};

const addInterest = () => {
  const trimmed = newInterest.value.trim();
  if (trimmed && !settingsForm.value.interests.includes(trimmed)) {
    settingsForm.value.interests.push(trimmed);
    newInterest.value = '';
  }
};

const removeInterest = (index) => {
  settingsForm.value.interests.splice(index, 1);
};

const addRecommendedTag = (tag) => {
  if (!settingsForm.value.interests.includes(tag)) {
    settingsForm.value.interests.push(tag);
  }
};

// 导出学习数据
const exportData = () => {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    userSettings: userSettings.value,
    progress: {
      learned: Array.from(learned.value),
      forgotten: Array.from(forgotten.value),
      currentIndex: currentIndex.value
    },
    wordbook: Array.from(wordbook.value),
    studyTime: {
      totalSeconds: totalStudyTime.value + getSessionTime(),
      sessions: [] // 可以扩展保存每次学习会话
    }
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vocab-context-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // 显示成功提示
  error.value = '数据导出成功!';
  setTimeout(() => { error.value = null; }, 3000);
};

// 导出为Anki格式
const exportToAnki = () => {
  let content = '';

  // 导出已学习的单词
  const learnedWords = words.value.filter(w => learned.value.has(w.id));
  learnedWords.forEach(word => {
    const front = word.word;
    const back = `${word.meaning}\n\n${word.ipa ? '发音: ' + word.ipa : ''}${word.examples && word.examples.length > 0 ? '\n\n例句:\n' + word.examples[0].sentence : ''}`;
    const tags = 'learned';

    content += `${front}\t${back}\t${tags}\n`;
  });

  // 导出需复习的单词
  const forgottenWords = words.value.filter(w => forgotten.value.has(w.id));
  forgottenWords.forEach(word => {
    const front = word.word;
    const back = `${word.meaning}\n\n${word.ipa ? '发音: ' + word.ipa : ''}${word.examples && word.examples.length > 0 ? '\n\n例句:\n' + word.examples[0].sentence : ''}`;
    const tags = 'review';

    content += `${front}\t${back}\t${tags}\n`;
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vocab-context-anki-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // 显示成功提示
  error.value = `已导出 ${learnedWords.length + forgottenWords.length} 个单词到 Anki 格式!`;
  setTimeout(() => { error.value = null; }, 3000);
};

// ===== AI例句生成 =====
const generateExample = async (word) => {
  if (!userSettings.value.apiKey) {
    error.value = '请先配置API密钥';
    setTimeout(() => { error.value = null; }, 3000);
    return;
  }

  generatingWordId.value = word.id;
  error.value = null;

  try {
    const result = await generateAIExample({
      apiKey: userSettings.value.apiKey,
      word: word.word,
      meaning: word.meaning,
      purpose: userProfile.value.purpose || 'daily'
    });

    const wordIndex = words.value.findIndex(w => w.id === word.id);
    if (wordIndex !== -1) {
      words.value[wordIndex].aiExample = {
        sentence: result.sentence,
        translation: result.translation,
        generatedAt: new Date().toISOString(),
        basedOnPurpose: userProfile.value.purpose || 'daily'
      };
    }

    triggerConfetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  } catch (err) {
    console.error('生成AI例句失败:', err);
    error.value = err.message || '生成失败，请重试';
    setTimeout(() => { error.value = null; }, 3000);
  } finally {
    generatingWordId.value = null;
  }
};

// ===== 词根词缀获取 =====
const loadEtymology = async (word) => {
  if (!userSettings.value.apiKey) {
    error.value = '请先配置API密钥';
    setTimeout(() => { error.value = null; }, 3000);
    return;
  }

  loadingEtymology.value = word.id;
  error.value = null;

  try {
    const result = await getEtymology({
      apiKey: userSettings.value.apiKey,
      word: word.word
    });

    if (result) {
      const wordIndex = words.value.findIndex(w => w.id === word.id);
      if (wordIndex !== -1) {
        words.value[wordIndex].etymology = result;
      }
      triggerConfetti({ particleCount: 20, spread: 40, origin: { y: 0.7 } });
    } else {
      error.value = '该单词暂无词根词缀信息';
      setTimeout(() => { error.value = null; }, 3000);
    }
  } catch (err) {
    console.error('获取词根词缀失败:', err);
    error.value = err.message || '获取失败，请重试';
    setTimeout(() => { error.value = null; }, 3000);
  } finally {
    loadingEtymology.value = null;
  }
};

// ===== 导航处理 =====
const handleNavigate = (page) => {
  currentPage.value = page;
};

// ===== 入门测试处理 =====
const handleOnboardingComplete = (profile) => {
  userProfile.value = profile;
  saveUserProfile(profile);
  showOnboarding.value = false;
};

// 获取学习目的标签
const getPurposeLabel = (purpose) => {
  const labels = {
    exam: '📚 备考',
    career: '💼 职场提升',
    hobby: '🎨 兴趣爱好',
    daily: '💬 日常交流'
  };
  return labels[purpose] || labels.daily;
};

// 重新进行词汇测试
const restartLevelTest = () => {
  closeSettings();
  showVocabTest.value = true;
};

// 处理词汇测试完成
const handleVocabTestComplete = (result) => {
  // 更新用户画像中的测试结果
  userProfile.value.vocabTestResult = result.testResult;
  saveUserProfile(userProfile.value);

  // 如果用户选择了词库，设置为新词库
  if (result.selectedVocab) {
    handleVocabularySelect(result.selectedVocab);
  }

  showVocabTest.value = false;

  // 显示成功提示
  error.value = '测试完成！词库已更新';
  setTimeout(() => { error.value = null; }, 3000);
};

// 处理测验完成
const handleQuizComplete = (result) => {
  console.log('测验完成:', result);
  // 可以根据测验结果进行统计或保存
  currentPage.value = 'today';
};

// 移动端Tab栏导航处理
const handleMobileNavigate = (page) => {
  if (page === 'settings') {
    // 设置页面打开弹窗
    openSettings();
  } else if (page === 'review') {
    // 复习页面 - 暂时显示今日学习页面,但可以复习forgotten的单词
    currentPage.value = 'today';
  } else {
    currentPage.value = page;
  }
};

// ===== 触摸手势处理 =====
const handleTouchStart = (event) => {
  touchStartX.value = event.changedTouches[0].screenX;
  touchStartY.value = event.changedTouches[0].screenY;
  isSwiping.value = true;
};

const handleTouchMove = (event) => {
  if (!isSwiping.value || !wordCard.value) return;

  const currentX = event.changedTouches[0].screenX;
  const currentY = event.changedTouches[0].screenY;
  const diffX = currentX - touchStartX.value;
  const diffY = Math.abs(currentY - touchStartY.value);

  // 阻止页面滚动（仅在水平滑动时）
  if (Math.abs(diffX) > Math.abs(diffY)) {
    event.preventDefault();

    // 实时更新卡片位置和旋转
    const rotation = diffX * 0.05; // 根据移动距离计算旋转角度
    const opacity = 1 - Math.abs(diffX) / 200; // 根据移动距离计算透明度

    wordCard.value.style.transform = `translateX(${diffX}px) rotate(${rotation}deg)`;
    wordCard.value.style.opacity = Math.max(opacity, 0.3).toString();
  }
};

const handleTouchEnd = (event) => {
  if (!isSwiping.value || !wordCard.value) return;

  touchEndX.value = event.changedTouches[0].screenX;
  touchEndY.value = event.changedTouches[0].screenY;

  const diffX = touchEndX.value - touchStartX.value;
  const diffY = Math.abs(touchEndY.value - touchStartY.value);

  // 判断是否为有效滑动
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
    // 有效滑动 - 触发相应操作
    if (diffX > 0) {
      // 向右滑动 → 不认识
      handleForget();
    } else {
      // 向左滑动 ← 认识
      handleKnow();
    }
  } else {
    // 滑动距离不够 - 回弹效果
    wordCard.value.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    wordCard.value.style.transform = 'translateX(0) rotate(0deg)';
    wordCard.value.style.opacity = '1';

    // 动画完成后清除transition
    setTimeout(() => {
      if (wordCard.value) {
        wordCard.value.style.transition = '';
      }
    }, 300);
  }

  isSwiping.value = false;
};

// ===== 键盘快捷键 =====
const handleKeydown = (event) => {
  // 如果在输入框中，不触发快捷键
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return;
  }

  // 如果设置弹窗打开，只响应ESC关闭
  if (showSettings.value) {
    if (event.key === 'Escape') {
      closeSettings();
    }
    return;
  }

  // 如果没有当前单词，不响应
  if (!currentWord.value) return;

  switch (event.key) {
    case ' ':
    case 'Space':
      event.preventDefault();
      handleKnow();
      break;
    case 'Enter':
      event.preventDefault();
      handleForget();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      previousWord();
      break;
    case 'ArrowRight':
      event.preventDefault();
      nextWord();
      break;
    case 's':
    case 'S':
      event.preventDefault();
      openSettings();
      break;
    case 'a':
    case 'A':
      event.preventDefault();
      if (userSettings.value.apiKey) {
        generateExample(currentWord.value);
      }
      break;
  }
};

// 初始化
onMounted(() => {
  loadData();

  // 加载用户设置
  const savedSettings = loadSettings();
  if (savedSettings) {
    userSettings.value = savedSettings;
  }

  // 加载用户画像
  const savedProfile = loadUserProfile();
  if (savedProfile) {
    userProfile.value = savedProfile;
  }

  // 检查是否需要显示入门测试
  if (shouldShowOnboarding()) {
    showOnboarding.value = true;
  }

  // 加载单词本
  wordbook.value = loadWordbook();

  // 加载学习时长
  totalStudyTime.value = loadStudyTime();

  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeydown);

  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // 页面离开前保存学习时长
  window.addEventListener('beforeunload', saveStudyTime);

  // 监听网络状态变化
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // 初始化同步统计
  updateGistSyncStats();
});

onUnmounted(() => {
  // 移除键盘事件监听
  window.removeEventListener('keydown', handleKeydown);

  // 移除可见性监听
  document.removeEventListener('visibilitychange', handleVisibilityChange);

  // 移除网络状态监听
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);

  // 页面卸载前保存学习时长
  saveStudyTime();
});

// 处理网络连接
const handleOnline = () => {
  isOnline.value = true;
  error.value = '网络已恢复';
  setTimeout(() => { error.value = null; }, 3000);
};

// 处理网络断开
const handleOffline = () => {
  isOnline.value = false;
  error.value = '网络连接已断开，正在使用离线模式';
  setTimeout(() => { error.value = null; }, 3000);
};

// 处理页面可见性变化
const handleVisibilityChange = () => {
  isPageVisible.value = !document.hidden;

  if (!document.hidden) {
    // 页面重新可见，重置会话开始时间
    sessionStartTime.value = Date.now();
  } else {
    // 页面隐藏，保存当前会话时长
    const currentSessionTime = getSessionTime();
    totalStudyTime.value += currentSessionTime;
    sessionStartTime.value = Date.now();
  }
};
</script>
