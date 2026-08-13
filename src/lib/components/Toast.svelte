<script lang="ts">
  export let message: string;
  export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
  export let duration: number = 3000;

  let visible = true;
  let timeout: ReturnType<typeof setTimeout>;

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const close = () => {
    visible = false;
    setTimeout(() => {
      // 组件销毁逻辑由父组件处理
    }, 300);
  };

  // 自动关闭
  if (duration > 0) {
    timeout = setTimeout(close, duration);
  }

  // 清理
  onDestroy(() => {
    if (timeout) clearTimeout(timeout);
  });
</script>

{#if visible}
  <div class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
    <div class="flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-lg border-l-4
                {type === 'success' ? 'border-green-500' : type === 'error' ? 'border-red-500' : type === 'warning' ? 'border-yellow-500' : 'border-blue-500'}
                pointer-events-auto animate-slideDown">
      <span class="text-xl">{iconMap[type]}</span>
      <span class="text-sm text-gray-800">{message}</span>
    </div>
  </div>
{/if}

<style>
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }
</style>
