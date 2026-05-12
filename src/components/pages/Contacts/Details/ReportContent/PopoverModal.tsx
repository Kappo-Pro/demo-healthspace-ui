import { UntitledIcon } from '@atoms/Icon';
import { message, Popover, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PopoverModalProps {
	isRecording: boolean;
	showVideoModal: () => void;
	showImageModal: () => void;
	toggleRecording: () => void;
	resetTranscript: () => void;
	onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	tempValue: string;
	recordedState: boolean;
	setRecordedState: (value: boolean) => void;
	setTempValue: (value: string) => void;
}

const PopoverModal = (props: PopoverModalProps) => {
	const {
		isRecording,
		showVideoModal,
		showImageModal,
		toggleRecording,
		resetTranscript,
		recordedState,
		setRecordedState,
		onChange,
		setTempValue,
		tempValue,
	} = props;
	const { t } = useTranslation();
	const [isPopup, setPopup] = useState(false);
	const microphoneRef = useRef(null);

	const handlePopupItemClick = () => {
		setPopup(false);
	};

	return (
		<div>
			{!isRecording && !recordedState && (
				<Popover
					placement="top"
					open={isPopup}
					onOpenChange={visible => setPopup(visible)}
					content={
						<>
							<Tooltip placement="topRight" showArrow={false}>
								<div
									className="cursor-pointer-custom"
									onClick={() => {
										showVideoModal();
										handlePopupItemClick();
									}}>
									<UntitledIcon name="video" />{' '}
									<span className="custom-icon-text">
										{t('Admin.data.addNotes.video')}
									</span>
								</div>
							</Tooltip>
							<Tooltip placement="topRight" showArrow={false}>
								<div
									className="cursor-pointer-custom"
									onClick={() => {
										showImageModal();
										handlePopupItemClick();
									}}>
									<UntitledIcon name="image" />{' '}
									<span className="custom-icon-text">
										{t('Admin.data.addNotes.image')}
									</span>
								</div>
							</Tooltip>
							<Tooltip placement="topRight" showArrow={false}>
								<div
									className={`cursor-pointer-custom`}
									onClick={() => {
										resetTranscript();
										toggleRecording();
										handlePopupItemClick();
									}}
									ref={microphoneRef}>
									<UntitledIcon name="audio" />{' '}
									<span className="custom-icon-text">
										{isRecording
											? t('Admin.data.addNotes.stop')
											: t('Admin.data.addNotes.record')}
									</span>
								</div>
							</Tooltip>
						</>
					}
					trigger="click"
					overlayInnerStyle={{
						paddingLeft: 'var(--spacing-5)',
						paddingRight: 'var(--spacing-5)',
					}}>
					<Tooltip placement="topRight" showArrow={false}>
						<div
							className="cursor-pointer-custom"
							onClick={() => {
								setPopup(!isPopup);
							}}>
							{!isPopup ? (
								<UntitledIcon name="plus" />
							) : (
								<div>
									<UntitledIcon name="close" size={16} />
								</div>
							)}
						</div>
					</Tooltip>
				</Popover>
			)}
			{isRecording && !recordedState && (
				<Tooltip
					placement="topRight"
					title={t('patient.activity.stopTooltip')}
					showArrow={false}>
					<div
						className="cursor-pointer-custom"
						onClick={() => {
							toggleRecording();
							setRecordedState(true);
						}}>
						<UntitledIcon name="close" />
					</div>
				</Tooltip>
			)}
			{recordedState && (
				<>
					<Tooltip
						placement="topRight"
						title={t('patient.activity.discardTooltip')}
						showArrow={false}>
						<div
							className="custom-ml-2 custom-stop-icon-class cursor-pointer-custom"
							onClick={() => {
								resetTranscript();
								message.success(t('patient.activity.recDiscard'));
								setRecordedState(false);
								onChange({
									target: { value: tempValue },
								} as React.ChangeEvent<HTMLTextAreaElement>);
								setTempValue('');
							}}>
							<UntitledIcon name="delete" />
						</div>
					</Tooltip>
				</>
			)}
		</div>
	);
};

export default PopoverModal;
