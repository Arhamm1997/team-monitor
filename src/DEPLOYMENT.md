# Employee Monitoring System - Deployment Guide

Complete guide for deploying the Employee Monitoring System to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Dashboard Deployment](#dashboard-deployment)
4. [Desktop Client Deployment](#desktop-client-deployment)
5. [Mass Deployment](#mass-deployment)
6. [Security Configuration](#security-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts & Tools

- **Supabase Account**: https://supabase.com
- **Vercel Account** (optional for dashboard): https://vercel.com
- **Node.js**: v18+ installed
- **Git**: For version control
- **Windows 10/11**: For testing desktop client

### Required Skills

- Basic command line knowledge
- Understanding of environment variables
- Basic SQL knowledge (for Supabase)
- Windows administration (for mass deployment)

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details:
   - Name: `employee-monitoring-prod`
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
4. Wait for project creation (~2 minutes)

### 2. Create Database Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- Employees Table
CREATE TABLE employees (
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

-- Screenshots Table
CREATE TABLE screenshots (
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
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  activity_type TEXT,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Settings Table
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screenshot_interval INTEGER DEFAULT 5,
  retention_days INTEGER DEFAULT 30,
  privacy_mode BOOLEAN DEFAULT false,
  admin_email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_screenshots_employee ON screenshots(employee_id);
CREATE INDEX idx_screenshots_timestamp ON screenshots(timestamp DESC);
CREATE INDEX idx_activity_logs_employee ON activity_logs(employee_id);
CREATE INDEX idx_employees_status ON employees(status);
```

### 3. Create Storage Bucket

1. Go to Storage in Supabase Dashboard
2. Click "New Bucket"
3. Name: `screenshots`
4. Set to **Private** (important for security)
5. Click "Create bucket"

### 4. Configure Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (admins)
CREATE POLICY "Admins can view all employees" ON employees
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert employees" ON employees
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update employees" ON employees
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete employees" ON employees
  FOR DELETE USING (auth.role() = 'authenticated');

-- Similar policies for other tables
CREATE POLICY "Admins can view screenshots" ON screenshots
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow clients to insert screenshots (using anon key)
CREATE POLICY "Clients can insert screenshots" ON screenshots
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view activity logs" ON activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Clients can insert logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage settings" ON system_settings
  FOR ALL USING (auth.role() = 'authenticated');
```

### 5. Get API Keys

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: For dashboard and clients
   - **service_role key**: For server-side operations (KEEP SECRET!)

---

## Dashboard Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Connect Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Configure environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
     ```
   - Click "Deploy"

3. **Configure Custom Domain** (optional):
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

### Option 2: Self-Host

```bash
# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for production
npm install -g pm2
pm2 start npm --name "employee-monitoring" -- start
pm2 save
pm2 startup
```

---

## Desktop Client Deployment

### 1. Configure Client

1. **Update Environment Variables**:
   Create `/electron-client/.env`:
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SCREENSHOT_INTERVAL=5
   ```

2. **Update Branding**:
   - Replace icons in `/electron-client/assets/`
   - Update company name in `package.json`
   - Customize notification messages

### 2. Build Installer

```bash
cd electron-client
npm install
npm run build:msi  # Creates MSI installer
```

The installer will be in `/electron-client/dist/`.

### 3. Code Signing (Production)

For production, sign your installer:

```bash
# Install signing tools
npm install -g windows-sign-tool

# Sign the installer
signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com EmployeeMonitoring.msi
```

---

## Mass Deployment

### Method 1: Group Policy (Domain Environments)

1. **Prepare Installation**:
   - Copy MSI to network share: `\\server\share\EmployeeMonitoring.msi`
   - Create transform file for silent config

2. **Create GPO**:
   ```
   1. Open Group Policy Management
   2. Create new GPO: "Employee Monitoring Deployment"
   3. Edit GPO → Computer Configuration → Policies → Software Settings
   4. Right-click Software Installation → New → Package
   5. Browse to \\server\share\EmployeeMonitoring.msi
   6. Select "Assigned"
   7. Click OK
   ```

3. **Configure Installation**:
   - Deployment type: Assigned
   - Install at logon: Yes
   - Uninstall when out of scope: Optional

4. **Link GPO to OU**:
   - Right-click target OU
   - Link existing GPO
   - Select "Employee Monitoring Deployment"

### Method 2: Microsoft Intune (Cloud)

1. **Package Application**:
   ```bash
   # Convert MSI to .intunewin
   IntuneWinAppUtil.exe -c ./source -s EmployeeMonitoring.msi -o ./output
   ```

2. **Upload to Intune**:
   - Go to Intune Admin Center
   - Apps → All apps → Add
   - App type: Windows app (Win32)
   - Upload .intunewin package

3. **Configure Detection Rules**:
   ```
   Rule type: MSI
   MSI product code: (from installer)
   ```

4. **Assign to Groups**:
   - Select target device groups
   - Set as "Required" installation
   - Configure deadline

### Method 3: SCCM/ConfigMgr

1. **Create Application**:
   - Software Library → Applications
   - Create Application
   - Type: Windows Installer
   - Source: \\server\share\EmployeeMonitoring.msi

2. **Configure Deployment**:
   - Purpose: Required
   - Schedule: ASAP
   - User experience: Install in background

3. **Deploy to Collection**:
   - Right-click application → Deploy
   - Select device collection
   - Configure settings
   - Deploy

### Silent Installation Command

```bash
# Silent install with employee ID
msiexec /i EmployeeMonitoring.msi /quiet EMPLOYEE_ID=EMP001

# Silent install with custom config
msiexec /i EmployeeMonitoring.msi /quiet /norestart TRANSFORMS=custom.mst
```

---

## Security Configuration

### 1. Network Security

- **Whitelist Supabase domains**:
  ```
  *.supabase.co
  *.supabase.io
  ```

- **Open firewall ports**:
  - HTTPS (443) outbound
  - DNS (53) outbound

### 2. Access Control

- **Create admin users** in Supabase Auth
- **Implement role-based access**:
  - Super Admin: Full access
  - Manager: View only
  - Support: Limited access

### 3. Data Protection

- **Enable encryption at rest** (Supabase Pro)
- **Use signed URLs** for screenshots (7-day expiry)
- **Implement data retention** policy
- **Regular backups**: Enable Supabase point-in-time recovery

### 4. Compliance

- **GDPR Compliance**:
  - Data processing agreement with Supabase
  - Employee consent forms
  - Right to access/deletion procedures

- **Privacy Policy**:
  - Inform employees about monitoring
  - Define data usage
  - Specify retention periods

---

## Monitoring & Maintenance

### 1. System Monitoring

**Dashboard Metrics**:
- Total active clients
- Screenshot upload rate
- Error rate
- Storage usage

**Supabase Metrics**:
- Database size
- API requests
- Storage usage
- Active connections

### 2. Alerts

Configure alerts for:
- Client disconnections
- Upload failures
- Storage quota warnings
- Database errors

### 3. Regular Maintenance

**Weekly**:
- Review error logs
- Check client connectivity
- Monitor storage usage

**Monthly**:
- Clean old screenshots (per retention policy)
- Review user access
- Update client software if needed
- Security audit

**Quarterly**:
- Performance optimization
- Database maintenance
- Backup verification
- Compliance review

### 4. Backup Strategy

```sql
-- Manual backup (Supabase CLI)
supabase db dump > backup-$(date +%Y%m%d).sql

-- Restore from backup
supabase db restore backup-20240101.sql
```

### 5. Troubleshooting

**Common Issues**:

1. **Clients not uploading**:
   - Check network connectivity
   - Verify Supabase credentials
   - Review firewall rules
   - Check client logs

2. **Dashboard not loading**:
   - Verify Supabase connection
   - Check browser console
   - Verify API keys

3. **High storage usage**:
   - Review retention policy
   - Clean old screenshots
   - Optimize image compression

---

## Support

For technical support:
- Email: support@company.com
- Slack: #employee-monitoring
- Documentation: https://docs.company.com

For security issues:
- Email: security@company.com
- Emergency: Call IT Help Desk

---

## Appendix

### A. Environment Variables Reference

**Dashboard**:
```env
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

**Desktop Client**:
```env
SUPABASE_URL=<supabase-url>
SUPABASE_ANON_KEY=<anon-key>
SCREENSHOT_INTERVAL=5
PRIVACY_MODE=false
AUTO_START=true
```

### B. SQL Queries for Common Tasks

```sql
-- Get total screenshot count
SELECT COUNT(*) FROM screenshots;

-- Get screenshots by employee
SELECT * FROM screenshots WHERE employee_id = 'EMP001' ORDER BY timestamp DESC;

-- Get active employees
SELECT * FROM employees WHERE status = 'active';

-- Delete old screenshots
DELETE FROM screenshots WHERE timestamp < NOW() - INTERVAL '30 days';

-- Get storage usage by employee
SELECT employee_id, COUNT(*) as screenshot_count 
FROM screenshots 
GROUP BY employee_id 
ORDER BY screenshot_count DESC;
```

### C. Client Logs Location

- **Windows**: `%APPDATA%\employee-monitoring\logs\`
- **Config**: `%APPDATA%\employee-monitoring\config.json`
- **Queue**: `%APPDATA%\employee-monitoring\upload-queue.json`
