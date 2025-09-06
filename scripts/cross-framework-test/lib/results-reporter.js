/**
 * Handles formatting and displaying test results
 */
class ResultsReporter {
  constructor(results, logger) {
    this.results = results;
    this.logger = logger;
  }

  /**
   * Display complete test results summary
   */
  displaySummary() {
    this.logger.info("\n📊 Build Test Summary:");

    this.displaySuccessfulResults();
    this.displayFailedResults();
    this.displaySkippedResults();
    this.displayTotals();
  }

  /**
   * Display successful test results
   */
  displaySuccessfulResults() {
    if (this.results.successful.length > 0) {
      this.logger.success(
        `✅ Successful: ${this.results.successful.join(", ")}`
      );
    }
  }

  /**
   * Display failed test results with details
   */
  displayFailedResults() {
    if (this.results.failed.length > 0) {
      this.logger.error(
        `❌ Failed: ${this.results.failed.map(f => f.framework).join(", ")}`
      );
      this.results.failed.forEach(failure => {
        this.logger.error(`   ${failure.framework}: ${failure.error}`);
      });
    }
  }

  /**
   * Display skipped test results with reasons
   */
  displaySkippedResults() {
    if (this.results.skipped.length > 0) {
      this.logger.warning(
        `⏭️  Skipped: ${this.results.skipped.map(s => s.framework).join(", ")}`
      );
      this.results.skipped.forEach(skip => {
        this.logger.warning(`   ${skip.framework}: ${skip.reason}`);
      });
    }
  }

  /**
   * Display total counts
   */
  displayTotals() {
    const total =
      this.results.successful.length +
      this.results.failed.length +
      this.results.skipped.length;
    this.logger.info(`\nTotal tested: ${total}`);
  }
}

module.exports = ResultsReporter;
