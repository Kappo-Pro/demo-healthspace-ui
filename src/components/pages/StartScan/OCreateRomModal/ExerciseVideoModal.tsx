import { Flex, Modal, Typography } from 'antd';

interface CustomModalProps {
	name?: string;
	description: string;
	video?: string;
	open: boolean;
	onClose?: () => void;
}

export const ExerciseVideoModal = ({
	open,
	onClose,
	name,
	description,
	video,
}: CustomModalProps) => {
	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={null}
			centered
			width={1000}
			closable
			maskClosable>
			<Flex
				vertical
				align="center"
				justify="center"
				className="select-none"
				style={{ textAlign: 'center', marginTop: 'var(--spacing-4)' }}>
				<video
					controls
					className="video"
					preload="metadata"
					src={video ?? ''}
					width="100%"
					height="100%"
					style={{ borderRadius: 'var(--radius-md)' }}
				/>
				<div className="select-none">
					<Typography.Title level={5}>{name}</Typography.Title>
					<Typography.Text>{description}</Typography.Text>
				</div>
			</Flex>
		</Modal>
	);
};
