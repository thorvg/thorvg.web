const Logger = require("./logger");
const CrossFrameworkBuildTester = require("./build-tester");

class CLI {
  constructor() {
    this.args = process.argv.slice(2);
    this.options = {};
    this.frameworks = [];
  }

  /**
   * @returns {number} Exit code
   */
  execute() {
    this._parseArguments();

    const tester = new CrossFrameworkBuildTester(this.options);
    const exitCode = tester.execute(
      this.frameworks.length > 0 ? this.frameworks : null
    );

    return exitCode;
  }

  /**
   * Parse command line arguments
   * @private
   */
  _parseArguments() {
    for (const arg of this.args) {
      if (this._isVerboseFlag(arg)) {
        this.options.verbose = true;
      } else if (this._isHelpFlag(arg)) {
        this._showHelp();
        process.exit(0);
      } else if (this._isFrameworkArgument(arg)) {
        this.frameworks.push(arg);
      } else {
        this._handleUnknownArgument(arg);
      }
    }
  }

  /**
   * Check if argument is a verbose flag
   * @private
   * @param {string} arg - Command line argument
   * @returns {boolean} True if verbose flag
   */
  _isVerboseFlag(arg) {
    return arg === "--verbose" || arg === "-v";
  }

  /**
   * Check if argument is a help flag
   * @private
   * @param {string} arg - Command line argument
   * @returns {boolean} True if help flag
   */
  _isHelpFlag(arg) {
    return arg === "--help" || arg === "-h";
  }

  /**
   * Check if argument is a framework name
   * @private
   * @param {string} arg - Command line argument
   * @returns {boolean} True if framework argument
   */
  _isFrameworkArgument(arg) {
    return !arg.startsWith("-");
  }

  /**
   * Handle unknown command line arguments
   * @private
   * @param {string} arg - Unknown argument
   */
  _handleUnknownArgument(arg) {
    Logger.warning(`Unknown argument: ${arg}`);
    this._showHelp();
    process.exit(1);
  }

  /**
   * Display help information
   * @private
   */
  _showHelp() {
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
}

module.exports = CLI;
