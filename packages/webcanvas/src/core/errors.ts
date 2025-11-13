/**
 * ThorVG error handling
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

    const message = `${operation} failed: ${messages[code] ?? 'Unknown error'}`;
    return new ThorVGError(message, code, operation);
  }
}

export function checkResult(result: number, operation: string): void {
  if (result !== ThorVGResultCode.Success) {
    throw ThorVGError.fromCode(result as ThorVGResultCode, operation);
  }
}
