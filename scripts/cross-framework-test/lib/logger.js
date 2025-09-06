/**
 * Logger class for consistent, colored console output with timestamps
 */
class Logger {
  static colors = {
    success: "\x1b[32m",
    error: "\x1b[31m",
    warning: "\x1b[33m",
    info: "\x1b[36m",
    reset: "\x1b[0m",
  };

  /**
   * Log a message with timestamp and color coding
   * @param {string} message - The message to log
   * @param {string} type - The log type (success, error, warning, info)
   */
  static log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const color = this.colors[type] || this.colors.info;
    console.log(`${color}[${timestamp}] ${message}${this.colors.reset}`);
  }

  /**
   * Convenience methods for different log types
   */
  static success(message) {
    this.log(message, "success");
  }
  static error(message) {
    this.log(message, "error");
  }
  static warning(message) {
    this.log(message, "warning");
  }
  static info(message) {
    this.log(message, "info");
  }
}

module.exports = Logger;
