/**
 * Cross-framework build testing script for thorvg.web
 * Tests build functionality across different frontend frameworks
 */

const CLI = require("./lib/cli");
const Logger = require("./lib/logger");

/**
 * Main entry point
 */
function main() {
  const cli = new CLI();
  const exitCode = cli.execute();
  process.exit(exitCode);
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  Logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", error => {
  Logger.error(`❌ Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    Logger.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  });
}
