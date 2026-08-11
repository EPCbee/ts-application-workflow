import { getApplicationById, updateApplication } from '../store';
import { statusLabels, formatContentFields } from '../utils';
import type { ApplicationStatus } from '../types';

export function renderDetail(container: HTMLElement, id: string) {
  const app = getApplicationById(id);
  if (!app) {
    container.innerHTML = `<div class="card text-center" style="color:#ff4d4f;">申请不存在</div>`;
    return;
  }

  const fields = formatContentFields(app.content, app.type);

  const statusTag = `tag-${app.status}`;
  container.innerHTML = `
    <div class="card">
      <h2 class="card-title">📄 申请详情</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div><strong>编号</strong><p>${app.id}</p></div>
        <div><strong>标题</strong><p>${app.title}</p></div>
        <div><strong>申请人</strong><p>${app.applicant.name} (${app.applicant.department})</p></div>
        <div><strong>类型</strong><p>${app.typeLabel}</p></div>
        <div><strong>状态</strong><p><span class="tag ${statusTag}">${app.statusLabel}</span></p></div>
        <div><strong>创建时间</strong><p>${new Date(app.createdAt).toLocaleString()}</p></div>
        ${app.submittedAt ? `<div><strong>提交时间</strong><p>${new Date(app.submittedAt).toLocaleString()}</p></div>` : ''}
        ${app.approvedAt ? `<div><strong>审批时间</strong><p>${new Date(app.approvedAt).toLocaleString()}</p></div>` : ''}
        ${app.comments ? `<div style="grid-column:1/-1;"><strong>审批意见</strong><p>${app.comments}</p></div>` : ''}
      </div>
      <div style="margin-top:16px;">
        <strong>申请内容</strong>
        <div style="background:#fafafa;padding:12px;border-radius:4px;border:1px solid #e8e8e8;margin-top:8px;">
          ${fields.length > 0 ? fields.map(f => `
            <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0f0f0;">
              <span style="color:#666;">${f.label}</span>
              <span>${f.value}</span>
            </div>
          `).join('') : '<span style="color:#999;">无内容</span>'}
        </div>
      </div>
      <div style="margin-top:24px;display:flex;gap:8px;flex-wrap:wrap;">
        ${app.status === 'draft' ? `<button id="submitBtn" class="btn btn-primary">提交审批</button><button id="cancelBtn" class="btn btn-danger">取消</button>` : ''}
        ${app.status === 'pending' ? `<button id="approveBtn" class="btn btn-success">批准</button><button id="rejectBtn" class="btn btn-danger">驳回</button>` : ''}
        <a href="#list" class="btn">返回列表</a>
      </div>
    </div>
  `;

  const updateStatus = (status: ApplicationStatus, label: string) => {
    updateApplication(id, { status, statusLabel: label });
    alert(`✅ 状态已更新为：${label}`);
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
