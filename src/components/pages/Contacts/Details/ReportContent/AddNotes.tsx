import { UntitledIcon } from '@atoms/Icon';
import { Button, message } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpeechRecognition } from 'react-speech-recognition';
import './AddNotes.css';

interface AddNotesProps {
	sendMessage: (
		reportId: string,
		messageDescription: string,
		imgFile: File[],
		videoBlob: Blob,
	) => void;
	onClick: () => void;
	onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	isUpdating?: boolean;
}

const AddNotes: React.FC<AddNotesProps> = ({
	onClick,
	onChange,
	sendMessage,
	isUpdating = false,
}) => {
	const { t } = useTranslation();
	const { resetTranscript, browserSupportsSpeechRecognition } =
		useSpeechRecognition();
	const [tempValue, setTempValue] = useState('');

	if (!browserSupportsSpeechRecognition) {
		return <span>{t('Admin.data.addNotes.browserErr')}</span>;
	}

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = event.target.value;
		setTempValue(value);
		onChange(event);
	};

	const handleSave = () => {
		if (tempValue.trim() === '') {
			message.error(t('Admin.data.addNotes.requiredErr'));
		} else {
			setTempValue('');
			resetTranscript();
			onClick();
		}
	};

	return (
		<div className="add-notes-container note-section">
			<p className="add-notes-label">
				{t('Admin.data.addToReports.addNotes')}
				<div className="popover-modal">
					<TextArea
						value={tempValue}
						placeholder={t('Admin.data.addNotes.enterDescription')}
						style={{ marginTop: 'var(--spacing-2)' }}
						onChange={handleChange}
						rows={3}
					/>
				</div>
				<Button
					className="notes-save-button"
					onClick={handleSave}
					loading={isUpdating}
					disabled={isUpdating}>
					<UntitledIcon name="check" /> Save
				</Button>
			</p>
		</div>
	);
};

export default AddNotes;
