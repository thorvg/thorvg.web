const Logger = require("./logger");
const CrossFrameworkBuildTester = require("./build-tester");

/**
 * Command Line Interface for the build tester
 */
class CLI {
  constructor() {
    this.args = process.argv.slice(2);
    this.options = {};
    this.frameworks = [];
  }

  /**
   * Parse command line arguments
   */
  parseArguments() {
    for (const arg of this.args) {
      if (this.isVerboseFlag(arg)) {
        this.options.verbose = true;
      } else if (this.isHelpFlag(arg)) {
        this.showHelp();
        process.exit(0);
      } else if (this.isFrameworkArgument(arg)) {
        this.frameworks.push(arg);
      } else {
        this.handleUnknownArgument(arg);
      }
    }
  }

  /**
   * Check if argument is a verbose flag
   * @param {string} arg - Command line argument
   * @returns {boolean} True if verbose flag
   */
  isVerboseFlag(arg) {
    return arg === "--verbose" || arg === "-v";
  }

  /**
   * Check if argument is a help flag
   * @param {string} arg - Command line argument
   * @returns {boolean} True if help flag
   */
  isHelpFlag(arg) {
    return arg === "--help" || arg === "-h";
  }

  /**
   * Check if argument is a framework name
   * @param {string} arg - Command line argument
   * @returns {boolean} True if framework argument
   */
  isFrameworkArgument(arg) {
    return !arg.startsWith("-");
  }

  /**
   * Handle unknown command line arguments
   * @param {string} arg - Unknown argument
   */
  handleUnknownArgument(arg) {
    Logger.warning(`Unknown argument: ${arg}`);
    this.showHelp();
    process.exit(1);
  }

  /**
   * Display help information
   */
  showHelp() {
    const helpText = `
      Cross-Framework Build Tester for thorvg.web

      Usage: node index.js [frameworks...] [options]

      Frameworks:
        react        Test React framework
        vue          Test Vue framework
        svelte       Test Svelte framework
        angular      Test Angular framework
        (auto-detect all frameworks if none specified)

      Options:
        --verbose, -v    Enable verbose output
        --help, -h       Show this help message

      Examples:
        node index.js                     # Test all frameworks
        node index.js react               # Test only React
        node index.js react vue --verbose # Test React and Vue with verbose output
    `.trim();

    console.log(helpText);
  }

  /**
   * Execute the CLI command
   * @returns {number} Exit code
   */
  execute() {
    this.parseArguments();

    const tester = new CrossFrameworkBuildTester(this.options);
    const exitCode = tester.run(
      this.frameworks.length > 0 ? this.frameworks : null
    );

    return exitCode;
  }
}

module.exports = CLI;
