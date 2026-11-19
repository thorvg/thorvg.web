/**
 * ThorVG error result codes.
 *
 * @category Error Handling
 */
export enum ThorVGResultCode {
  /** The value returned in case of a correct request execution. */
  Success = 0,
  /** The value returned in the event of a problem with the arguments given to the API - e.g. empty paths or null pointers. */
  InvalidArguments = 1,
  /** The value returned in case the request cannot be processed - e.g. asking for properties of an object, which does not exist. */
  InsufficientCondition = 2,
  /** The value returned in case of unsuccessful memory allocation. */
  FailedAllocation = 3,
  /** The value returned in the event of bad memory handling - e.g. failing in pointer releasing or casting. */
  MemoryCorruption = 4,
  /** The value returned in case of choosing unsupported engine features (options). */
  NotSupported = 5,
  /** The value returned when an underlying system operation fails. */
  SystemError = 6,
  /** The value returned in all other cases. */
  Unknown = 255,
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
  }

  /** @internal */
  public static fromCode(code: ThorVGResultCode, operation: string): ThorVGError {
    const messages: Record<ThorVGResultCode, string> = {
      [ThorVGResultCode.Success]: 'Success',
      [ThorVGResultCode.InvalidArguments]: 'Invalid arguments',
      [ThorVGResultCode.InsufficientCondition]: 'Insufficient condition',
      [ThorVGResultCode.FailedAllocation]: 'Failed allocation',
      [ThorVGResultCode.MemoryCorruption]: 'Memory corruption',
      [ThorVGResultCode.NotSupported]: 'Not supported',
      [ThorVGResultCode.SystemError]: 'System error',
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
