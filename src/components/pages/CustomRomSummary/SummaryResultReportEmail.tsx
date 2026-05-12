import { UntitledIcon } from '@atoms/Icon';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { Loading03 } from '@vitalflow-icons/general/loading03';
import { DEFAULT_RESULT_BY_EMAIL_TEMPLATE } from '@constants/inviteTemplates';
import { sendRomResultInMail } from '@stores/clinical/rom/customRom';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { fetchRomEmailTemplate } from '@stores/settings/settingsSlice';
import { CustomRomSession } from '@types';
import { Button, Flex, Form, Input, message, Modal, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';

const { Paragraph } = Typography;

const toolbarOptions = [
	[{ font: [] }],
	[{ size: ['small', false, 'large', 'huge'] }],
	['bold', 'italic', 'underline', 'strike'],
	[{ color: [] }, { background: [] }],
	[{ align: [] }],
	[{ list: 'ordered' }, { list: 'bullet' }],
	['blockquote', 'link'],
	['clean'],
];

interface SendResultByEmailModalProps {
	modalOpen: boolean;
	setModalOpen: (val: boolean) => void;
	closable: boolean;
	selectedRom: CustomRomSession;
	pdfBlob: Blob | null;
}

const formattedDate = new Date()
	.toLocaleDateString('en-US', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	})
	.replace(/\//g, '-'); // Ex: 04-28-2025

const fileName = `report-${formattedDate}.pdf`;

const SendResultByEmailModal = (props: SendResultByEmailModalProps) => {
	const { t } = useTranslation();
	const sendingMail = useTypedSelector(
		state => state.rom.customRom.sendingMail,
	);
	const dispatch = useTypedDispatch();
	const [emailIds, setEmailIds] = useState('');
	const [content, setContent] = useState('');
	const { pdfBlob, modalOpen, setModalOpen, closable, selectedRom } = props;
	const user = useTypedSelector(state => state.user);
	const romTemplate = useTypedSelector(state => state.settings.templates.rom);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	const [form] = Form.useForm();

	const fetchData = async () => {
		try {
			await dispatch(fetchRomEmailTemplate());
		} catch (error) {
			console.error('❌ Error:', error);
		}
	};

	useEffect(() => {
		if (modalOpen) {
			fetchData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalOpen]);

	useEffect(() => {
		setContent(romTemplate || DEFAULT_RESULT_BY_EMAIL_TEMPLATE);
	}, [romTemplate]);

	const handleViewPdf = (e: React.MouseEvent<HTMLSpanElement>) => {
		e.stopPropagation();
		if (!pdfBlob) return;
		const blobUrl = URL.createObjectURL(pdfBlob);
		window.open(blobUrl, '_blank');
	};

	const handleFinish = async (_values: { email: string }) => {
		if (!pdfBlob) message.info('please wait loading pdf');
		else if (content === '<p><br></p>' || content === '')
			message.error(
				t('Admin.data.menu.userRoles.invitePatientModal.emptyContent'),
			);
		else {
			const formData = new FormData();
			const emailIdList = emailIds.split(',').map(s => s.trim());

			emailIdList?.forEach((item, index) => {
				formData.append(`emails[${index}]`, item);
			});
			formData.append('message', content);
			formData.append(
				'name',
				user.isPhysioterapist
					? selectedUser?.profile?.fullName
					: user?.profile?.fullName,
			);
			formData.append('assessmentDate', `${selectedRom?.createdAt}`);
			formData.append('mustSendEmail', 'true');
			formData.append('attachment', pdfBlob);

			const data = await dispatch(
				sendRomResultInMail({
					sessionId: selectedRom?.id,
					formData: formData,
				}),
			);
			if (data?.payload) {
				message.success(
					t('Admin.data.menu.userRoles.invitePatientModal.successEmail'),
				);
			}
			setModalOpen(false);
		}
	};

	return (
		<Modal
			open={modalOpen}
			centered
			footer={null}
			destroyOnHidden
			closable={closable}
			maskClosable={false}
			width={MODAL_SIZES.LARGE}
			className="select-none"
			onCancel={() => setModalOpen(false)}
			title={
				<h2 style={{ textAlign: 'center', margin: 0 }}>
					{t('Patient.data.vitalscan-rom.sendAssessmentResults')}
				</h2>
			}>
			<Form form={form} layout="vertical" onFinish={handleFinish}>
				<Form.Item
					label={t('Admin.data.menu.userRoles.invitePatientModal.email')}
					name="email"
					className="w-full"
					rules={[
						{
							required: true,
							message: t(
								'Admin.data.menu.userRoles.invitePatientModal.emailRequired',
							),
						},
						{
							validator: (_, value) => {
								if (!value) return Promise.resolve();
								const emails = value.split(',').map((e: string) => e.trim());
								const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
								const invalidEmails = emails.filter(
									(email: string) => !emailRegex.test(email),
								);
								if (invalidEmails.length > 0) {
									return Promise.reject(
										t(
											'Admin.data.menu.userRoles.invitePatientModal.invalidEmail',
											{
												emails: invalidEmails.join(', '),
											},
										),
									);
								}
								return Promise.resolve();
							},
						},
					]}>
					<Input
						className="input-item"
						onChange={e => setEmailIds(e?.target?.value)}
						placeholder={t(
							'Admin.data.menu.userRoles.invitePatientModal.emailPlaceholder',
						)}
					/>
				</Form.Item>
				<Form.Item style={{ marginBottom: '0px' }}>
					<Flex justify="flex-end">
						<span
							style={{ cursor: 'pointer' }}
							onClick={() => {
								setContent(romTemplate || DEFAULT_RESULT_BY_EMAIL_TEMPLATE);
							}}>
							{t('Admin.data.menu.setting.reset')}
						</span>
					</Flex>
				</Form.Item>
				<Form.Item>
					<ReactQuill
						modules={{ toolbar: toolbarOptions }}
						theme="snow"
						value={content}
						onChange={setContent}
						style={{ marginTop: 10 }}
						className="custom-quill"
					/>
				</Form.Item>
				<Form.Item>
					<Flex
						align="center"
						gap={8}
						style={{
							border: '1px solid var(--color-gray-300)',
							borderRadius: 'var(--radius-md)',
							background: 'var(--surface-primary)',
							padding: 'var(--spacing-2) var(--spacing-3)',
							width: '100%',
						}}>
						{!pdfBlob ? (
							<>
								<Loading03
									style={{ fontSize: '22px', color: 'var(--text-secondary)' }}
								/>
								<span style={{ color: 'var(--text-link)', cursor: 'pointer' }}>
									{t('Patient.data.vitalscan-rom.generatingPdf')}
								</span>
							</>
						) : (
							<>
								<UntitledIcon
									name="paperclip"
									size={22}
									style={{ color: 'var(--text-secondary)' }}
								/>
								<span
									style={{ color: 'var(--text-link)', cursor: 'pointer' }}
									onClick={handleViewPdf}>
									{fileName}
								</span>
							</>
						)}
					</Flex>
				</Form.Item>
				<Form.Item>
					<Button
						size="large"
						htmlType="submit"
						type="primary"
						style={{
							width: '100%',
							backgroundColor: !pdfBlob ? 'var(--color-purple-400)' : '',
						}}>
						{pdfBlob ? (
							sendingMail ? (
								<Flex align="center" gap={8}>
									<span>
										{t(
											'Admin.data.menu.patientDetail.aiAssistantRomSummary.saving',
										)}
									</span>
								</Flex>
							) : (
								t('patient.activity.send')
							)
						) : (
							t('Patient.data.vitalscan-rom.generatingPdf')
						)}
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default SendResultByEmailModal;
