/**
 * Phone Validation Utility
 * Extracted from Default.tsx and ResetPasswordModal.tsx patterns
 */

import type { Rule } from 'antd/es/form';

export interface PhoneValidationOptions {
	required?: boolean;
	message?: string;
	minLength?: number;
	maxLength?: number;
	countryCode?: string;
}

export interface PhoneValidationResult {
	valid: boolean;
	message?: string;
}

/**
 * Validates a phone number (US format: 10 digits)
 */
export function validatePhone(
	value: string,
	options: PhoneValidationOptions = {}
): PhoneValidationResult {
	const {
		required = false,
		minLength = 10,
		maxLength = 10,
		countryCode = 'US',
	} = options;

	// Check if empty and required
	if (!value || value.trim() === '') {
		if (required) {
			return {
				valid: false,
				message: 'Phone number is required',
			};
		}
		return { valid: true };
	}

	// Remove non-numeric characters
	const cleaned = value.replace(/\D/g, '');

	// US phone validation (10 digits)
	if (countryCode === 'US') {
		if (cleaned.length < minLength || cleaned.length > maxLength) {
			return {
				valid: false,
				message: `Mobile number must be exactly ${maxLength} digits`,
			};
		}

		// Check if all digits
		if (!/^[0-9]+$/.test(cleaned)) {
			return {
				valid: false,
				message: 'Phone number must contain only digits',
			};
		}
	}

	return { valid: true };
}

/**
 * Returns Ant Design Form rules for phone validation
 *
 * @example
 * ```tsx
 * <Form.Item
 *   name="mobilePhone"
 *   rules={getPhoneRules({ required: true })}
 * >
 *   <Input type="number" />
 * </Form.Item>
 * ```
 */
export function getPhoneRules(
	options: PhoneValidationOptions = {}
): Rule[] {
	const {
		required = false,
		message = 'Mobile number must be exactly 10 digits',
		maxLength = 10,
	} = options;

	const rules: Rule[] = [];

	if (required) {
		rules.push({
			required: true,
			message: 'Phone number is required',
		});
	}

	rules.push({
		pattern: new RegExp(`^[0-9]{${maxLength}}$`),
		message,
		validateTrigger: 'onBlur',
	});

	return rules;
}

/**
 * Formats phone number for display
 * (555) 123-4567
 */
export function formatPhone(value: string): string {
	const cleaned = value.replace(/\D/g, '');

	if (cleaned.length === 10) {
		return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
	}

	return value;
}

export default {
	validatePhone,
	getPhoneRules,
	formatPhone,
};
