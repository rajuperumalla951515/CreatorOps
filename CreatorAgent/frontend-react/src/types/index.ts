export interface Project {
  id: string;
  title: string;
  name?: string;
  video_format: string;
  format?: string;
  aspect_ratio: string;
  ratio?: string;
  layout?: string;
  target_duration: number;
  instructions: string;
  status: 'draft' | 'planning' | 'rendering' | 'ready' | 'published' | string;
  created_at: string | number;
  updated_at: string | number;
  metadata?: Record<string, any>;
}

export interface Job {
  id: string;
  project_id?: string;
  job_type: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled' | string;
  step?: number;
  total_steps?: number;
  step_title?: string;
  step_subtitle?: string;
  progress_pct: number;
  log?: string;
  log_text?: string;
  media_url?: string;
  error_message?: string;
  created_at: string | number;
  started_at?: string | number;
  completed_at?: string | number;
}

export type ProcessingJob = Job;

export interface RenderTaskStatus {
  id: string;
  status: 'queued' | 'processing' | 'complete' | 'failed' | string;
  step: number;
  total_steps: number;
  step_title: string;
  step_subtitle: string;
  elapsed: number;
  log: string;
  error?: string;
  media_url?: string;
}

export interface AgentPlan {
  plan_id?: string;
  intended_output: string;
  project_name?: string;
  target_format?: string;
  target_aspect_ratio?: string;
  target_layout?: string;
  target_duration_seconds: number;
  v1_trim?: { start: number; end: number };
  v2_trim?: { start: number; end: number };
  operations: Array<{
    step?: number;
    id?: string;
    type?: string;
    stage?: string;
    description: string;
    [key: string]: any;
  }>;
  warnings?: string[];
  estimated_resources?: {
    estimated_render_seconds?: number;
    ram_mb?: number;
    vram_mb?: number;
  };
  estimated_processing_seconds?: number;
  estimated_human_time?: string;
  status?: string;
  requires_user_approval?: boolean;
}

export interface YtProfile {
  title: string;
  handle?: string;
  custom_url?: string;
  avatar_url?: string;
  thumbnail_url?: string;
  subscriber_count: number | string;
  video_count: number | string;
  view_count?: number | string;
  channel_id?: string;
  description?: string;
}

export interface YtVideo {
  id?: string;
  title: string;
  url: string;
  thumbnail?: string;
  published_at: string;
}

export interface PublishingRecord {
  id: string;
  project_id?: string;
  title: string;
  video_title?: string;
  description?: string;
  privacy: string;
  privacy_status?: string;
  scheduled_publish_time?: string;
  youtube_video_id?: string;
  youtube_url?: string;
  status: string;
  error_message?: string;
  created_at: string | number;
  published_at?: string | number;
}

export type PublishingJob = PublishingRecord;
