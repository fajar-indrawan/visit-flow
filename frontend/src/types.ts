export type Role = 'SALES' | 'ADMIN';
export type Segment = 'B2G' | 'B2B';
export type VisitStatus = 'NOT_VISITED' | 'VISITED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface EntityOption {
  id: string;
  name: string;
  type: string;
  segment: Segment;
  region: string;
  displayName: string;
  source: 'MASTER' | 'HISTORY';
}

export interface Activity {
  id: string;
  entityId: string | null;
  entityName: string;
  entityType: string;
  region: string;
  segment: Segment;
  visitDate: string;
  status: VisitStatus;
  salesName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitySummary {
  total: number;
  visited: number;
  notVisited: number;
}

export interface ActivityListResponse {
  data: Activity[];
  summary: ActivitySummary;
}

export interface ActivityFilterParams {
  segment?: Segment | '';
  status?: VisitStatus | '';
  from?: string;
  to?: string;
  search?: string;
}
