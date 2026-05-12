import { UntitledIcon } from '@atoms/Icon';
import { InvitationData } from '@types';
import {
	Button,
	Checkbox,
	Flex,
	Form,
	Progress,
	Typography,
	Upload,
	message,
} from 'antd';
import { useTranslation } from 'react-i18next';
import './BulkInvite.css';
import TextEditor from './TextEditor';

const { Paragraph } = Typography;

export interface BulkInvites {
	beforeUpload: (file: { type: string; size: number; name: string }) => void;
	rowData: InvitationData;
	setIsInvitePatientModalOpen: (value: boolean) => void;
	handleUpload: unknown;
	handleRemove: () => void;
	uploading: boolean;
	progress: number;
	file: File | null;
	setMustSendEmail: (value: boolean) => void;
	mustSendEmail: boolean;
	content: string;
	setContent: (value: string) => void;
	activeKey: string | number;
	instanceLink: string;
	username: string;
	password: string;
	inviteCode: string;
	setIsUploaded: (value: boolean) => void;
	inviteTemplate: string;
}
const BulkInvite = (props: BulkInvites) => {
	const {
		beforeUpload,
		inviteTemplate,
		rowData,
		setIsUploaded,
		setIsInvitePatientModalOpen,
		handleUpload,
		handleRemove,
		uploading,
		progress,
		file,
		setMustSendEmail,
		mustSendEmail,
		inviteCode,
		password,
		username,
		instanceLink,
		activeKey,
		setContent,
		content,
	} = props;
	const { t } = useTranslation();

	const formatFileSize = (size: number) => {
		return size < 1024 * 1024
			? `${(size / 1024).toFixed(1)} KB`
			: `${(size / 1024 / 1024).toFixed(2)} MB`;
	};

	const onSlectIsMail = (value: boolean) => {
		setMustSendEmail(value);
	};

	return (
		<div className="bulk-invite-wrapper mt-6">
			<div className="bulk-invite-header">
				<p className="bulk-invite-text">
					{t('Admin.data.menu.userRoles.invitePatientModal.allowFormat')}:{' '}
					<strong>
						{t('Admin.data.menu.userRoles.invitePatientModal.csv')}
					</strong>{' '}
					| {t('Admin.data.menu.userRoles.invitePatientModal.maximumFile')}:{' '}
					<strong>
						{t('Admin.data.menu.userRoles.invitePatientModal.maxFileSize')}
					</strong>
				</p>
				<p
					className="bulk-invite-download"
					onClick={() => (window.location.href = '/assets/sampledata.xlsx')}>
					<UntitledIcon name="download" />
					<span>
						{t('Admin.data.menu.userRoles.invitePatientModal.downloadSample')}
					</span>
				</p>
			</div>
			{!file ? (
				<Upload.Dragger
					showUploadList={false}
					beforeUpload={beforeUpload}
					customRequest={handleUpload}
					accept=".csv,.xlsx">
					{uploading ? (
						<div className="bulk-invite-uploading">
							<p>
								<strong>
									{t('Admin.data.menu.userRoles.invitePatientModal.drag')}
									<br />{' '}
									{t('Admin.data.menu.userRoles.invitePatientModal.uploading')}
									...
								</strong>
							</p>
							<div className="w-1/2">
								<Progress
									percent={progress}
									trailColor="var(--brand-secondary)"
									strokeColor="var(--brand-secondary)"
									status="active"
								/>
							</div>
						</div>
					) : (
						<div className="bulk-invite-drag-area">
							<img src="/assets/uploadIcon.svg" width={70} />
							<Paragraph>
								{t('Admin.data.menu.userRoles.invitePatientModal.drag')}{' '}
								{t('Admin.data.menu.userRoles.invitePatientModal.clickUpload')}
							</Paragraph>
						</div>
					)}
				</Upload.Dragger>
			) : (
				<div className="bulk-invite-file-uploaded">
					<Flex gap={5}>
						<img src="/assets/downloadedIcon.svg" />{' '}
						<span style={{ color: 'var(--gray-800)' }}>
							{t('Admin.data.menu.userRoles.invitePatientModal.fileUploaded')}{' '}
						</span>
					</Flex>
					<div className="bulk-invite-file-info">
						<p>
							{file.name} <span>({formatFileSize(file.size)})</span>
						</p>
						<div onClick={handleRemove} className="cursor-pointer">
							<UntitledIcon
								name="close"
								size={20}
								style={{ color: 'var(--text-tertiary)' }}
								aria-label="Remove file"
							/>
						</div>
					</div>
				</div>
			)}
			<Flex
				justify="end"
				style={{
					width: '100%',
					marginTop: 10,
				}}>
				<Checkbox
					checked={mustSendEmail}
					onChange={e => onSlectIsMail(e.target.checked)}>
					{t('Admin.data.menu.userRoles.invitePatientModal.sentMail')}
				</Checkbox>
			</Flex>
			{mustSendEmail && (
				<Flex
					justify="end"
					style={{
						marginBottom: 'var(--spacing-2)',
						marginTop: 'var(--spacing-2)',
					}}>
					<Form.Item style={{ marginBottom: 0 }}>
						<span
							className="settings-templates-reset-to-default"
							onClick={() => {
								setContent(inviteTemplate);
							}}
							style={{
								cursor: 'pointer',
								fontSize: 'var(--font-size-sm)',
								color: 'var(--brand-primary)',
							}}>
							{t('Admin.data.menu.setting.reset')}
						</span>
					</Form.Item>
				</Flex>
			)}
			{mustSendEmail && !rowData && (
				<TextEditor
					content={content}
					setContent={setContent}
					activeKey={activeKey}
					instanceLink={instanceLink}
					username={username}
					password={password}
					inviteCode={inviteCode}
				/>
			)}
			<div className="bulk-invite-actions">
				<Button
					size="large"
					className="w-1/2"
					onClick={() => {
						setIsInvitePatientModalOpen(false);
					}}
					type="default">
					{t('Admin.data.menu.userRoles.invitePatientModal.cancel')}
				</Button>{' '}
				<Button
					size="large"
					className="w-1/2"
					htmlType="submit"
					onClick={() => {
						const isEmptyParagraph =
							/^<p>(\s*|<br\s*\/?>|\s*<br\s*\/?>\s*)<\/p>$/i.test(content);

						if (mustSendEmail) {
							if (isEmptyParagraph) {
								message.error(
									t(
										'Admin.data.menu.userRoles.invitePatientModal.emailContentRequired',
									),
								);
							} else {
								setIsUploaded(true);
							}
						} else {
							setIsUploaded(true);
						}
					}}
					type="primary">
					{t('Admin.data.menu.userRoles.invitePatientModal.save')}
				</Button>
			</div>
		</div>
	);
};

export default BulkInvite;
