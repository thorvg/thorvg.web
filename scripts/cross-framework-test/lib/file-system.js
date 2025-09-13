const fs = require("fs");
const path = require("path");

/**
 * File system utilities for framework directory operations
 */
class FileSystem {
  /**
   * Check if a framework directory exists and has required files
   * @param {string} examplesDir - Base examples directory
   * @param {string} frameworkName - Name of the framework to check
   * @returns {{valid: boolean, reason: string}}
   */
  static validateFrameworkDirectory(examplesDir, frameworkName) {
    const frameworkPath = path.join(examplesDir, frameworkName);
    const packageJsonPath = path.join(frameworkPath, "package.json");

    if (!fs.existsSync(frameworkPath)) {
      return { valid: false, reason: "Directory does not exist" };
    }

    if (!fs.existsSync(packageJsonPath)) {
      return { valid: false, reason: "package.json not found" };
    }

    return { valid: true };
  }

  /**
   * Get all framework directories from examples folder
   * @param {string} examplesDir - Base examples directory
   * @returns {string[]} Array of framework names
   */
  static discoverFrameworks(examplesDir) {
    return fs.readdirSync(examplesDir).filter(item => {
      const itemPath = path.join(examplesDir, item);
      return (
        fs.statSync(itemPath).isDirectory() &&
        item !== "node_modules" &&
        item !== "build" &&
        !item.startsWith(".")
      );
    });
  }

  /**
   * Check if node_modules exists in framework directory
   * @param {string} frameworkPath - Path to framework directory
   * @returns {boolean} True if node_modules exists
   */
  static hasNodeModules(frameworkPath) {
    return fs.existsSync(path.join(frameworkPath, "node_modules"));
  }
}

module.exports = FileSystem;
