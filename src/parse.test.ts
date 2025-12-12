import { describe, it, expect } from 'vitest';
import { parseCode } from './parse';

describe('parseCode', () => {
  it('should parse valid code correctly', () => {
    const result = parseCode('10А');
    expect(result).toEqual('10А');
  });

  it('should convert latin characters to cyrillic', () => {
    const result = parseCode('10D');
    expect(result).toEqual('10Д');
  });

  it('should remove leading zeros', () => {
    const result = parseCode('00010А');
    expect(result).toEqual('10А');
  });

  it('should handle HTML entities', () => {
    const result = parseCode('&nbsp;10А&nbsp;');
    expect(result).toEqual('10А');
  });

  it('should replace newlines with spaces', () => {
    const single = parseCode('10\nА');
    expect(single).toEqual('10А');
    const multi = parseCode('10\n\n\n\nБ');
    expect(multi).toEqual('10Б');
  });

  it('should remove multiple spaces', () => {
    const result = parseCode('10   А');
    expect(result).toEqual('10А');
  });

  it('should remove dashes', () => {
    const result1 = parseCode('10-А');
    const result2 = parseCode('10–Б');
    const result3 = parseCode('10—В');
    const result4 = parseCode('10―Г');
    expect(result1).toEqual('10А');
    expect(result2).toEqual('10Б');
    expect(result3).toEqual('10В');
    expect(result4).toEqual('10Г');
  });

  it('should allow "0" as valid code', () => {
    const result = parseCode(' 0000 ');
    expect(result).toBe('0');
  });

  it('should extract numeric patterns from long strings', () => {
    const longStr = 'нерозібраний текст що містить номер справи 10А та інший текст';
    const result = parseCode(longStr);
    expect(result).toEqual('10');
  });

  it('should throw error on empty code when ignoreError is false', () => {
    expect(() => parseCode('   ')).toThrow('Empty code');
  });

  it('should not throw error on empty code when ignoreError is true', () => {
    expect(() => parseCode('   ', true)).not.toThrow();
  });

  it('should remove special characters except cyrillic and numbers', () => {
    const result = parseCode('10!@А#т$%1');
    expect(result).toEqual('10АТ1');
  });

  it('should return uppercase result', () => {
    const result = parseCode('10а');
    expect(result).toEqual('10А');
  });

  it('should shorten "доп" to "д"', () => {
    const result = parseCode('10доп123');
    expect(result).toEqual('10Д123');
  });

  it('should shorten "том" to "т"', () => {
    const result = parseCode('10том123');
    expect(result).toEqual('10Т123');
  });

  it('should shorten "частина" variations to "ч"', () => {
    const result1 = parseCode('10частина123');
    const result2 = parseCode('10частин123');
    const result3 = parseCode('10части123');
    expect(result1).toEqual('10Ч123');
    expect(result2).toEqual('10Ч123');
    expect(result3).toEqual('10Ч123');
  });

  it('EDGE CASE: should detect ending with dot as "Н"', () => {
    const result = parseCode('10.');
    expect(result).toBe('10Н');
  });
});
