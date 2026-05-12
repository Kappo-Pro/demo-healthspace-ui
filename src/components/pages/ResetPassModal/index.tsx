import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { updateUserPassword } from '@stores/shared/user';
import { Button, Checkbox, Flex, Form, Input, Modal, message } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IResetPasswordModalProps {
	open: boolean;
	onClose: () => void;
	userId: string;
}

interface IResetPasswordFormData {
	newPassword: string;
	confirmPassword: string;
	forceChangePassword: boolean;
}

const ResetPasswordModal = ({
	open,
	onClose,
	userId,
}: IResetPasswordModalProps) => {
	const { t } = useTranslation();
	const { user } = useTypedSelector(state => ({
		user: state.user,
	}));
	const [loading, setLoading] = useState(false);
	const dispatch = useTypedDispatch();
	const onFinish = async (data: IResetPasswordFormData) => {
		if (data.newPassword !== data.confirmPassword) {
			message.error(
				t('Admin.data.menu.userRoles.registeredPatients.passwordMismatch'),
			);
			return;
		}
		setLoading(true);
		await dispatch(
			updateUserPassword({
				userId: userId,
				data: {
					password: data.newPassword,
					confirmPassword: data.confirmPassword,
					forceChangePassword: data?.forceChangePassword || false,
				},
			}),
		);
		setLoading(false);
		onClose();
	};
	return (
		<Modal
			title={
				<div style={{ textAlign: 'center', width: '100%' }}>
					{t('Admin.data.menu.userRoles.resetPassword')}
				</div>
			}
			open={open}
			onCancel={onClose}
			footer={null}>
			<Form layout="vertical" onFinish={onFinish}>
				<Form.Item
					label={t('Admin.data.menu.userRoles.registeredPatients.newPassword')}
					name="newPassword"
					rules={[
						{
							required: true,
							message: t(
								'Admin.data.menu.userRoles.registeredPatients.notEmptyPasswordRule',
							),
						},
						{
							min: 8,
							message: t(
								'Admin.data.menu.userRoles.registeredPatients.minimumPasswordLengthRule',
							),
						},
					]}>
					<Input.Password
						className="input-item"
						placeholder={t(
							'Admin.data.menu.userRoles.registeredPatients.enterNewPassword',
						)}
					/>
				</Form.Item>
				<Form.Item
					label={t(
						'Admin.data.menu.userRoles.registeredPatients.confirmPassword',
					)}
					name="confirmPassword"
					dependencies={['newPassword']}
					rules={[
						{
							required: true,
							message: t(
								'Admin.data.menu.userRoles.registeredPatients.confirmPasswordRule',
							),
						},
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue('newPassword') === value) {
									return Promise.resolve();
								}
								return Promise.reject(
									new Error(
										t(
											'Admin.data.menu.userRoles.registeredPatients.passwordMismatch',
										),
									),
								);
							},
						}),
					]}>
					<Input.Password
						className="input-item"
						placeholder={t(
							'Admin.data.menu.userRoles.registeredPatients.confirmNewPassword',
						)}
					/>
				</Form.Item>
				{user?.isPhysioterapist && (
					<Form.Item name="forceChangePassword" valuePropName="checked">
						<Flex align="center" justify="center">
							<Checkbox>
								{t(
									'Admin.data.menu.userRoles.registeredPatients.forcePasswordChangeText',
								)}
							</Checkbox>
						</Flex>
					</Form.Item>
				)}
				<Form.Item style={{ margin: 'var(--spacing-3)' }}>
					<Flex align="center" justify="center">
						<Button size="large" htmlType="submit" loading={loading}>
							Update
						</Button>
					</Flex>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default ResetPasswordModal;
