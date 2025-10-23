import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

export const supabase = createSupabaseClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export type Employee = {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  department: string;
  computer_name: string;
  status: 'active' | 'inactive' | 'offline';
  last_activity: string;
  created_at: string;
};

export type Screenshot = {
  id: string;
  employee_id: string;
  employee_name: string;
  window_title: string;
  app_name: string;
  computer_name: string;
  screenshot_url: string;
  timestamp: string;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  employee_id: string;
  activity_type: string;
  description: string;
  timestamp: string;
};

export type SystemSettings = {
  id: string;
  screenshot_interval: number;
  retention_days: number;
  privacy_mode: boolean;
  admin_email: string;
  updated_at: string;
};
