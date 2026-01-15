/**
 * Google Cloud Text-to-Speech 服务
 * 使用 WaveNet 和 Neural2 语音模型，提供高质量语音合成
 */

const SETTINGS_KEY = 'vocabcontext_settings'
const CACHE_KEY_PREFIX = 'vocabcontext_google_tts_'

/**
 * Google TTS 服务类
 */
export class GoogleTTS {
  constructor() {
    this.apiKey = this.loadApiKey()
  }

  /**
   * 加载 API 密钥
   */
  loadApiKey() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) {
        const settings = JSON.parse(saved)
        const apiKey = String(settings.googleApiKey || '').trim()
        return apiKey
      }
    } catch (error) {
      console.error('加载 Google API 密钥失败:', error)
    }
    return ''
  }

  /**
   * 检查是否可用
   */
  isAvailable() {
    return !!this.apiKey
  }

  /**
   * 生成语音
   * @param {string} text - 要朗读的文本
   * @param {Object} options - 配置选项
   * @returns {Promise<string>} 音频数据的 base64 编码
   */
  async generateSpeech(text, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('请先配置 Google API 密钥')
    }

    const cleanText = text.trim()
    if (!cleanText) {
      throw new Error('文本不能为空')
    }

    // 检查缓存
    const cacheKey = `${CACHE_KEY_PREFIX}${encodeURIComponent(cleanText)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      console.log('🔊 使用缓存的 Google 语音:', cleanText)
      return cached
    }

    console.log('🔊 请求 Google TTS:', cleanText)

    try {
      // 构建请求
      const requestBody = {
        input: { text: cleanText },
        voice: {
          languageCode: options.lang || 'en-US',
          name: options.voice || 'en-US-Wavenet-D', // 默认使用 WaveNet D (男声)
          ssmlGender: options.gender || 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: options.rate || 1.0,
          pitch: options.pitch || 0.0
        }
      }

      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `Google API 调用失败: ${response.status}`)
      }

      const result = await response.json()
      const audioBase64 = result.audioContent

      // 缓存音频
      this.saveToCache(cacheKey, audioBase64)

      console.log('✅ Google TTS 生成成功')
      return audioBase64
    } catch (error) {
      console.error('❌ Google TTS 生成失败:', error)
      throw error
    }
  }

  /**
   * 播放语音
   * @param {string} text - 要朗读的文本
   * @param {HTMLAudioElement} audioElement - 音频元素（可选）
   * @returns {Promise<void>}
   */
  async play(text, audioElement = null) {
    const audioBase64 = await this.generateSpeech(text)

    // 创建或使用音频元素
    const audio = audioElement || new Audio()
    audio.src = `data:audio/mp3;base64,${audioBase64}`

    // 播放
    await new Promise((resolve, reject) => {
      audio.onended = () => resolve()
      audio.onerror = (e) => reject(new Error('音频播放失败'))
      audio.play().catch(reject)
    })
  }

  /**
   * 从缓存获取
   * @private
   */
  getFromCache(key) {
    try {
      const cached = localStorage.getItem(key)
      if (cached) {
        const data = JSON.parse(cached)
        // 检查是否过期（30天）
        const age = Date.now() - (data.timestamp || 0)
        const maxAge = 30 * 24 * 60 * 60 * 1000
        if (age < maxAge) {
          return data.audio
        } else {
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.error('读取缓存失败:', error)
    }
    return null
  }

  /**
   * 保存到缓存
   * @private
   */
  saveToCache(key, audioBase64) {
    try {
      const data = {
        audio: audioBase64,
        timestamp: Date.now()
      }
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('保存缓存失败:', error)
      // 如果缓存满了，清理旧缓存
      if (error.name === 'QuotaExceededError') {
        this.cleanOldCache()
        try {
          localStorage.setItem(key, JSON.stringify(data))
        } catch (retryError) {
          console.error('重试保存缓存失败:', retryError)
        }
      }
    }
  }

  /**
   * 清理旧缓存
   * @private
   */
  cleanOldCache() {
    try {
      const keys = Object.keys(localStorage)
      const ttsKeys = keys.filter(k => k.startsWith(CACHE_KEY_PREFIX))

      // 按时间排序，删除最旧的50%
      const cacheEntries = ttsKeys.map(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key))
          return { key, timestamp: data.timestamp || 0 }
        } catch {
          return { key, timestamp: 0 }
        }
      }).sort((a, b) => a.timestamp - b.timestamp)

      const deleteCount = Math.floor(cacheEntries.length / 2)
      for (let i = 0; i < deleteCount; i++) {
        localStorage.removeItem(cacheEntries[i].key)
      }

      console.log(`🧹 清理了 ${deleteCount} 条旧 Google TTS 缓存`)
    } catch (error) {
      console.error('清理缓存失败:', error)
    }
  }

  /**
   * 清除所有缓存
   */
  clearAllCache() {
    try {
      const keys = Object.keys(localStorage)
      const ttsKeys = keys.filter(k => k.startsWith(CACHE_KEY_PREFIX))

      ttsKeys.forEach(key => {
        localStorage.removeItem(key)
      })

      console.log(`🧹 清除了 ${ttsKeys.length} 条 Google TTS 缓存`)
      return ttsKeys.length
    } catch (error) {
      console.error('清除缓存失败:', error)
      return 0
    }
  }

  /**
   * 重新加载 API 密钥
   */
  reloadApiKey() {
    this.apiKey = this.loadApiKey()
  }

  /**
   * 获取推荐的语音列表
   */
  getRecommendedVoices() {
    return [
      { name: 'en-US-Wavenet-D', gender: 'MALE', description: '美式英语男声 (WaveNet)' },
      { name: 'en-US-Wavenet-C', gender: 'FEMALE', description: '美式英语女声 (WaveNet)' },
      { name: 'en-US-Wavenet-A', gender: 'FEMALE', description: '美式英语女声 (WaveNet)' },
      { name: 'en-US-Neural2-D', gender: 'MALE', description: '美式英语男声 (Neural2)' },
      { name: 'en-US-Neural2-C', gender: 'FEMALE', description: '美式英语女声 (Neural2)' },
      { name: 'en-GB-Wavenet-D', gender: 'MALE', description: '英式英语男声 (WaveNet)' },
      { name: 'en-GB-Wavenet-A', gender: 'FEMALE', description: '英式英语女声 (WaveNet)' }
    ]
  }
}

// ==================== 单例模式 ====================

let ttsInstance = null

/**
 * 获取 Google TTS 实例
 */
export function getGoogleTTS() {
  if (!ttsInstance) {
    ttsInstance = new GoogleTTS()
  }
  return ttsInstance
}

/**
 * 重置实例（用于测试）
 */
export function resetGoogleTTS() {
  ttsInstance = null
  return getGoogleTTS()
}
