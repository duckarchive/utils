import uniqBy from 'lodash/uniqBy.js';
import unescape from 'lodash/unescape.js';

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
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^\s*0+(\d)/g, '$1')
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
    .replace(/\s{2,}/g, ' ')
    .trim();
};

// const parseYears = (yearsStr?: string) => {
//   if (!yearsStr) return [];
// const ranges: { start_year: number; end_year: number }[] = [];
// const parts = yearsStr.split(/,|;/);

// parts.forEach((part) => {
//     const trimmed = part.trim();
//     // Match "1800-1805" or "1800–1805"
//     const matchRange = trimmed.match(/(\d{4})\s*[-–]\s*(\d{4})/);
//     // Match "1800"
//     const matchSingle = trimmed.match(/(\d{4})/);

//     if (matchRange) {
//       ranges.push({
//         start_year: parseInt(matchRange[1], 10),
//         end_year: parseInt(matchRange[2], 10),
//       });
//     } else if (matchSingle) {
//       const y = parseInt(matchSingle[1], 10);
//       ranges.push({
//         start_year: y,
//         end_year: y,
//       });
//     }
//   });

//   return ranges;
// };

interface YearRange {
  start_year: number;
  end_year: number;
}

export const parseYears = (str: string): YearRange[] => {
  if (!str) {
    return [];
  }

  const parts = str
    .replace(/—–-/g, '-')
    .split(/,|;/)
    .map((p) => p.trim());

  const ranges = parts.map((part) => {
    // Case 1: Range of years (e.g., "1941-1945", "1941 - 1945")
    const rangeMatch = part.match(/^(\d{4})\s*-\s*(\d{4})$/);
    if (rangeMatch) {
      return {
        start_year: parseInt(rangeMatch[1], 10),
        end_year: parseInt(rangeMatch[2], 10),
      };
    }

    // Case 2: Single year (e.g., "1941")
    const singleYearMatch = part.match(/^(\d{4})$/);
    if (singleYearMatch) {
      const year = parseInt(singleYearMatch[1], 10);
      return { start_year: year, end_year: year };
    }

    // If no specific format is matched, try to find all 4-digit numbers and take min/max
    const allYears = (part.match(/\d{4}/g) || []).map((y) => parseInt(y, 10));
    if (allYears.length > 0) {
      const validYears = allYears.filter((y) => y > 1000 && y < 3000);
      if (validYears.length > 0) {
        return {
          start_year: Math.min(...validYears),
          end_year: Math.max(...validYears),
        };
      }
    }
  });

  return uniqBy(
    ranges.filter(Boolean) as YearRange[],
    (range) => `${range.start_year}-${range.end_year}`
  );
};
