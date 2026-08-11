import type { Application, ApplicationStatus, ApplicationType, ApplicationStats } from './types';
import { generateMockApplications } from './utils';

const STORAGE_KEY = 'applications';

let applications: Application[] = [];

function loadApplications(): Application[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data).map((app: any) => app);
    } catch {}
  }
  const mock = generateMockApplications(30);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
  return mock;
}

function saveApplications(apps: Application[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export function initStore(useMock: boolean = true) {
  if (useMock) {
    applications = loadApplications();
  } else {
    applications = [];
    saveApplications(applications);
  }
}

export function resetStore() {
  applications = [];
  saveApplications(applications);
}

export function getApplications(): Application[] {
  return applications;
}

export function getApplicationById(id: string): Application | undefined {
  return applications.find(app => app.id === id);
}

export function addApplication(app: Application): void {
  applications = [app, ...applications];
  saveApplications(applications);
}

export function updateApplication(id: string, updates: Partial<Application>): void {
  const index = applications.findIndex(app => app.id === id);
  if (index !== -1) {
    applications[index] = { ...applications[index], ...updates, updatedAt: new Date().toISOString() };
    saveApplications(applications);
  }
}

export function deleteApplication(id: string): void {
  applications = applications.filter(app => app.id !== id);
  saveApplications(applications);
}

export function getStats(): ApplicationStats {
  const apps = applications;
  const total = apps.length;
  const byStatus: Record<ApplicationStatus, number> = { draft: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 };
  const byType: Record<ApplicationType, number> = { travel: 0, purchase: 0, reimbursement: 0, overtime: 0, custom: 0 };
  const monthMap = new Map<string, number>();
  let totalDays = 0, processed = 0;

  apps.forEach(app => {
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

  return {
    total,
    byStatus,
    byType,
    monthlyTrend,
    avgProcessingTime: processed > 0 ? totalDays / processed : 0,
  };
}

// 初始化（默认使用 mock）
initStore(true);
