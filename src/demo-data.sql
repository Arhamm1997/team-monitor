-- ============================================================================
-- Employee Monitoring System - Demo Data
-- ============================================================================
-- Run this script to populate the database with sample data for testing
-- This helps you explore the dashboard features without waiting for real data
-- ============================================================================

-- ============================================================================
-- 1. INSERT DEMO EMPLOYEES
-- ============================================================================

INSERT INTO employees (employee_id, name, email, department, computer_name, status, last_activity)
VALUES
  ('EMP001', 'John Doe', 'john.doe@company.com', 'Engineering', 'DESKTOP-ENG-001', 'active', NOW() - INTERVAL '5 minutes'),
  ('EMP002', 'Jane Smith', 'jane.smith@company.com', 'Marketing', 'LAPTOP-MKT-002', 'active', NOW() - INTERVAL '15 minutes'),
  ('EMP003', 'Bob Johnson', 'bob.johnson@company.com', 'Sales', 'DESKTOP-SALES-003', 'inactive', NOW() - INTERVAL '2 hours'),
  ('EMP004', 'Alice Williams', 'alice.williams@company.com', 'Engineering', 'LAPTOP-ENG-004', 'active', NOW() - INTERVAL '10 minutes'),
  ('EMP005', 'Charlie Brown', 'charlie.brown@company.com', 'Support', 'DESKTOP-SUP-005', 'offline', NOW() - INTERVAL '1 day'),
  ('EMP006', 'Diana Prince', 'diana.prince@company.com', 'Design', 'LAPTOP-DES-006', 'active', NOW() - INTERVAL '3 minutes'),
  ('EMP007', 'Ethan Hunt', 'ethan.hunt@company.com', 'Operations', 'DESKTOP-OPS-007', 'inactive', NOW() - INTERVAL '4 hours'),
  ('EMP008', 'Fiona Green', 'fiona.green@company.com', 'Engineering', 'LAPTOP-ENG-008', 'active', NOW() - INTERVAL '8 minutes')
ON CONFLICT (employee_id) DO NOTHING;

-- ============================================================================
-- 2. INSERT DEMO SCREENSHOTS
-- ============================================================================

-- Helper: Generate screenshots for the last 7 days
DO $$
DECLARE
  emp_ids TEXT[] := ARRAY['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP006', 'EMP008'];
  emp_names TEXT[] := ARRAY['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Diana Prince', 'Fiona Green'];
  app_names TEXT[] := ARRAY[
    'Visual Studio Code',
    'Google Chrome',
    'Microsoft Teams',
    'Slack',
    'Figma',
    'Microsoft Word',
    'Excel',
    'PowerPoint',
    'Notion',
    'Zoom'
  ];
  window_titles TEXT[] := ARRAY[
    'main.tsx - Visual Studio Code',
    'Dashboard - Google Chrome',
    'Team Meeting - Microsoft Teams',
    'Engineering Channel - Slack',
    'Design System - Figma',
    'Q4 Report.docx - Word',
    'Budget 2024.xlsx - Excel',
    'Presentation.pptx - PowerPoint',
    'Project Notes - Notion',
    'All Hands Meeting - Zoom'
  ];
  computer_names TEXT[] := ARRAY['DESKTOP-ENG-001', 'LAPTOP-MKT-002', 'DESKTOP-SALES-003', 'LAPTOP-ENG-004', 'LAPTOP-DES-006', 'LAPTOP-ENG-008'];
  
  i INTEGER;
  j INTEGER;
  emp_idx INTEGER;
  app_idx INTEGER;
  random_offset INTEGER;
BEGIN
  -- Generate 100 demo screenshots across last 7 days
  FOR i IN 0..99 LOOP
    emp_idx := (i % 6) + 1;
    app_idx := (i % 10) + 1;
    random_offset := (random() * 7 * 24 * 60)::INTEGER; -- Random minutes in last 7 days
    
    INSERT INTO screenshots (
      employee_id,
      employee_name,
      window_title,
      app_name,
      computer_name,
      screenshot_url,
      timestamp
    ) VALUES (
      emp_ids[emp_idx],
      emp_names[emp_idx],
      window_titles[app_idx],
      app_names[app_idx],
      computer_names[emp_idx],
      'https://images.unsplash.com/photo-' || (1600000000 + i * 1000) || '?w=800&h=600&fit=crop',
      NOW() - (random_offset || ' minutes')::INTERVAL
    );
  END LOOP;
