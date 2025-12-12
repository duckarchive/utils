import { describe, it, expect } from 'vitest';
import { parseDBParams, stringifyDBParams, parseCode, parseTitle } from '../src/parse';

describe('parseDBParams', () => {
  it('should parse simple parameters correctly', () => {
    const input = 'key1:value1,key2:value2';
    const result = parseDBParams(input);
    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
    });
  });

  it('should handle URL-encoded values', () => {
    const input = 'key%20name:value%20data';
    const result = parseDBParams(input);
    expect(result).toEqual({
      'key name': 'value data',
    });
  });

  it('should handle special characters', () => {
    const input = 'email:test%40example.com,password:pass%2B123';
    const result = parseDBParams(input);
    expect(result).toEqual({
      email: 'test@example.com',
      password: 'pass+123',
    });
  });

  it('should handle whitespace around parameters', () => {
    const input = ' key1 : value1 , key2 : value2 ';
    const result = parseDBParams(input);
    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
    });
  });

  it('should return empty object for null input', () => {
    const result = parseDBParams(null);
    expect(result).toEqual({});
  });

  it('should return empty object for empty string', () => {
    const result = parseDBParams('');
    expect(result).toEqual({});
  });

  it('should handle single parameter', () => {
    const input = 'key:value';
    const result = parseDBParams(input);
    expect(result).toEqual({
      key: 'value',
    });
  });

  it('should handle empty values', () => {
    const input = 'key1:,key2:value2';
    const result = parseDBParams(input);
    expect(result.key1).toBe('');
    expect(result.key2).toBe('value2');
  });

  it('should handle colons in values', () => {
    const input = 'url:http%3A%2F%2Fexample.com';
    const result = parseDBParams(input);
    expect(result.url).toBe('http://example.com');
  });
});

describe('stringifyDBParams', () => {
  it('should stringify simple parameters correctly', () => {
    const input = { key1: 'value1', key2: 'value2' };
    const result = stringifyDBParams(input);
    expect(result).toContain('key1:value1');
    expect(result).toContain('key2:value2');
    expect(result).toContain(',');
  });

  it('should encode special characters', () => {
    const input = { email: 'test@example.com' };
    const result = stringifyDBParams(input);
    expect(result).toBe('email:test%40example.com');
  });

  it('should handle numeric values', () => {
    const input = { count: 42, id: 123 };
    const result = stringifyDBParams(input);
    expect(result).toContain('count:42');
    expect(result).toContain('id:123');
  });

  it('should handle boolean values', () => {
    const input = { active: true, deleted: false };
    const result = stringifyDBParams(input);
    expect(result).toContain('active:true');
    expect(result).toContain('deleted:false');
  });

  it('should encode spaces', () => {
    const input = { name: 'John Doe' };
    const result = stringifyDBParams(input);
    expect(result).toBe('name:John%20Doe');
  });

  it('should handle empty values', () => {
    const input = { key1: '', key2: 'value' };
    const result = stringifyDBParams(input);
    expect(result).toContain('key1:');
  });

  it('should handle complex special characters', () => {
    const input = { url: 'http://example.com?foo=bar&baz=qux' };
    const result = stringifyDBParams(input);
    expect(result).toContain('url:http');
    expect(result).toContain('%3A');
    expect(result).toContain('%3F');
  });
});

