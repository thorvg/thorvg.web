const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Cross-framework build testing script for thorvg.web
 * Tests build functionality across different frontend frameworks
 */

const EXAMPLES_DIR = path.join(__dirname, "..", "..", "example");
const FRAMEWORK_CONFIGS = {
  react: {
    buildCommand: "npm run build",
    packageManager: "npm",
    timeout: 300000, // 5 minutes
    description: "React build configuration",
  },
  vue: {
    buildCommand: "npm run build",
    packageManager: "npm",
    timeout: 300000,
    description: "Vue build configuration",
  },
  svelte: {
    buildCommand: "npm run build",
    packageManager: "npm",
    timeout: 300000,
    description: "Svelte build configuration",
  },
  // Add more frameworks as they are added
};

class CrossFrameworkBuildTester {
  constructor(options = {}) {
    this.results = { successful: [], failed: [], skipped: [] };
    this.options = {
      examplesDir: options.examplesDir || EXAMPLES_DIR,
      verbose: options.verbose || false,
      ...options,
    };
    this.originalCwd = process.cwd();
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const colors = {
      success: "\x1b[32m",
      error: "\x1b[31m",
      warning: "\x1b[33m",
      info: "\x1b[36m",
      reset: "\x1b[0m",
    };

    const color = colors[type] || colors.info;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  async checkFrameworkDirectory(frameworkName) {
    const frameworkPath = path.join(this.options.examplesDir, frameworkName);
    const packageJsonPath = path.join(frameworkPath, "package.json");

    if (!fs.existsSync(frameworkPath)) {
      this.results.skipped.push({
        framework: frameworkName,
        reason: "Directory does not exist",
        timestamp: new Date().toISOString(),
      });
      this.log(`${frameworkName}: Directory does not exist`, "warning");
      return false;
    }

    if (!fs.existsSync(packageJsonPath)) {
      this.results.skipped.push({
        framework: frameworkName,
        reason: "package.json not found",
        timestamp: new Date().toISOString(),
      });
      this.log(`${frameworkName}: package.json not found`, "warning");
      return false;
    }

    return true;
  }

  async testBuild(frameworkName) {
    const frameworkPath = path.join(this.options.examplesDir, frameworkName);
    const config = FRAMEWORK_CONFIGS[frameworkName];

    if (!config) {
      this.results.skipped.push({
        framework: frameworkName,
        reason: "No configuration found for this framework",
        timestamp: new Date().toISOString(),
      });
      this.log(`${frameworkName}: No configuration found`, "warning");
      return;
    }

    try {
      this.log(`Testing ${frameworkName} build...`, "info");

      // Change to framework directory
      process.chdir(frameworkPath);

      // Install dependencies if node_modules doesn't exist
      if (!fs.existsSync(path.join(frameworkPath, "node_modules"))) {
        this.log(`Installing dependencies for ${frameworkName}...`, "info");
        execSync(`${config.packageManager} install`, {
          stdio: this.options.verbose ? "inherit" : "pipe",
          timeout: config.timeout,
        });
      }

      // Run build command
      this.log(`Building ${frameworkName}...`, "info");
      execSync(config.buildCommand, {
        stdio: this.options.verbose ? "inherit" : "pipe",
        timeout: config.timeout,
      });

      this.results.successful.push(frameworkName);
      this.log(`✅ ${frameworkName} build successful!`, "success");
    } catch (error) {
      this.results.failed.push({
        framework: frameworkName,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      this.log(`❌ ${frameworkName} build failed: ${error.message}`, "error");
    } finally {
      // Always restore original directory - FIX: Use stored original path
      try {
        process.chdir(this.originalCwd);
      } catch (error) {
        this.log(`Failed to restore directory: ${error.message}`, "warning");
      }
    }
  }

  async run(frameworks = null) {
    this.log("🚀 Starting cross-framework build testing...", "info");

    // Get frameworks to test
    let frameworksToTest;
    if (frameworks) {
      frameworksToTest = Array.isArray(frameworks) ? frameworks : [frameworks];
    } else {
      // Auto-discover frameworks
      frameworksToTest = fs
        .readdirSync(this.options.examplesDir)
        .filter(item => {
          const itemPath = path.join(this.options.examplesDir, item);
          return (
            fs.statSync(itemPath).isDirectory() &&
            item !== "node_modules" &&
            item !== "build" &&
            !item.startsWith(".")
          );
        });
    }

    this.log(
      `Found frameworks to test: ${frameworksToTest.join(", ")}`,
      "info"
    );

    // Test each framework
    for (const framework of frameworksToTest) {
      const exists = await this.checkFrameworkDirectory(framework);
      if (exists) {
        await this.testBuild(framework);
      }
    }

    // Print summary
    this.printSummary();

    // Exit with appropriate code
    return this.results.failed.length === 0 ? 0 : 1;
  }

  printSummary() {
    this.log("\n📊 Build Test Summary:", "info");

    if (this.results.successful.length > 0) {
      this.log(
        `✅ Successful: ${this.results.successful.join(", ")}`,
        "success"
      );
    }

    if (this.results.failed.length > 0) {
      this.log(
        `❌ Failed: ${this.results.failed.map(f => f.framework).join(", ")}`,
        "error"
      );
      this.results.failed.forEach(failure => {
        this.log(`   ${failure.framework}: ${failure.error}`, "error");
      });
    }

    if (this.results.skipped.length > 0) {
      this.log(
        `⏭️  Skipped: ${this.results.skipped.map(s => s.framework).join(", ")}`,
        "warning"
      );
      this.results.skipped.forEach(skip => {
        this.log(`   ${skip.framework}: ${skip.reason}`, "warning");
      });
    }

    this.log(
      `\nTotal tested: ${
        this.results.successful.length +
        this.results.failed.length +
        this.results.skipped.length
      }`,
      "info"
    );
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const options = {};
  const frameworks = [];

  for (const arg of args) {
    if (arg === "--verbose" || arg === "-v") {
      options.verbose = true;
    } else if (!arg.startsWith("-")) {
      frameworks.push(arg);
    }
  }

  const tester = new CrossFrameworkBuildTester(options);
  const exitCode = await tester.run(frameworks.length > 0 ? frameworks : null);

  process.exit(exitCode);
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", error => {
  console.error("❌ Uncaught Exception:", error.message);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = CrossFrameworkBuildTester;
