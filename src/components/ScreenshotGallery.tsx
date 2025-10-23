import { useEffect, useState } from 'react';
import { supabase, Screenshot } from '../utils/supabase/client';
import {
  Search,
  Calendar,
  Filter,
  Download,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function ScreenshotGallery() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [filteredScreenshots, setFilteredScreenshots] = useState<Screenshot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [employees, setEmployees] = useState<string[]>([]);

  useEffect(() => {
    loadScreenshots();
    
    // Real-time subscription
    const channel = supabase
      .channel('screenshots_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'screenshots' }, () => {
        loadScreenshots();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterScreenshots();
  }, [screenshots, searchQuery, selectedEmployee, selectedDate]);

  const loadScreenshots = async () => {
    try {
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      setScreenshots(data || []);
      
      // Extract unique employees
      const uniqueEmployees = [...new Set(data?.map((s) => s.employee_name).filter(Boolean))] as string[];
      setEmployees(uniqueEmployees);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading screenshots:', error);
      setLoading(false);
    }
  };

  const filterScreenshots = () => {
    let filtered = screenshots;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.window_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.app_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Employee filter
    if (selectedEmployee !== 'all') {
      filtered = filtered.filter((s) => s.employee_name === selectedEmployee);
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter((s) => {
        const screenshotDate = new Date(s.timestamp).toISOString().split('T')[0];
        return screenshotDate === selectedDate;
      });
    }

    setFilteredScreenshots(filtered);
  };

  const handleDownload = async (screenshot: Screenshot) => {
    if (!screenshot.screenshot_url) return;
    
    try {
      const link = document.createElement('a');
      link.href = screenshot.screenshot_url;
      link.download = `screenshot_${screenshot.employee_name}_${screenshot.timestamp}.png`;
      link.click();
    } catch (error) {
      console.error('Error downloading screenshot:', error);
    }
  };

  const navigateScreenshot = (direction: 'prev' | 'next') => {
    if (!selectedScreenshot) return;
    
    const currentIndex = filteredScreenshots.findIndex((s) => s.id === selectedScreenshot.id);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < filteredScreenshots.length) {
      setSelectedScreenshot(filteredScreenshots[newIndex]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-white mb-2">Screenshot Gallery</h1>
        <p className="text-slate-600 dark:text-slate-400">
          View and manage captured screenshots
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by employee, window, or app..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp} value={emp}>
                    {emp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {(searchQuery || selectedEmployee !== 'all' || selectedDate) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400">
                {filteredScreenshots.length} results
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedEmployee('all');
                  setSelectedDate('');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-600">Loading screenshots...</div>
      ) : filteredScreenshots.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Filter className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {searchQuery || selectedEmployee !== 'all' || selectedDate
                ? 'No screenshots match your filters'
                : 'No screenshots captured yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredScreenshots.map((screenshot) => (
            <Card
              key={screenshot.id}
              className="group cursor-pointer hover:shadow-xl transition-all"
              onClick={() => setSelectedScreenshot(screenshot)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden">
                  {screenshot.screenshot_url ? (
                    <img
                      src={screenshot.screenshot_url}
                      alt={screenshot.window_title || 'Screenshot'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Maximize2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(screenshot);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-slate-900 dark:text-white line-clamp-1">
                      {screenshot.window_title || 'Untitled'}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white">
                        {screenshot.employee_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 truncate">
                      {screenshot.employee_name || 'Unknown'}
                    </span>
                  </div>

                  {screenshot.app_name && (
                    <Badge variant="secondary" className="truncate">
                      {screenshot.app_name}
                    </Badge>
                  )}

                  <p className="text-slate-500 dark:text-slate-500">
                    {new Date(screenshot.timestamp).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Screen Modal */}
      <Dialog open={!!selectedScreenshot} onOpenChange={() => setSelectedScreenshot(null)}>
        <DialogContent className="max-w-6xl">
          {selectedScreenshot && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-slate-900 dark:text-white mb-1">
                    {selectedScreenshot.window_title || 'Screenshot'}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedScreenshot.employee_name} • {new Date(selectedScreenshot.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateScreenshot('prev')}
                    disabled={filteredScreenshots.findIndex((s) => s.id === selectedScreenshot.id) === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateScreenshot('next')}
                    disabled={
                      filteredScreenshots.findIndex((s) => s.id === selectedScreenshot.id) ===
                      filteredScreenshots.length - 1
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(selectedScreenshot)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Image */}
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                {selectedScreenshot.screenshot_url ? (
                  <img
                    src={selectedScreenshot.screenshot_url}
                    alt={selectedScreenshot.window_title || 'Screenshot'}
                    className="w-full"
                  />
                ) : (
                  <div className="aspect-video flex items-center justify-center text-slate-400">
                    No image available
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Employee</p>
                  <p className="text-slate-900 dark:text-white">
                    {selectedScreenshot.employee_name}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Application</p>
                  <p className="text-slate-900 dark:text-white">
                    {selectedScreenshot.app_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Computer</p>
                  <p className="text-slate-900 dark:text-white">
                    {selectedScreenshot.computer_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Timestamp</p>
                  <p className="text-slate-900 dark:text-white">
                    {new Date(selectedScreenshot.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
