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

  // 使用 store 的 getApplications 方法
  let applications = applicationStore.getApplications();

  // 响应式计算过滤后的列表
  $: filteredApps = applyFilters(applications, statusFilter, startDate, endDate);

  function applyFilters(apps: any[], status: string, start?: string, end?: string) {
    let result = status === 'all' ? apps : apps.filter(a => a.status === status);
    if (start || end) {
      result = filterApplicationsByDate(result, start, end);
    }
    return result;
  }

  function handleStatusChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    onStatusFilterChange(select.value as ApplicationStatus | 'all');
  }

  function handleStartDateChange(e: Event) {
    const input = e.target as HTMLInputElement;
    onDateFilterChange(input.value, endDate);
  }

  function handleEndDateChange(e: Event) {
    const input = e.target as HTMLInputElement;
    onDateFilterChange(startDate, input.value);
  }

  function clearDateFilter() {
    onDateFilterChange('', '');
  }

  function viewDetail(id: string) {
    goto(`/detail/${id}`);
  }
</script>

<div class="bg-white rounded-lg shadow">
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

  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">编号</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">申请人</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">提交时间</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each filteredApps as app}
          <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.title}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.applicant.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.typeLabel}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full tag-{app.status}">
                {app.statusLabel}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button on:click={() => viewDetail(app.id)} class="text-blue-600 hover:text-blue-900">查看</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>