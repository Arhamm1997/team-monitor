/**
 * Employee Monitoring System - Desktop Client
 * Main Process Entry Point
 * 
 * This is a reference implementation for the Electron desktop client.
 * This code cannot run in the browser environment but shows the architecture.
 */

import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import { ScreenshotCapture } from './screenshot';
import { ScreenshotUploader } from './uploader';
import { ConfigManager } from './config';
import { TrayManager } from './tray';

class EmployeeMonitoringClient {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private screenshotCapture: ScreenshotCapture;
  private uploader: ScreenshotUploader;
  private config: ConfigManager;
  private trayManager: TrayManager;
  private captureInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = new ConfigManager();
    this.screenshotCapture = new ScreenshotCapture();
    this.uploader = new ScreenshotUploader(this.config);
    this.trayManager = new TrayManager(this);

    this.initialize();
  }

  private async initialize() {
    // Wait for app to be ready
    await app.whenReady();

    // Check if employee ID is configured
    if (!this.config.getEmployeeId()) {
      this.showSetupWindow();
    } else {
      this.startMonitoring();
    }

    // Create system tray
    this.trayManager.createTray();

    // Handle app events
    this.setupEventHandlers();
  }

  private showSetupWindow() {
    this.mainWindow = new BrowserWindow({
      width: 500,
      height: 400,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
      autoHideMenuBar: true,
      resizable: false,
    });

    this.mainWindow.loadFile(path.join(__dirname, '../renderer/setup.html'));

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  public async startMonitoring() {
    console.log('Starting employee monitoring...');

    const interval = this.config.getScreenshotInterval();
    
    // Initial capture
    await this.captureAndUpload();

    // Set up recurring captures
    this.captureInterval = setInterval(async () => {
      await this.captureAndUpload();
    }, interval * 60 * 1000); // Convert minutes to milliseconds

    this.trayManager.updateStatus('active');
  }

  public stopMonitoring() {
    console.log('Stopping employee monitoring...');

    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    this.trayManager.updateStatus('inactive');
  }

  private async captureAndUpload() {
    try {
      console.log('Capturing screenshot...');

      // Capture screenshot with metadata
      const screenshot = await this.screenshotCapture.capture();

      if (!screenshot) {
        console.error('Failed to capture screenshot');
        return;
      }

      // Upload to Supabase
      const success = await this.uploader.upload(screenshot);

      if (success) {
        console.log('Screenshot uploaded successfully');
        this.trayManager.showNotification('Screenshot captured', 'Screenshot uploaded successfully');
      } else {
        console.error('Failed to upload screenshot');
        this.trayManager.showNotification('Upload failed', 'Failed to upload screenshot', true);
      }
    } catch (error) {
      console.error('Error during capture/upload:', error);
    }
  }

  public async manualCapture() {
    console.log('Manual screenshot capture requested');
    await this.captureAndUpload();
  }

  public showSettings() {
    if (this.mainWindow) {
      this.mainWindow.focus();
      return;
    }

    this.mainWindow = new BrowserWindow({
      width: 600,
      height: 500,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
      autoHideMenuBar: true,
    });

    this.mainWindow.loadFile(path.join(__dirname, '../renderer/settings.html'));

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  public async quit() {
    this.stopMonitoring();
    app.quit();
  }

  private setupEventHandlers() {
    // IPC handlers
    ipcMain.handle('get-config', () => {
      return this.config.getAll();
    });

    ipcMain.handle('save-config', async (_, config) => {
      this.config.save(config);
      
      // Restart monitoring with new settings
      this.stopMonitoring();
      await this.startMonitoring();
      
      return { success: true };
    });

    ipcMain.handle('manual-capture', async () => {
      await this.manualCapture();
      return { success: true };
    });

    // Prevent app from quitting when all windows are closed (keep in tray)
    app.on('window-all-closed', (e: Event) => {
      e.preventDefault();
    });

    // Auto-launch on startup
    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath('exe'),
    });
  }
}

// Start the application
new EmployeeMonitoringClient();
