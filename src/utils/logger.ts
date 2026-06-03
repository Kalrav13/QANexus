import fs from 'fs';
import path from 'path';

import { ensureDirectory } from '@utils/fileUtils';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[90m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};

const RESET_COLOR = '\x1b[0m';

class LoggerService {
  private static instance: LoggerService;

  private readonly logFilePath: string;
  private readonly minLevel: LogLevel;
  private readonly colorEnabled: boolean;

  private constructor() {
    this.logFilePath = path.resolve(process.cwd(), 'logs', 'framework.log');
    this.minLevel = this.resolveMinLevel();
    this.colorEnabled =
      process.stdout.isTTY === true && process.env.NO_COLOR === undefined;

    ensureDirectory(path.dirname(this.logFilePath));
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }

    return LoggerService.instance;
  }

  public debug(message: string, meta?: unknown): void {
    this.write('debug', message, meta);
  }

  public info(message: string, meta?: unknown): void {
    this.write('info', message, meta);
  }

  public warn(message: string, meta?: unknown): void {
    this.write('warn', message, meta);
  }

  public error(message: string, meta?: unknown): void {
    this.write('error', message, meta);
  }

  private write(level: LogLevel, message: string, meta?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formatted = this.formatLine(level, message, meta);
    this.writeToConsole(level, formatted);
    this.appendToFile(formatted);
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  private resolveMinLevel(): LogLevel {
    const configured = (process.env.LOG_LEVEL ?? 'info').toLowerCase() as LogLevel;
    return LOG_LEVEL_PRIORITY[configured] !== undefined ? configured : 'info';
  }

  private formatTimestamp(date: Date = new Date()): string {
    const pad = (value: number): string => String(value).padStart(2, '0');

    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
    ].join('-') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  private formatLine(level: LogLevel, message: string, meta?: unknown): string {
    const metaSuffix =
      meta !== undefined ? ` ${typeof meta === 'string' ? meta : JSON.stringify(meta)}` : '';

    return `[${this.formatTimestamp()}] [${level.toUpperCase()}] ${message}${metaSuffix}`;
  }

  private colorize(level: LogLevel, line: string): string {
    if (!this.colorEnabled) {
      return line;
    }

    return `${LEVEL_COLORS[level]}${line}${RESET_COLOR}`;
  }

  private writeToConsole(level: LogLevel, line: string): void {
    const output = this.colorize(level, line);

    switch (level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }
  }

  private appendToFile(line: string): void {
    try {
      fs.appendFileSync(this.logFilePath, `${line}\n`, 'utf-8');
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.error(
        `[${this.formatTimestamp()}] [ERROR] Failed to write to log file: ${reason}`
      );
    }
  }
}

/** Singleton logger — use Logger.info(), Logger.error(), etc. */
export const Logger = LoggerService.getInstance();

/** @deprecated Use `Logger` — kept for existing imports */
export const logger = Logger;
