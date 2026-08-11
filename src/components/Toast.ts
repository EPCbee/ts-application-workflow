/**
 * Toast 提示组件
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

const TOAST_CONFIG = {
  defaultDuration: 3000,
  animationDuration: 300,
} as const;

const TOAST_ICON_MAP: Readonly<Record<ToastType, string>> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

export interface ToastHandle {
  close: () => void;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function showToast(
  message: string,
  type: ToastType = 'info',
  duration: number = TOAST_CONFIG.defaultDuration
): ToastHandle {
  const container = document.createElement('div');
  container.className = 'toast-container';

  const toastEl = document.createElement('div');
  toastEl.className = `toast toast-${type}`;

  const iconSpan = document.createElement('span');
  iconSpan.className = 'toast-icon';
  iconSpan.textContent = TOAST_ICON_MAP[type];

  const msgSpan = document.createElement('span');
  msgSpan.className = 'toast-message';
  msgSpan.textContent = escapeHtml(message);

  toastEl.append(iconSpan, msgSpan);
  container.appendChild(toastEl);
  document.body.appendChild(container);

  let timerId: number | null = null;

  if (duration > 0) {
    timerId = window.setTimeout(() => {
      toastEl.classList.add('toast-fade-out');
      window.setTimeout(() => {
        container.remove();
      }, TOAST_CONFIG.animationDuration);
    }, duration);
  }

  const close = (): void => {
    if (timerId !== null) clearTimeout(timerId);
    toastEl.classList.add('toast-fade-out');
    window.setTimeout(() => container.remove(), TOAST_CONFIG.animationDuration);
  };

  return { close };
}
