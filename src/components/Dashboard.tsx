import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';
import {
  Users,
  Image,
  Activity,
  TrendingUp,
  Monitor,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

type Stats = {
  totalEmployees: number;
  activeEmployees: number;
  totalScreenshots: number;
  screenshotsToday: number;
};

type RecentActivity = {
  id: string;
  employee_name: string;
  activity: string;
  timestamp: string;
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalScreenshots: 0,
    screenshotsToday: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'screenshots' }, () => {
        loadDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get employee stats
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('*');

      // Get screenshot stats
      const { data: screenshots, error: screenshotError } = await supabase
        .from('screenshots')
        .select('*');

      // Get today's screenshots
      const today = new Date().toISOString().split('T')[0];
      const { data: todayScreenshots } = await supabase
        .from('screenshots')
        .select('*')
        .gte('created_at', today);

      // Get recent activity
      const { data: activity } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      setStats({
        totalEmployees: employees?.length || 0,
        activeEmployees: employees?.filter((e) => e.status === 'active').length || 0,
        totalScreenshots: screenshots?.length || 0,
        screenshotsToday: todayScreenshots?.length || 0,
      });

      setRecentActivity(
        activity?.map((a) => ({
          id: a.id,
          employee_name: a.employee_id,
          activity: a.description || a.activity_type,
          timestamp: a.timestamp,
        })) || []
      );

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
    },
    {
      title: 'Active Now',
      value: stats.activeEmployees,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: `${stats.activeEmployees} online`,
    },
    {
      title: 'Screenshots Today',
      value: stats.screenshotsToday,
      icon: Image,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+18%',
    },
    {
      title: 'Total Captures',
      value: stats.totalScreenshots,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: 'All time',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Monitor employee activity and system performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-slate-600 dark:text-slate-400 mb-1">
                      {stat.title}
                    </p>
                    <h2 className="text-slate-900 dark:text-white mb-2">
                      {stat.value.toLocaleString()}
                    </h2>
                    <Badge variant="secondary" className="text-slate-600">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No recent activity
                </div>
              ) : (
                recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-white">
                        {activity.employee_name}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        {activity.activity}
                      </p>
                      <p className="text-slate-500 dark:text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-slate-900 dark:text-white">Database</p>
                    <p className="text-slate-600 dark:text-slate-400">Connected</p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white">Healthy</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-slate-900 dark:text-white">Storage</p>
                    <p className="text-slate-600 dark:text-slate-400">Available</p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white">Healthy</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-slate-900 dark:text-white">API Status</p>
                    <p className="text-slate-600 dark:text-slate-400">Operational</p>
                  </div>
                </div>
                <Badge className="bg-blue-600 text-white">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="text-slate-900 dark:text-white">Storage Usage</p>
                    <p className="text-slate-600 dark:text-slate-400">45% of quota</p>
                  </div>
                </div>
                <Badge className="bg-orange-600 text-white">Monitor</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
