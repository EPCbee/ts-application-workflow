import { mockEmployees, typeLabels, formatContentFields } from '../utils';
import { addApplication } from '../store';
import type { Application, Applicant, ApplicationType } from '../types';
import { APPLICATION_TYPES } from '../constants';

let currentApplicant: Applicant = mockEmployees[0];
let currentType: ApplicationType = APPLICATION_TYPES.TRAVEL;
let currentTitle = '';
let currentContent: Record<string, any> = {};

function validateForm(type: ApplicationType, title: string, content: Record<string, any>): string | null {
  if (!title.trim()) return '请填写标题';
  if (type === APPLICATION_TYPES.TRAVEL) {
    if (!content.destination) return '请填写目的地';
    if (!content.startDate) return '请选择开始日期';
    if (!content.endDate) return '请选择结束日期';
    if (!content.purpose) return '请填写出行目的';
    if (!content.estimatedCost || content.estimatedCost <= 0) return '请填写有效预估费用';
  } else if (type === APPLICATION_TYPES.PURCHASE) {
    if (!content.items?.[0]?.name) return '请填写物品名称';
    if (!content.vendor) return '请填写供应商';
  } else if (type === APPLICATION_TYPES.REIMBURSEMENT) {
    if (!content.expenses?.[0]?.category) return '请填写费用类别';
    if (!content.expenses?.[0]?.amount || content.expenses[0].amount <= 0) return '请填写有效金额';
  } else if (type === APPLICATION_TYPES.OVERTIME) {
    if (!content.date) return '请选择加班日期';
    if (!content.hours || content.hours <= 0) return '请填写有效加班时长';
  }
  return null;
}

