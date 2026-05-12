import { Flex, Progress, Typography } from 'antd';
import './style.css';

const { Paragraph } = Typography;

export const UploadBar = ({ uploadProgress }: { uploadProgress: number }) => {
	return (
		<div style={{ width: 110, marginLeft: 'var(--spacing-5)' }}>
			<Flex justify="center" className="upload-progress-bar progress-bar-width">
				<Progress
					percent={uploadProgress}
					strokeColor={{
						'0%': 'var(--color-lime-500)',
						'100%': 'var(--color-lime-500)',
					}}
					strokeWidth={12}
					showInfo={false}
				/>
			</Flex>
			<Paragraph style={{ marginLeft: 'var(--spacing-7)' }}>
				{uploadProgress + '%'}
			</Paragraph>
		</div>
	);
};
