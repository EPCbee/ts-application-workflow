<script lang="ts">
  import { onMount } from 'svelte';
  import * as echarts from 'echarts';
  import type { ApplicationStats } from '$lib/types/application';
  import { statusLabels, typeLabels } from '$lib/constants';

  export let stats: ApplicationStats;

  let chartRef: HTMLDivElement;
  let chartInstance: echarts.ECharts | null = null;

  function initChart() {
    if (!chartRef) return;
    chartInstance = echarts.init(chartRef);
    updateChart();
    const resizeObserver = new ResizeObserver(() => chartInstance?.resize());
    resizeObserver.observe(chartRef);
    return () => {
      resizeObserver.disconnect();
      chartInstance?.dispose();
      chartInstance = null;
    };
  }

  function updateChart() {
    if (!chartInstance || !stats) return;
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: stats.monthlyTrend.map(item => item.month),
        axisLine: { lineStyle: { color: '#d9d9d9' } }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },
      series: [{
        name: '申请数',
        type: 'bar',
        data: stats.monthlyTrend.map(item => item.count),
        itemStyle: {
          color: '#1890ff',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '40%',
        animationDuration: 1000,
        animationEasing: 'cubicOut'
      }],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    };
    chartInstance.setOption(option, true);
  }

  onMount(() => {
    const cleanup = initChart();
    return cleanup;
  });

  $: if (chartInstance && stats) {
    updateChart();
  }
</script>

<div class="space-y-6">
  <!-- 统计卡片 - 强化区分度 -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <!-- 总申请数 -->
    <div class="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
      <div class="flex items-center justify-between">
        <div class="text-sm font-medium text-gray-500">总申请数</div>
        <span class="text-2xl text-blue-500">📋</span>
      </div>
      <div class="text-3xl font-bold text-blue-600 mt-2">{stats.total}</div>
    </div>

    <!-- 待审批 -->
    <div class="bg-white rounded-lg shadow-md p-5 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow duration-200">
      <div class="flex items-center justify-between">
        <div class="text-sm font-medium text-gray-500">待审批</div>
        <span class="text-2xl text-yellow-500">⏳</span>
      </div>
      <div class="text-3xl font-bold text-yellow-600 mt-2">{stats.byStatus.pending}</div>
    </div>

    <!-- 已批准 -->
    <div class="bg-white rounded-lg shadow-md p-5 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
      <div class="flex items-center justify-between">
        <div class="text-sm font-medium text-gray-500">已批准</div>
        <span class="text-2xl text-green-500">✅</span>
      </div>
      <div class="text-3xl font-bold text-green-600 mt-2">{stats.byStatus.approved}</div>
    </div>

    <!-- 平均处理天数 -->
    <div class="bg-white rounded-lg shadow-md p-5 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow duration-200">
      <div class="flex items-center justify-between">
        <div class="text-sm font-medium text-gray-500">平均处理天数</div>
        <span class="text-2xl text-indigo-500">📊</span>
      </div>
      <div class="text-3xl font-bold text-indigo-600 mt-2">{stats.avgProcessingTime.toFixed(1)}</div>
    </div>
  </div>

  <!-- 月度趋势图表 -->
  <div class="bg-white rounded-lg shadow-md p-5">
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-lg font-semibold text-gray-800">📈 月度申请趋势</h4>
      <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">近 {stats.monthlyTrend.length} 月</span>
    </div>
    <div bind:this={chartRef} style="height: 300px; width: 100%;"></div>
  </div>

  <!-- 状态和类型分布 -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="bg-white rounded-lg shadow-md p-5">
      <h4 class="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span class="w-2 h-2 bg-blue-500 rounded-full"></span> 按状态分布
      </h4>
      <ul class="divide-y divide-gray-100">
        {#each Object.entries(stats.byStatus) as [key, val]}
          <li class="flex justify-between py-2.5 text-sm hover:bg-gray-50 px-2 rounded transition-colors">
            <span class="text-gray-600">{statusLabels[key]}</span>
            <span class="font-semibold text-gray-900">{val}</span>
          </li>
        {/each}
      </ul>
    </div>
    <div class="bg-white rounded-lg shadow-md p-5">
      <h4 class="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span class="w-2 h-2 bg-green-500 rounded-full"></span> 按类型分布
      </h4>
      <ul class="divide-y divide-gray-100">
        {#each Object.entries(stats.byType) as [key, val]}
          <li class="flex justify-between py-2.5 text-sm hover:bg-gray-50 px-2 rounded transition-colors">
            <span class="text-gray-600">{typeLabels[key]}</span>
            <span class="font-semibold text-gray-900">{val}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>