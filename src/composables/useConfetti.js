/**
 * 彩带动画组合式函数
 * 使用canvas-confetti库实现彩带效果
 */

import confetti from 'canvas-confetti';

/**
 * 使用彩带动画
 * @returns {Object} 包含triggerConfetti方法的对象
 */
export function useConfetti() {
  /**
   * 触发彩带动画
   * @param {Object} options - 彩带配置选项
   */
  const triggerConfetti = (options = {}) => {
    const defaultOptions = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#5c6b5c', '#8da892', '#b3c2b3', '#d4ddd4']  // sage色系
    };

    confetti({
      ...defaultOptions,
      ...options
    });
  };

  return {
    triggerConfetti
  };
}
