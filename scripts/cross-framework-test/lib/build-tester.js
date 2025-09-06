const path = require("path");
const { execSync } = require("child_process");

const Logger = require("./logger");
const FileSystemUtils = require("./file-system-utils");
const ResultsReporter = require("./results-reporter");

const { DEFAULT_CONFIG, FRAMEWORK_CONFIGS } = require("./config");

/**
 * Main class for cross-framework build testing
 */
class CrossFrameworkBuildTester {
  constructor(options = {}) {
    this.results = { successful: [], failed: [], skipped: [] };
    this.options = {
      examplesDir: options.examplesDir || DEFAULT_CONFIG.EXAMPLES_DIR,
      verbose: options.verbose || DEFAULT_CONFIG.VERBOSE_DEFAULT,
      ...options,
    };
    this.originalCwd = process.cwd();
    this.logger = Logger;
  }

  /**
   * Validate a framework directory and record results
   * @param {string} frameworkName - Name of the framework to validate
   * @returns {boolean} True if framework is valid for testing
   */
  async validateFramework(frameworkName) {
    const validation = FileSystemUtils.validateFrameworkDirectory(
      this.options.examplesDir,
      frameworkName
    );

    if (!validation.valid) {
      this.results.skipped.push({
        framework: frameworkName,
        reason: validation.reason,
        timestamp: new Date().toISOString(),
      });
      this.logger.warning(`${frameworkName}: ${validation.reason}`);
      return false;
    }

    return true;
  }

  /**
   * Execute build test for a specific framework
   * @param {string} frameworkName - Name of the framework to test
   */
  async executeBuildTest(frameworkName) {
    const frameworkPath = path.join(this.options.examplesDir, frameworkName);
    const config = FRAMEWORK_CONFIGS[frameworkName];

    if (!config) {
      this.recordSkipped(
        frameworkName,
        "No configuration found for this framework"
      );
      return;
    }

    try {
      this.logger.info(`Testing ${frameworkName} build...`);

      process.chdir(frameworkPath); // Change to framework directory
      await this.installDepsIfNeeded(frameworkName, frameworkPath, config); // Install dependencies if needed
      await this.runBuildCommand(frameworkName, config); // Execute build command

      // Record success
      this.results.successful.push(frameworkName);
      this.logger.success(`✅ ${frameworkName} build successful!`);
    } catch (error) {
      this.recordFailed(frameworkName, error.message);
    } finally {
      this.restoreWorkingDirectory();
    }
  }

  /**
   * Install dependencies if node_modules doesn't exist
   * @param {string} frameworkName - Name of the framework
   * @param {string} frameworkPath - Path to framework directory
   * @param {object} config - Framework configuration
   */
  async installDepsIfNeeded(frameworkName, frameworkPath, config) {
    if (!FileSystemUtils.hasNodeModules(frameworkPath)) {
      this.logger.info(`Installing dependencies for ${frameworkName}...`);
      execSync(`${config.packageManager} install`, {
        stdio: this.options.verbose ? "inherit" : "pipe",
        timeout: config.timeout,
      });
    }
  }

  /**
   * Run the build command for a framework
   * @param {string} frameworkName - Name of the framework
   * @param {object} config - Framework configuration
   */
  async runBuildCommand(frameworkName, config) {
    this.logger.info(`Building ${frameworkName}...`);
    execSync(config.buildCommand, {
      stdio: this.options.verbose ? "inherit" : "pipe",
      timeout: config.timeout,
    });
  }

  /**
   * Record a skipped framework with reason
   * @param {string} frameworkName - Name of the framework
   * @param {string} reason - Reason for skipping
   */
  recordSkipped(frameworkName, reason) {
    this.results.skipped.push({
      framework: frameworkName,
      reason,
      timestamp: new Date().toISOString(),
    });
    this.logger.warning(`${frameworkName}: ${reason}`);
  }

  /**
   * Record a failed framework with error
   * @param {string} frameworkName - Name of the framework
   * @param {string} errorMessage - Error message
   */
  recordFailed(frameworkName, errorMessage) {
    this.results.failed.push({
      framework: frameworkName,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
    this.logger.error(`❌ ${frameworkName} build failed: ${errorMessage}`);
  }

  /**
   * Safely restore the original working directory
   */
  restoreWorkingDirectory() {
    try {
      process.chdir(this.originalCwd);
    } catch (error) {
      this.logger.warning(`Failed to restore directory: ${error.message}`);
    }
  }

  /**
   * Main execution method for running build tests
   * @param {string|string[]|null} frameworks - Specific frameworks to test, or null for auto-discovery
   * @returns {number} Exit code (0 for success, 1 for failures)
   */
  async run(frameworks = null) {
    this.logger.info("🚀 Starting cross-framework build testing...");

    const frameworksToTest = this.resolveFrameworksToTest(frameworks);
    this.logger.info(
      `Found frameworks to test: ${frameworksToTest.join(", ")}`
    );

    await this.executeTests(frameworksToTest); // Execute tests for each framework
    this.displayResults(); // Generate and display results

    return this.determineExitCode();
  }

  /**
   * Resolve which frameworks to test based on input
   * @param {string|string[]|null} frameworks - User-specified frameworks or null for auto-discovery
   * @returns {string[]} Array of framework names to test
   */
  resolveFrameworksToTest(frameworks) {
    if (frameworks) {
      return Array.isArray(frameworks) ? frameworks : [frameworks];
    }

    // Auto-discover frameworks
    return FileSystemUtils.discoverFrameworks(this.options.examplesDir);
  }

  /**
   * Execute build tests for all specified frameworks
   * @param {string[]} frameworksToTest - Array of framework names to test
   */
  async executeTests(frameworksToTest) {
    for (const framework of frameworksToTest) {
      const isValid = await this.validateFramework(framework);
      if (isValid) {
        await this.executeBuildTest(framework);
      }
    }
  }

  /**
   * Display test results summary
   */
  displayResults() {
    const reporter = new ResultsReporter(this.results, this.logger);
    reporter.displaySummary();
  }

  /**
   * Determine exit code based on test results
   * @returns {number} 0 if all tests passed, 1 if any failed
   */
  determineExitCode() {
    return this.results.failed.length === 0 ? 0 : 1;
  }
}

module.exports = CrossFrameworkBuildTester;
