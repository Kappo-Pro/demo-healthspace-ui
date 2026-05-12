/**
 * Template Renderer Utility Tests
 *
 * Story 3.4: Add Template Preview Functionality
 * AC: 3 - Template variables replaced with sample data
 * AC: 8 - Unit tests written with 80%+ coverage
 */

import { replaceVariables, extractVariables, SAMPLE_DATA } from '../templateRenderer';

describe('templateRenderer', () => {
  describe('replaceVariables', () => {
    it('should replace single variable with sample data', () => {
      const template = 'Hello {{userName}}';
      const result = replaceVariables(template);

      expect(result).toBe('Hello John Doe');
    });

    it('should replace multiple variables', () => {
      const template = '{{userName}} at {{clientName}} with code {{inviteCode}}';
      const result = replaceVariables(template);

      expect(result).toBe('John Doe at VitalFlow with code ABC123');
    });

    it('should replace all known variables from SAMPLE_DATA', () => {
      const template =
        '{{userName}} {{clientName}} {{inviteCode}} {{assessmentUrl}} {{resultSummary}}';
      const result = replaceVariables(template);

      expect(result).toContain('John Doe');
      expect(result).toContain('VitalFlow');
      expect(result).toContain('ABC123');
      expect(result).toContain('https://vitalflow.ai/assessments/123');
      expect(result).toContain('excellent progress');
    });

    it('should preserve unknown variables', () => {
      const template = 'Known: {{userName}}, Unknown: {{unknownVar}}';
      const result = replaceVariables(template);

      expect(result).toBe('Known: John Doe, Unknown: {{unknownVar}}');
    });

    it('should handle empty template', () => {
      const result = replaceVariables('');

      expect(result).toBe('');
    });

    it('should handle template with no variables', () => {
      const template = 'Plain text with no variables';
      const result = replaceVariables(template);

      expect(result).toBe('Plain text with no variables');
    });

    it('should handle custom sample data', () => {
      const template = 'Hello {{userName}}';
      const customData = {
        userName: 'Jane Smith',
        name: 'Jane Smith',
        clientName: 'Custom Corp',
      };

      const result = replaceVariables(template, customData);

      expect(result).toBe('Hello Jane Smith');
    });

    it('should handle variable with undefined value', () => {
      const template = 'Value: {{inviteCode}}';
      const customData = {
        userName: 'Test',
        name: 'Test',
        clientName: 'Test',
        inviteCode: undefined,
      };

      const result = replaceVariables(template, customData);

      // Should preserve placeholder when value is undefined
      expect(result).toBe('Value: {{inviteCode}}');
    });

    it('should handle variable with null value', () => {
      const template = 'Value: {{inviteCode}}';
      const customData = {
        userName: 'Test',
        name: 'Test',
        clientName: 'Test',
        inviteCode: null,
      };

      const result = replaceVariables(template, customData);

      // Should preserve placeholder when value is null
      expect(result).toBe('Value: {{inviteCode}}');
    });

    it('should handle repeated variables', () => {
      const template = '{{userName}} says hello to {{userName}}';
      const result = replaceVariables(template);

      expect(result).toBe('John Doe says hello to John Doe');
    });

    it('should handle variables in different formats', () => {
      const template = '{{userName}} and {{name}} should both work';
      const result = replaceVariables(template);

      // Both userName and name map to 'John Doe'
      expect(result).toBe('John Doe and John Doe should both work');
    });

    it('should handle HTML content with variables', () => {
      const template = '<p>Hello {{userName}}</p><strong>{{clientName}}</strong>';
      const result = replaceVariables(template);

      expect(result).toBe('<p>Hello John Doe</p><strong>VitalFlow</strong>');
    });

    it('should handle variables with numbers', () => {
      const template = 'User {{userName}} has {{inviteCode}}';
      const result = replaceVariables(template);

      expect(result).toBe('User John Doe has ABC123');
    });

    it('should handle date variable', () => {
      const template = 'Today is {{date}}';
      const result = replaceVariables(template);

      expect(result).toContain('Today is');
      expect(result).not.toBe('Today is {{date}}');
    });

    it('should handle special characters in template', () => {
      const template = 'Email: {{userName}} <test@example.com>';
      const result = replaceVariables(template);

      expect(result).toBe('Email: John Doe <test@example.com>');
    });

    it('should not replace malformed variable syntax', () => {
      const template = '{userName} or {{{userName}}} or userName';
      const result = replaceVariables(template);

      // Only {{userName}} should be replaced (the middle one in {{{userName}}})
      // {{{userName}}} → {John Doe} (outer braces remain)
      expect(result).toBe('{userName} or {John Doe} or userName');
    });

    it('should handle variable at start of string', () => {
      const template = '{{userName}} is the user';
      const result = replaceVariables(template);

      expect(result).toBe('John Doe is the user');
    });

    it('should handle variable at end of string', () => {
      const template = 'The user is {{userName}}';
      const result = replaceVariables(template);

      expect(result).toBe('The user is John Doe');
    });

    it('should handle only variable in string', () => {
      const template = '{{userName}}';
      const result = replaceVariables(template);

      expect(result).toBe('John Doe');
    });
  });

  describe('extractVariables', () => {
    it('should extract single variable', () => {
      const template = 'Hello {{userName}}';
      const variables = extractVariables(template);

      expect(variables).toEqual(['userName']);
    });

    it('should extract multiple variables', () => {
      const template = '{{userName}} at {{clientName}} with {{inviteCode}}';
      const variables = extractVariables(template);

      expect(variables).toEqual(['userName', 'clientName', 'inviteCode']);
    });

    it('should extract unique variables only', () => {
      const template = '{{userName}} says hello to {{userName}} and {{clientName}}';
      const variables = extractVariables(template);

      expect(variables).toEqual(['userName', 'clientName']);
    });

    it('should return empty array for template with no variables', () => {
      const template = 'Plain text with no variables';
      const variables = extractVariables(template);

      expect(variables).toEqual([]);
    });

    it('should return empty array for empty template', () => {
      const variables = extractVariables('');

      expect(variables).toEqual([]);
    });

    it('should not extract malformed variables', () => {
      const template = '{userName} {{{userName}}} {{validVar}}';
      const variables = extractVariables(template);

      expect(variables).toEqual(['userName', 'validVar']);
    });

    it('should extract variables from HTML content', () => {
      const template = '<p>{{userName}}</p><a href="{{link}}">Click</a>';
      const variables = extractVariables(template);

      expect(variables).toEqual(['userName', 'link']);
    });

    it('should extract variables with underscores and numbers', () => {
      const template = '{{user_name}} {{var123}} {{test_var_2}}';
      const variables = extractVariables(template);

      expect(variables).toEqual(['user_name', 'var123', 'test_var_2']);
    });
  });

  describe('SAMPLE_DATA', () => {
    it('should have all expected fields', () => {
      expect(SAMPLE_DATA).toHaveProperty('userName');
      expect(SAMPLE_DATA).toHaveProperty('name');
      expect(SAMPLE_DATA).toHaveProperty('clientName');
      expect(SAMPLE_DATA).toHaveProperty('inviteCode');
      expect(SAMPLE_DATA).toHaveProperty('link');
      expect(SAMPLE_DATA).toHaveProperty('assessmentUrl');
      expect(SAMPLE_DATA).toHaveProperty('resultLink');
      expect(SAMPLE_DATA).toHaveProperty('resultSummary');
      expect(SAMPLE_DATA).toHaveProperty('assessmentType');
      expect(SAMPLE_DATA).toHaveProperty('clinicName');
      expect(SAMPLE_DATA).toHaveProperty('patientName');
      expect(SAMPLE_DATA).toHaveProperty('date');
    });

    it('should have valid sample values', () => {
      expect(SAMPLE_DATA.userName).toBe('John Doe');
      expect(SAMPLE_DATA.clientName).toBe('VitalFlow');
      expect(SAMPLE_DATA.inviteCode).toBe('ABC123');
      expect(SAMPLE_DATA.assessmentUrl).toContain('vitalflow.ai');
      expect(typeof SAMPLE_DATA.date).toBe('string');
      expect(SAMPLE_DATA.date).toBeTruthy();
    });

    it('should have userName and name as aliases', () => {
      expect(SAMPLE_DATA.userName).toBe(SAMPLE_DATA.name);
    });

    it('should have patientName equal to userName', () => {
      expect(SAMPLE_DATA.patientName).toBe(SAMPLE_DATA.userName);
    });
  });
});
