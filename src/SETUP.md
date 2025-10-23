# Employee Monitoring System - Quick Setup Guide

Get your Employee Monitoring System up and running in 15 minutes.

## 🚀 Quick Start

### Prerequisites

- Supabase account (free tier works)
- Node.js 18+ installed
- Modern web browser

### Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd employee-monitoring

# Install dependencies
npm install
```

### Step 2: Supabase Setup (5 minutes)

1. **Create Supabase Project**:
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name: `employee-monitoring-dev`
   - Create project (wait ~2 min)

2. **Run Database Setup**:
   - Go to SQL Editor in Supabase
   - Paste and run this SQL:

```sql
-- Create Tables
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

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  activity_type TEXT,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screenshot_interval INTEGER DEFAULT 5,
  retention_days INTEGER DEFAULT 30,
  privacy_mode BOOLEAN DEFAULT false,
  admin_email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow all for development)
CREATE POLICY "Enable all for authenticated users" ON employees FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for anon" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for authenticated" ON employees FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for screenshots" ON screenshots FOR ALL USING (true);
CREATE POLICY "Enable all for activity_logs" ON activity_logs FOR ALL USING (true);
CREATE POLICY "Enable all for system_settings" ON system_settings FOR ALL USING (true);
```

3. **Create Storage Bucket**:
   - Go to Storage in Supabase
   - Click "New Bucket"
   - Name: `screenshots`
   - Public: **No** (keep private)
   - Click "Create"

4. **Get API Keys**:
   - Go to Settings → API
   - Copy:
     - Project URL
     - anon public key

### Step 3: Configure Environment (1 minute)

The Supabase connection is already configured in Figma Make. You just need to ensure your Supabase project is set up correctly.

### Step 4: Start Development Server (1 minute)

```bash
npm run dev
```

Open http://localhost:3000

### Step 5: Create Admin Account (2 minutes)

1. Click "Sign up"
2. Enter:
   - Name: Your name
   - Email: your@email.com
   - Password: (minimum 6 characters)
3. Click "Create Account"
4. Sign in with your credentials

### Step 6: Explore Dashboard (5 minutes)

You're now in! The app includes demo data to help you explore:

- **Dashboard**: Overview of employees and activity
- **Employees**: Manage employee records
- **Screenshots**: View captured screenshots (demo data included)
- **Analytics**: Charts and productivity insights
- **Settings**: Configure screenshot intervals and retention

---

## 📱 Desktop Client Setup (Optional)

The Electron desktop client runs on employee computers to capture screenshots.

### Prerequisites

- Windows 10/11
- Node.js 18+

### Setup

1. **Navigate to client folder**:
```bash
cd electron-client
npm install
```

2. **Configure environment**:
Create `electron-client/.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SCREENSHOT_INTERVAL=5
```

3. **Run in development**:
```bash
npm run dev
```

4. **Build installer** (for deployment):
```bash
npm run build:msi
```

Find installer in `electron-client/dist/`

---

## 🔐 Authentication Setup

### Create Admin Account

**Via Dashboard UI** (Recommended):
1. Open dashboard
2. Click "Sign up"
3. Enter credentials
4. Automatically signed in

**Via Supabase Dashboard** (Alternative):
1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. User can now sign in

### Demo Account

For testing, you can use:
- Email: `admin@demo.com`
- Password: `demo123`

(You need to create this account first via sign up)

---

## 🎯 Testing the System

### 1. Add Test Employee

1. Go to "Employees" tab
2. Click "Add Employee"
3. Fill in:
   - Employee ID: EMP001
   - Name: Test Employee
   - Email: test@company.com
   - Department: Engineering
   - Computer: DESKTOP-TEST
4. Click "Add Employee"

### 2. Simulate Screenshot Upload

Use this curl command to test:

```bash
curl -X POST https://your-project.supabase.co/rest/v1/screenshots \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP001",
    "employee_name": "Test Employee",
    "window_title": "Visual Studio Code",
    "app_name": "Code.exe",
    "computer_name": "DESKTOP-TEST",
    "screenshot_url": "https://via.placeholder.com/800x600",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

### 3. Verify in Dashboard

1. Go to "Screenshots" tab
2. You should see the uploaded screenshot
3. Check "Analytics" for updated charts
4. View "Dashboard" for activity logs

---

## 📊 Features Overview

