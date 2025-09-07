const path = require("path");

const DEFAULT_CONFIG = {
  EXAMPLES_DIR: path.join(__dirname, "..", "..", "..", "example"),
  DEFAULT_TIMEOUT: 300000, // 5 minutes
  VERBOSE_DEFAULT: false,
};

/**
 * Framework-specific build configurations
 * Each framework defines its build command, package manager, and timeout
 */
const FRAMEWORK_CONFIGS = {
  react: {
    buildCommand: "npm run build",
    packageManager: "npm",
    timeout: DEFAULT_CONFIG.DEFAULT_TIMEOUT,
    description: "React build configuration",
  },
  vue: {
    buildCommand: "npm run build",
    packageManager: "npm",
    timeout: DEFAULT_CONFIG.DEFAULT_TIMEOUT,
    description: "Vue build configuration",
  },
  svelte: {
    buildCommand: "npm run build",
    packageManager: "npm",
    timeout: DEFAULT_CONFIG.DEFAULT_TIMEOUT,
    description: "Svelte build configuration",
  },

  // Add more frameworks as they are added
};

module.exports = {
  DEFAULT_CONFIG,
  FRAMEWORK_CONFIGS,
};
