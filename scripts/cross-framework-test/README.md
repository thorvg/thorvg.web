# Cross-Framework Build Tester

A cross-framework build testing script for thorvg.web that tests build functionality across different frontend frameworks.

## File Structure

All paths are relative to the **project root directory**:

```
scripts/cross-framework-test/
├── index.js              # Main entry point
├── lib/
│   ├── config.js             # Config and framework settings
│   ├── logger.js             # Logging utility
│   ├── file-system-utils.js  # File system utility
│   ├── build-tester.js       # Main build testing logic
│   ├── results-reporter.js   # Results formatting and output
│   └── cli.js                # Command line interface
└── README.md            # This file
```

## Usage

All commands should be run from the **project root directory**.

### Basic Usage

```bash
# Auto-detect and test all frameworks
node scripts/cross-framework-test/index.js

# Test specific frameworks only
node scripts/cross-framework-test/index.js react
node scripts/cross-framework-test/index.js vue svelte

# Verbose output mode
node scripts/cross-framework-test/index.js --verbose
node scripts/cross-framework-test/index.js react --verbose

# Show help
node scripts/cross-framework-test/index.js --help
```

### Supported Frameworks

- **React** - React application build testing
- **Vue** - Vue application build testing
- **Svelte** - Svelte application build testing

## Configuration

### Adding New Framework

You can add new frameworks in the `config.js` file:

```javascript
const FRAMEWORK_CONFIGS = {
  // existing configurations...
  angular: {
    buildCommand: "ng build",
    packageManager: "npm",
    timeout: DEFAULT_CONFIG.DEFAULT_TIMEOUT,
    description: "Angular build configuration",
  },
};
```

## Output Example

```
[2025-09-06T14:43:36.376Z] 🚀 Starting cross-framework build testing...
[2025-09-06T14:43:36.379Z] Found frameworks to test: react, vue, svelte
[2025-09-06T14:43:36.380Z] Testing react build...
[2025-09-06T14:43:37.768Z] ✅ react build successful!
[2025-09-06T14:43:37.768Z] Testing vue build...
[2025-09-06T14:43:38.123Z] ✅ vue build successful!
[2025-09-06T14:43:38.124Z]
📊 Build Test Summary:
[2025-09-06T14:43:38.124Z] ✅ Successful: react, vue
[2025-09-06T14:43:38.124Z] ⏭️  Skipped: svelte (Directory does not exist)
[2025-09-06T14:43:38.124Z]
Total tested: 3
```

## Development

### Module Structure

Each module follows the single responsibility principle and can be tested and reused independently:

- **`config.js`** - Configuration management
- **`logger.js`** - Color-coded timestamp logging
- **`file-system-utils.js`** - File system operations
- **`build-tester.js`** - Build testing logic
- **`results-reporter.js`** - Results formatting
- **`cli.js`** - Command line interface
- **`index.js`** - Main entry point

### Adding New Frameworks

1. Add framework configuration to `config.js`
2. Create framework project in `example/` directory
3. Ensure `package.json` file exists