END $$;

-- ============================================================================
-- 3. INSERT DEMO ACTIVITY LOGS
-- ============================================================================

INSERT INTO activity_logs (employee_id, activity_type, description, timestamp)
VALUES
  ('EMP001', 'screenshot_captured', 'Screenshot captured successfully', NOW() - INTERVAL '5 minutes'),
  ('EMP001', 'client_started', 'Desktop client started', NOW() - INTERVAL '2 hours'),
  ('EMP002', 'screenshot_captured', 'Screenshot captured successfully', NOW() - INTERVAL '15 minutes'),
  ('EMP002', 'client_started', 'Desktop client started', NOW() - INTERVAL '3 hours'),
  ('EMP003', 'client_stopped', 'Desktop client stopped', NOW() - INTERVAL '2 hours'),
  ('EMP003', 'screenshot_captured', 'Screenshot captured successfully', NOW() - INTERVAL '3 hours'),
  ('EMP004', 'screenshot_captured', 'Screenshot captured successfully', NOW() - INTERVAL '10 minutes'),
  ('EMP004', 'client_started', 'Desktop client started', NOW() - INTERVAL '4 hours'),
  ('EMP006', 'screenshot_captured', 'Screenshot captured successfully', NOW() - INTERVAL '3 minutes'),
  ('EMP006', 'client_started', 'Desktop client started', NOW() - INTERVAL '1 hour'),
  ('EMP008', 'screenshot_captured', 'Screenshot captured successfully', NOW() - INTERVAL '8 minutes'),
  ('EMP008', 'client_started', 'Desktop client started', NOW() - INTERVAL '5 hours'),
  ('EMP001', 'employee_added', 'Employee John Doe added to system', NOW() - INTERVAL '1 week'),
  ('EMP002', 'employee_added', 'Employee Jane Smith added to system', NOW() - INTERVAL '1 week'),
  ('EMP003', 'employee_added', 'Employee Bob Johnson added to system', NOW() - INTERVAL '1 week');

-- ============================================================================
-- 4. VERIFY DATA INSERTION
-- ============================================================================

-- Count records in each table
SELECT 
  'employees' as table_name, 
  COUNT(*) as record_count 
FROM employees

UNION ALL

SELECT 
  'screenshots', 
  COUNT(*) 
FROM screenshots

UNION ALL

SELECT 
  'activity_logs', 
  COUNT(*) 
FROM activity_logs;

-- ============================================================================
-- 5. VIEW SAMPLE DATA
-- ============================================================================

-- Sample employees
SELECT 
  employee_id,
  name,
  email,
  department,
  status,
  last_activity
FROM employees
ORDER BY last_activity DESC NULLS LAST
LIMIT 5;

-- Sample screenshots
SELECT 
  employee_name,
  app_name,
  window_title,
  timestamp
FROM screenshots
ORDER BY timestamp DESC
LIMIT 10;

-- Sample activity logs
SELECT 
  employee_id,
  activity_type,
  description,
  timestamp
FROM activity_logs
ORDER BY timestamp DESC
LIMIT 10;

-- ============================================================================
-- 6. STATISTICS
-- ============================================================================

-- Employee statistics
SELECT 
  department,
  COUNT(*) as employee_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'inactive') as inactive_count
FROM employees
GROUP BY department
ORDER BY employee_count DESC;

-- Screenshot statistics
SELECT 
  employee_name,
  COUNT(*) as screenshot_count,
  COUNT(DISTINCT DATE(timestamp)) as active_days,
  MAX(timestamp) as last_screenshot
FROM screenshots
GROUP BY employee_name
ORDER BY screenshot_count DESC;

-- Application usage
SELECT 
  app_name,
  COUNT(*) as usage_count,
  ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM screenshots) * 100, 2) as percentage
FROM screenshots
WHERE app_name IS NOT NULL
GROUP BY app_name
ORDER BY usage_count DESC
LIMIT 10;

-- Daily screenshot trend (last 7 days)
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as screenshot_count,
  COUNT(DISTINCT employee_id) as active_employees
FROM screenshots
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- ============================================================================
-- DEMO DATA LOADED SUCCESSFULLY!
-- ============================================================================
-- You now have:
-- - 8 demo employees
-- - 100 demo screenshots (across 7 days)
-- - 15 activity log entries
-- 
-- Refresh your dashboard to see the data!
-- ============================================================================
