/**
 * Smart code transformer that strips initialization code while preserving user logic
 * Works with any variable names and patterns
 */

export function transformCodeForExecution(code: string): string {
  let result = code;

  // 1. Remove import statements (any import from any module)
  result = result.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '');

  // 2. Remove export statements
  result = result.replace(/^export\s+.*$/gm, '');

  // 3. Remove await init() calls with any variable name
  // Matches: const/let/var VARNAME = await init({...});
  result = result.replace(
    /^(const|let|var)\s+\w+\s*=\s*await\s+init\s*\(\s*\{[\s\S]*?\}\s*\)\s*;?\s*$/gm,
    ''
  );

  // 4. Remove new Canvas() instantiation with any variable names
  // Matches: const/let/var VARNAME = new ANYTHING.Canvas('#canvas', {...});
  result = result.replace(
    /^(const|let|var)\s+\w+\s*=\s*new\s+\w+\.Canvas\s*\(\s*['"]#?canvas['"],?\s*\{[\s\S]*?\}\s*\)\s*;?\s*$/gm,
    ''
  );

  // 5. Remove single-line comments that are explanatory (not code)
  // Keep commented-out code, remove only standalone comment lines
  result = result.replace(/^\/\/(?!.*:).*$/gm, '');

  // 6. Remove multi-line comments and JSDoc
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');

  // 7. Clean up excessive blank lines (more than 2 consecutive)
  result = result.replace(/\n{3,}/g, '\n\n');

  // 8. Trim leading/trailing whitespace
  result = result.trim();

  return result;
}

/**
 * Extract the initialization config from code for reference
 * This can be useful for debugging or showing what was stripped
 */
export function extractInitConfig(code: string): {
  renderer?: string;
  canvasSize?: { width: number; height: number };
} {
  const config: {
    renderer?: string;
    canvasSize?: { width: number; height: number };
  } = {};

  // Extract renderer from init() call
  const rendererMatch = code.match(/renderer:\s*['"](\w+)['"]/);
  if (rendererMatch) {
    config.renderer = rendererMatch[1];
  }

  // Extract canvas dimensions
  const widthMatch = code.match(/width:\s*(\d+)/);
  const heightMatch = code.match(/height:\s*(\d+)/);
  if (widthMatch && heightMatch) {
    config.canvasSize = {
      width: parseInt(widthMatch[1], 10),
      height: parseInt(heightMatch[1], 10),
    };
  }

  return config;
}

/**
 * Validate that the transformed code doesn't have syntax errors
 * Returns error message if invalid, null if valid
 */
export function validateTransformedCode(code: string): string | null {
  try {
    // Simple syntax check using Function constructor
    new Function(code);
    return null;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown syntax error';
  }
}

/**
 * Check if code uses async/await patterns that need special handling
 */
export function needsAsyncWrapper(code: string): boolean {
  return /\bawait\b/.test(code);
}

/**
 * Development helper: show what will be stripped vs kept
 */
export function debugTransformation(code: string): {
  original: string;
  transformed: string;
  stripped: string[];
  config: ReturnType<typeof extractInitConfig>;
} {
  const lines = code.split('\n');
  const transformed = transformCodeForExecution(code);
  const transformedLines = new Set(transformed.split('\n').filter(l => l.trim()));

  const stripped = lines
    .filter(line => {
      const trimmed = line.trim();
      return trimmed && !transformedLines.has(trimmed);
    });

  return {
    original: code,
    transformed,
    stripped,
    config: extractInitConfig(code),
  };
}
