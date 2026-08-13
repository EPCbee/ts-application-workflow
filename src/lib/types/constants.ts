import type { ApplicationType, ApplicationStatus } from './types/application';

export const APPLICATION_TYPES = {
  TRAVEL: 'travel' as const,
  PURCHASE: 'purchase' as const,
  REIMBURSEMENT: 'reimbursement' as const,
  OVERTIME: 'overtime' as const,
  CUSTOM: 'custom' as const,
} as const;

export const APPLICATION_STATUSES = {
  DRAFT: 'draft' as const,
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
  CANCELLED: 'cancelled' as const,
} as const;

export const typeLabels: Record<ApplicationType, string> = {
  [APPLICATION_TYPES.TRAVEL]: '差旅申请',
  [APPLICATION_TYPES.PURCHASE]: '采购申请',
  [APPLICATION_TYPES.REIMBURSEMENT]: '报销申请',
  [APPLICATION_TYPES.OVERTIME]: '加班申请',
  [APPLICATION_TYPES.CUSTOM]: '自定义申请',
};

export const statusLabels: Record<ApplicationStatus, string> = {
  [APPLICATION_STATUSES.DRAFT]: '草稿',
  [APPLICATION_STATUSES.PENDING]: '待审批',
  [APPLICATION_STATUSES.APPROVED]: '已批准',
  [APPLICATION_STATUSES.REJECTED]: '已驳回',
  [APPLICATION_STATUSES.CANCELLED]: '已取消',
};