export type LogLevel = "info" | "error" | "warning";

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private format(level: LogLevel, message: string) {
    const time = new Date().toISOString();
    return `[${time}] [${this.context}] ${level.toUpperCase()}: ${message}`;
  }

  info(message: string, ...args: unknown[]) {
    console.log(this.format("info", message), ...args);
  }

  error(message: string, ...args: unknown[]) {
    console.error(this.format("error", message), ...args);
  }

  warning(message: string, ...args: unknown[]) {
    console.warn(this.format("warning", message), ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.warning(message, ...args);
  }
}
