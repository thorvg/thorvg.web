import { describe, it, expect } from 'vitest';
import { ThorVGResultCode, ThorVGError, checkResult } from '../src/common/errors';

describe('ThorVGResultCode', () => {
  it('has correct values', () => {
    expect(ThorVGResultCode.Success).toBe(0);
    expect(ThorVGResultCode.InvalidArguments).toBe(1);
    expect(ThorVGResultCode.InsufficientCondition).toBe(2);
    expect(ThorVGResultCode.FailedAllocation).toBe(3);
    expect(ThorVGResultCode.MemoryCorruption).toBe(4);
    expect(ThorVGResultCode.NotSupported).toBe(5);
    expect(ThorVGResultCode.Unknown).toBe(6);
  });
});

describe('ThorVGError', () => {
  it('constructor sets fields', () => {
    const err = new ThorVGError('test message', ThorVGResultCode.InvalidArguments, 'testOp');
    expect(err.message).toBe('test message');
    expect(err.code).toBe(ThorVGResultCode.InvalidArguments);
    expect(err.operation).toBe('testOp');
    expect(err.name).toBe('ThorVGError');
    expect(err).toBeInstanceOf(Error);
  });

  it('fromCode creates correct message', () => {
    const err = ThorVGError.fromCode(ThorVGResultCode.InvalidArguments, 'moveTo');
    expect(err.message).toContain('moveTo');
    expect(err.message).toContain('Invalid arguments');
    expect(err.code).toBe(ThorVGResultCode.InvalidArguments);
    expect(err.operation).toBe('moveTo');
  });
});

describe('checkResult', () => {
  it('does not throw on success', () => {
    expect(() => checkResult(0, 'test')).not.toThrow();
  });

  it('throws ThorVGError on failure', () => {
    expect(() => checkResult(1, 'test')).toThrow(ThorVGError);
  });
});
