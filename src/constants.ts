// 运行时常量，用于避免硬编码字符串
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