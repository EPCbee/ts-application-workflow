<script lang="ts">
  import { onMount } from 'svelte';
  import { applicationStore } from '$lib/stores/applicationStore';
  import { statusLabels, typeLabels } from '$lib/utils/mockData';
  import * as echarts from 'echarts';
  import type { Application, ApplicationStatus, ApplicationStats, ApplicationType } from '$lib/types/application';

  let stats: ApplicationStats | null = null;
  let currentFilter: ApplicationStatus | 'all' = 'all';
  let chartInstance: echarts.ECharts | null = null;

  function computeStats(apps: Application[]): ApplicationStats {
    const total = apps.length;
    const byStatus: Record<ApplicationStatus, number> = { draft: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 };
    const byType: Record<ApplicationType, number> = { travel: 0, purchase: 0, reimbursement: 0, overtime: 0, custom: 0 };
    const monthMap = new Map<string, number>();
    let totalDays = 0, processed = 0;

    apps.forEach(app => {
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

    return {
      total,
      byStatus,
      byType,
      monthlyTrend,
      avgProcessingTime: processed > 0 ? totalDays / processed : 0,
    };
  }

  function renderChart(container: HTMLElement, data: ApplicationStats) {
    if (chartInstance) {
      chartInstance.dispose();
    }
    chartInstance = echarts.init(container);
    chartInstance.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.monthlyTrend.map(item => item.month), axisLine: { lineStyle: { color: '#d9d9d9' } } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f0f0f0' } } },
      series: [{
        name: '申请数',
        type: 'bar',
        data: data.monthlyTrend.map(item => item.count),
        itemStyle: { color: '#1890ff', borderRadius: [4,4,0,0] },
        barWidth: '40%'
      }],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
    });
    window.addEventListener('resize', () => chartInstance?.resize());
  }

  function updateStats(filter: ApplicationStatus | 'all') {
    const all = $applicationStore;
    const filtered = filter === 'all' ? all : all.filter(a => a.status === filter);
    const newStats = computeStats(filtered);
    stats = newStats;
    setTimeout(() => {
      const chartDom = document.getElementById('chart');
      if (chartDom) renderChart(chartDom, newStats);
    }, 50);
  }

  onMount(() => {
    const unsubscribe = applicationStore.subscribe(() => {
      updateStats(currentFilter);
    });
    updateStats('all');
    return () => {
      unsubscribe();
      if (chartInstance) chartInstance.dispose();
    };
  });

  function handleFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    currentFilter = select.value as ApplicationStatus | 'all';
    updateStats(currentFilter);
  }
</script>

<div>
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-semibold">📊 统计报表</h2>
    <div class="flex items-center gap-2">
      <label class="font-medium">状态筛选：</label>
      <select on:change={handleFilterChange} class="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500">
        <option value="all">全部</option>
        <option value="draft">草稿</option>
        <option value="pending">待审批</option>
        <option value="approved">已批准</option>
        <option value="rejected">已驳回</option>
        <option value="cancelled">已取消</option>
      </select>
    </div>
  </div>

  {#if stats}
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div class="bg-white rounded-lg shadow p-4"><div class="text-sm text-gray-500">总申请数</div><div class="text-2xl font-bold">{stats.total}</div></div>
      <div class="bg-white rounded-lg shadow p-4"><div class="text-sm text-gray-500">待审批</div><div class="text-2xl font-bold text-yellow-600">{stats.byStatus.pending}</div></div>
      <div class="bg-white rounded-lg shadow p-4"><div class="text-sm text-gray-500">已批准</div><div class="text-2xl font-bold text-green-600">{stats.byStatus.approved}</div></div>
      <div class="bg-white rounded-lg shadow p-4"><div class="text-sm text-gray-500">平均处理天数</div><div class="text-2xl font-bold text-blue-600">{stats.avgProcessingTime.toFixed(1)}</div></div>
    </div>

    <div class="bg-white rounded-lg shadow p-4 mb-4">
      <h3 class="font-semibold mb-2">📈 月度申请趋势</h3>
      <div id="chart" class="h-72"></div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="font-semibold mb-2">按状态分布</h3>
        <ul class="divide-y divide-gray-200">
          {#each Object.entries(stats.byStatus) as [key, val]}
            <li class="flex justify-between py-2"><span>{statusLabels[key as ApplicationStatus]}</span><span class="font-semibold">{val}</span></li>
          {/each}
        </ul>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="font-semibold mb-2">按类型分布</h3>
        <ul class="divide-y divide-gray-200">
          {#each Object.entries(stats.byType) as [key, val]}
            <li class="flex justify-between py-2"><span>{typeLabels[key as ApplicationType]}</span><span class="font-semibold">{val}</span></li>
          {/each}
        </ul>
      </div>
    </div>
  {:else}
    <div class="text-center py-8">加载中...</div>
  {/if}
</div>