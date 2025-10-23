-- ============================================================================
-- Employee Monitoring System - Database Setup
-- ============================================================================
-- Run this entire script in your Supabase SQL Editor
-- This will create all tables, indexes, and policies needed for the system
-- ============================================================================

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT,
  computer_name TEXT,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'offline')),
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Screenshots Table
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

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  activity_type TEXT,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screenshot_interval INTEGER DEFAULT 5 CHECK (screenshot_interval BETWEEN 1 AND 60),
  retention_days INTEGER DEFAULT 30 CHECK (retention_days BETWEEN 1 AND 365),
  privacy_mode BOOLEAN DEFAULT false,
  admin_email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

-- Employees indexes
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- Screenshots indexes
CREATE INDEX IF NOT EXISTS idx_screenshots_employee_id ON screenshots(employee_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_timestamp ON screenshots(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_screenshots_created_at ON screenshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_screenshots_app_name ON screenshots(app_name);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_employee_id ON activity_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(activity_type);

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can insert employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can update employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can delete employees" ON employees;
DROP POLICY IF EXISTS "Anyone can insert employees" ON employees;

DROP POLICY IF EXISTS "Authenticated users can view screenshots" ON screenshots;
DROP POLICY IF EXISTS "Anyone can insert screenshots" ON screenshots;
DROP POLICY IF EXISTS "Authenticated users can delete screenshots" ON screenshots;

DROP POLICY IF EXISTS "Authenticated users can view activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Anyone can insert activity logs" ON activity_logs;

DROP POLICY IF EXISTS "Authenticated users can manage settings" ON system_settings;

-- Employees Policies
CREATE POLICY "Authenticated users can view employees"
  ON employees FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert employees"
  ON employees FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update employees"
  ON employees FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete employees"
  ON employees FOR DELETE
  USING (auth.role() = 'authenticated');

-- Allow anonymous inserts for demo/testing
CREATE POLICY "Anyone can insert employees"
  ON employees FOR INSERT
  WITH CHECK (true);

-- Screenshots Policies
CREATE POLICY "Authenticated users can view screenshots"
  ON screenshots FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert screenshots"
  ON screenshots FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete screenshots"
  ON screenshots FOR DELETE
  USING (auth.role() = 'authenticated');

-- Activity Logs Policies
CREATE POLICY "Authenticated users can view activity logs"
  ON activity_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true);

-- System Settings Policies
CREATE POLICY "Authenticated users can manage settings"
  ON system_settings FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- 5. CREATE FUNCTIONS
-- ============================================================================

-- Function to update employee last activity
CREATE OR REPLACE FUNCTION update_employee_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE employees
  SET last_activity = NEW.timestamp,
      status = 'active'
  WHERE employee_id = NEW.employee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update employee activity
DROP TRIGGER IF EXISTS trigger_update_employee_activity ON screenshots;
CREATE TRIGGER trigger_update_employee_activity
  AFTER INSERT ON screenshots
  FOR EACH ROW
  EXECUTE FUNCTION update_employee_last_activity();

-- Function to cleanup old screenshots
CREATE OR REPLACE FUNCTION cleanup_old_screenshots(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM screenshots
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get employee statistics
CREATE OR REPLACE FUNCTION get_employee_stats(emp_id TEXT)
RETURNS TABLE (
  total_screenshots BIGINT,
  screenshots_today BIGINT,
  last_screenshot TIMESTAMP WITH TIME ZONE,
  most_used_app TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_screenshots,
    COUNT(*) FILTER (WHERE DATE(timestamp) = CURRENT_DATE) as screenshots_today,
    MAX(timestamp) as last_screenshot,
    (
      SELECT app_name
      FROM screenshots s2
      WHERE s2.employee_id = emp_id
      GROUP BY app_name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_used_app
  FROM screenshots
  WHERE employee_id = emp_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. INSERT DEFAULT DATA
-- ============================================================================

-- Insert default system settings if none exist
INSERT INTO system_settings (screenshot_interval, retention_days, privacy_mode, admin_email)
SELECT 5, 30, false, 'admin@company.com'
WHERE NOT EXISTS (SELECT 1 FROM system_settings);

-- ============================================================================
-- 7. STORAGE BUCKET SETUP (Manual Step)
-- ============================================================================

-- NOTE: Storage buckets cannot be created via SQL
-- After running this script, go to Storage in Supabase Dashboard and:
-- 1. Create a new bucket named "screenshots"
-- 2. Set it to PRIVATE (not public)
-- 3. Configure the following policies:

-- Storage Policy for Uploads (Run in Storage Policies section):
/*
CREATE POLICY "Anyone can upload screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'screenshots');

CREATE POLICY "Authenticated users can read screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'screenshots' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete screenshots"
ON storage.objects FOR DELETE
USING (bucket_id = 'screenshots' AND auth.role() = 'authenticated');
*/

-- ============================================================================
-- 8. HELPFUL QUERIES
-- ============================================================================

-- View all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Count records in each table
-- SELECT 'employees' as table, COUNT(*) FROM employees
-- UNION ALL
-- SELECT 'screenshots', COUNT(*) FROM screenshots
-- UNION ALL
-- SELECT 'activity_logs', COUNT(*) FROM activity_logs
-- UNION ALL
-- SELECT 'system_settings', COUNT(*) FROM system_settings;

-- Get employee stats
-- SELECT * FROM get_employee_stats('EMP001');

-- Cleanup old screenshots (older than 30 days)
-- SELECT cleanup_old_screenshots(30);

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Create storage bucket "screenshots" (see note above)
-- 2. Create admin user via Authentication -> Users in Supabase Dashboard
-- 3. Update your dashboard environment variables with Supabase credentials
-- 4. Test the connection
-- ============================================================================
