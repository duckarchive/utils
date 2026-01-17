import { describe, it, expect } from 'vitest';
import { parseCode, parseYears } from './parse';

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

describe('parseYears', () => {
  it('should parse single year', () => {
    const result = parseYears('1999');
    expect(result).toEqual([{ start_year: 1999, end_year: 1999 }]);
  });

  it('should parse year range with hyphen', () => {
    const result = parseYears('2000-2005');
    expect(result).toEqual([{ start_year: 2000, end_year: 2005 }]);
  });

  it('should parse year range with en dash', () => {
    const result = parseYears('2010–2015');
    expect(result).toEqual([{ start_year: 2010, end_year: 2015 }]);
  });

  it('should parse year range with md dash', () => {
    const result = parseYears('2010—2015');
    expect(result).toEqual([{ start_year: 2010, end_year: 2015 }]);
  });

  it('should parse multiple years and ranges', () => {
    const result = parseYears('1990, 1995-2000; 2005');
    expect(result).toEqual([
      { start_year: 1990, end_year: 1990 },
      { start_year: 1995, end_year: 2000 },
      { start_year: 2005, end_year: 2005 },
    ]);
  });

  it('should parse years from ISO date', () => {
    const result = parseYears('1999-12-31, 2000-01-01 до 2005-12-31');
    expect(result).toEqual([
      { start_year: 1999, end_year: 1999 },
      { start_year: 2000, end_year: 2005 },
    ]);
  });

  it('should parse years from local date', () => {
    const result = parseYears('31.12.1999, 01.01.2000-31.12.2005');
    expect(result).toEqual([
      { start_year: 1999, end_year: 1999 },
      { start_year: 2000, end_year: 2005 },
    ]);
  });

  it('should ignore invalid year formats', () => {
    const result = parseYears('abcd, 2001-xyz, 2010');
    expect(result).toEqual([
      { start_year: 2001, end_year: 2001 },
      { start_year: 2010, end_year: 2010 },
    ]);
  });

  it('should return empty array for empty input', () => {
    const result = parseYears('');
    expect(result).toEqual([]);
  });
});
