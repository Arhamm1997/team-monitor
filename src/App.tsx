import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/AuthPage';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { ScreenshotGallery } from './components/ScreenshotGallery';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { supabase } from './utils/supabase/client';
import { testSupabaseConnection } from './utils/supabase/test-connection';

export default function App() {
  const { isAuthenticated, loading, user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    console.log('App state:', { isAuthenticated, loading, user: user?.email });
  }, [isAuthenticated, loading, user]);

  useEffect(() => {
    // Initialize database and create demo data
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Test Supabase connection first
      await testSupabaseConnection();
      
      // Create demo employee if none exist
      const { data: existingEmployees } = await supabase
        .from('employees')
        .select('*')
        .limit(1);

      if (!existingEmployees || existingEmployees.length === 0) {
        // Add demo employees
        await supabase.from('employees').insert([
          {
            employee_id: 'EMP001',
            name: 'John Doe',
            email: 'john.doe@company.com',
            department: 'Engineering',
            computer_name: 'DESKTOP-ABC123',
            status: 'active',
            last_activity: new Date().toISOString(),
          },
          {
            employee_id: 'EMP002',
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            department: 'Marketing',
            computer_name: 'LAPTOP-XYZ789',
            status: 'active',
            last_activity: new Date().toISOString(),
          },
          {
            employee_id: 'EMP003',
            name: 'Bob Johnson',
            email: 'bob.johnson@company.com',
            department: 'Sales',
            computer_name: 'DESKTOP-DEF456',
            status: 'inactive',
          },
        ]);

        // Add demo screenshots
        const demoScreenshots = [];
        const apps = ['Visual Studio Code', 'Google Chrome', 'Microsoft Teams', 'Slack', 'Figma'];
        const windows = [
          'Project Dashboard - Visual Studio Code',
          'Email - Google Chrome',
          'Team Meeting - Microsoft Teams',
          'Design Review - Figma',
          'Customer Support - Slack',
        ];

        for (let i = 0; i < 15; i++) {
          const app = apps[Math.floor(Math.random() * apps.length)];
          const employee = i % 3 === 0 ? 'EMP001' : i % 3 === 1 ? 'EMP002' : 'EMP003';
          const employeeName = employee === 'EMP001' ? 'John Doe' : employee === 'EMP002' ? 'Jane Smith' : 'Bob Johnson';
          
          demoScreenshots.push({
            employee_id: employee,
            employee_name: employeeName,
            window_title: windows[Math.floor(Math.random() * windows.length)],
            app_name: app,
            computer_name: `DESKTOP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            screenshot_url: `https://images.unsplash.com/photo-${1600000000000 + i * 100000}?w=800&h=600&fit=crop`,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }

        await supabase.from('screenshots').insert(demoScreenshots);

        // Add demo activity logs
        await supabase.from('activity_logs').insert([
          {
            employee_id: 'EMP001',
            activity_type: 'screenshot_captured',
            description: 'Screenshot captured successfully',
            timestamp: new Date().toISOString(),
          },
          {
            employee_id: 'EMP002',
            activity_type: 'client_connected',
            description: 'Desktop client connected',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);

        console.log('Demo data created successfully');
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <EmployeeList />;
      case 'screenshots':
        return <ScreenshotGallery />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <DashboardLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </DashboardLayout>
  );
}
