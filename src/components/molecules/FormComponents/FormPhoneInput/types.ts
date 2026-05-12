/**
 * FormPhoneInput Types
 * Phone number input with automatic validation
 */

import type { InputProps } from 'antd';

export interface FormPhoneInputProps extends Omit<InputProps, 'type'> {
	// Phone-specific
	countryCode?: string;
	maxLength?: number;
	autoFormat?: boolean;

	// Validation
	required?: boolean;
	customValidation?: (value: string) => boolean | string;
}

export interface PhoneValidationResult {
	valid: boolean;
	message?: string;
}
