import { describe, it, expect } from 'vitest';
import { formatContentFields, filterApplicationsByDate } from '../src/utils';
import type { Application, ApplicationType } from '../src/types';

describe('formatContentFields', () => {
  it('should format travel fields correctly', () => {
    const content = {
      destination: '北京',
      startDate: '2026-05-01',
      endDate: '2026-05-05',
      purpose: '项目对接',
      estimatedCost: 5000,
      transportation: '飞机',
    };
    const fields = formatContentFields(content, 'travel');
    expect(fields).toEqual([
      { label: '目的地', value: '北京' },
      { label: '开始日期', value: '2026-05-01' },
      { label: '结束日期', value: '2026-05-05' },
      { label: '出行目的', value: '项目对接' },
      { label: '预估费用', value: '¥5000' },
      { label: '交通方式', value: '飞机' },
    ]);
  });

  it('should format reimbursement fields correctly', () => {
    const content = {
      expenses: [
        { category: '交通费', amount: 200, date: '2026-05-01', description: '打车' },
        { category: '住宿费', amount: 800, date: '2026-05-02', description: '酒店' },
      ],
      totalAmount: 1000,
    };
    const fields = formatContentFields(content, 'reimbursement');
    expect(fields).toEqual([
      { label: '费用1类别', value: '交通费' },
      { label: '费用1金额', value: '¥200' },
      { label: '费用1日期', value: '2026-05-01' },
      { label: '费用1描述', value: '打车' },
      { label: '费用2类别', value: '住宿费' },
      { label: '费用2金额', value: '¥800' },
      { label: '费用2日期', value: '2026-05-02' },
      { label: '费用2描述', value: '酒店' },
      { label: '总金额', value: '¥1000' },
    ]);
  });

  it('should format overtime fields correctly', () => {
    const content = {
      date: '2026-05-10',
      hours: 3,
      startTime: '18:00',
      endTime: '21:00',
      reason: '紧急维护',
    };
    const fields = formatContentFields(content, 'overtime');
    expect(fields).toEqual([
      { label: '加班日期', value: '2026-05-10' },
      { label: '加班时长', value: '3' },
      { label: '开始时间', value: '18:00' },
      { label: '结束时间', value: '21:00' },
      { label: '加班原因', value: '紧急维护' },
    ]);
  });

  it('should format purchase fields correctly', () => {
    const content = {
      items: [{ name: '笔记本', quantity: 2, total: 16000 }],
      vendor: '联想',
      deliveryDate: '2026-05-15',
      reason: '设备更新',
    };
    const fields = formatContentFields(content, 'purchase');
    expect(fields).toEqual([
      { label: '物品清单', value: '笔记本 × 2 = ¥16000' },
      { label: '供应商', value: '联想' },
      { label: '预计交付日期', value: '2026-05-15' },
      { label: '采购原因', value: '设备更新' },
    ]);
  });

  it('should format custom fields correctly', () => {
    const content = {
      customFields: [{ label: '审批人', value: '张三' }, { label: '备注', value: '重要' }],
    };
    const fields = formatContentFields(content, 'custom');
    expect(fields).toEqual([
      { label: '审批人', value: '张三' },
      { label: '备注', value: '重要' },
    ]);
  });
});

describe('filterApplicationsByDate', () => {
  const createApp = (submittedAt: string | undefined): Application => ({
    id: '1',
    type: 'travel',
    typeLabel: '差旅',
    applicant: { id: '1', name: 'A', department: 'D', email: 'a@a', phone: '123' },
    title: 'Test',
    content: {},
    status: 'pending',
    statusLabel: '待审批',
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    submittedAt,
  });

  it('should filter by start date', () => {
    const apps = [
      createApp('2026-05-10T00:00:00.000Z'),
      createApp('2026-05-12T00:00:00.000Z'),
      createApp('2026-05-09T00:00:00.000Z'),
    ];
    const result = filterApplicationsByDate(apps, '2026-05-10');
    expect(result).toHaveLength(2);
    expect(result.map(a => a.submittedAt)).toEqual(['2026-05-10T00:00:00.000Z', '2026-05-12T00:00:00.000Z']);
  });

  it('should filter by end date inclusive', () => {
    const apps = [
      createApp('2026-05-10T00:00:00.000Z'),
      createApp('2026-05-11T23:59:59.999Z'),
      createApp('2026-05-12T00:00:00.000Z'),
    ];
    const result = filterApplicationsByDate(apps, undefined, '2026-05-11');
    expect(result).toHaveLength(2);
    expect(result.map(a => a.submittedAt)).toEqual(['2026-05-10T00:00:00.000Z', '2026-05-11T23:59:59.999Z']);
  });

  it('should filter by both start and end', () => {
    const apps = [
      createApp('2026-05-10T00:00:00.000Z'),
      createApp('2026-05-11T12:00:00.000Z'),
      createApp('2026-05-12T00:00:00.000Z'),
    ];
    const result = filterApplicationsByDate(apps, '2026-05-10', '2026-05-11');
    expect(result).toHaveLength(2);
  });

  it('should return all if no dates', () => {
    const apps = [createApp('2026-05-10T00:00:00.000Z')];
    const result = filterApplicationsByDate(apps);
    expect(result).toHaveLength(1);
  });

  it('should ignore apps without submittedAt', () => {
    const apps = [createApp(undefined), createApp('2026-05-10T00:00:00.000Z')];
    const result = filterApplicationsByDate(apps, '2026-05-10');
    expect(result).toHaveLength(1);
  });
});
