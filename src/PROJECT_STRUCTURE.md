# 📁 Project Structure

Complete overview of the Employee Monitoring System codebase.

## 🗂️ Directory Structure

```
employee-monitoring-system/
│
├── 📱 Frontend (Dashboard)
│   ├── App.tsx                          # Main application entry
│   ├── components/
│   │   ├── AuthPage.tsx                 # Login/Signup page
│   │   ├── DashboardLayout.tsx          # Main layout with sidebar
│   │   ├── Dashboard.tsx                # Overview dashboard
│   │   ├── EmployeeList.tsx             # Employee management
│   │   ├── ScreenshotGallery.tsx        # Screenshot viewer
│   │   ├── Analytics.tsx                # Charts and analytics
│   │   ├── Settings.tsx                 # System settings
│   │   └── ui/                          # ShadCN UI components
│   │       ├── button.tsx               # Button component
│   │       ├── input.tsx                # Input component
│   │       ├── label.tsx                # Label component
│   │       ├── card.tsx                 # Card component
│   │       ├── badge.tsx                # Badge component
│   │       ├── dialog.tsx               # Dialog/Modal component
│   │       ├── dropdown-menu.tsx        # Dropdown menu
│   │       ├── select.tsx               # Select component
│   │       ├── switch.tsx               # Toggle switch
│   │       └── slider.tsx               # Slider component
│   │
│   ├── hooks/
│   │   └── useAuth.ts                   # Authentication hook
│   │
│   ├── utils/
│   │   └── supabase/
│   │       ├── client.ts                # Supabase client & types
│   │       ├── setup.ts                 # Database initialization
│   │       └── info.tsx                 # Supabase credentials
│   │
│   └── styles/
│       └── globals.css                  # Global styles & Tailwind
│
├── 💻 Desktop Client (Electron)
│   └── electron-client/
│       ├── src/
│       │   ├── main/                    # Main process
│       │   │   ├── index.ts             # Entry point
│       │   │   ├── screenshot.ts        # Screenshot capture
│       │   │   ├── uploader.ts          # Upload logic
│       │   │   ├── tray.ts              # System tray
│       │   │   └── config.ts            # Configuration
│       │   │
│       │   ├── preload/
│       │   │   └── index.ts             # Preload script
│       │   │
│       │   └── renderer/
│       │       ├── setup.html           # Setup UI
│       │       └── settings.html        # Settings UI
│       │
│       ├── assets/                      # Icons & images
│       ├── package.json                 # Dependencies & build config
│       ├── .env.example                 # Environment template
│       └── README.md                    # Client documentation
│
├── 📚 Documentation
│   ├── README.md                        # Main documentation
│   ├── SETUP.md                         # Quick setup guide
│   ├── DEPLOYMENT.md                    # Deployment guide
│   ├── PROJECT_STRUCTURE.md             # This file
│   └── supabase-setup.sql               # Database schema
│
└── 📦 Configuration
    ├── package.json                     # Project dependencies
    ├── tsconfig.json                    # TypeScript config
    └── .gitignore                       # Git ignore rules
```

---

## 📄 File Descriptions

### Frontend Components

#### `App.tsx`
- **Purpose**: Main application component
- **Features**:
  - Route management
  - Authentication check
  - Demo data initialization
  - View rendering
- **Dependencies**: All major components

#### `AuthPage.tsx`
- **Purpose**: Login and signup interface
- **Features**:
  - Email/password authentication
  - Form validation
  - Error handling
  - Demo account info
- **Components**: Button, Input, Label

#### `DashboardLayout.tsx`
- **Purpose**: Main application layout
- **Features**:
  - Sidebar navigation
  - User profile section
  - Dark mode toggle
  - Mobile responsiveness
  - Sign out functionality
- **Components**: Button

#### `Dashboard.tsx`
- **Purpose**: Overview dashboard
- **Features**:
  - Statistics cards
  - Recent activity feed
  - System status
  - Real-time updates
- **Components**: Card, Badge
- **Data**: Employees, screenshots, activity logs

#### `EmployeeList.tsx`
- **Purpose**: Employee management
- **Features**:
  - Employee CRUD operations
  - Search and filtering
  - Status indicators
  - Grid layout
  - Modal dialogs
- **Components**: Button, Input, Badge, Card, Dialog, DropdownMenu, Label
- **Real-time**: Live updates on changes

#### `ScreenshotGallery.tsx`
- **Purpose**: Screenshot viewing and management
- **Features**:
  - Grid gallery view
  - Filtering by employee/date
  - Full-screen viewer
  - Navigation controls
  - Download functionality
