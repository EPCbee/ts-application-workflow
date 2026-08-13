// src/lib/stores/applicationStore.ts
import { writable, derived } from 'svelte/store';
import type { Application, ApplicationStatus, ApplicationType, ApplicationStats } from '$lib/types/application';
import { generateMockApplications } from '$lib/utils/mockData';

const STORAGE_KEY = 'applications';

function loadApplications(): Application[] {
  if (typeof localStorage === 'undefined') return generateMockApplications(30);
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try { return JSON.parse(data); } catch {}
  }
  const mock = generateMockApplications(30);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
  return mock;
}

function saveApplications(apps: Application[]) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  }
}

// 创建 store
const initial = loadApplications();
const { subscribe, set, update } = writable<Application[]>(initial);

// 获取所有申请（直接读取最新值）
function getApplications(): Application[] {
  let result: Application[] = [];
  // 使用 subscribe 获取当前值
  const unsub = subscribe(val => { result = val; });
  unsub();
  return result;
}

// 根据 ID 查找
function getApplicationById(id: string): Application | undefined {
  return getApplications().find(app => app.id === id);
}

// 导出 store 对象
export const applicationStore = {
  subscribe,
  addApplication: (app: Application) => update(apps => {
    const newApps = [app, ...apps];
    saveApplications(newApps);
    return newApps;
  }),
  updateApplication: (id: string, updates: Partial<Application>) => update(apps => {
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
      apps[index] = { ...apps[index], ...updates, updatedAt: new Date().toISOString() };
      saveApplications(apps);
    }
    return apps;
  }),
  deleteApplication: (id: string) => update(apps => {
    const newApps = apps.filter(a => a.id !== id);
    saveApplications(newApps);
    return newApps;
  }),
  getApplicationById,
  getApplications,
  reset: () => {
    const mock = generateMockApplications(30);
    set(mock);
    saveApplications(mock);
  },
  // 新增：清空所有数据
  clear: () => {
    set([]);
    saveApplications([]);
  }
};

// 派生 store：按状态过滤
export const applicationsByStatus = (status: ApplicationStatus | 'all') => derived(
  applicationStore,
  $apps => status === 'all' ? $apps : $apps.filter(a => a.status === status)
);

// 派生 store：统计信息
export const statsStore = derived(applicationStore, $apps => {
  const total = $apps.length;
  const byStatus: Record<ApplicationStatus, number> = { draft: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 };
  const byType: Record<ApplicationType, number> = { travel: 0, purchase: 0, reimbursement: 0, overtime: 0, custom: 0 };
  const monthMap = new Map<string, number>();
  let totalDays = 0, processed = 0;

  $apps.forEach(app => {
    byStatus[app.status] = (byStatus[app.status] || 0) + 1;
    byType[app.type] = (byType[app.type] || 0) + 1;
    const month = app.createdAt.slice(0, 7);
    monthMap.set(month, (monthMap.get(month) || 0) + 1);
    if (app.submittedAt && app.approvedAt) {
      const days = (new Date(app.approvedAt).getTime() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
      totalDays += days;
      processed++;
    }
  });

  const monthlyTrend = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));
  const avgProcessingTime = processed > 0 ? totalDays / processed : 0;

  return { total, byStatus, byType, monthlyTrend, avgProcessingTime } as ApplicationStats;
});