export function renderCreate(container: HTMLElement) {
  const renderForm = () => {
    const typeOptions = Object.entries(typeLabels).map(([key, label]) =>
      `<option value="${key}" ${key === currentType ? 'selected' : ''}>${label}</option>`
    ).join('');

    container.innerHTML = `
      <div class="card">
        <h2 class="card-title">➕ 发起新申请</h2>
        <form id="appForm">
          <div class="form-group">
            <label class="form-label">申请人</label>
            <select id="applicantSelect" class="form-control">
              ${mockEmployees.map(emp => `<option value="${emp.id}" ${emp.id === currentApplicant.id ? 'selected' : ''}>${emp.name} - ${emp.department}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">申请类型</label>
            <select id="typeSelect" class="form-control">${typeOptions}</select>
          </div>
          <div class="form-group">
            <label class="form-label">标题</label>
            <input type="text" id="titleInput" class="form-control" value="${currentTitle}" placeholder="请输入标题" />
          </div>
          <div id="dynamicFields" class="dynamic-fields"></div>
          <div class="form-group form-btn-group">
            <button type="button" id="previewBtn" class="btn btn-primary">预览</button>
            <button type="button" id="submitBtn" class="btn btn-success">提交</button>
          </div>
        </form>
      </div>
      <div id="previewModal" class="preview-modal-wrap"></div>
    `;

    const applicantSelect = document.getElementById('applicantSelect') as HTMLSelectElement;
    const typeSelect = document.getElementById('typeSelect') as HTMLSelectElement;
    const titleInput = document.getElementById('titleInput') as HTMLInputElement;
    const previewBtn = document.getElementById('previewBtn')!;
    const submitBtn = document.getElementById('submitBtn')!;
    const modalContainer = document.getElementById('previewModal')!;

    const renderDynamicFields = () => {
      const type = typeSelect.value as ApplicationType;
      const container = document.getElementById('dynamicFields')!;
      let html = '';
      if (type === APPLICATION_TYPES.TRAVEL) {
        html = `
          <div class="form-group"><label class="form-label">目的地</label><input class="form-control" type="text" id="dest" value="${currentContent.destination || ''}" /></div>
          <div class="form-group"><label class="form-label">开始日期</label><input class="form-control" type="date" id="startDate" value="${currentContent.startDate || ''}" /></div>
          <div class="form-group"><label class="form-label">结束日期</label><input class="form-control" type="date" id="endDate" value="${currentContent.endDate || ''}" /></div>
          <div class="form-group"><label class="form-label">出行目的</label><input class="form-control" type="text" id="purpose" value="${currentContent.purpose || ''}" /></div>
          <div class="form-group"><label class="form-label">预估费用</label><input class="form-control" type="number" id="cost" value="${currentContent.estimatedCost || ''}" /></div>
          <div class="form-group"><label class="form-label">交通方式</label><select id="transport" class="form-control"><option value="飞机">飞机</option><option value="高铁">高铁</option><option value="汽车">汽车</option></select></div>
        `;
      } else if (type === APPLICATION_TYPES.PURCHASE) {
        html = `
          <div class="form-group"><label class="form-label">物品名称</label><input class="form-control" type="text" id="item" value="${currentContent.items?.[0]?.name || ''}" /></div>
          <div class="form-group"><label class="form-label">供应商</label><input class="form-control" type="text" id="vendor" value="${currentContent.vendor || ''}" /></div>
        `;
      } else if (type === APPLICATION_TYPES.REIMBURSEMENT) {
        html = `
          <div class="form-group"><label class="form-label">费用类别</label><input class="form-control" type="text" id="expCat" value="${currentContent.expenses?.[0]?.category || ''}" /></div>
          <div class="form-group"><label class="form-label">金额</label><input class="form-control" type="number" id="expAmt" value="${currentContent.expenses?.[0]?.amount || ''}" /></div>
        `;
      } else if (type === APPLICATION_TYPES.OVERTIME) {
        html = `
          <div class="form-group"><label class="form-label">加班日期</label><input class="form-control" type="date" id="otDate" value="${currentContent.date || ''}" /></div>
          <div class="form-group"><label class="form-label">加班时长（小时）</label><input class="form-control" type="number" id="otHours" value="${currentContent.hours || ''}" /></div>
        `;
      } else if (type === APPLICATION_TYPES.CUSTOM) {
        html = `
          <div class="form-group"><label class="form-label">自定义字段名</label><input class="form-control" type="text" id="customLabel" value="${currentContent.customFields?.[0]?.label || ''}" /></div>
          <div class="form-group"><label class="form-label">自定义值</label><input class="form-control" type="text" id="customVal" value="${currentContent.customFields?.[0]?.value || ''}" /></div>
        `;
      }
      container.innerHTML = html;
    };
    renderDynamicFields();

    const collectFormData = () => {
      const type = typeSelect.value as ApplicationType;
      const title = titleInput.value;
      const applicant = mockEmployees.find(e => e.id === applicantSelect.value)!;
      const content: Record<string, any> = {};
      if (type === APPLICATION_TYPES.TRAVEL) {
        content.destination = (document.getElementById('dest') as HTMLInputElement).value;
        content.startDate = (document.getElementById('startDate') as HTMLInputElement).value;
        content.endDate = (document.getElementById('endDate') as HTMLInputElement).value;
        content.purpose = (document.getElementById('purpose') as HTMLInputElement).value;
        content.estimatedCost = Number((document.getElementById('cost') as HTMLInputElement).value);
        content.transportation = (document.getElementById('transport') as HTMLSelectElement).value;
      } else if (type === APPLICATION_TYPES.PURCHASE) {
        content.items = [{ name: (document.getElementById('item') as HTMLInputElement).value, quantity: 1, unitPrice: 0, total: 0 }];
        content.vendor = (document.getElementById('vendor') as HTMLInputElement).value;
      } else if (type === APPLICATION_TYPES.REIMBURSEMENT) {
        const amt = Number((document.getElementById('expAmt') as HTMLInputElement).value);
        content.expenses = [{ category: (document.getElementById('expCat') as HTMLInputElement).value, amount: amt, date: new Date().toISOString().split('T')[0], description: '' }];
        content.totalAmount = amt;
      } else if (type === APPLICATION_TYPES.OVERTIME) {
        content.date = (document.getElementById('otDate') as HTMLInputElement).value;
        content.hours = Number((document.getElementById('otHours') as HTMLInputElement).value);
      } else if (type === APPLICATION_TYPES.CUSTOM) {
        content.customFields = [{ label: (document.getElementById('customLabel') as HTMLInputElement).value, value: (document.getElementById('customVal') as HTMLInputElement).value }];
      }
      return { type, title, applicant, content };
    };

    const handleSubmit = (previewOnly: boolean) => {
      const { type, title, applicant, content } = collectFormData();
      const error = validateForm(type, title, content);
      if (error) {
        alert(`⚠️ ${error}`);
        return;
      }
      if (previewOnly) {
        showPreviewModal(applicant, type, title, content);
        return;
      }
      const newApp: Application = {
        id: `app_${Date.now()}`,
        type,
        typeLabel: typeLabels[type],
        applicant: { ...applicant },
        title,
        content,
        status: 'pending',
        statusLabel: '待审批',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
      };
      addApplication(newApp);
      alert('✅ 申请已提交！');
      window.location.hash = 'list';
    };

    const showPreviewModal = (applicant: Applicant, type: ApplicationType, title: string, content: Record<string, any>) => {
      const fields = formatContentFields(content, type);
      const fieldsHTML = fields.length > 0
        ? fields.map(f => `
            <div class="preview-field-row">
              <span class="preview-field-label">${f.label}</span>
              <span class="preview-field-value">${f.value}</span>
            </div>
          `).join('')
        : '<span class="preview-empty-text">无内容</span>';

      const modalHTML = `
        <div class="modal-overlay" id="modalOverlay">
          <div class="modal">
            <div class="modal-header">
              <h3>📋 预览申请</h3>
              <button class="modal-close" id="modalClose">&times;</button>
            </div>
            <div class="modal-body">
              <div class="preview-item">
                <strong>申请人：</strong>${applicant.name} (${applicant.department})
              </div>
              <div class="preview-item">
                <strong>类型：</strong>${typeLabels[type]}
              </div>
              <div class="preview-item">
                <strong>标题：</strong>${title}
              </div>
              <div>
                <strong>内容：</strong>
              </div>
              <div class="preview-content-wrap">${fieldsHTML}</div>
            </div>
            <div class="modal-footer">
              <button class="btn" id="modalEditBtn">返回修改</button>
              <button class="btn btn-success" id="modalSubmitBtn">确认提交</button>
            </div>
          </div>
        </div>
      `;
      modalContainer.innerHTML = modalHTML;
      modalContainer.style.display = 'block';

      document.getElementById('modalClose')!.addEventListener('click', () => {
        modalContainer.style.display = 'none';
      });
      document.getElementById('modalOverlay')!.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) modalContainer.style.display = 'none';
      });
      document.getElementById('modalEditBtn')!.addEventListener('click', () => {
        modalContainer.style.display = 'none';
      });
      document.getElementById('modalSubmitBtn')!.addEventListener('click', () => {
        modalContainer.style.display = 'none';
        handleSubmit(false);
      });
    };

    previewBtn.addEventListener('click', () => handleSubmit(true));
    submitBtn.addEventListener('click', () => handleSubmit(false));

    typeSelect.addEventListener('change', () => {
      currentType = typeSelect.value as ApplicationType;
      renderDynamicFields();
    });
  };

  renderForm();
}
