// Toast 组件
type ToastType = 'success' | 'error' | 'warning' | 'info';

export function showToast(message: string, type: ToastType = 'info', duration: number = 3000) {
  // 移除已有 toast
  const existing = document.querySelector('.toast-container');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.className = 'toast-container';

  const iconMap: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  container.innerHTML = `
    <div class="toast toast-${type}">
      <span class="toast-icon">${iconMap[type]}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;

  document.body.appendChild(container);

  // 自动消失
  setTimeout(() => {
    container.classList.add('toast-fade-out');
    setTimeout(() => container.remove(), 300);
  }, duration);
}
