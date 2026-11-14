import type {
  Activity,
  ActivityFilterParams,
  ActivityListResponse,
  AuthResponse,
  EntityOption,
  Segment,
  VisitStatus,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('visit_flow_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !path.includes('/auth/login')) {
    localStorage.removeItem('visit_flow_token');
    localStorage.removeItem('visit_flow_user');
    window.location.href = '/login';
    throw new ApiError('Sesi berakhir, silakan login kembali.', 401);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'Terjadi kesalahan pada server';
    throw new ApiError(msg, response.status);
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getActivities: (params: ActivityFilterParams) => {
    const query = new URLSearchParams();
    if (params.segment) query.set('segment', params.segment);
    if (params.status) query.set('status', params.status);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.search?.trim()) query.set('search', params.search.trim());

    const qs = query.toString();
    return request<ActivityListResponse>(`/activities${qs ? `?${qs}` : ''}`);
  },

  createActivity: (payload: {
    entityId: string;
    segment: Segment;
    visitDate: string;
    salesName: string;
  }) =>
    request<Activity>('/activities', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateActivityStatus: (id: string, status: VisitStatus) =>
    request<Activity>(`/activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getEntities: (segment?: Segment | '', search?: string) => {
    const query = new URLSearchParams();
    if (segment) query.set('segment', segment);
    if (search?.trim()) query.set('search', search.trim());

    const qs = query.toString();
    return request<EntityOption[]>(`/entities${qs ? `?${qs}` : ''}`);
  },
};
