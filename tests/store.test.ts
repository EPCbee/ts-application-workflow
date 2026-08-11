import { describe, it, expect, beforeEach } from 'vitest';
import { initStore, resetStore, getApplications, addApplication, updateApplication, getStats } from '../src/store';
import type { Application } from '../src/types';

beforeEach(() => {
  localStorage.clear();
  // 不自动生成 mock，清空 store
  initStore(false);
});

describe('store', () => {
  it('should add an application', () => {
    const app: Application = {
      id: 'test1',
      type: 'travel',
      typeLabel: '差旅',
      applicant: { id: '1', name: 'A', department: 'D', email: 'a@a', phone: '123' },
      title: 'Test',
      content: {},
      status: 'draft',
      statusLabel: '草稿',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addApplication(app);
    expect(getApplications()).toHaveLength(1);
  });

  it('should update status', () => {
    const app: Application = {
      id: 'test2',
      type: 'travel',
      typeLabel: '差旅',
      applicant: { id: '1', name: 'A', department: 'D', email: 'a@a', phone: '123' },
      title: 'Test',
      content: {},
      status: 'draft',
      statusLabel: '草稿',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addApplication(app);
    updateApplication('test2', { status: 'pending', statusLabel: '待审批' });
    const updated = getApplications()[0];
    expect(updated.status).toBe('pending');
  });

  it('should compute stats', () => {
    // 先清空再添加一些数据
    resetStore();
    const app1: Application = {
      id: 's1',
      type: 'travel',
      typeLabel: '差旅',
      applicant: { id: '1', name: 'A', department: 'D', email: 'a@a', phone: '123' },
      title: 'Test1',
      content: {},
      status: 'pending',
      statusLabel: '待审批',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const app2: Application = {
      id: 's2',
      type: 'travel',
      typeLabel: '差旅',
      applicant: { id: '1', name: 'A', department: 'D', email: 'a@a', phone: '123' },
      title: 'Test2',
      content: {},
      status: 'approved',
      statusLabel: '已批准',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      approvedAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    };
    addApplication(app1);
    addApplication(app2);
    const stats = getStats();
    expect(stats.total).toBe(2);
    expect(stats.byStatus.pending).toBe(1);
    expect(stats.byStatus.approved).toBe(1);
    expect(stats.avgProcessingTime).toBeCloseTo(2, 0);
  });
});
