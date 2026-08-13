<script>
  import { goto } from '$app/navigation';
</script>

<div class="text-center py-12">
  <h1 class="text-4xl font-bold text-gray-900 mb-4">欢迎使用申请管理系统</h1>
  <p class="text-lg text-gray-600 mb-8">快速发起、审批、跟踪您的申请</p>
  <div class="flex justify-center gap-4">
    <button on:click={() => goto('/create')} class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">发起新申请</button>
    <button on:click={() => goto('/list')} class="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">查看申请</button>
  </div>
</div>