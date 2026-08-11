import { getApplications } from '../store';
import { filterApplicationsByDate } from '../utils';
import type { ApplicationStatus } from '../types';

export function renderList(container: HTMLElement) {
  const allApps = getApplications();

  const render = (statusFilter: ApplicationStatus | 'all', startDate?: string, endDate?: string) => {
    let filtered = statusFilter === 'all' ? allApps : allApps.filter(a => a.status === statusFilter);
    // 使用工具函数进行日期过滤
    filtered = filterApplicationsByDate(filtered, startDate, endDate);

    container.innerHTML = `
      <div class="card">
        <h2 class="card-title">📋 申请列表</h2>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px;align-items:center;">
          <div>
            <label style="font-weight:500;margin-right:4px;">状态：</label>
            <select id="statusFilter" class="form-control" style="width:auto;">
              <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>全部</option>
              <option value="draft" ${statusFilter === 'draft' ? 'selected' : ''}>草稿</option>
              <option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>待审批</option>
              <option value="approved" ${statusFilter === 'approved' ? 'selected' : ''}>已批准</option>
              <option value="rejected" ${statusFilter === 'rejected' ? 'selected' : ''}>已驳回</option>
              <option value="cancelled" ${statusFilter === 'cancelled' ? 'selected' : ''}>已取消</option>
            </select>
          </div>
          <div>
            <label style="font-weight:500;margin-right:4px;">提交时间从：</label>
            <input type="date" id="startDate" class="form-control" style="width:auto;display:inline;" value="${startDate || ''}" />
          </div>
          <div>
            <label style="font-weight:500;margin-right:4px;">至：</label>
            <input type="date" id="endDate" class="form-control" style="width:auto;display:inline;" value="${endDate || ''}" />
          </div>
          <button id="clearDateBtn" class="btn btn-sm">清除日期</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>编号</th><th>标题</th><th>申请人</th><th>类型</th><th>状态</th><th>提交时间</th><th>操作</th></tr>
            </thead>
            <tbody id="listBody"></tbody>
          </table>
        </div>
      </div>
    `;

    const tbody = document.getElementById('listBody')!;
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:20px;color:#999;">暂无匹配记录</td></tr>`;
    } else {
      tbody.innerHTML = filtered.map(app => `
        <tr>
          <td><code style="background:#f5f5f5;padding:2px 8px;border-radius:2px;">${app.id}</code></td>
          <td>${app.title}</td>
          <td>${app.applicant.name}</td>
          <td>${app.typeLabel}</td>
          <td><span class="tag tag-${app.status}">${app.statusLabel}</span></td>
          <td>${app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '-'}</td>
          <td><a href="#detail/${app.id}" class="btn btn-text btn-sm">查看</a></td>
        </tr>
      `).join('');
    }

    const statusSelect = document.getElementById('statusFilter') as HTMLSelectElement;
    const startInput = document.getElementById('startDate') as HTMLInputElement;
    const endInput = document.getElementById('endDate') as HTMLInputElement;
    const clearBtn = document.getElementById('clearDateBtn')!;

    const refresh = () => {
      const status = statusSelect.value as ApplicationStatus | 'all';
      const s = startInput.value;
      const e = endInput.value;
      render(status, s, e);
    };

    statusSelect.addEventListener('change', refresh);
    startInput.addEventListener('change', refresh);
    endInput.addEventListener('change', refresh);
    clearBtn.addEventListener('click', () => {
      startInput.value = '';
      endInput.value = '';
      refresh();
    });
  };

  render('all');
}
