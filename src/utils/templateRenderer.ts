/**
 * Template Renderer Utility
 *
 * Story 3.4: Add Template Preview Functionality
 *
 * Replaces template variables with sample data for preview purposes
 */

/**
 * Sample data for template variable replacement
 */
export interface SampleData {
  userName: string;
  name: string; // Alias for userName
  clientName: string;
  inviteCode?: string;
  link?: string;
  assessmentUrl?: string;
  resultLink?: string;
  resultSummary?: string;
  assessmentType?: string;
  clinicName?: string;
  patientName?: string;
  date?: string;
}

/**
 * Default sample data used for template previews
 */
export const SAMPLE_DATA: SampleData = {
  userName: 'John Doe',
  name: 'John Doe',
  clientName: 'VitalFlow',
  inviteCode: 'ABC123',
  link: 'https://vitalflow.ai/invite/ABC123',
  assessmentUrl: 'https://vitalflow.ai/assessments/123',
  resultLink: 'https://vitalflow.ai/results/123',
  resultSummary: 'Your assessment shows excellent progress.',
  assessmentType: 'ROM Assessment',
  clinicName: 'VitalFlow Physical Therapy',
  patientName: 'John Doe',
  date: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
};

/**
 * Replaces template variables ({{variableName}}) with sample data
 *
 * @param template - Template string containing {{variableName}} placeholders
 * @param data - Sample data object (defaults to SAMPLE_DATA)
 * @returns Template string with variables replaced
 *
 * @example
 * ```typescript
 * const template = "Hi {{userName}}, your code is {{inviteCode}}";
 * const result = replaceVariables(template);
 * // Returns: "Hi John Doe, your code is ABC123"
 * ```
 */
export const replaceVariables = (
  template: string,
  data: SampleData = SAMPLE_DATA
): string => {
  if (!template) return '';

  return template.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    // Check if variable exists in data
    if (variableName in data) {
      const value = data[variableName as keyof SampleData];
      return value !== undefined && value !== null ? String(value) : match;
    }

    // If variable not found, keep placeholder visible
    return match;
  });
};

/**
 * Extracts all variable names from a template
 *
 * @param template - Template string containing {{variableName}} placeholders
 * @returns Array of unique variable names found in template
 *
 * @example
 * ```typescript
 * const template = "Hi {{userName}}, your code is {{inviteCode}}";
 * const variables = extractVariables(template);
 * // Returns: ['userName', 'inviteCode']
 * ```
 */
export const extractVariables = (template: string): string[] => {
  if (!template) return [];

  const matches = template.matchAll(/\{\{(\w+)\}\}/g);
  const variables = new Set<string>();

  for (const match of matches) {
    if (match[1]) {
      variables.add(match[1]);
    }
  }

  return Array.from(variables);
};
