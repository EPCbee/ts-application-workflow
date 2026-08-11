import * as echarts from 'echarts';
import { getApplications } from '../store';
import { statusLabels, typeLabels } from '../utils';
import type { Application, ApplicationStatus, ApplicationType, ApplicationStats } from '../types';

// 计算统计数据
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

export function renderStats(container: HTMLElement) {
  const allApps = getApplications();
  let currentFilter: ApplicationStatus | 'all' = 'all';

  const render = () => {
    const filtered = currentFilter === 'all' ? allApps : allApps.filter(a => a.status === currentFilter);
    const stats = computeStats(filtered);

    container.innerHTML = `
      <div>
        <div class="stat-header-bar">
          <h2 class="stat-title">📊 统计报表</h2>
          <div class="stat-filter-wrap">
            <label class="stat-filter-label">状态筛选：</label>
            <select id="statusFilter" class="form-control stat-filter-select">
              <option value="all" ${currentFilter === 'all' ? 'selected' : ''}>全部</option>
              <option value="draft" ${currentFilter === 'draft' ? 'selected' : ''}>草稿</option>
              <option value="pending" ${currentFilter === 'pending' ? 'selected' : ''}>待审批</option>
              <option value="approved" ${currentFilter === 'approved' ? 'selected' : ''}>已批准</option>
              <option value="rejected" ${currentFilter === 'rejected' ? 'selected' : ''}>已驳回</option>
              <option value="cancelled" ${currentFilter === 'cancelled' ? 'selected' : ''}>已取消</option>
            </select>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-card"><div class="stat-label">总申请数</div><div class="stat-value">${stats.total}</div></div>
          <div class="stat-card"><div class="stat-label">待审批</div><div class="stat-value stat-value-warning">${stats.byStatus.pending}</div></div>
          <div class="stat-card"><div class="stat-label">已批准</div><div class="stat-value stat-value-success">${stats.byStatus.approved}</div></div>
          <div class="stat-card"><div class="stat-label">平均处理天数</div><div class="stat-value stat-value-primary">${stats.avgProcessingTime.toFixed(1)}</div></div>
        </div>

        <div class="card">
          <h3 class="chart-title">📈 月度申请趋势</h3>
          <div id="chart" class="chart-container"></div>
        </div>

        <div class="stat-two-col-grid">
          <div class="card">
            <h3 class="chart-title">按状态分布</h3>
            <ul class="stat-list">
              ${Object.entries(stats.byStatus).map(([key, val]) => `
                <li class="stat-list-item">
                  <span>${statusLabels[key as ApplicationStatus]}</span>
                  <span><strong>${val}</strong></span>
                </li>
              `).join('')}
            </ul>
          </div>
          <div class="card">
            <h3 class="chart-title">按类型分布</h3>
            <ul class="stat-list">
              ${Object.entries(stats.byType).map(([key, val]) => `
                <li class="stat-list-item">
                  <span>${typeLabels[key as ApplicationType]}</span>
                  <span><strong>${val}</strong></span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;

    // ECharts
    const chartDom = document.getElementById('chart')!;
    const myChart = echarts.init(chartDom);
    myChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: stats.monthlyTrend.map(item => item.month), axisLine: { lineStyle: { color: '#d9d9d9' } } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f0f0f0' } } },
      series: [{
        name: '申请数',
        type: 'bar',
        data: stats.monthlyTrend.map(item => item.count),
        itemStyle: { color: '#1890ff', borderRadius: [4,4,0,0] },
        barWidth: '40%'
      }],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
    });
    window.addEventListener('resize', () => myChart.resize());

    // 筛选监听
    const filterSelect = document.getElementById('statusFilter') as HTMLSelectElement;
    filterSelect.addEventListener('change', () => {
      currentFilter = filterSelect.value as ApplicationStatus | 'all';
      render(); // 重新渲染
    });
  };

  render();
}
