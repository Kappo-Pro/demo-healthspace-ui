/**
 * FormPhoneInput
 *
 * Phone number input with automatic validation.
 * Extracted from Default.tsx phone validation pattern.
 *
 * @example
 * ```tsx
 * <Form.Item
 *   name="mobilePhone"
 *   label={t('form.phone.label')}
 *   rules={getPhoneRules({ required: true })}
 * >
 *   <FormPhoneInput placeholder={t('form.phone.placeholderWithDigits')} />
 * </Form.Item>
 * ```
 */

import { Input } from 'antd';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import type { FormPhoneInputProps } from './types';

export const FormPhoneInput: React.FC<FormPhoneInputProps> = ({
	countryCode: _countryCode = 'US',
	maxLength = 10,
	autoFormat: _autoFormat = false,
	placeholder,
	...inputProps
}) => {
	const { t } = useTypedTranslation();
	const defaultPlaceholder = t('form.phone.placeholder');

	return (
		<Input
			{...inputProps}
			type="tel"
			inputMode="numeric"
			maxLength={maxLength}
			placeholder={placeholder ?? defaultPlaceholder}
		/>
	);
};

FormPhoneInput.displayName = 'FormPhoneInput';

export default FormPhoneInput;
