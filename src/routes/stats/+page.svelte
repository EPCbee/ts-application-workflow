<script lang="ts">
  import { onMount } from 'svelte';
  import ApplicationStats from '$lib/components/ApplicationStats.svelte';
  import { applicationStore } from '$lib/stores/applicationStore';
  import { typeLabels, statusLabels } from '$lib/constants';
  import type { ApplicationStatus, ApplicationType, ApplicationStats } from '$lib/types/application';

  let stats: ApplicationStats | null = null;
  let filterStatus: ApplicationStatus | 'all' = 'all';
  let filterType: ApplicationType | 'all' = 'all';

  function computeStats() {
    const apps = applicationStore.getApplications();
    // 先按状态过滤
    let filtered = filterStatus === 'all' ? apps : apps.filter(a => a.status === filterStatus);
    // 再按类型过滤
    filtered = filterType === 'all' ? filtered : filtered.filter(a => a.type === filterType);

    // 计算统计数据（与 store 中逻辑一致）
    const total = filtered.length;
    const byStatus: Record<ApplicationStatus, number> = { draft: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 };
    const byType: Record<ApplicationType, number> = { travel: 0, purchase: 0, reimbursement: 0, overtime: 0, custom: 0 };
    const monthMap = new Map<string, number>();
    let totalDays = 0, processed = 0;

    filtered.forEach(app => {
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
      byType[app.type] = (byType[app.type] || 0) + 1;
      const month = app.createdAt.slice(0, 7);
      monthMap.set(month, (monthMap.get(month) || 0) + 1);
      if (app.submittedAt && app.approvedAt) {
        const days = (new Date(app.approvedAt).getTime() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
        totalDays += days;
        processed++;
      }
    });

    const monthlyTrend = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));
    const avgProcessingTime = processed > 0 ? totalDays / processed : 0;

    stats = { total, byStatus, byType, monthlyTrend, avgProcessingTime };
  }

  function handleStatusChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    filterStatus = select.value as ApplicationStatus | 'all';
    computeStats();
  }

  function handleTypeChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    filterType = select.value as ApplicationType | 'all';
    computeStats();
  }

  onMount(() => {
    computeStats();
    const unsubscribe = applicationStore.subscribe(() => computeStats());
    return () => unsubscribe();
  });
</script>

<div class="max-w-6xl mx-auto">
  <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
    <h1 class="text-2xl font-bold text-gray-900">📊 统计报表</h1>
    <div class="flex flex-wrap gap-4 items-center">
      <!-- 状态筛选 -->
      <div class="flex items-center gap-2">
        <label for="statusFilter" class="font-medium">状态：</label>
        <select
          id="statusFilter"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterStatus}
          on:change={handleStatusChange}
        >
          <option value="all">全部</option>
          <option value="draft">草稿</option>
          <option value="pending">待审批</option>
          <option value="approved">已批准</option>
          <option value="rejected">已驳回</option>
          <option value="cancelled">已取消</option>
        </select>
      </div>
      <!-- 类型筛选 -->
      <div class="flex items-center gap-2">
        <label for="typeFilter" class="font-medium">类型：</label>
        <select
          id="typeFilter"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterType}
          on:change={handleTypeChange}
        >
          <option value="all">全部</option>
          {#each Object.entries(typeLabels) as [key, label]}
            <option value={key}>{label}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  {#if stats}
    <ApplicationStats stats={stats} />
  {:else}
    <div class="text-center py-8 text-gray-500">加载中...</div>
  {/if}
</div>