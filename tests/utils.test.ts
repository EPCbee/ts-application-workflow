import { describe, it, expect } from 'vitest';
import { formatContentFields, filterApplicationsByDate } from '../src/lib/utils/mockData';
import type { Application } from '../src/lib/types/application';

describe('formatContentFields', () => {
  it('should format travel fields correctly', () => {
    const content = { destination: '北京', startDate: '2026-05-01', endDate: '2026-05-05', purpose: '项目对接', estimatedCost: 5000, transportation: '飞机' };
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
  // ... 其他测试同之前
});

describe('filterApplicationsByDate', () => {
  // ... 测试同之前
});
