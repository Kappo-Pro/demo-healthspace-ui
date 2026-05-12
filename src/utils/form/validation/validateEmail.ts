/**
 * Email Validation Utility
 * Standard email validation with domain typo detection
 */

import type { Rule } from 'antd/es/form';

export interface EmailValidationOptions {
	required?: boolean;
	message?: string;
	checkDomain?: boolean;
	allowedDomains?: string[];
}

export interface EmailValidationResult {
	valid: boolean;
	message?: string;
	suggestion?: string;
}

const COMMON_DOMAINS = [
	'gmail.com',
	'yahoo.com',
	'hotmail.com',
	'outlook.com',
	'icloud.com',
];

const COMMON_TYPOS: Record<string, string> = {
	'gmial.com': 'gmail.com',
	'gmai.com': 'gmail.com',
	'yahooo.com': 'yahoo.com',
	'yaho.com': 'yahoo.com',
	'hotmial.com': 'hotmail.com',
};

/**
 * Validates an email address
 */
export function validateEmail(
	value: string,
	options: EmailValidationOptions = {}
): EmailValidationResult {
	const { required = false, checkDomain = true, allowedDomains } = options;

	// Check if empty and required
	if (!value || value.trim() === '') {
		if (required) {
			return {
				valid: false,
				message: 'Email is required',
			};
		}
		return { valid: true };
	}

	// Basic email format validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(value)) {
		return {
			valid: false,
			message: 'Invalid email format',
		};
	}

	// Extract domain
	const domain = value.split('@')[1]?.toLowerCase();

	// Check allowed domains
	if (allowedDomains && allowedDomains.length > 0) {
		if (!allowedDomains.includes(domain)) {
			return {
				valid: false,
				message: `Email must be from: ${allowedDomains.join(', ')}`,
			};
		}
	}

	// Check for typos
	if (checkDomain && COMMON_TYPOS[domain]) {
		return {
			valid: false,
			message: `Did you mean ${value.split('@')[0]}@${COMMON_TYPOS[domain]}?`,
			suggestion: `${value.split('@')[0]}@${COMMON_TYPOS[domain]}`,
		};
	}

	return { valid: true };
}

/**
 * Returns Ant Design Form rules for email validation
 *
 * @example
 * ```tsx
 * <Form.Item
 *   name="email"
 *   rules={getEmailRules({ required: true })}
 * >
 *   <Input type="email" />
 * </Form.Item>
 * ```
 */
export function getEmailRules(
	options: EmailValidationOptions = {}
): Rule[] {
	const { required = false, message = 'Invalid email address' } = options;

	const rules: Rule[] = [];

	if (required) {
		rules.push({
			required: true,
			message: 'Email is required',
		});
	}

	rules.push({
		type: 'email',
		message,
	});

	return rules;
}

export default {
	validateEmail,
	getEmailRules,
	COMMON_DOMAINS,
};
