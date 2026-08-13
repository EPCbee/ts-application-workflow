<script>
  import '../app.css';
</script>

<nav class="bg-white shadow-md">
  <div class="container mx-auto px-4 py-3 flex justify-between items-center">
    <div class="text-xl font-bold text-blue-600">📋 申请管理系统</div>
    <div class="space-x-4">
      <a href="/" class="text-gray-700 hover:text-blue-600">首页</a>
      <a href="/create" class="text-gray-700 hover:text-blue-600">发起申请</a>
      <a href="/list" class="text-gray-700 hover:text-blue-600">申请列表</a>
      <a href="/stats" class="text-gray-700 hover:text-blue-600">统计报表</a>
    </div>
  </div>
</nav>

<main class="container mx-auto px-4 py-6">
  <slot />
</main>