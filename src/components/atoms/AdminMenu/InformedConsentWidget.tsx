import { FileCheck02 } from '@vitalflow-icons/files/fileCheck02';
import { getUserById } from '@stores/activity/contacts/contacts';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { consentPolicyUpdate } from '@stores/clinical/painAssessment';
import { getStats } from '@stores/patients/admin/adminPatient';
import { Checkbox, Flex, message } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useState } from 'react';
import AdminConsentFormModal from '@pages/AdminConsentFormModal';

export default function InformedConsentWidget() {
	const dispatch = useTypedDispatch();
	const { user, selectedUser } = useTypedSelector(state => ({
		user: state.user,
		selectedUser: state.contacts.main.selectedUser,
	}));
	const userId = user?.isPhysioterapist ? selectedUser?.id : user?.id;
	const [consentModalOpen, setConsentModalOpen] = useState(false);
	const [consentChecked, setConsentChecked] = useState(false);

	const handleConsentChange = async (e: CheckboxChangeEvent) => {
		const checked = e.target.checked;
		setConsentChecked(checked);

		if (checked) {
			try {
				const payload = { consentPolicyRead: true };
				await dispatch(consentPolicyUpdate({ payload, id: userId }));
				await dispatch(getUserById(userId));
				await dispatch(getStats());
				message.success('Consent saved successfully');
			} catch (error) {
				message.error('Failed to save consent');
				setConsentChecked(false);
			}
		}
	};

	const handleConsentFormClose = async () => {
		setConsentModalOpen(false);
	};

	return (
		<>
			<ul
				className="mt-2.5"
				style={{
					background: 'var(--user-menu-bg-color)',
					borderRadius: 'var(--radius-lg)',
				}}>
				<div className="functional-button-div mx-3 justify-between">
					<Flex align="center">
						<FileCheck02 width={17} height={17} color="stroke-white" />
						<Flex className="functional-title" align="baseline" gap={40}>
							Informed Consent
						</Flex>
					</Flex>
				</div>
				<div
					className="mx-3 justify-between"
					style={{
						padding: 'var(--spacing-2-5) var(--spacing-1) var(--spacing-4)',
					}}>
					<Flex
						align="center"
						style={{
							columnGap: 'var(--spacing-2-5)',
						}}>
						<Checkbox
							checked={consentChecked}
							onChange={handleConsentChange}
							className="consent-checkbox"
							style={{
								color: 'var(--text-on-dark)',
							}}
						/>
						<span
							style={{
								color: 'var(--text-on-dark)',
								fontSize: 'var(--font-size-sm)',
								flex: 1,
							}}>
							I have read and agree to the{' '}
							<span
								onClick={() => setConsentModalOpen(true)}
								style={{
									color: 'var(--button-color)',
									textDecoration: 'underline',
									cursor: 'pointer',
								}}>
								informed consent policy
							</span>
						</span>
					</Flex>
				</div>
			</ul>
			{consentModalOpen && (
				<AdminConsentFormModal
					isOpen={consentModalOpen}
					onClose={handleConsentFormClose}
					isConsentPolicyReadOnly={true}
				/>
			)}
		</>
	);
}
