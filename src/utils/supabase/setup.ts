import { supabase } from './client';

export async function initializeDatabase() {
  try {
    // Create employees table
    const { error: employeesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS employees (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          department TEXT,
          computer_name TEXT,
          status TEXT DEFAULT 'inactive',
          last_activity TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create screenshots table
    const { error: screenshotsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS screenshots (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id TEXT NOT NULL,
          employee_name TEXT,
          window_title TEXT,
          app_name TEXT,
          computer_name TEXT,
          screenshot_url TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create activity_logs table
    const { error: logsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id TEXT NOT NULL,
          activity_type TEXT,
          description TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create settings table
    const { error: settingsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS system_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          screenshot_interval INTEGER DEFAULT 5,
          retention_days INTEGER DEFAULT 30,
          privacy_mode BOOLEAN DEFAULT false,
          admin_email TEXT,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create storage bucket for screenshots
    const { error: bucketError } = await supabase.storage.createBucket('screenshots', {
      public: false,
      fileSizeLimit: 10485760, // 10MB
    });

    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    return { success: false, error };
  }
}
