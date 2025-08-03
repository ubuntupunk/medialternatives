import { decodeHtmlEntities } from '../helpers';

describe('decodeHtmlEntities', () => {
  test('should decode common HTML entities', () => {
    expect(decodeHtmlEntities('&amp;')).toBe('&');
    expect(decodeHtmlEntities('&lt;')).toBe('<');
    expect(decodeHtmlEntities('&gt;')).toBe('>');
    expect(decodeHtmlEntities('&quot;')).toBe('"');
    expect(decodeHtmlEntities('&#039;')).toBe("'");
    expect(decodeHtmlEntities('&nbsp;')).toBe(' ');
  });

  test('should decode WordPress-specific entities', () => {
    expect(decodeHtmlEntities('&#8217;')).toBe('\u2019'); // Right single quotation mark
    expect(decodeHtmlEntities('&#8216;')).toBe('\u2018'); // Left single quotation mark
    expect(decodeHtmlEntities('&#8220;')).toBe('\u201C'); // Left double quotation mark
    expect(decodeHtmlEntities('&#8221;')).toBe('\u201D'); // Right double quotation mark
    expect(decodeHtmlEntities('&#8211;')).toBe('–'); // En dash
    expect(decodeHtmlEntities('&#8212;')).toBe('—'); // Em dash
    expect(decodeHtmlEntities('&#8230;')).toBe('…'); // Horizontal ellipsis
  });

  test('should decode named entities', () => {
    expect(decodeHtmlEntities('&hellip;')).toBe('…');
    expect(decodeHtmlEntities('&mdash;')).toBe('—');
    expect(decodeHtmlEntities('&ndash;')).toBe('–');
    expect(decodeHtmlEntities('&rsquo;')).toBe('\u2019');
    expect(decodeHtmlEntities('&lsquo;')).toBe('\u2018');
    expect(decodeHtmlEntities('&rdquo;')).toBe('\u201D');
    expect(decodeHtmlEntities('&ldquo;')).toBe('\u201C');
  });

  test('should handle real WordPress post titles', () => {
    expect(decodeHtmlEntities('Don&#8217;t Stop Believing')).toBe('Don\u2019t Stop Believing');
    expect(decodeHtmlEntities('The&nbsp;Ultimate&nbsp;Guide')).toBe('The Ultimate Guide');
    expect(decodeHtmlEntities('&#8220;Hello World&#8221;')).toBe('\u201CHello World\u201D');
    expect(decodeHtmlEntities('News &#8211; Updates &#8212; More')).toBe('News – Updates — More');
  });

  test('should handle mixed entities', () => {
    expect(decodeHtmlEntities('A &amp; B &#8217;s Guide to C&nbsp;&amp;&nbsp;D')).toBe('A & B \u2019s Guide to C & D');
  });

  test('should handle empty or null input', () => {
    expect(decodeHtmlEntities('')).toBe('');
    expect(decodeHtmlEntities(null as any)).toBe('');
    expect(decodeHtmlEntities(undefined as any)).toBe('');
  });

  test('should handle text without entities', () => {
    expect(decodeHtmlEntities('Hello World')).toBe('Hello World');
    expect(decodeHtmlEntities('Simple text')).toBe('Simple text');
  });

  test('should decode numeric entities', () => {
    expect(decodeHtmlEntities('&#65;')).toBe('A'); // Decimal
    expect(decodeHtmlEntities('&#x41;')).toBe('A'); // Hexadecimal
    expect(decodeHtmlEntities('&#169;')).toBe('©'); // Copyright symbol
  });
});