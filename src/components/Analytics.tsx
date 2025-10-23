import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';
import { Badge } from './ui/badge';

type ActivityData = {
  date: string;
  screenshots: number;
  activeEmployees: number;
};

type AppUsage = {
  name: string;
  count: number;
};

export function Analytics() {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [appUsage, setAppUsage] = useState<AppUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgScreenshotsPerDay: 0,
    avgActiveTime: 0,
    topApp: '',
    productivityScore: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get screenshots for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: screenshots, error } = await supabase
        .from('screenshots')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      // Process activity data
      const activityMap = new Map<string, { screenshots: number; employees: Set<string> }>();
      const appMap = new Map<string, number>();

      screenshots?.forEach((s) => {
        const date = new Date(s.created_at).toLocaleDateString();
        
        if (!activityMap.has(date)) {
          activityMap.set(date, { screenshots: 0, employees: new Set() });
        }
        
        const activity = activityMap.get(date)!;
        activity.screenshots++;
        if (s.employee_id) {
          activity.employees.add(s.employee_id);
        }

        // Count app usage
        if (s.app_name) {
          appMap.set(s.app_name, (appMap.get(s.app_name) || 0) + 1);
        }
      });

      // Convert to chart data
      const activityArray: ActivityData[] = [];
      activityMap.forEach((value, date) => {
        activityArray.push({
          date,
          screenshots: value.screenshots,
          activeEmployees: value.employees.size,
        });
      });

      // Sort by date
      activityArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Get top 5 apps
      const appArray: AppUsage[] = Array.from(appMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setActivityData(activityArray);
      setAppUsage(appArray);

      // Calculate stats
      const avgScreenshots = activityArray.reduce((sum, d) => sum + d.screenshots, 0) / activityArray.length || 0;
      const topAppName = appArray[0]?.name || 'N/A';
      const productivityScore = Math.min(100, Math.round((avgScreenshots / 10) * 100));

      setStats({
        avgScreenshotsPerDay: Math.round(avgScreenshots),
        avgActiveTime: Math.round(avgScreenshots * 5), // 5 min intervals
        topApp: topAppName,
        productivityScore,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-white mb-2">Analytics & Insights</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track productivity trends and usage patterns
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-1">
                  Avg Screenshots/Day
                </p>
                <h2 className="text-slate-900 dark:text-white mb-2">
                  {stats.avgScreenshotsPerDay}
                </h2>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-1">
                  Avg Active Time
                </p>
                <h2 className="text-slate-900 dark:text-white mb-2">
                  {stats.avgActiveTime}m
                </h2>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>+8%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-1">
                  Top Application
                </p>
                <h3 className="text-slate-900 dark:text-white mb-2 truncate">
                  {stats.topApp}
                </h3>
                <Badge variant="secondary">Most Used</Badge>
              </div>
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-1">
                  Productivity Score
                </p>
                <h2 className="text-slate-900 dark:text-white mb-2">
                  {stats.productivityScore}%
                </h2>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Excellent</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="screenshots"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Screenshots"
                />
                <Line
                  type="monotone"
                  dataKey="activeEmployees"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Active Employees"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Top Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Application Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Application Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {appUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex-1 space-y-3">
              {appUsage.map((app, index) => (
                <div key={app.name} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white">{app.name}</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {app.count} captures
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {((app.count / appUsage.reduce((sum, a) => sum + a.count, 0)) * 100).toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