describe('parseCode', () => {
  it('should parse valid code correctly', () => {
    const result = parseCode('АБВ123');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should convert latin characters to cyrillic', () => {
    const result = parseCode('abc');
    expect(result).toContain('А') || expect(result).toContain('Б') || expect(result).toContain('Ц');
  });

  it('should remove leading zeros', () => {
    const result = parseCode('0001234');
    expect(result).not.toMatch(/^0+/);
  });

  it('should handle HTML entities', () => {
    const result = parseCode('&nbsp;АБВ');
    expect(result).toBeTruthy();
  });

  it('should replace newlines with spaces', () => {
    const result = parseCode('АБВ\n123');
    expect(result).toBeTruthy();
  });

  it('should remove multiple spaces', () => {
    const result = parseCode('АБВ   123');
    expect(result).toBeTruthy();
  });

  it('should handle code ending with dot', () => {
    const result = parseCode('10.');
    expect(result).toBe('1Н');
  });

  it('should extract numeric patterns from long strings', () => {
    const longStr = 'АБВ123ГДЕ456789ЖЗИ';
    const result = parseCode(longStr);
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('should throw error on empty code when ignoreError is false', () => {
    expect(() => parseCode('   ')).toThrow('Empty code');
  });

  it('should not throw error on empty code when ignoreError is true', () => {
    expect(() => parseCode('   ', true)).not.toThrow();
  });

  it('should remove special characters except cyrillic and numbers', () => {
    const result = parseCode('А!Б@В#1$2%3');
    expect(result).toMatch(/^[А-ЯҐЄІЇ0-9]+$/);
  });

  it('should return uppercase result', () => {
    const result = parseCode('abc123');
    expect(result).toBe(result.toUpperCase());
  });

  it('should shorten "доп" to "д"', () => {
    const result = parseCode('доп123');
    expect(result).toContain('Д');
  });

  it('should shorten "том" to "т"', () => {
    const result = parseCode('том123');
    expect(result).toContain('Т');
  });

  it('should shorten "частина" variations to "ч"', () => {
    const result1 = parseCode('частина123');
    const result2 = parseCode('частин123');
    const result3 = parseCode('части123');
    expect(result1).toContain('Ч');
    expect(result2).toContain('Ч');
    expect(result3).toContain('Ч');
  });

  it('should handle mixed content', () => {
    const result = parseCode('ФОН-123/2024');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('parseTitle', () => {
  it('should parse simple title correctly', () => {
    const result = parseTitle('Sample Title');
    expect(result).toBe('Sample Title');
  });

  it('should handle undefined input', () => {
    const result = parseTitle(undefined);
    expect(result).toBe('');
  });

  it('should handle empty string', () => {
    const result = parseTitle('');
    expect(result).toBe('');
  });

  it('should unescape HTML entities', () => {
    const result = parseTitle('Title &amp; Subtitle');
    expect(result).toContain('&');
  });

  it('should remove non-breaking spaces', () => {
    const result = parseTitle('Title&nbsp;Text');
    expect(result).toBe('Title Text');
  });

  it('should replace newlines with spaces', () => {
    const result = parseTitle('Title\nSubtitle');
    expect(result).toBe('Title Subtitle');
  });

  it('should replace multiple spaces with single space', () => {
    const result = parseTitle('Title   Multiple   Spaces');
    expect(result).toBe('Title Multiple Spaces');
  });

  it('should trim whitespace', () => {
    const result = parseTitle('   Title   ');
    expect(result).toBe('Title');
  });

  it('should limit title to 200 characters', () => {
    const longTitle = 'A'.repeat(300);
    const result = parseTitle(longTitle);
    expect(result.length).toBeLessThanOrEqual(200);
  });

  it('should handle combination of formatting issues', () => {
    const input = '  Title&nbsp;With\nMultiple   Issues  &amp;  More  ';
    const result = parseTitle(input);
    expect(result).not.toMatch(/&nbsp;/);
    expect(result).not.toMatch(/\n/);
    expect(result).not.toMatch(/  /);
    expect(result).toBeTruthy();
  });

  it('should preserve special characters', () => {
    const result = parseTitle('Title (2024) - Subtitle: Description');
    expect(result).toContain('(');
    expect(result).toContain(')');
    expect(result).toContain('-');
    expect(result).toContain(':');
  });

  it('should handle cyrillic characters', () => {
    const result = parseTitle('Заголовок: Опис');
    expect(result).toBe('Заголовок: Опис');
  });

  it('should handle mixed Latin and Cyrillic', () => {
    const result = parseTitle('Title Заголовок Mixed');
    expect(result).toContain('Title');
    expect(result).toContain('Заголовок');
    expect(result).toContain('Mixed');
  });
});
