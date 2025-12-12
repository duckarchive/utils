import unescape from 'lodash/unescape.js';

export const parseDBParams = (str: string | null): Record<string, string> => {
  const result: Record<string, string> = {};

  str?.split(',').map((param) => {
    const [_key, _value] = param.split(':');
    const key = decodeURIComponent(_key?.trim() || '');
    const value = decodeURIComponent(_value?.trim() || '');
    result[key] = value;
  });

  return result;
};

export const stringifyDBParams = (
  data: Record<string, string | number | boolean>
): string => {
  return Object.entries(data)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}:${encodeURIComponent(value)}`
    )
    .join(',');
};

const latin2cyrillic = (str: string): string => {
  const charMap: Record<string, string> = {
    a: 'а',
    b: 'б',
    c: 'ц',
    d: 'д',
    e: 'е',
    f: 'ф',
    g: 'г',
    h: 'х',
    i: 'и',
    j: 'й',
    k: 'к',
    l: 'л',
    m: 'м',
    n: 'н',
    o: 'о',
    p: 'п',
    q: 'к',
    r: 'р',
    s: 'с',
    t: 'т',
    u: 'у',
    v: 'в',
    w: 'в',
    y: 'и',
    z: 'з',
  };

  return str
    .split('')
    .map((char) => (charMap[char.toLowerCase()] || char).toUpperCase())
    .join('');
};

const shortenSpecialTerms = (str: string): string => {
  return str
    .replace(/до(п|д)/i, 'д')
    .replace(/том/i, 'т')
    .replace(/част?и?н?а?/i, 'ч');
};

export const parseCode = (str: string, ignoreError?: boolean): string => {
  let result = '';
  const pure = latin2cyrillic(
    unescape(str)
      .replace(/&nbsp;/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/  /g, ' ')
      .replace(/^0+/, '')
      .trim()
  );
  if (/\d+\.$/.test(pure)) {
    // temporary solution for "10." in https://e-resource.tsdavo.gov.ua/fonds/8/
    result = pure.replace(/\./, 'н');
  } else if (pure.length > 12) {
    const [extracted] = pure.match(/([^А-ЯҐЄІЇ]{0,1}\d+)/gi) || [];
    result = extracted || pure.slice(0, 10);
  } else {
    result = pure.replace(/[^А-ЯҐЄІЇ0-9]/gi, '');
  }

  if (!result.length) {
    console.error('Empty code', str);
    if (!ignoreError) {
      throw new Error('Empty code');
    }
  }

  return shortenSpecialTerms(result).toUpperCase().trim();
};

export const parseTitle = (str?: string): string => {
  return unescape(str || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/  /g, ' ')
    .slice(0, 200)
    .trim();
};