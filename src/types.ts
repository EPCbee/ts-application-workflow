export type ApplicationType = 'travel' | 'purchase' | 'reimbursement' | 'overtime' | 'custom';
export type ApplicationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Applicant {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
}

export interface Application {
  id: string;
  type: ApplicationType;
  typeLabel: string;
  applicant: Applicant;
  title: string;
  content: Record<string, any>;
  status: ApplicationStatus;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  comments?: string;
}

export interface ApplicationStats {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  byType: Record<ApplicationType, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
  avgProcessingTime: number;
}