- **Components**: Button, Input, Card, Badge, Dialog, Select
- **Real-time**: Auto-refresh on new uploads

#### `Analytics.tsx`
- **Purpose**: Analytics and insights
- **Features**:
  - Activity trend charts
  - App usage bar charts
  - Pie chart distribution
  - Statistics cards
  - 7-day analysis
- **Components**: Card, Badge
- **Libraries**: Recharts for visualizations

#### `Settings.tsx`
- **Purpose**: System configuration
- **Features**:
  - Screenshot interval slider
  - Retention period slider
  - Privacy toggles
  - Admin email config
  - Data cleanup
- **Components**: Card, Button, Input, Label, Switch, Slider, Badge
- **Persistence**: Saves to Supabase

---

### Hooks

#### `useAuth.ts`
- **Purpose**: Authentication state management
- **Features**:
  - User session management
  - Sign in/up/out functions
  - Loading states
  - Error handling
  - Auth state listener
- **Returns**:
  - `user`: Current user object
  - `loading`: Loading state
  - `error`: Error messages
  - `signIn()`: Login function
  - `signUp()`: Registration function
  - `signOut()`: Logout function
  - `isAuthenticated`: Boolean status

---

### Utilities

#### `utils/supabase/client.ts`
- **Purpose**: Supabase client configuration
- **Exports**:
  - `supabase`: Configured client instance
  - Type definitions:
    - `Employee`
    - `Screenshot`
    - `ActivityLog`
    - `SystemSettings`

#### `utils/supabase/setup.ts`
- **Purpose**: Database initialization
- **Functions**:
  - `initializeDatabase()`: Create tables if needed
- **Note**: Reference implementation (RPC not supported in browser)

#### `utils/supabase/info.tsx`
- **Purpose**: Supabase credentials
- **Exports**:
  - `projectId`: Supabase project ID
  - `publicAnonKey`: Public anonymous key
- **Note**: Provided by Figma Make environment

---

### Desktop Client

#### `electron-client/src/main/index.ts`
- **Purpose**: Main Electron process
- **Features**:
  - App lifecycle management
  - Window creation
  - Monitoring control
  - IPC handlers
  - Auto-start setup

#### `electron-client/src/main/screenshot.ts`
- **Purpose**: Screenshot capture logic
- **Features**:
  - Active window detection
  - Screenshot capture
  - Metadata collection
  - Privacy filtering
  - Validation

#### `electron-client/src/main/uploader.ts`
- **Purpose**: Upload management
- **Features**:
  - Supabase upload
  - Retry logic
  - Queue management
  - Offline support
  - Error handling

#### `electron-client/src/main/tray.ts`
- **Purpose**: System tray integration
- **Features**:
  - Tray icon
  - Context menu
  - Notifications
  - Status updates

#### `electron-client/src/main/config.ts`
- **Purpose**: Configuration management
- **Features**:
  - Config persistence
  - Default values
  - Validation
  - Environment integration

---

## 🔌 Data Flow

### Screenshot Capture Flow

```
1. Desktop Client (Electron)
   └─> Screenshot.capture()
       └─> Active window detection
       └─> Screenshot capture
       └─> Metadata collection
       └─> Returns ScreenshotData

2. Upload Process
   └─> Uploader.upload(data)
       └─> Convert to buffer
       └─> Upload to Supabase Storage
       └─> Get signed URL
       └─> Save metadata to PostgreSQL
       └─> Log activity
       └─> Update employee status

3. Dashboard Display
   └─> Real-time subscription
       └─> Fetch screenshots
       └─> Render gallery
       └─> Show analytics
```

### Authentication Flow

```
1. User Input
   └─> Email + Password
       └─> useAuth.signIn()
           └─> supabase.auth.signInWithPassword()
               └─> Session created
                   └─> User state updated
                       └─> Dashboard rendered
```

### Real-time Updates

```
1. Change Event (Insert/Update/Delete)
   └─> Supabase Real-time
       └─> Subscription listener
           └─> Component re-fetch
               └─> UI update
```

---

## 🗄️ Database Schema

### Tables

#### `employees`
```typescript
{
  id: UUID (PK)
  employee_id: TEXT (UNIQUE)
  name: TEXT
  email: TEXT (UNIQUE)
  department: TEXT
  computer_name: TEXT
  status: 'active' | 'inactive' | 'offline'
  last_activity: TIMESTAMP
  created_at: TIMESTAMP
}
```

#### `screenshots`
```typescript
{
  id: UUID (PK)
  employee_id: TEXT
  employee_name: TEXT
  window_title: TEXT
  app_name: TEXT
  computer_name: TEXT
  screenshot_url: TEXT
  timestamp: TIMESTAMP
  created_at: TIMESTAMP
}
```

