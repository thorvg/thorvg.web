# Cross-Framework Build Tester

A cross-framework build testing script for thorvg.web that tests build functionality across different frontend frameworks.

## File Structure

All paths are relative to the **project root directory**:

```
scripts/cross-framework-test/
├── index.js              # Main entry point
├── constant/
│   └── config.js             # Config and framework settings
├── lib/
│   ├── build-tester.js       # Main build testing logic
│   ├── cli.js                # Command line interface
│   ├── file-system.js        # File system utilities
│   ├── logger.js             # Logging utility
│   └── reporter.js           # Results formatting and output
└── README.md             # This file
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

You can add new frameworks in the `constant/config.js` file:

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

## Development

### Module Structure

Each module follows the single responsibility principle and can be tested and reused independently:

- **`constant/config.js`** - Configuration management
- **`lib/logger.js`** - Color-coded timestamp logging
- **`lib/file-system.js`** - File system operations
- **`lib/build-tester.js`** - Build testing logic
- **`lib/reporter.js`** - Results formatting
- **`lib/cli.js`** - Command line interface
- **`index.js`** - Main entry point

### Adding New Frameworks

1. Add framework configuration to `constant/config.js`
2. Create framework project in `example/` directory
3. Ensure `package.json` file exists
