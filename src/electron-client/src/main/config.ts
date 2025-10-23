/**
 * Configuration Manager
 * Handles loading and saving client configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ClientConfig {
  employeeId: string;
  computerName: string;
  screenshotInterval: number;
  supabaseUrl: string;
  supabaseKey: string;
  privacyMode: boolean;
  autoStart: boolean;
}

export class ConfigManager {
  private config: ClientConfig;
  private configPath: string;

  constructor() {
    this.configPath = this.getConfigPath();
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from disk
   */
  private loadConfig(): ClientConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }

    // Return default config
    return this.getDefaultConfig();
  }

  /**
   * Save configuration to disk
   */
  public save(config: Partial<ClientConfig>): void {
    this.config = { ...this.config, ...config };

    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log('Configuration saved');
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  /**
   * Get configuration file path
   */
  private getConfigPath(): string {
    const appData = process.env.APPDATA || process.env.HOME || '';
    const appDir = path.join(appData, 'employee-monitoring');

    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }

    return path.join(appDir, 'config.json');
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): ClientConfig {
    return {
      employeeId: '',
      computerName: os.hostname(),
      screenshotInterval: parseInt(process.env.SCREENSHOT_INTERVAL || '5'),
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_ANON_KEY || '',
      privacyMode: false,
      autoStart: true,
    };
  }

  /**
   * Get employee ID
   */
  public getEmployeeId(): string {
    return this.config.employeeId;
  }

  /**
   * Get screenshot interval in minutes
   */
  public getScreenshotInterval(): number {
    return this.config.screenshotInterval;
  }

  /**
   * Get computer name
   */
  public getComputerName(): string {
    return this.config.computerName;
  }

  /**
   * Check if privacy mode is enabled
   */
  public isPrivacyModeEnabled(): boolean {
    return this.config.privacyMode;
  }

  /**
   * Get Supabase credentials
   */
  public getSupabaseCredentials(): { url: string; key: string } {
    return {
      url: this.config.supabaseUrl,
      key: this.config.supabaseKey,
    };
  }

  /**
   * Get all configuration
   */
  public getAll(): ClientConfig {
    return { ...this.config };
  }

  /**
   * Reset configuration to defaults
   */
  public reset(): void {
    this.config = this.getDefaultConfig();
    this.save(this.config);
  }

  /**
   * Validate configuration
   */
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.employeeId) {
      errors.push('Employee ID is required');
    }

    if (!this.config.supabaseUrl) {
      errors.push('Supabase URL is required');
    }

    if (!this.config.supabaseKey) {
      errors.push('Supabase key is required');
    }

    if (this.config.screenshotInterval < 1 || this.config.screenshotInterval > 60) {
      errors.push('Screenshot interval must be between 1 and 60 minutes');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
