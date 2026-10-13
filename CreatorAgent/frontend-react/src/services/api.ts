import type {
  Project,
  Job,
  ProcessingJob,
  RenderTaskStatus,
  AgentPlan,
  PublishingRecord,
  PublishingJob,
  YtProfile,
  YtVideo,
} from '../types';

export type {
  Project,
  Job,
  ProcessingJob,
  RenderTaskStatus,
  AgentPlan,
  PublishingRecord,
  PublishingJob,
  YtProfile,
  YtVideo,
};

export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : import.meta.env.VITE_API_BASE !== undefined
    ? import.meta.env.VITE_API_BASE
    : (window.location.port === '5173' ? 'http://localhost:8000' : '')
).replace(/\/$/, '');

export const getAuthHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = { ...extra };
  const key =
    localStorage.getItem('tubepilot_creator_key') ||
    localStorage.getItem('creatorops_access_key') ||
    '';
  if (key) {
    headers['X-Creator-Key'] = key;
  }

  const supaToken =
    localStorage.getItem('tubepilot_supabase_token') ||
    localStorage.getItem('supabase_access_token') ||
    '';
  if (supaToken) {
    headers['Authorization'] = `Bearer ${supaToken}`;
  }

  return headers;
};

// Generic fetch wrapper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = getAuthHeaders((options.headers as Record<string, string>) || {});
  
  // Auto-refresh Supabase token if available
  if (!headers['Authorization']) {
    try {
      const keys = Object.keys(localStorage);
      const sbKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
      if (sbKey) {
        const item = localStorage.getItem(sbKey);
        if (item) {
          const parsed = JSON.parse(item);
          const token = parsed?.access_token || parsed?.currentSession?.access_token;
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('tubepilot_supabase_token', token);
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('tubepilot:unauthorized'));
    throw new Error('Access denied. Valid Creator Access Key or authenticated session required.');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  getAuthHeaders,

  setCreatorKey: (key: string) => {
    localStorage.setItem('tubepilot_creator_key', key);
    localStorage.setItem('creatorops_access_key', key);
  },

  clearCreatorKey: () => {
    localStorage.removeItem('tubepilot_creator_key');
    localStorage.removeItem('creatorops_access_key');
  },

  getAuthStatus: async () => {
    return request<{ protected: boolean; authenticated: boolean }>('/api/auth/status');
  },

  verifyCreatorKey: async (accessKey: string) => {
    const res = await request<{ valid: boolean; protected: boolean }>('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_key: accessKey }),
    });
    if (res.valid) {
      api.setCreatorKey(accessKey);
    }
    return res;
  },

  getHealth: async () => {
    return request<{ status: string; engine?: string; version?: string }>('/health');
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const data = await request<{ projects: Project[] }>('/api/v1/projects');
    return data.projects || [];
  },

  createProject: async (payload: Partial<Project>): Promise<Project> => {
    return request<Project>('/api/v1/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  getProject: async (projectId: string): Promise<Project> => {
    return request<Project>(`/api/v1/projects/${projectId}`);
  },

  updateProject: async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    return request<Project>(`/api/v1/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  deleteProject: async (projectId: string): Promise<boolean> => {
    await request<{ deleted: boolean }>(`/api/v1/projects/${projectId}`, { method: 'DELETE' });
    return true;
  },

  // Agents
  generateProjectPlan: async (projectId: string, params: Record<string, any> = {}): Promise<AgentPlan> => {
    return request<AgentPlan>(`/api/v1/projects/${projectId}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  },

  generateCaptions: async (projectId: string, params: Record<string, any> = {}) => {
    return request<{ cues: any[]; total_cues: number; srt: string; vtt: string }>(
      `/api/v1/projects/${projectId}/captions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }
    );
  },

  generateMetadata: async (projectId: string, params: Record<string, any> = {}) => {
    return request<{
      title_suggestions: string[];
      primary_title: string;
      description: string;
      chapters: string[];
      tags: string[];
      thumbnail_concepts: any[];
      is_short: boolean;
    }>(`/api/v1/projects/${projectId}/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  },

  runQA: async (projectId: string, mediaUrl: string) => {
    return request<{
      passed: boolean;
      quality_score: number;
      duration: number;
      dimensions: string;
      checks: any[];
      recommendation: string;
    }>(`/api/v1/projects/${projectId}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_url: mediaUrl }),
    });
  },

  // Jobs
  getJobs: async (): Promise<Job[]> => {
    const data = await request<{ jobs: Job[] }>('/api/v1/jobs');
    return data.jobs || [];
  },

  getJob: async (jobId: string): Promise<Job> => {
    return request<Job>(`/api/v1/jobs/${jobId}`);
  },

  cancelJob: async (jobId: string) => {
    return request<{ cancelled: boolean; job_id: string }>(`/api/v1/jobs/${jobId}/cancel`, {
      method: 'POST',
    });
  },

  // YouTube
  getYoutubeAuthUrl: async (state?: string): Promise<{ auth_url: string; code_verifier?: string }> => {
    const params = new URLSearchParams();
    if (state) params.set('state', state);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ auth_url: string; code_verifier?: string }>(`/api/youtube/auth-url${queryString}`);
  },

  handleYoutubeCallback: async (
    code: string,
    redirectUri?: string,
    codeVerifier?: string
  ): Promise<{ status: string; profile: YtProfile }> => {
    return request<{ status: string; profile: YtProfile }>('/api/youtube/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        redirect_uri: redirectUri || `${window.location.origin}`,
        code_verifier: codeVerifier,
      }),
    });
  },

  disconnectYoutube: async (): Promise<boolean> => {
    await request<{ status: string }>('/api/youtube/clear', {
      method: 'POST',
    });
    return true;
  },

  getYoutubeProfile: async (): Promise<YtProfile | null> => {
    const data = await request<{ authenticated: boolean; profile: YtProfile | null }>('/api/youtube/profile');
    return data.profile;
  },

  getYoutubeVideos: async (): Promise<YtVideo[]> => {
    const data = await request<{ videos: YtVideo[] }>('/api/youtube/user-videos');
    return data.videos || [];
  },

  publishToYoutube: async (payload: {
    task_id: string;
    title: string;
    description?: string;
    privacy?: string;
    project_id?: string;
    scheduled_time?: string;
    user_confirmed?: boolean;
  }) => {
    return request<{
      published: boolean;
      youtube_video_id?: string;
      youtube_url?: string;
      status: string;
      error?: string;
    }>('/api/youtube/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_confirmed: true, ...payload }),
    });
  },

  getPublishingHistory: async (): Promise<PublishingRecord[]> => {
    const data = await request<{ history: PublishingRecord[] }>('/api/v1/publishing/history');
    return data.history || [];
  },
};
