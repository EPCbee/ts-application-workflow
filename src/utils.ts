import type { Applicant, Application, ApplicationType, ApplicationStatus } from './types';

export const mockEmployees: Applicant[] = [
  { id: 'emp001', name: '张伟', department: '技术研发部', email: 'zhangwei@company.com', phone: '13800001001' },
  { id: 'emp002', name: '李娜', department: '市场营销部', email: 'lina@company.com', phone: '13800001002' },
  { id: 'emp003', name: '王强', department: '财务管理部', email: 'wangqiang@company.com', phone: '13800001003' },
  { id: 'emp004', name: '刘洋', department: '人力资源部', email: 'liuyang@company.com', phone: '13800001004' },
  { id: 'emp005', name: '陈静', department: '技术研发部', email: 'chenjing@company.com', phone: '13800001005' },
  { id: 'emp006', name: '赵磊', department: '运营管理部', email: 'zhaolei@company.com', phone: '13800001006' },
  { id: 'emp007', name: '孙悦', department: '产品设计部', email: 'sunyue@company.com', phone: '13800001007' },
];

export const typeLabels: Record<ApplicationType, string> = {
  travel: '差旅申请',
  purchase: '采购申请',
  reimbursement: '报销申请',
  overtime: '加班申请',
  custom: '自定义申请',
};

export const statusLabels: Record<ApplicationStatus, string> = {
  draft: '草稿',
  pending: '待审批',
  approved: '已批准',
  rejected: '已驳回',
  cancelled: '已取消',
};

export function formatContentFields(content: Record<string, any>, type: ApplicationType): Array<{ label: string; value: string }> {
  const result: Array<{ label: string; value: string }> = [];
  const labelMap: Record<string, string> = {
    destination: '目的地',
    startDate: '开始日期',
    endDate: '结束日期',
    purpose: '出行目的',
    estimatedCost: '预估费用',
    transportation: '交通方式',
    items: '采购物品',
    vendor: '供应商',
    deliveryDate: '预计交付日期',
    expenses: '费用明细',
    totalAmount: '总金额',
    date: '加班日期',
    hours: '加班时长',
    startTime: '开始时间',
    endTime: '结束时间',
    reason: '加班原因',
    customFields: '自定义字段',
  };

  if (type === 'travel') {
    const fields = ['destination', 'startDate', 'endDate', 'purpose', 'estimatedCost', 'transportation'];
    fields.forEach(key => {
      const val = content[key];
      if (val !== undefined && val !== '') {
        let display = String(val);
        if (key === 'estimatedCost') display = `¥${val}`;
        result.push({ label: labelMap[key] || key, value: display });
      }
    });
  } else if (type === 'purchase') {
    if (content.items && Array.isArray(content.items) && content.items.length > 0) {
      const itemsStr = content.items.map((item: any) => `${item.name} × ${item.quantity} = ¥${item.total}`).join('; ');
      result.push({ label: '物品清单', value: itemsStr });
    }
    if (content.vendor) result.push({ label: '供应商', value: content.vendor });
    if (content.deliveryDate) result.push({ label: '预计交付日期', value: content.deliveryDate });
    if (content.reason) result.push({ label: '采购原因', value: content.reason });
  } else if (type === 'reimbursement') {
    if (content.expenses && Array.isArray(content.expenses)) {
      content.expenses.forEach((exp: any, idx: number) => {
        if (exp.category) result.push({ label: `费用${idx+1}类别`, value: exp.category });
        if (exp.amount) result.push({ label: `费用${idx+1}金额`, value: `¥${exp.amount}` });
        if (exp.date) result.push({ label: `费用${idx+1}日期`, value: exp.date });
        if (exp.description) result.push({ label: `费用${idx+1}描述`, value: exp.description });
      });
    }
    if (content.totalAmount !== undefined) result.push({ label: '总金额', value: `¥${content.totalAmount}` });
  } else if (type === 'overtime') {
    const fields = ['date', 'hours', 'startTime', 'endTime', 'reason'];
    fields.forEach(key => {
      const val = content[key];
      if (val !== undefined && val !== '') {
        result.push({ label: labelMap[key] || key, value: String(val) });
      }
    });
  } else if (type === 'custom') {
    if (content.customFields && Array.isArray(content.customFields)) {
      content.customFields.forEach((field: any) => {
        if (field.label && field.value) {
          result.push({ label: field.label, value: field.value });
        }
      });
    }
  }
  return result;
}

// 日期过滤，包含结束日期（endDate 当天 23:59:59）
export function filterApplicationsByDate(
  apps: Application[],
  startDate?: string,
  endDate?: string
): Application[] {
  let filtered = apps;
  if (startDate) {
    filtered = filtered.filter(a => a.submittedAt && a.submittedAt.slice(0, 10) >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(a => a.submittedAt && a.submittedAt.slice(0, 10) <= endDate);
  }
  return filtered;
}

function generateMockContent(type: ApplicationType): Record<string, any> {
  const contents: Record<ApplicationType, () => Record<string, any>> = {
    travel: () => ({
      destination: ['北京', '上海', '广州', '深圳'][Math.floor(Math.random() * 4)],
      startDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + (30 + Math.random() * 20) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      purpose: ['项目对接', '客户拜访', '技术交流'][Math.floor(Math.random() * 3)],
      estimatedCost: Math.round((2000 + Math.random() * 8000) / 100) * 100,
      transportation: ['飞机', '高铁', '汽车'][Math.floor(Math.random() * 3)],
    }),
    purchase: () => ({
      items: [{ name: '笔记本电脑', quantity: 2, unitPrice: 8000, total: 16000 }],
      vendor: '联想',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason: '设备更新',
    }),
    reimbursement: () => ({
      expenses: [{ category: '交通费', amount: 200, date: new Date().toISOString().split('T')[0], description: '打车' }],
      totalAmount: 200,
    }),
    overtime: () => ({
      date: new Date().toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '20:00',
      reason: '项目紧急',
      hours: 2,
    }),
    custom: () => ({
      customFields: [{ label: '备注', value: '自定义内容' }],
    }),
  };
  return contents[type]();
}

export function generateMockApplications(count = 20): Application[] {
  const apps: Application[] = [];
  const types = Object.keys(typeLabels) as ApplicationType[];
  const statuses: ApplicationStatus[] = ['draft', 'pending', 'approved', 'rejected', 'cancelled'];
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const employee = mockEmployees[Math.floor(Math.random() * mockEmployees.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const content = generateMockContent(type);
    const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    const app: Application = {
      id: `app_${String(i + 1).padStart(4, '0')}`,
      type,
      typeLabel: typeLabels[type],
      applicant: { ...employee },
      title: `${typeLabels[type]} - ${createdAt.toLocaleDateString()}`,
      content,
      status,
      statusLabel: statusLabels[status],
      createdAt: createdAt.toISOString(),
      updatedAt: new Date(createdAt.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
      comments: Math.random() > 0.5 ? '审批意见：同意' : undefined,
    };
    if (status === 'approved' || status === 'rejected') {
      app.submittedAt = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
      app.approvedAt = new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
    } else if (status === 'pending') {
      app.submittedAt = new Date(createdAt.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
    }
    apps.push(app);
  }
  return apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
