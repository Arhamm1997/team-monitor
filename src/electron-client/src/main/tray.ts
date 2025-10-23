/**
 * System Tray Manager
 * Handles system tray icon and menu
 */

import { Tray, Menu, nativeImage, Notification } from 'electron';
import * as path from 'path';

export class TrayManager {
  private tray: Tray | null = null;
  private client: any;
  private status: 'active' | 'inactive' = 'inactive';

  constructor(client: any) {
    this.client = client;
  }

  /**
   * Create system tray icon
   */
  public createTray(): void {
    // Create tray icon (you'd provide actual icon files in production)
    const icon = nativeImage.createFromPath(
      path.join(__dirname, '../../assets/tray-icon.png')
    );

    this.tray = new Tray(icon.resize({ width: 16, height: 16 }));
    this.tray.setToolTip('Employee Monitoring System');

    this.updateMenu();

    // Handle tray click
    this.tray.on('click', () => {
      this.client.showSettings();
    });
  }

  /**
   * Update tray menu
   */
  private updateMenu(): void {
    if (!this.tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Status',
        enabled: false,
      },
      {
        label: this.status === 'active' ? '🟢 Active' : '🔴 Inactive',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Manual Capture',
        click: () => {
          this.client.manualCapture();
        },
      },
      {
        label: 'Settings',
        click: () => {
          this.client.showSettings();
        },
      },
      { type: 'separator' },
      {
        label: this.status === 'active' ? 'Pause Monitoring' : 'Resume Monitoring',
        click: () => {
          if (this.status === 'active') {
            this.client.stopMonitoring();
          } else {
            this.client.startMonitoring();
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          this.client.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  /**
   * Update monitoring status
   */
  public updateStatus(status: 'active' | 'inactive'): void {
    this.status = status;
    this.updateMenu();

    if (this.tray) {
      this.tray.setToolTip(
        `Employee Monitoring System - ${status === 'active' ? 'Active' : 'Inactive'}`
      );
    }
  }

  /**
   * Show notification
   */
  public showNotification(title: string, body: string, isError = false): void {
    const notification = new Notification({
      title,
      body,
      icon: path.join(__dirname, '../../assets/icon.png'),
      silent: !isError,
    });

    notification.show();
  }

  /**
   * Display upload progress
   */
  public showUploadProgress(progress: number): void {
    if (this.tray) {
      this.tray.setToolTip(`Uploading... ${progress}%`);
    }
  }

  /**
   * Destroy tray
   */
  public destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
