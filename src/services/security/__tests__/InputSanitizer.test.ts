/**
 * InputSanitizer Tests
 * Story 6.1: XSS Attack Pattern Tests
 *
 * Tests protection against common XSS attack vectors:
 * - Script tag injection
 * - Event handler injection
 * - JavaScript protocol in links
 * - Nested/obfuscated attacks
 * - Safe HTML preservation
 */

import { InputSanitizer } from '../InputSanitizer';
import type { PresetCommand, UserAction } from '@atoms/CommandPalette/types';

describe('InputSanitizer', () => {
  describe('Script Tag Removal (AC 5)', () => {
    it('removes script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = InputSanitizer.sanitize(input);
      expect(result).toBe('Hello');
      expect(result).not.toContain('<script>');
    });

    it('removes script src tags', () => {
      const input = '<script src="evil.js"></script>Safe Text';
      const result = InputSanitizer.sanitize(input);
      expect(result).toBe('Safe Text');
    });

    it('handles nested script tags', () => {
      const input = '<scr<script>ipt>alert("xss")</scr</script>ipt>';
      const result = InputSanitizer.sanitize(input);
      expect(result).not.toContain('script');
    });

    it('preserves text inside removed tags (KEEP_CONTENT)', () => {
      const input = '<div>Some Text</div>';
      const result = InputSanitizer.sanitize(input);
      // div is not in allowed tags, but KEEP_CONTENT preserves the text
      expect(result).toBe('Some Text');
    });
  });

  describe('Event Handler Removal (AC 5)', () => {
    it('removes onclick handler', () => {
      const input = '<div onclick="alert(\'xss\')">Click</div>';
      const result = InputSanitizer.sanitize(input);
      expect(result).not.toContain('onclick');
      expect(result).toContain('Click');
    });

    it('removes onerror handler', () => {
      const input = '<img src="x" onerror="alert(\'xss\')">';
      const result = InputSanitizer.sanitize(input);
      expect(result).not.toContain('onerror');
    });

    it('removes onload handler', () => {
      const input = '<body onload="alert(\'xss\')">Content</body>';
      const result = InputSanitizer.sanitize(input);
      expect(result).not.toContain('onload');
    });

    it('removes onmouseover handler', () => {
      const input = '<span onmouseover="alert(\'xss\')">Hover</span>';
      const result = InputSanitizer.sanitize(input);
      expect(result).not.toContain('onmouseover');
    });
  });

  describe('JavaScript Protocol Removal (AC 5)', () => {
    it('removes javascript: protocol in links', () => {
      const input = '<a href="javascript:alert(\'xss\')">Link</a>';
      const result = InputSanitizer.sanitize(input);
      expect(result).not.toContain('javascript:');
      expect(result).toContain('Link');
    });

    it('handles case-insensitive javascript protocol', () => {
      const input = '<a href="JaVaScRiPt:alert(\'xss\')">Link</a>';
      const result = InputSanitizer.sanitize(input);
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('JaVaScRiPt:');
    });
  });

  describe('Safe HTML Preservation (AC 6)', () => {
    it('allows bold tags', () => {
      const input = '<b>Bold Text</b>';
      const result = InputSanitizer.sanitize(input);
      expect(result).toBe('<b>Bold Text</b>');
    });

    it('allows italic tags', () => {
      const input = '<i>Italic Text</i>';
      const result = InputSanitizer.sanitize(input);
      expect(result).toBe('<i>Italic Text</i>');
    });

    it('allows em tags', () => {
      const input = '<em>Emphasized</em>';
      const result = InputSanitizer.sanitize(input);
      expect(result).toBe('<em>Emphasized</em>');
    });

    it('allows strong tags', () => {
      const input = '<strong>Strong</strong>';
      const result = InputSanitizer.sanitize(input);
      expect(result).toBe('<strong>Strong</strong>');
    });

    it('allows safe links with https', () => {
      const input = '<a href="https://safe.com">Link</a>';
      const result = InputSanitizer.sanitize(input);
      expect(result).toContain('<a href="https://safe.com">');
    });

    it('allows safe links with http', () => {
      const input = '<a href="http://safe.com">Link</a>';
      const result = InputSanitizer.sanitize(input);
      expect(result).toContain('<a href="http://safe.com">');
    });
  });

  describe('Dangerous Tag Removal (AC 5)', () => {
    it('removes iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>Text';
      const result = InputSanitizer.sanitize(input);
      expect(result).not.toContain('iframe');
      expect(result).toContain('Text');
    });

    it('removes object tags', () => {
      const input = '<object data="evil.swf"></object>Text';
      const result = InputSanitizer.sanitize(input);
      expect(result).not.toContain('object');
    });

    it('removes embed tags', () => {
      const input = '<embed src="evil.swf">Text';
      const result = InputSanitizer.sanitize(input);
      expect(result).not.toContain('embed');
    });
  });

  describe('Edge Cases (AC 8)', () => {
    it('handles empty string', () => {
      const result = InputSanitizer.sanitize('');
      expect(result).toBe('');
    });

    it('handles non-string input', () => {
      const result = InputSanitizer.sanitize(null as unknown as string);
      expect(result).toBe('');
    });

    it('handles undefined input', () => {
      const result = InputSanitizer.sanitize(undefined as unknown as string);
      expect(result).toBe('');
    });

    it('handles plain text without HTML', () => {
      const input = 'Plain text without HTML';
      const result = InputSanitizer.sanitize(input);
      expect(result).toBe(input);
    });
  });

  describe('sanitizeCommand (AC 9)', () => {
    it('sanitizes all command fields', () => {
      const command: PresetCommand = {
        id: 'test',
        label: '<script>alert("xss")</script>Dashboard',
        description: '<img src=x onerror="alert(\'xss\')">Go to dashboard',
        category: 'navigation',
        keywords: ['<script>xss</script>dash', 'board'],
        handler: jest.fn(),
      };

      const sanitized = InputSanitizer.sanitizeCommand(command);

      expect(sanitized.label).toBe('Dashboard');
      expect(sanitized.description).not.toContain('onerror');
      expect(sanitized.description).toContain('Go to dashboard');
      expect(sanitized.keywords).toEqual(['dash', 'board']);
      expect(sanitized.id).toBe('test');
      expect(sanitized.handler).toBe(command.handler);
    });

    it('handles command without description', () => {
      const command: PresetCommand = {
        id: 'test',
        label: '<b>Bold</b> Label',
        category: 'navigation',
        handler: jest.fn(),
      };

      const sanitized = InputSanitizer.sanitizeCommand(command);

      expect(sanitized.label).toBe('<b>Bold</b> Label');
      expect(sanitized.description).toBeUndefined();
    });

    it('handles command without keywords', () => {
      const command: PresetCommand = {
        id: 'test',
        label: 'Label',
        category: 'navigation',
        handler: jest.fn(),
      };

      const sanitized = InputSanitizer.sanitizeCommand(command);

      expect(sanitized.label).toBe('Label');
      expect(sanitized.keywords).toBeUndefined();
    });
  });

  describe('sanitizeCommands (batch)', () => {
    it('sanitizes array of commands', () => {
      const commands: PresetCommand[] = [
        {
          id: '1',
          label: '<script>xss</script>First',
          category: 'navigation',
          handler: jest.fn(),
        },
        {
          id: '2',
          label: '<b>Second</b>',
          category: 'action',
          handler: jest.fn(),
        },
      ];

      const sanitized = InputSanitizer.sanitizeCommands(commands);

      expect(sanitized[0].label).toBe('First');
      expect(sanitized[1].label).toBe('<b>Second</b>');
      expect(sanitized.length).toBe(2);
    });
  });

  describe('sanitizeAction (AC 9)', () => {
    it('sanitizes user action fields', () => {
      const action: UserAction = {
        id: 'test-action',
        label: '<script>alert("xss")</script>Assign Admin',
        description: '<img src=x onerror="alert(\'xss\')">Assign admin role',
        icon: null,
        category: 'manage',
        requiredRole: ['SUPER_ADMIN'],
        handler: jest.fn(),
      };

      const sanitized = InputSanitizer.sanitizeAction(action);

      expect(sanitized.label).toBe('Assign Admin');
      expect(sanitized.description).not.toContain('onerror');
      expect(sanitized.description).toContain('Assign admin role');
    });
  });

  describe('sanitizeActions (batch)', () => {
    it('sanitizes array of actions', () => {
      const actions: UserAction[] = [
        {
          id: '1',
          label: '<script>xss</script>Action 1',
          description: 'Description 1',
          icon: null,
          category: 'manage',
          requiredRole: ['ADMIN'],
          handler: jest.fn(),
        },
        {
          id: '2',
          label: '<b>Action 2</b>',
          description: 'Description 2',
          icon: null,
          category: 'security',
          requiredRole: ['SUPER_ADMIN'],
          handler: jest.fn(),
        },
      ];

      const sanitized = InputSanitizer.sanitizeActions(actions);

      expect(sanitized[0].label).toBe('Action 1');
      expect(sanitized[1].label).toBe('<b>Action 2</b>');
      expect(sanitized.length).toBe(2);
    });
  });

  describe('Complex XSS Attacks', () => {
    it('handles multiple attack vectors in one string', () => {
      const input =
        '<script>alert("xss")</script><img src=x onerror="alert(\'xss\')"><a href="javascript:alert(\'xss\')">Link</a>';
      const result = InputSanitizer.sanitize(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('javascript:');
      expect(result).toContain('Link');
    });

    it('preserves safe content mixed with attacks', () => {
      const input =
        '<b>Bold</b><script>alert("xss")</script><i>Italic</i>';
      const result = InputSanitizer.sanitize(input);
      expect(result).toContain('<b>Bold</b>');
      expect(result).toContain('<i>Italic</i>');
      expect(result).not.toContain('<script>');
    });
  });
});