#### `activity_logs`
```typescript
{
  id: UUID (PK)
  employee_id: TEXT
  activity_type: TEXT
  description: TEXT
  timestamp: TIMESTAMP
}
```

#### `system_settings`
```typescript
{
  id: UUID (PK)
  screenshot_interval: INTEGER
  retention_days: INTEGER
  privacy_mode: BOOLEAN
  admin_email: TEXT
  updated_at: TIMESTAMP
}
```

---

## 🎨 Styling System

### Tailwind CSS Classes Used

- **Layout**: `flex`, `grid`, `min-h-screen`, `container`
- **Spacing**: `p-*`, `m-*`, `gap-*`, `space-*`
- **Colors**: `bg-*`, `text-*`, `border-*`
- **Typography**: Default from globals.css
- **Responsive**: `md:*`, `lg:*`, `xl:*`
- **Dark Mode**: `dark:*` variants

### Color Palette

```css
Primary: #3b82f6 (Blue)
Success: #10b981 (Green)
Warning: #f59e0b (Orange)
Error: #ef4444 (Red)
Purple: #8b5cf6
Pink: #ec4899
```

---

## 🔧 Configuration Files

### `package.json` (Dashboard)
```json
{
  "dependencies": {
    "react": "^18.x",
    "@supabase/supabase-js": "^2.x",
    "recharts": "^2.x",
    "lucide-react": "^0.x"
  }
}
```

### `package.json` (Electron Client)
```json
{
  "dependencies": {
    "electron": "^28.x",
    "@supabase/supabase-js": "^2.x",
    "active-win": "^7.x"
  }
}
```

---

## 🚀 Build & Deploy

### Dashboard Build
```bash
npm run build      # Build for production
npm run dev        # Development server
npm run lint       # Lint code
```

### Electron Client Build
```bash
npm run dev        # Development mode
npm run build      # Build installer
npm run build:msi  # MSI installer only
```

---

## 📦 Dependencies

### Frontend
- **React**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Supabase**: Backend & auth
- **Recharts**: Charts
- **Lucide React**: Icons

### Desktop Client
- **Electron**: Desktop framework
- **TypeScript**: Type safety
- **Active-Win**: Window detection
- **Electron Builder**: Packaging
- **Supabase**: Backend integration

---

## 🔍 Code Quality

### TypeScript Types
- All components fully typed
- No `any` types (except controlled cases)
- Strict mode enabled
- Interface exports

### Component Structure
- Functional components
- React Hooks
- Props interfaces
- Error boundaries (recommended)

### Best Practices
- ✅ Component composition
- ✅ Custom hooks
- ✅ Real-time subscriptions
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Accessibility

---

## 📊 Performance

### Optimizations
- Real-time subscriptions (vs polling)
- Indexed database queries
- Lazy loading images
- Component memoization (where needed)
- Debounced search inputs

### Monitoring
- Supabase dashboard metrics
- Client-side error logging
- Network request monitoring

---

## 🔐 Security

### Frontend
- Row Level Security (RLS)
- Environment variables
- Secure authentication
- HTTPS only

### Backend (Supabase)
- PostgreSQL RLS policies
- Private storage buckets
- Signed URLs (7-day expiry)
- JWT authentication

### Desktop Client
- Encrypted uploads (HTTPS)
- Local config encryption
- No credential storage in code

---

## 🧪 Testing Strategy

### Unit Tests (Recommended)
- Hook testing
- Utility functions
- Component logic

### Integration Tests (Recommended)
- Auth flow
- CRUD operations
- Real-time updates

### E2E Tests (Recommended)
- Full user flows
- Screenshot upload
- Dashboard navigation

---

## 📝 Development Workflow

1. **Local Development**
   ```bash
   npm install
   npm run dev
   ```

2. **Make Changes**
   - Edit components
   - Test in browser
   - Check console for errors

3. **Test**
   - Manual testing
   - Check all features
   - Verify real-time updates

4. **Deploy**
   - Build application
   - Deploy to Vercel/hosting
   - Update environment variables

---

## 🆘 Common Issues

### Import Errors
- Ensure component paths are correct
- Check component exists in `/components/ui/`

### Supabase Connection
- Verify project ID and anon key
- Check RLS policies
- Ensure tables exist

### Real-time Not Working
- Check subscription setup
- Verify table changes trigger events
- Check browser console

### Build Errors
- Run `npm install`
- Clear cache: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`

---

This structure provides a scalable, maintainable codebase for the Employee Monitoring System with clear separation of concerns and comprehensive documentation.
