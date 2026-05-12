import { Image03 } from '@vitalflow-icons/files/image03';
import { AddCoverImageProps } from '@types';
import { Button, Flex, Typography, message } from 'antd';
import { useTranslation } from 'react-i18next';

export default function AddCoverUpload(props: AddCoverImageProps) {
	const {
		previewImage,
		setOpenCoverImage,
		setPreviewImage,
		setImgFile,
		setPreviewUnSplashedImage,
	} = props;
	const { t } = useTranslation();

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.type.startsWith('image/')) {
				const fileUrl = URL.createObjectURL(file);
				setImgFile(file);
				setPreviewImage(fileUrl);
			} else {
				message.error(
					t('Admin.data.menu.patientDetail.aiAssistantPrograms.imageRequirement'),
				);
			}
		}
	};

	return (
		<div style={{ height: '275px' }}>
			<div
				style={{
					position: 'relative',
					border: '2px dashed var(--border-secondary)',
					borderRadius: 'var(--radius-lg)',
					padding: 'var(--spacing-5)',
					textAlign: 'center',
					cursor: 'pointer',
					height: '250px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
				onClick={() => {
					document.getElementById('fileInput')?.click();
				}}>
				{previewImage ? (
					<img
						src={previewImage}
						alt={t('Admin.data.menu.patientDetail.aiAssistantPrograms.preview')}
						style={{
							width: '100%',
							height: '200px',
							objectFit: 'contain',
							borderRadius: 'var(--radius-lg)',
						}}
					/>
				) : (
					<Flex vertical align="center" gap={10}>
						<Image03 width={50} height={50} color="var(--border-secondary)" />
						<Typography.Text style={{ color: 'var(--text-secondary)' }}>
							{t('Admin.data.menu.patientDetail.aiAssistantPrograms.dropImage')}
						</Typography.Text>
					</Flex>
				)}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						backgroundColor: 'var(--surface-overlay)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						opacity: 0,
						transition: 'opacity 0.3s ease-in-out',
					}}
					onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
					onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}>
					<Typography.Text style={{ color: 'var(--text-on-brand)', fontWeight: 'var(--font-weight-semibold)' }}>
						{previewImage
							? t('Admin.data.survey.changeImage')
							: t('Admin.data.survey.upload')}
					</Typography.Text>
				</div>
			</div>
			<input
				type="file"
				id="fileInput"
				style={{ display: 'none' }}
				accept="image/*"
				onChange={handleFileChange}
			/>
			<Flex justify="center" style={{ marginTop: 'var(--spacing-4)' }}>
				<Button
					type="primary"
					size="large"
					onClick={() => {
						setPreviewUnSplashedImage(null);
						setOpenCoverImage(false);
					}}
					style={{
						backgroundColor: 'var(--brand-primary)',
						borderColor: 'var(--brand-primary)',
						color: 'var(--text-on-brand)',
					}}>
					{t('Admin.data.menu.patientDetail.aiAssistantPrograms.save')}
				</Button>
			</Flex>
		</div>
	);
}