### Dashboard Features

✅ **Real-time Monitoring**
- Live employee status
- Active connections
- Screenshot counts

✅ **Employee Management**
- Add/edit/delete employees
- Search and filter
- Status tracking

✅ **Screenshot Gallery**
- Thumbnail preview
- Full-screen viewer
- Date/employee filters
- Download screenshots

✅ **Analytics**
- Activity trends
- App usage charts
- Productivity metrics
- Time-based insights

✅ **Settings**
- Screenshot interval
- Data retention
- Privacy mode
- Admin configuration

### Desktop Client Features

✅ **Automatic Capture**
- Screenshots every 5 minutes (configurable)
- Active window detection
- Metadata collection

✅ **System Tray**
- Silent background operation
- Status indicator
- Manual capture option

✅ **Robust Uploading**
- Auto-retry on failure
- Queue management
- Offline support

---

## 🔧 Configuration

### Screenshot Interval

Change in Settings tab:
- Default: 5 minutes
- Range: 1-60 minutes
- Applies to all clients

### Data Retention

Configure in Settings:
- Default: 30 days
- Range: 7-365 days
- Auto-delete old data

### Privacy Mode

Enable to:
- Blur sensitive information
- Redact personal data
- Comply with privacy regulations

---

## 🐛 Troubleshooting

### Dashboard Issues

**Can't sign in**:
- Check Supabase connection
- Verify email/password
- Check browser console for errors

**No data showing**:
- Ensure tables are created
- Check RLS policies
- Verify API keys

**Images not loading**:
- Check storage bucket exists
- Verify bucket is named "screenshots"
- Check storage policies

### Desktop Client Issues

**Client won't start**:
- Check Node.js version (18+)
- Run `npm install`
- Check .env configuration

**Screenshots not uploading**:
- Verify Supabase credentials
- Check internet connection
- Review client logs
- Check firewall settings

**High CPU usage**:
- Increase screenshot interval
- Check for other applications
- Review system resources

---

## 📚 Next Steps

### For Development

1. **Customize branding**:
   - Update colors in `styles/globals.css`
   - Replace logos and icons
   - Modify company name

2. **Add features**:
   - Custom reports
   - Email notifications
   - Advanced analytics
   - User roles

3. **Enhance security**:
   - Implement 2FA
   - Add audit logging
   - Set up monitoring

### For Production

1. **Review deployment guide**: See `DEPLOYMENT.md`
2. **Set up CI/CD**: Automate builds and deployments
3. **Configure monitoring**: Set up alerts and logging
4. **Plan rollout**: Gradual deployment strategy

---

## 🆘 Getting Help

### Resources

- **Full Documentation**: See `DEPLOYMENT.md`
- **Supabase Docs**: https://supabase.com/docs
- **Electron Docs**: https://electronjs.org/docs

### Common Questions

**Q: Is this production-ready?**
A: The dashboard is production-ready. The Electron client is a reference implementation that needs testing in your environment.

**Q: What about employee privacy?**
A: Ensure you have proper policies, consent forms, and compliance with local laws. Enable privacy mode and implement data retention policies.

**Q: Can I self-host?**
A: Yes! You can self-host the dashboard. Supabase offers self-hosting options for the backend.

**Q: How much does it cost?**
A: Supabase free tier includes:
- 500MB database
- 1GB storage
- 50K monthly active users
Upgrade to Pro for more resources.

**Q: Can employees disable the client?**
A: The client can be configured to require admin privileges. Use Group Policy or MDM to enforce installation and prevent removal.

---

## ✅ Checklist

Before deploying to production:

- [ ] Supabase project created
- [ ] Database tables created
- [ ] Storage bucket configured
- [ ] RLS policies set up
- [ ] Admin account created
- [ ] Dashboard accessible
- [ ] Demo data verified
- [ ] Desktop client built
- [ ] Testing completed
- [ ] Documentation reviewed
- [ ] Privacy policy prepared
- [ ] Employee consent obtained
- [ ] Deployment plan ready
- [ ] Monitoring configured
- [ ] Backup strategy defined

---

## 🎉 You're All Set!

Your Employee Monitoring System is now running. Start by exploring the dashboard with the demo data, then add your own employees and configure the desktop clients.

For production deployment, see the detailed `DEPLOYMENT.md` guide.

**Happy Monitoring! 🚀**
