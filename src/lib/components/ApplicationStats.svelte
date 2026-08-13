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
        // 动画配置
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
    chartInstance.setOption(option, true); // true 表示不合并，完全替换
  }

  onMount(() => {
    const cleanup = initChart();
    return cleanup;
  });

  // 当 stats 变化时更新图表
  $: if (chartInstance && stats) {
    updateChart();
  }
</script>

<div class="space-y-6">
  <!-- 统计卡片 -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="bg-white rounded-lg shadow p-4">
      <div class="text-sm text-gray-500">总申请数</div>
      <div class="text-2xl font-bold">{stats.total}</div>
    </div>
    <div class="bg-white rounded-lg shadow p-4">
      <div class="text-sm text-gray-500">待审批</div>
      <div class="text-2xl font-bold text-yellow-600">{stats.byStatus.pending}</div>
    </div>
    <div class="bg-white rounded-lg shadow p-4">
      <div class="text-sm text-gray-500">已批准</div>
      <div class="text-2xl font-bold text-green-600">{stats.byStatus.approved}</div>
    </div>
    <div class="bg-white rounded-lg shadow p-4">
      <div class="text-sm text-gray-500">平均处理天数</div>
      <div class="text-2xl font-bold text-blue-600">{stats.avgProcessingTime.toFixed(1)}</div>
    </div>
  </div>

  <!-- 月度趋势图表 -->
  <div class="bg-white rounded-lg shadow p-4">
    <h4 class="text-lg font-semibold mb-2">📈 月度申请趋势</h4>
    <div bind:this={chartRef} style="height: 300px;"></div>
  </div>

  <!-- 状态和类型分布 -->
  <div class="grid grid-cols-2 gap-4">
    <div class="bg-white rounded-lg shadow p-4">
      <h4>按状态分布</h4>
      <ul class="mt-2">
        {#each Object.entries(stats.byStatus) as [key, val]}
          <li class="flex justify-between py-1 border-b border-gray-100">
            <span>{statusLabels[key]}</span>
            <span class="font-medium">{val}</span>
          </li>
        {/each}
      </ul>
    </div>
    <div class="bg-white rounded-lg shadow p-4">
      <h4>按类型分布</h4>
      <ul class="mt-2">
        {#each Object.entries(stats.byType) as [key, val]}
          <li class="flex justify-between py-1 border-b border-gray-100">
            <span>{typeLabels[key]}</span>
            <span class="font-medium">{val}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>