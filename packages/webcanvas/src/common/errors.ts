/**
 * ThorVG error result codes returned by native WASM operations.
 *
 * @category Error Handling
 */
export enum ThorVGResultCode {
  Success = 0,
  InvalidArguments = 1,
  InsufficientCondition = 2,
  FailedAllocation = 3,
  MemoryCorruption = 4,
  NotSupported = 5,
  Unknown = 6,
}

/**
 * Error class for ThorVG WASM operations.
 * Contains error code and operation information.
 *
 * @category Error Handling
 */
export class ThorVGError extends Error {
  public readonly code: ThorVGResultCode;
  public readonly operation: string;

  constructor(message: string, code: ThorVGResultCode, operation: string) {
    super(message);
    this.name = 'ThorVGError';
    this.code = code;
    this.operation = operation;

    // Maintains proper stack trace for where our error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ThorVGError);
    }
  }

  public static fromCode(code: ThorVGResultCode, operation: string): ThorVGError {
    const messages: Record<ThorVGResultCode, string> = {
      [ThorVGResultCode.Success]: 'Success',
      [ThorVGResultCode.InvalidArguments]: 'Invalid arguments',
      [ThorVGResultCode.InsufficientCondition]: 'Insufficient condition',
      [ThorVGResultCode.FailedAllocation]: 'Failed allocation',
      [ThorVGResultCode.MemoryCorruption]: 'Memory corruption',
      [ThorVGResultCode.NotSupported]: 'Not supported',
      [ThorVGResultCode.Unknown]: 'Unknown error',
    };

    const message = `TVGERR - ${operation} failed: ${messages[code] ?? 'Unknown error'}`;
    return new ThorVGError(message, code, operation);
  }
}

/**
 * Context information provided when an error occurs.
 *
 * @category Error Handling
 */
export interface ErrorContext {
  /** The operation that failed (e.g., 'moveTo', 'render', 'update') */
  operation: string;
}

/**
 * Error handler callback function.
 *
 * Handles both ThorVG WASM errors (ThorVGError) and JavaScript errors (Error).
 * Use instanceof to distinguish between error types.
 *
 * @category Error Handling
 *
 * @example
 * ```typescript
 * import { init } from '@thorvg/webcanvas';
 *
 * const TVG = await init({
 *   onError: (error, context) => {
 *     if (error instanceof ThorVGError) {
 *       // WASM error - has error.code
 *       console.log('WASM error code:', error.code);
 *     } else {
 *       // JavaScript error
 *       console.log('JS error:', error.message);
 *     }
 *   }
 * });
 * ```
 */
export interface ErrorHandler {
  (error: Error, context: ErrorContext): void;
}

// Global error handler - set during init()
let globalErrorHandler: ErrorHandler | undefined;

/**
 * @internal
 * Sets the global error handler
 */
export function setGlobalErrorHandler(handler?: ErrorHandler): void {
  globalErrorHandler = handler;
}

export function checkResult(result: number, operation: string): void {
  if (result === ThorVGResultCode.Success) {
    return;
  }

  const error = ThorVGError.fromCode(result as ThorVGResultCode, operation);

  if (globalErrorHandler) {
    globalErrorHandler(error, { operation });
    return;
  }

  // No error handler - throw for try-catch debugging
  throw error;
}

export function handleError(message: string, operation: string): void {
  const error = new Error(`ERROR - ${operation}: ${message}`);

  if (globalErrorHandler) {
    globalErrorHandler(error, { operation });
    return;
  }

  // No error handler - throw for try-catch debugging
  throw error;
}
