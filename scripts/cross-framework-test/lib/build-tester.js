const path = require("path");
const { execSync } = require("child_process");

const Logger = require("./logger");
const FileSystem = require("./file-system");
const Reporter = require("./reporter");

const { DEFAULT_CONFIG, FRAMEWORK_CONFIGS } = require("../constant/config");

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
   * @param {string|string[]|null} frameworks - Specific frameworks to test, or null for auto-discovery
   * @returns {number} Exit code (0 for success, 1 for failures)
   */
  execute(frameworks = null) {
    // 1. testing
    this.logger.info("🚀 Starting cross-framework build testing...");
    const frameworksToTest = this._getFrameworksToTest(frameworks);
    this.logger.info(
      `Found frameworks to test: ${frameworksToTest.join(", ")}`
    );
    this._executeBuildTestsForFrameworks(frameworksToTest); // Orchestrate builds for each framework

    // 2. Display results
    const reporter = new Reporter(this.results, this.logger);
    reporter.displaySummary();

    // 3. Determine exit code
    return this.results.failed.length === 0 ? 0 : 1;
  }

  /**
   * @private
   * @param {string|string[]|null} frameworks - User-specified frameworks or null for auto-discovery
   * @returns {string[]} Array of framework names to test
   */
  _getFrameworksToTest(frameworks) {
    if (frameworks) {
      return Array.isArray(frameworks) ? frameworks : [frameworks];
    }
    return FileSystem.discoverFrameworks(this.options.examplesDir);
  }

  /**
   * Orchestrate build tests for all specified frameworks
   * @private
   * @param {string[]} frameworksToTest - Array of framework names to test
   */
  _executeBuildTestsForFrameworks(frameworksToTest) {
    for (const framework of frameworksToTest) {
      const validation = FileSystem.validateFrameworkDirectory(
        this.options.examplesDir,
        framework
      );

      if (!validation.valid) {
        this._recordBuildResult(framework, "skipped", validation.reason);
        continue;
      }

      this.logger.info(`Testing ${framework} build...`);

      try {
        this._buildSingleFramework(framework);
        this._recordBuildResult(framework, "successful");
      } catch (error) {
        this._recordBuildResult(framework, "failed", null, error.message);
      } finally {
        this._restoreWorkingDirectory();
      }
    }
  }

  /**
   * @private
   * @param {string} frameworkName - Name of the framework to build
   * @throws {Error} If build process fails
   */
  _buildSingleFramework(frameworkName) {
    const frameworkPath = path.join(this.options.examplesDir, frameworkName);
    /**
     *  <CONFIG EXAMPLE>
     * {
     *   buildCommand: "npm run build",
     *   packageManager: "npm",
     *   timeout: DEFAULT_CONFIG.DEFAULT_TIMEOUT,
     *   description: "framework build configuration",
     * }
     */
    const config = FRAMEWORK_CONFIGS[frameworkName];

    if (!config) {
      throw new Error(`No configuration found for framework: ${frameworkName}`);
    }

    // Change to framework directory
    process.chdir(frameworkPath);

    // Install dependencies if needed
    if (!FileSystem.hasNodeModules(frameworkPath)) {
      this.logger.info(`Installing dependencies for ${frameworkName}...`);
      this._executeShellCommand(`${config.packageManager} install`, config);
    }

    // Execute build command
    this.logger.info(`Building ${frameworkName}...`);
    this._executeShellCommand(config.buildCommand, config);
  }

  /**
   * @private
   * @param {string} command - Command to execute
   * @param {object} config - Framework configuration with timeout property
   * @param {boolean} [condition=true] - Whether to execute the command (default: true)
   */
  _executeShellCommand(command, config, condition = true) {
    if (!condition) return;

    execSync(command, {
      stdio: this.options.verbose ? "inherit" : "pipe",
      timeout: config.timeout,
    });
  }

  /**
   * @private
   * @param {string} frameworkName - Name of the framework
   * @param {string} status - Status: 'successful', 'skipped', or 'failed'
   * @param {string} [reason] - Reason for skipping (only for 'skipped' status)
   * @param {string} [errorMessage] - Error message (only for 'failed' status)
   */
  _recordBuildResult(
    frameworkName,
    status,
    reason = null,
    errorMessage = null
  ) {
    switch (status) {
      case "successful":
        this.results.successful.push(frameworkName);
        this.logger.success(
          `✅ ${frameworkName} build completed successfully!`
        );
        break;
      case "skipped":
        this.results.skipped.push({
          framework: frameworkName,
          reason,
          timestamp: new Date().toISOString(),
        });
        this.logger.warning(`⏭️ ${frameworkName} build skipped: ${reason}`);
        break;
      case "failed":
        this.results.failed.push({
          framework: frameworkName,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        });
        this.logger.error(`❌ ${frameworkName} build failed: ${errorMessage}`);
        break;
    }
  }

  /**
   * @private
   */
  _restoreWorkingDirectory() {
    try {
      process.chdir(this.originalCwd);
    } catch (error) {
      this.logger.warning(`Failed to restore directory: ${error.message}`);
    }
  }
}

module.exports = CrossFrameworkBuildTester;
