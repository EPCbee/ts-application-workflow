import { getApplicationById, updateApplication } from '../store';
import { statusLabels, formatContentFields } from '../utils';
import type { ApplicationStatus } from '../types';

export function renderDetail(container: HTMLElement, id: string): void {
  const app = getApplicationById(id);
  if (!app) {
    container.innerHTML = `<div class="card text-center card-notfound">申请不存在</div>`;
    return;
  }

  const fields = formatContentFields(app.content, app.type);

  const statusTag = `tag-${app.status}`;
  container.innerHTML = `
    <div class="card">
      <h2 class="card-title">📄 申请详情</h2>
      <div class="detail-grid">
        <div><strong>编号</strong><p>${app.id}</p></div>
        <div><strong>标题</strong><p>${app.title}</p></div>
        <div><strong>申请人</strong><p>${app.applicant.name} (${app.applicant.department})</p></div>
        <div><strong>类型</strong><p>${app.typeLabel}</p></div>
        <div><strong>状态</strong><p><span class="tag ${statusTag}">${app.statusLabel}</span></p></div>
        <div><strong>创建时间</strong><p>${new Date(app.createdAt).toLocaleString()}</p></div>
        ${app.submittedAt ? `<div><strong>提交时间</strong><p>${new Date(app.submittedAt).toLocaleString()}</p></div>` : ''}
        ${app.approvedAt ? `<div><strong>审批时间</strong><p>${new Date(app.approvedAt).toLocaleString()}</p></div>` : ''}
        ${app.comments ? `<div class="detail-grid-full-col"><strong>审批意见</strong><p>${app.comments}</p></div>` : ''}
      </div>
      <div class="detail-content-block">
        <strong>申请内容</strong>
        <div class="detail-content-wrap">
          ${fields.length > 0 ? fields.map(f => `
            <div class="detail-field-row">
              <span class="detail-field-label">${f.label}</span>
              <span>${f.value}</span>
            </div>
          `).join('') : '<span class="detail-empty-text">无内容</span>'}
        </div>
      </div>
      <div class="detail-btn-group">
        ${app.status === 'draft' ? `<button id="submitBtn" class="btn btn-primary">提交审批</button><button id="cancelBtn" class="btn btn-danger">取消</button>` : ''}
        ${app.status === 'pending' ? `<button id="approveBtn" class="btn btn-success">批准</button><button id="rejectBtn" class="btn btn-danger">驳回</button>` : ''}
        <a href="#list" class="btn">返回列表</a>
      </div>
    </div>
  `;

  const updateStatus = (status: ApplicationStatus, label: string): void => {
    updateApplication(id, { status, statusLabel: label });
    showToast(`状态已更新为：${label}`, 'success');
    window.location.hash = 'list';
  };

  document.getElementById('submitBtn')?.addEventListener('click', () => updateStatus('pending', '待审批'));
  document.getElementById('cancelBtn')?.addEventListener('click', () => updateStatus('cancelled', '已取消'));
  document.getElementById('approveBtn')?.addEventListener('click', () => {
    updateApplication(id, { approvedAt: new Date().toISOString(), comments: '审批通过' });
    updateStatus('approved', '已批准');
  });
  document.getElementById('rejectBtn')?.addEventListener('click', () => {
    updateApplication(id, { approvedAt: new Date().toISOString(), comments: '审批驳回' });
    updateStatus('rejected', '已驳回');
  });
}
