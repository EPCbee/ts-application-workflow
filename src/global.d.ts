// src/global.d.ts
import type { ToastType, ToastHandle } from './components/toast';

declare global {
  /**
   * Toast全局提示
   * @param message 提示文本
   * @param type 提示类型
   * @param duration 毫秒，0不自动关闭
   */
  function showToast(message: string, type?: ToastType, duration?: number): ToastHandle;
}

export {}; // 必须，把文件变成模块，否则global不生效
