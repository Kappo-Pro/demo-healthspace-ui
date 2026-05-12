import { UntitledIcon } from '@atoms/Icon';
import { resetAll, setIsOmniRomRecordModal } from '@stores/clinical/rehab/main';
import { setRomUploadDetails } from '@stores/clinical/rom/customRom';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { Button, Card, Col, Flex, Input, Row, Typography, message } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './style.css';

const { Paragraph } = Typography;

interface ImageModalContentProps {
	activeStep: number;
	setActiveStep: (val: number) => void;
}

export default function ImageModalContent(props: ImageModalContentProps) {
	const { activeStep, setActiveStep } = props;
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();

	const { isOmniRomRecord, isOmniRomUpload } = useTypedSelector(
		state => state.rehab.main,
	);
	const imgInputRef = useRef<HTMLInputElement>(null);
	const [imgFile, setImgFile] = useState<File[] | undefined>([]);
	const [messageTitle, setMessageTitle] = useState('');
	const [messageDescription, setMessageDescription] = useState('');

	const openImgInput = () => {
		imgInputRef.current?.click();
	};

	const handleFileChange = (e: { target: { files: File[] } }) => {
		const files = e.target.files;
		if (files[0]) {
			setImgFile([files[0]]);
		}
	};

	const validateFields = () => {
		if (isOmniRomUpload && (!imgFile || imgFile.length === 0)) {
			message.error(t('Patient.data.vitalscan-rom.videoErr'));
			return false;
		}
		if (!messageTitle.trim()) {
			message.error(t('Patient.data.vitalscan-rom.titleErr'));
			return false;
		}
		return true;
	};

	const handleSave = () => {
		if (!validateFields()) return;
		const payload = {
			title: messageTitle,
			description: messageDescription,
			videos: imgFile,
		};
		const data = dispatch(setRomUploadDetails(payload));
		data?.payload && setActiveStep(activeStep + 1);
	};

	const videoElement = useMemo(() => {
		if (!imgFile || imgFile.length === 0) return null;
		const firstFile = imgFile[0];
		if (!firstFile) return null;
		return (
			<video
				src={URL.createObjectURL(firstFile)}
				controls
				autoPlay
				loop
				muted
				className="video-element"
			/>
		);
	}, [imgFile]);

	const handleCancel = () => {
		dispatch(setIsOmniRomRecordModal(false));
		dispatch(resetAll());
	};

	return (
		<>
			<Typography.Title level={3}>
				{isOmniRomRecord
					? t('Patient.data.vitalscan-rom.recordExercise')
					: t('Patient.data.vitalscan-rom.addExercise')}
			</Typography.Title>
			<Card style={{ width: '80%' }}>
				<Row gutter={[16, 16]}>
					{isOmniRomUpload && (imgFile ?? []).length === 0 && (
						<Col span={16} className="custom-col" onClick={openImgInput}>
							<div className="upload-content">
								<UntitledIcon name="plus" size="medium" />
								<Paragraph>{t('Patient.data.vitalscan-rom.uploadVideo')}</Paragraph>
							</div>
						</Col>
					)}

					{isOmniRomUpload && imgFile && imgFile.length > 0 && (
						<Col span={16}>
							{videoElement}
							<div className="absolute-bottom-left" onClick={openImgInput}>
								<UntitledIcon name="upload" size={20} />
								<span>{t('Patient.data.vitalscan-rom.uploadAnotherVideo')}</span>
							</div>
						</Col>
					)}

					<Col span={isOmniRomRecord ? 24 : 8}>
						<Flex>
							<Typography>{t('Patient.data.vitalscan-rom.title')}</Typography>
						</Flex>
						<Input.TextArea
							id="messageTitle"
							name="messageTitle"
							placeholder={t('Patient.data.vitalscan-rom.addTitle')}
							rows={1}
							value={messageTitle}
							onChange={e => {
								setMessageTitle(e.target.value);
							}}
							className="extra-margin-bottom"
						/>
						<Flex>
							<Typography>{t('Patient.data.vitalscan-rom.description')}</Typography>
						</Flex>
						<Input.TextArea
							id="messageDescription"
							name="messageDescription"
							placeholder={t('Patient.data.vitalscan-rom.addDescription')}
							rows={isOmniRomRecord ? 8 : 10}
							value={messageDescription}
							onChange={e => {
								setMessageDescription(e.target.value);
							}}
							className="extra-margin-bottom"
						/>
					</Col>

					<input
						ref={imgInputRef}
						type="file"
						accept="video/*"
						className="hidden"
						onChange={handleFileChange}
					/>
					<Flex gap={16} style={{ width: '100%' }}>
						<Button onClick={handleCancel} style={{ flex: 1 }}>
							{t('Admin.data.menu.userRoles.pendingInvites.cancel')}
						</Button>
						<Button onClick={() => handleSave()} style={{ flex: 1 }}>
							{t('Patient.data.vitalscan-rom.next')}
							<UntitledIcon name="arrowRight" size={20} />
						</Button>
					</Flex>
				</Row>
			</Card>
		</>
	);
}
