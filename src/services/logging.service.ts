import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warning = 2,
  Error = 3,
}

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private currentLogLevel: LogLevel;

  constructor() {
    // Set log level based on environment
    this.currentLogLevel = environment.production
      ? LogLevel.Warning
      : LogLevel.Debug;
  }

  debug(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.Debug, message, ...optionalParams);
  }

  info(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.Info, message, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.Warning, message, ...optionalParams);
  }

  error(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.Error, message, ...optionalParams);
  }

  private log(
    level: LogLevel,
    message: string,
    ...optionalParams: any[]
  ): void {
    // Only log if the current log level is less than or equal to the specified level
    if (level >= this.currentLogLevel) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${LogLevel[level]}]`;

      switch (level) {
        case LogLevel.Debug:
          console.debug(prefix, message, ...optionalParams);
          break;
        case LogLevel.Info:
          console.info(prefix, message, ...optionalParams);
          break;
        case LogLevel.Warning:
          console.warn(prefix, message, ...optionalParams);
          break;
        case LogLevel.Error:
          console.error(prefix, message, ...optionalParams);
          break;
      }

      // In a real application, you might want to send logs to a server or other storage
      // this.sendToServer(level, message, ...optionalParams);
    }
  }

  // Optional: Method to send logs to server for production monitoring
  private sendToServer(
    level: LogLevel,
    message: string,
    ...optionalParams: any[]
  ): void {
    // Implementation for sending logs to server would go here
    // Only implement if you have a backend service to collect logs
  }
}
