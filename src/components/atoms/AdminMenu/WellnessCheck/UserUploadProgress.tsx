import { useTypedSelector } from '@stores/index';
import { Progress, Typography } from 'antd';

const { Paragraph } = Typography;
import './UserUploadProgress.css'

const UserUploadProgress = () => {
	const progress = useTypedSelector(
		state => state.patientDetail.userSlice.uploadProgress,
	);

	return (
		<div className="upload-bar-user-container">
			<div className="upload-bar-user-progress">
				<div className="upload-bar-user-progress-wrapper">
					<Progress
						percent={progress?.progress}
						strokeColor={{
							'0%': 'var(--color-lime-500)',
							'100%': 'var(--color-lime-500)',
						}}
						strokeWidth={12}
						showInfo={false}
						className="upload-bar-user-bar"
					/>
					<Paragraph className="upload-bar-user-text">{progress?.progress + '%'}</Paragraph>
				</div>
			</div>
		</div>
	);
};

export default UserUploadProgress;
