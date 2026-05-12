import EventEmitter from '@services/EventEmitter';
import { Col, Row } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './style.css';

interface IProgressbarUpload {
	message?: string;
	isFullscreen?: boolean;
}

function ProgressBarUpload({
	message = 'Patient.data.rehab.uploadingVideo',
	isFullscreen,
}: IProgressbarUpload) {
	const { t } = useTranslation();
	const [uploadProgress, setUploadProgress] = useState(0);

	useEffect(() => {
		EventEmitter.on('UPLOAD_PROGRESS', percent => {
			setUploadProgress(percent);
		});

		return function cleanup() {
			EventEmitter.off('UPLOAD_PROGRESS');
		};
	}, []);

	return (
		<Row align="middle" justify="center" className="h-full select-none">
			<Col
				style={{
					background: 'var(--brand-primary-gradient)',
					maxWidth: isFullscreen ? '100%' : 1280,
					maxHeight: isFullscreen ? '100%' : 720,
					width: '100%',
					height: isFullscreen ? '97vh' : '100%',
				}}>
				<div className="progress-container select-none h-full">
					<p>{t(message)}</p>
					<div className="progress progress-moved">
						<div
							className="progress-bar-upload"
							style={{ width: `${uploadProgress}%` }}></div>
					</div>
				</div>
			</Col>
		</Row>
	);
}

export default ProgressBarUpload;
