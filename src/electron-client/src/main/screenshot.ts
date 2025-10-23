/**
 * Screenshot Capture Module
 * Handles capturing screenshots of the active window with metadata
 */

import { screen, desktopCapturer, BrowserWindow } from 'electron';
import * as os from 'os';
import * as activeWin from 'active-win';

export interface ScreenshotData {
  imageBase64: string;
  metadata: {
    windowTitle: string;
    appName: string;
    timestamp: string;
    computerName: string;
    screenResolution: string;
    employeeId: string;
  };
}

export class ScreenshotCapture {
  constructor() {}

  /**
   * Capture screenshot of active window with metadata
   */
  public async capture(): Promise<ScreenshotData | null> {
    try {
      // Get active window information
      const activeWindow = await activeWin();
      
      if (!activeWindow) {
        console.error('No active window found');
        return null;
      }

      // Capture screenshot
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: screen.getPrimaryDisplay().workAreaSize,
      });

      if (sources.length === 0) {
        console.error('No screen sources available');
        return null;
      }

      // Get the primary screen
      const primarySource = sources[0];
      const thumbnail = primarySource.thumbnail;

      // Convert to base64
      const imageBase64 = thumbnail.toPNG().toString('base64');

      // Collect metadata
      const metadata = {
        windowTitle: activeWindow.title,
        appName: activeWindow.owner.name,
        timestamp: new Date().toISOString(),
        computerName: os.hostname(),
        screenResolution: `${thumbnail.getSize().width}x${thumbnail.getSize().height}`,
        employeeId: this.getEmployeeId(),
      };

      return {
        imageBase64,
        metadata,
      };
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return null;
    }
  }

  /**
   * Capture screenshot of specific window
   */
  public async captureWindow(windowId: number): Promise<string | null> {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: 1920, height: 1080 },
      });

      const targetSource = sources.find((source) => source.id.includes(String(windowId)));

      if (!targetSource) {
        console.error('Window not found');
        return null;
      }

      const thumbnail = targetSource.thumbnail;
      return thumbnail.toPNG().toString('base64');
    } catch (error) {
      console.error('Error capturing window:', error);
      return null;
    }
  }

  /**
   * Get active window information
   */
  public async getActiveWindowInfo(): Promise<{
    title: string;
    app: string;
    bounds: { x: number; y: number; width: number; height: number };
  } | null> {
    try {
      const activeWindow = await activeWin();

      if (!activeWindow) {
        return null;
      }

      return {
        title: activeWindow.title,
        app: activeWindow.owner.name,
        bounds: activeWindow.bounds,
      };
    } catch (error) {
      console.error('Error getting active window info:', error);
      return null;
    }
  }

  /**
   * Apply privacy filters to screenshot
   */
  private applyPrivacyFilter(imageBase64: string): string {
    // This is a placeholder - in production, you'd implement:
    // 1. OCR to detect sensitive text
    // 2. Blur specific regions
    // 3. Redact personal information
    // 4. Apply configurable privacy rules
    
    // For now, return as-is
    return imageBase64;
  }

  /**
   * Get employee ID from config
   */
  private getEmployeeId(): string {
    // This would be loaded from config in production
    return process.env.EMPLOYEE_ID || 'UNKNOWN';
  }

  /**
   * Validate screenshot before upload
   */
  public validateScreenshot(data: ScreenshotData): boolean {
    // Check if image is valid
    if (!data.imageBase64 || data.imageBase64.length === 0) {
      return false;
    }

    // Check if metadata is complete
    if (!data.metadata.employeeId || !data.metadata.timestamp) {
      return false;
    }

    // Check image size (max 10MB)
    const sizeInMB = (data.imageBase64.length * 0.75) / (1024 * 1024);
    if (sizeInMB > 10) {
      console.warn('Screenshot too large:', sizeInMB, 'MB');
      return false;
    }

    return true;
  }
}
