/**
 * Screenshot Uploader Module
 * Handles uploading screenshots to Supabase with retry logic
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ScreenshotData } from './screenshot';
import { ConfigManager } from './config';
import * as fs from 'fs';
import * as path from 'path';

export class ScreenshotUploader {
  private supabase: SupabaseClient;
  private config: ConfigManager;
  private uploadQueue: ScreenshotData[] = [];
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  constructor(config: ConfigManager) {
    this.config = config;

    // Initialize Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );

    // Load pending uploads from disk
    this.loadPendingUploads();
  }

  /**
   * Upload screenshot to Supabase
   */
  public async upload(screenshot: ScreenshotData): Promise<boolean> {
    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(screenshot.imageBase64, 'base64');

      // Generate unique filename
      const filename = `${screenshot.metadata.employeeId}_${Date.now()}.png`;
      const filepath = `screenshots/${screenshot.metadata.employeeId}/${filename}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('screenshots')
        .upload(filepath, buffer, {
          contentType: 'image/png',
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // Add to queue for retry
        this.addToQueue(screenshot);
        return false;
      }

      // Get public URL (or signed URL for private buckets)
      const { data: urlData } = await this.supabase.storage
        .from('screenshots')
        .createSignedUrl(filepath, 604800); // 7 days

      const screenshotUrl = urlData?.signedUrl || '';

      // Save metadata to database
      const { error: dbError } = await this.supabase.from('screenshots').insert([
        {
          employee_id: screenshot.metadata.employeeId,
          employee_name: await this.getEmployeeName(screenshot.metadata.employeeId),
          window_title: screenshot.metadata.windowTitle,
          app_name: screenshot.metadata.appName,
          computer_name: screenshot.metadata.computerName,
          screenshot_url: screenshotUrl,
          timestamp: screenshot.metadata.timestamp,
        },
      ]);

      if (dbError) {
        console.error('Database error:', dbError);
        
        // Delete uploaded file if database insert fails
        await this.supabase.storage.from('screenshots').remove([filepath]);
        
        this.addToQueue(screenshot);
        return false;
      }

      // Log activity
      await this.logActivity(screenshot.metadata.employeeId, 'screenshot_captured');

      // Update employee last activity
      await this.updateEmployeeActivity(screenshot.metadata.employeeId);

      console.log('Screenshot uploaded successfully:', filename);
      return true;
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      this.addToQueue(screenshot);
      return false;
    }
  }

  /**
   * Retry failed uploads
   */
  public async retryUploads(): Promise<void> {
    const queue = [...this.uploadQueue];
    this.uploadQueue = [];

    for (const screenshot of queue) {
      const success = await this.upload(screenshot);
      
      if (!success) {
        // Will be re-added to queue by upload method
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      }
    }

    this.savePendingUploads();
  }

  /**
   * Add screenshot to upload queue
   */
  private addToQueue(screenshot: ScreenshotData): void {
    // Limit queue size to prevent memory issues
    if (this.uploadQueue.length < 100) {
      this.uploadQueue.push(screenshot);
      this.savePendingUploads();
    } else {
      console.warn('Upload queue full, discarding oldest screenshot');
      this.uploadQueue.shift();
      this.uploadQueue.push(screenshot);
    }
  }

  /**
   * Save pending uploads to disk
   */
  private savePendingUploads(): void {
    try {
      const queuePath = this.getQueuePath();
      fs.writeFileSync(queuePath, JSON.stringify(this.uploadQueue));
    } catch (error) {
      console.error('Error saving upload queue:', error);
    }
  }

  /**
   * Load pending uploads from disk
   */
  private loadPendingUploads(): void {
    try {
      const queuePath = this.getQueuePath();
      
      if (fs.existsSync(queuePath)) {
        const data = fs.readFileSync(queuePath, 'utf-8');
        this.uploadQueue = JSON.parse(data);
        console.log(`Loaded ${this.uploadQueue.length} pending uploads`);
        
        // Retry uploads on startup
        this.retryUploads();
      }
    } catch (error) {
      console.error('Error loading upload queue:', error);
    }
  }

  /**
   * Get queue file path
   */
  private getQueuePath(): string {
    const appData = process.env.APPDATA || process.env.HOME || '';
    const appDir = path.join(appData, 'employee-monitoring');
    
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }
    
    return path.join(appDir, 'upload-queue.json');
  }

  /**
   * Get employee name from database
   */
  private async getEmployeeName(employeeId: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('employees')
        .select('name')
        .eq('employee_id', employeeId)
        .single();

      if (error || !data) {
        return employeeId;
      }

      return data.name;
    } catch (error) {
      console.error('Error getting employee name:', error);
      return employeeId;
    }
  }

  /**
   * Log activity to database
   */
  private async logActivity(employeeId: string, activityType: string): Promise<void> {
    try {
      await this.supabase.from('activity_logs').insert([
        {
          employee_id: employeeId,
          activity_type: activityType,
          description: `Screenshot captured and uploaded`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  /**
   * Update employee last activity timestamp
   */
  private async updateEmployeeActivity(employeeId: string): Promise<void> {
    try {
      await this.supabase
        .from('employees')
        .update({
          last_activity: new Date().toISOString(),
          status: 'active',
        })
        .eq('employee_id', employeeId);
    } catch (error) {
      console.error('Error updating employee activity:', error);
    }
  }

  /**
   * Get upload queue size
   */
  public getQueueSize(): number {
    return this.uploadQueue.length;
  }

  /**
   * Clear upload queue
   */
  public clearQueue(): void {
    this.uploadQueue = [];
    this.savePendingUploads();
  }
}
