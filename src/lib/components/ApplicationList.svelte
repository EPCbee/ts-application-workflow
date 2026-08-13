<script lang="ts">
  import { applicationStore } from '$lib/stores/applicationStore';
  import { filterApplicationsByDate } from '$lib/utils/mockData';
  import { goto } from '$app/navigation';
  import type { ApplicationStatus } from '$lib/types/application';

  export let statusFilter: ApplicationStatus | 'all' = 'all';
  export let startDate: string = '';
  export let endDate: string = '';
  export let onStatusFilterChange: (status: ApplicationStatus | 'all') => void;
  export let onDateFilterChange: (start: string, end: string) => void;

  let applications = applicationStore.getApplications();
  let currentPage = 1;
  let pageSize = 10;

  // 可选每页条数
  const pageSizeOptions = [10, 20, 50];

  // 过滤后的总数
  $: filteredAll = applyFilters(applications, statusFilter, startDate, endDate);

  // 分页数据
  $: totalPages = Math.ceil(filteredAll.length / pageSize) || 1;
  $: if (currentPage > totalPages) currentPage = totalPages;
  $: startIndex = (currentPage - 1) * pageSize;
  $: filteredApps = filteredAll.slice(startIndex, startIndex + pageSize);

  function applyFilters(apps: any[], status: string, start?: string, end?: string) {
    let result = status === 'all' ? apps : apps.filter(a => a.status === status);
    if (start || end) {
      result = filterApplicationsByDate(result, start, end);
    }
    return result;
  }

  function handleStatusChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    currentPage = 1; // 重置到第一页
    onStatusFilterChange(select.value as ApplicationStatus | 'all');
  }

  function handleStartDateChange(e: Event) {
    const input = e.target as HTMLInputElement;
    currentPage = 1;
    onDateFilterChange(input.value, endDate);
  }

  function handleEndDateChange(e: Event) {
    const input = e.target as HTMLInputElement;
    currentPage = 1;
    onDateFilterChange(startDate, input.value);
  }

  function clearDateFilter() {
    currentPage = 1;
    onDateFilterChange('', '');
  }

  function changePage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
  }

  function changePageSize(e: Event) {
    const select = e.target as HTMLSelectElement;
    pageSize = Number(select.value);
    currentPage = 1; // 重置到第一页
  }

  function viewDetail(id: string) {
    goto(`/detail/${id}`);
  }

  // 状态标签样式（使用 Tailwind 类）
  function getStatusClass(status: string) {
    const base = 'px-2 py-1 text-xs font-semibold rounded-full';
    const map: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-500'
    };
    return `${base} ${map[status] || 'bg-gray-100 text-gray-700'}`;
  }
</script>

<div class="bg-white rounded-lg shadow">
  <!-- 过滤栏 -->
  <div class="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
    <h2 class="text-xl font-semibold text-gray-800">申请列表</h2>
    <div class="flex flex-wrap gap-2 items-center">
      <select
        class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={statusFilter}
        on:change={handleStatusChange}
      >
        <option value="all">全部</option>
        <option value="draft">草稿</option>
        <option value="pending">待审批</option>
        <option value="approved">已批准</option>
        <option value="rejected">已驳回</option>
        <option value="cancelled">已取消</option>
      </select>

      <input
        type="date"
        class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={startDate}
        on:change={handleStartDateChange}
        placeholder="开始日期"
      />
      <span>至</span>
      <input
        type="date"
        class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={endDate}
        on:change={handleEndDateChange}
        placeholder="结束日期"
      />
      <button
        class="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        on:click={clearDateFilter}
      >清除日期</button>
    </div>
  </div>

  <!-- 表格 -->
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">编号</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请人</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交时间</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each filteredApps as app}
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.title}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.applicant.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.typeLabel}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class={getStatusClass(app.status)}>
                {app.statusLabel}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button on:click={() => viewDetail(app.id)} class="text-blue-600 hover:text-blue-900 font-medium">查看</button>
            </td>
          </tr>
        {/each}
        {#if filteredApps.length === 0}
          <tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">暂无数据</td></tr>
        {/if}
      </tbody>
    </table>
  </div>

  <!-- 分页栏 -->
  <div class="px-6 py-4 border-t border-gray-200 flex flex-wrap justify-between items-center gap-2">
    <div class="flex items-center gap-2 text-sm text-gray-700">
      每页
      <select
        class="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={pageSize}
        on:change={changePageSize}
      >
        {#each pageSizeOptions as size}
          <option value={size}>{size}</option>
        {/each}
      </select>
      条
      <span class="ml-2">共 {filteredAll.length} 条</span>
    </div>

    <div class="flex items-center gap-1">
      <button
        class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={currentPage <= 1}
        on:click={() => changePage(currentPage - 1)}
      >上一页</button>

      <span class="px-3 py-1 text-sm">
        第 {currentPage} / {totalPages} 页
      </span>

      <button
        class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={currentPage >= totalPages}
        on:click={() => changePage(currentPage + 1)}
      >下一页</button>
    </div>
  </div>
</div>