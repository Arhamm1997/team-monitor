# 🖥️ Employee Monitoring System

Enterprise-grade employee monitoring solution for Windows laptops with real-time dashboard, screenshot capture, and productivity analytics.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Security & Privacy](#-security--privacy)
- [License](#-license)

---

## ✨ Features

### 🎯 Admin Dashboard

- **Real-time Monitoring**: Live employee status and activity tracking
- **Employee Management**: Add, edit, and manage employee records
- **Screenshot Gallery**: View, filter, and download captured screenshots
- **Analytics & Insights**: Productivity metrics, charts, and trends
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Eye-friendly dark theme
- **Role-Based Access**: Admin and manager roles

### 💻 Desktop Client (Electron)

- **Automatic Screenshots**: Captures active window every 5 minutes
- **Metadata Collection**: Window title, app name, timestamp, computer info
- **System Tray**: Silent operation with status indicator
- **Secure Upload**: Encrypted uploads to Supabase
- **Auto-Retry Logic**: Handles network issues gracefully
- **Configurable**: Per-employee settings
- **MSI Installer**: Easy deployment via Group Policy or MDM

### 📊 Analytics & Reports

- **Activity Trends**: 7-day activity charts
- **App Usage**: Top applications tracking
- **Productivity Score**: Calculated metrics
- **Time Analysis**: Active time tracking
- **Export Reports**: Download data for analysis

### 🔐 Security Features

- **JWT Authentication**: Secure admin login
- **Row Level Security**: Database-level access control
- **Encrypted Storage**: Screenshots in private buckets
- **Signed URLs**: Time-limited access to screenshots
- **Audit Logging**: All activities tracked
- **Privacy Mode**: Blur sensitive information

---

## 📸 Screenshots

### Dashboard Overview
Modern, clean interface with real-time statistics and activity monitoring.

### Employee Management
Comprehensive employee list with search, filters, and quick actions.

### Screenshot Gallery
Beautiful gallery view with thumbnails, full-screen viewer, and filters.

### Analytics
Interactive charts showing productivity trends and app usage.

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Desktop Client │         │   Web Dashboard  │         │    Supabase     │
│   (Electron)    │────────▶│     (React)      │────────▶│   (Backend)     │
│                 │         │                  │         │                 │
│ - Screenshot    │         │ - Auth           │         │ - PostgreSQL    │
│ - Metadata      │         │ - Employee Mgmt  │         │ - Storage       │
│ - Upload        │         │ - Analytics      │         │ - Auth          │
│ - System Tray   │         │ - Settings       │         │ - Real-time     │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Data Flow

1. **Capture**: Desktop client captures screenshot + metadata
2. **Upload**: Secure upload to Supabase Storage
3. **Store**: Metadata saved to PostgreSQL
4. **Display**: Dashboard queries and displays data
5. **Analytics**: Real-time aggregation and insights

---

## 🛠️ Tech Stack

### Dashboard (Frontend)

- **React 18**: Modern UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Beautiful charts and graphs
- **Lucide Icons**: Modern icon set
- **ShadCN UI**: High-quality components
- **Supabase Client**: Real-time database

### Desktop Client

- **Electron**: Cross-platform desktop apps
- **TypeScript**: Type-safe development
- **Active-Win**: Window detection
- **Electron Builder**: Installer creation
- **Supabase Client**: Backend integration

### Backend (Supabase)

- **PostgreSQL**: Relational database
- **Supabase Storage**: File storage
- **Supabase Auth**: Authentication
- **Row Level Security**: Access control
- **Real-time Subscriptions**: Live updates

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Windows 10/11 (for desktop client)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

The Supabase integration is pre-configured. Just ensure your Supabase project has:
- Database tables created (see SETUP.md)
- Storage bucket named "screenshots"
- RLS policies configured

### 3. Start Dashboard

```bash
npm run dev
```

Open http://localhost:3000

### 4. Create Admin Account

1. Click "Sign up"
2. Enter credentials
3. Start managing employees!

**For detailed setup instructions, see [SETUP.md](SETUP.md)**

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)**: Quick start guide (15 minutes)
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Production deployment guide
- **[electron-client/README.md](electron-client/README.md)**: Desktop client documentation

### Key Files

```
employee-monitoring/
├── App.tsx                    # Main application
├── components/
│   ├── AuthPage.tsx          # Login/signup
│   ├── Dashboard.tsx         # Overview dashboard
│   ├── EmployeeList.tsx      # Employee management
│   ├── ScreenshotGallery.tsx # Screenshot viewer
│   ├── Analytics.tsx         # Charts and metrics
│   └── Settings.tsx          # Admin settings
├── hooks/
│   └── useAuth.ts            # Authentication hook
├── utils/supabase/
│   └── client.ts             # Supabase client
├── electron-client/          # Desktop client
│   ├── src/main/
│   │   ├── index.ts          # Main process
│   │   ├── screenshot.ts     # Capture logic
│   │   ├── uploader.ts       # Upload logic
│   │   ├── tray.ts           # System tray
│   │   └── config.ts         # Configuration
│   └── package.json
├── SETUP.md                  # Setup guide
├── DEPLOYMENT.md             # Deployment guide
└── README.md                 # This file
```

---

## 🔐 Security & Privacy

### Data Protection

- ✅ **Encrypted Transit**: HTTPS for all communications
- ✅ **Private Storage**: Screenshots in private buckets
- ✅ **Access Control**: Row Level Security on all tables
- ✅ **Signed URLs**: Time-limited screenshot access
- ✅ **Audit Logging**: All actions tracked

### Privacy Compliance

⚠️ **IMPORTANT**: Before deploying this system:

1. **Legal Compliance**:
   - Ensure compliance with local labor laws
   - Review GDPR, CCPA, and other privacy regulations
   - Consult with legal counsel

2. **Employee Consent**:
   - Inform employees about monitoring
   - Obtain written consent
   - Clearly communicate data usage

3. **Privacy Policy**:
   - Define what data is collected
   - Specify retention periods
   - Explain employee rights

4. **Data Retention**:
   - Configure appropriate retention periods
   - Implement auto-deletion
   - Provide data access/deletion mechanisms

### Recommended Practices

- Enable Privacy Mode for sensitive environments
- Configure shortest acceptable screenshot interval
- Implement strong password policies
- Regular security audits
- Employee training on monitoring policies

---

## 🌟 Key Features Breakdown

### Dashboard

| Feature | Description | Status |
|---------|-------------|--------|
| Authentication | Secure login/signup with JWT | ✅ Ready |
| Real-time Updates | Live employee status | ✅ Ready |
| Employee CRUD | Add, edit, delete employees | ✅ Ready |
| Screenshot Viewer | Gallery with filters | ✅ Ready |
| Analytics | Charts and trends | ✅ Ready |
| Dark Mode | Theme switching | ✅ Ready |
| Responsive | Mobile-friendly | ✅ Ready |

### Desktop Client

| Feature | Description | Status |
|---------|-------------|--------|
| Auto Capture | Scheduled screenshots | ✅ Reference Code |
| System Tray | Background operation | ✅ Reference Code |
| Metadata | Window/app detection | ✅ Reference Code |
| Upload Queue | Offline support | ✅ Reference Code |
| Configuration | Employee ID setup | ✅ Reference Code |
| MSI Installer | Easy deployment | ✅ Reference Code |

---

## 🎯 Use Cases

### 1. Remote Work Monitoring
Track productivity of remote employees with automated screenshots and activity logs.

### 2. Time & Attendance
Verify employee work hours with timestamp data and activity tracking.

### 3. Project Time Tracking
Analyze time spent on different applications and projects.

### 4. Compliance & Audit
Maintain detailed activity logs for compliance and security audits.

### 5. Productivity Analysis
Identify productivity patterns and optimize workflows.

---

## 🚦 Deployment Options

### Option 1: Vercel (Dashboard)

```bash
# Deploy dashboard to Vercel
vercel --prod
```

### Option 2: Self-Hosted

```bash
# Build and run
npm run build
npm start
```

### Option 3: Docker

```dockerfile
# Dockerfile included in deployment docs
docker build -t employee-monitoring .
docker run -p 3000:3000 employee-monitoring
```

### Desktop Client Deployment

- **Group Policy**: Windows domain environments
- **Microsoft Intune**: Cloud-based MDM
- **SCCM**: Enterprise configuration management
- **Manual**: MSI installer distribution

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 📊 System Requirements

### Dashboard (Web)

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- JavaScript enabled

### Desktop Client

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 100MB for application
- **Network**: Internet connection for uploads
- **Permissions**: User or Admin (configurable)

### Server Requirements

- Node.js 18+ (self-hosted)
- 1GB RAM minimum
- 10GB storage (depending on screenshot volume)

---

## 🤝 Contributing

This is a proprietary system. For internal contributions:

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request
5. Code review required

---

## 📝 License

Proprietary - All rights reserved. Not for public distribution or commercial use without permission.

---

## ⚠️ Disclaimer

This software is provided for legitimate business purposes only. Users are responsible for:

- Compliance with applicable laws and regulations
- Obtaining necessary employee consent
- Protecting collected data
- Implementing appropriate security measures
- Respecting employee privacy rights

The developers assume no liability for misuse or legal violations.

---

## 🆘 Support

### Internal Support

- **Email**: support@company.com
- **Slack**: #employee-monitoring
- **Documentation**: [Internal Wiki]

### Issues & Bugs

Report issues through your internal ticketing system.

---

## 🗺️ Roadmap

### v1.1 (Planned)

- [ ] Multi-monitor support
- [ ] Video recording capability
- [ ] Advanced reporting
- [ ] Email notifications
- [ ] Mobile app

### v1.2 (Planned)

- [ ] AI-powered productivity insights
- [ ] Custom alerts and triggers
- [ ] Integration with HR systems
- [ ] Advanced privacy controls
- [ ] Multi-language support

### v2.0 (Future)

- [ ] macOS client support
- [ ] Linux client support
- [ ] Advanced analytics with ML
- [ ] Custom branding
- [ ] White-label option

---

## 🎓 Credits

Built with:
- React & TypeScript
- Tailwind CSS
- Supabase
- Electron
- ShadCN UI
- Recharts
- Lucide Icons

---

## 📞 Contact

For sales, licensing, or enterprise inquiries:
- Email: sales@company.com
- Website: https://company.com
- Phone: +1 (555) 123-4567

---

<div align="center">

**Made with ❤️ for enterprise productivity**

[Documentation](SETUP.md) • [Deployment Guide](DEPLOYMENT.md) • [Support](mailto:support@company.com)

</div>
