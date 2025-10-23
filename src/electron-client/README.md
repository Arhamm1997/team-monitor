# Employee Monitoring System - Desktop Client

This is the Electron desktop client for the Employee Monitoring System. This client runs on employee Windows laptops and captures screenshots at configurable intervals.

## Features

- 🖼️ **Automatic Screenshot Capture**: Captures screenshots every 5 minutes (configurable)
- 📊 **Metadata Collection**: Collects window title, app name, timestamp, and computer info
- 🔐 **Secure Upload**: Encrypts and uploads to Supabase storage
- 🎯 **System Tray**: Runs silently with system tray icon
- ⚙️ **Configurable**: Employee ID and settings per installation
- 🔄 **Auto-Retry**: Robust error handling with upload retry logic
- 📦 **Easy Deployment**: MSI installer for mass deployment

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Windows 10/11

### Setup

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd electron-client
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Configure environment variables:
Create a \`.env\` file in the root directory:
\`\`\`env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SCREENSHOT_INTERVAL=5
\`\`\`

4. Run in development:
\`\`\`bash
npm run dev
\`\`\`

5. Build installer:
\`\`\`bash
npm run build
\`\`\`

The installer will be created in the \`dist\` folder.

## Configuration

### Employee ID Setup

On first launch, the client prompts for:
- Employee ID (required)
- Computer Name (auto-detected, can override)

This configuration is saved locally and persists across restarts.

### Settings

Administrators can configure:
- Screenshot interval (minutes)
- Upload retry attempts
- Storage quota
- Privacy filters

## Architecture

\`\`\`
electron-client/
├── src/
│   ├── main/
│   │   ├── index.ts          # Main process entry
│   │   ├── screenshot.ts     # Screenshot capture logic
│   │   ├── uploader.ts       # Upload to Supabase
│   │   ├── tray.ts           # System tray icon
│   │   └── config.ts         # Configuration management
│   ├── preload/
│   │   └── index.ts          # Preload script
│   └── renderer/
│       └── settings.html     # Settings UI
├── package.json
├── electron-builder.yml      # Build configuration
└── README.md
\`\`\`

## Deployment

### Group Policy Deployment

1. Build the MSI installer
2. Copy to network share
3. Create GPO for software installation
4. Deploy to target OUs

### MDM Deployment (Intune)

1. Package as \`.intunewin\` 
2. Upload to Intune
3. Create deployment group
4. Assign to devices

### Silent Installation

\`\`\`bash
msiexec /i EmployeeMonitoring.msi /quiet EMPLOYEE_ID=EMP001
\`\`\`

## Security

- Screenshots encrypted in transit (HTTPS)
- No local storage of screenshots
- Secure employee ID storage
- Privacy mode available
- Audit logging

## Troubleshooting

### Client Not Uploading

1. Check internet connection
2. Verify Supabase credentials
3. Check firewall settings
4. Review logs in: \`%APPDATA%/employee-monitoring/logs\`

### High CPU Usage

- Increase screenshot interval
- Enable privacy mode (reduces processing)
- Check for conflicting software

## Support

For issues or questions:
- Email: support@company.com
- Documentation: https://docs.company.com/monitoring
- Slack: #employee-monitoring-support
