<script lang="ts">
  import { onMount } from 'svelte';
  import * as echarts from 'echarts';
  import type { ApplicationStats } from '$lib/types/application';
  import { statusLabels, typeLabels } from '$lib/utils/mockData';

  export let stats: ApplicationStats;
  let chartRef: HTMLDivElement;
  let chartInstance: echarts.ECharts | null = null;

  onMount(() => {
    if (chartRef) {
      chartInstance = echarts.init(chartRef);
      updateChart();
      const resizeObserver = new ResizeObserver(() => chartInstance?.resize());
      resizeObserver.observe(chartRef);
      return () => {
        resizeObserver.disconnect();
        chartInstance?.dispose();
      };
    }
  });

  function updateChart() {
    if (!chartInstance) return;
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: stats.monthlyTrend.map(item => item.month) },
      yAxis: { type: 'value' },
      series: [{ name: '申请数', type: 'bar', data: stats.monthlyTrend.map(item => item.count), itemStyle: { color: '#3b82f6' } }],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
    };
    chartInstance.setOption(option);
  }

  $: if (chartInstance) updateChart();
</script>

<div class="space-y-6">
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="bg-white rounded-lg shadow p-4"><div class="text-sm text-gray-500">总申请数</div><div class="text-2xl font-bold">{stats.total}</div></div>
    <div class="bg-white rounded-lg shadow p-4"><div class="text-sm text-gray-500">待审批</div><div class="text-2xl font-bold text-yellow-600">{stats.byStatus.pending}</div></div>
    <div class="bg-white rounded-lg shadow p-4"><div class="text-sm text-gray-500">已批准</div><div class="text-2xl font-bold text-green-600">{stats.byStatus.approved}</div></div>
    <div class="bg-white rounded-lg shadow p-4"><div class="text-sm text-gray-500">平均处理天数</div><div class="text-2xl font-bold text-blue-600">{stats.avgProcessingTime.toFixed(1)}</div></div>
  </div>
  <div class="bg-white rounded-lg shadow p-4"><h4 class="text-lg font-semibold mb-2">月度趋势</h4><div bind:this={chartRef} style="height:300px;"></div></div>
  <div class="grid grid-cols-2 gap-4">
    <div class="bg-white rounded-lg shadow p-4"><h4>按状态</h4><ul>{#each Object.entries(stats.byStatus) as [key, val]}<li class="flex justify-between py-1 border-b"><span>{statusLabels[key]}</span><span>{val}</span></li>{/each}</ul></div>
    <div class="bg-white rounded-lg shadow p-4"><h4>按类型</h4><ul>{#each Object.entries(stats.byType) as [key, val]}<li class="flex justify-between py-1 border-b"><span>{typeLabels[key]}</span><span>{val}</span></li>{/each}</ul></div>
  </div>
</div>