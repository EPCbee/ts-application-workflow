import { getApplications } from '../store';
import { filterApplicationsByDate } from '../utils';
import type { ApplicationStatus } from '../types';

// 静态统一管理分页大小，修改这里即可全局生效
const PAGE_SIZE = 10;

export function renderList(container: HTMLElement) {
  const allApps = getApplications();

  const render = (
    statusFilter: ApplicationStatus | 'all',
    startDate?: string,
    endDate?: string,
    page: number = 1
  ) => {
    let filtered = statusFilter === 'all' ? allApps : allApps.filter(a => a.status === statusFilter);
    filtered = filterApplicationsByDate(filtered, startDate, endDate);

    // 分页计算，使用静态常量PAGE_SIZE
    const total = filtered.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    // 页码越界保护
    if (page < 1) page = 1;
    if (totalPages > 0 && page > totalPages) page = totalPages;

    const startIndex = (page - 1) * PAGE_SIZE;
    const pageData = filtered.slice(startIndex, startIndex + PAGE_SIZE);

    container.innerHTML = `
      <div class="card">
        <h2 class="card-title">📋 申请列表</h2>
        <div class="list-filter-bar">
          <div class="filter-item">
            <label class="filter-label">状态：</label>
            <select id="statusFilter" class="form-control filter-select">
              <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>全部</option>
              <option value="draft" ${statusFilter === 'draft' ? 'selected' : ''}>草稿</option>
              <option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>待审批</option>
              <option value="approved" ${statusFilter === 'approved' ? 'selected' : ''}>已批准</option>
              <option value="rejected" ${statusFilter === 'rejected' ? 'selected' : ''}>已驳回</option>
              <option value="cancelled" ${statusFilter === 'cancelled' ? 'selected' : ''}>已取消</option>
            </select>
          </div>
          <div class="filter-item">
            <label class="filter-label">提交时间从：</label>
            <input type="date" id="startDate" class="form-control filter-input" value="${startDate || ''}" />
          </div>
          <div class="filter-item">
            <label class="filter-label">至：</label>
            <input type="date" id="endDate" class="form-control filter-input" value="${endDate || ''}" />
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
        <!-- 分页区域 -->
        <div class="pagination-bar" style="margin-top:12px;display:flex;gap:8px;align-items:center;">
          <span class="page-info">共 ${total} 条，第 ${page}/${totalPages || 1} 页</span>
          <button id="prevPage" class="btn btn-sm" ${page <= 1 ? 'disabled' : ''}>上一页</button>
          <button id="nextPage" class="btn btn-sm" ${page >= totalPages ? 'disabled' : ''}>下一页</button>
        </div>
      </div>
    `;

    const tbody = document.getElementById('listBody')!;
    if (pageData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center table-empty-row">暂无匹配记录</td></tr>`;
    } else {
      tbody.innerHTML = pageData.map(app => `
        <tr>
          <td><code class="table-id-code">${app.id}</code></td>
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
    const prevBtn = document.getElementById('prevPage')! as HTMLButtonElement;
    const nextBtn = document.getElementById('nextPage')! as HTMLButtonElement;

    const refresh = (newPage: number = 1) => {
      const status = statusSelect.value as ApplicationStatus | 'all';
      const s = startInput.value;
      const e = endInput.value;
      render(status, s, e, newPage);
    };

    statusSelect.addEventListener('change', () => refresh(1));
    startInput.addEventListener('change', () => refresh(1));
    endInput.addEventListener('change', () => refresh(1));
    clearBtn.addEventListener('click', () => {
      startInput.value = '';
      endInput.value = '';
      refresh(1);
    });

    prevBtn.addEventListener('click', () => refresh(page - 1));
    nextBtn.addEventListener('click', () => refresh(page + 1));
  };

  render('all');
}
