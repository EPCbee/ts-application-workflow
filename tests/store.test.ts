import { describe, it, expect, beforeEach } from 'vitest';
import { applicationStore } from '../src/lib/stores/applicationStore';
import type { Application } from '../src/lib/types/application';

beforeEach(() => {
  // 重置 store
  applicationStore.reset();
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
    applicationStore.addApplication(app);
    let apps: Application[] = [];
    applicationStore.subscribe(a => apps = a)();
    expect(apps).toHaveLength(1);
  });
  // ... 更多测试
});
import { describe, it, expect, beforeEach } from 'vitest';
import { applicationStore } from '../src/lib/stores/applicationStore';
import type { Application } from '../src/lib/types/application';

describe('applicationStore', () => {
  beforeEach(() => {
    // 重置 store，避免测试间互相干扰
    applicationStore.reset();
  });

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
    applicationStore.addApplication(app);
    let apps: Application[] = [];
    const unsubscribe = applicationStore.subscribe(value => { apps = value; });
    expect(apps).toHaveLength(1);
    expect(apps[0].id).toBe('test1');
    unsubscribe();
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
    applicationStore.addApplication(app);
    applicationStore.updateApplication('test2', { status: 'pending', statusLabel: '待审批' });
    let apps: Application[] = [];
    const unsubscribe = applicationStore.subscribe(value => { apps = value; });
    expect(apps[0].status).toBe('pending');
    unsubscribe();
  });
});