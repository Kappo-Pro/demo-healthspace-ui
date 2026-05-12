import { Modal, Button, Typography } from 'antd';

interface ReadyToBeginModalProps {
	open: boolean;
	onBegin: () => void;
}

export default function ReadyToBeginModal({
	open,
	onBegin,
}: ReadyToBeginModalProps) {
	return (
		<Modal
			open={open}
			footer={null}
			closable={false}
			maskClosable={false}
			keyboard={false}
			centered
			width={520}
			styles={{ body: { textAlign: 'center', padding: 24 } }}>
			<Typography.Title level={3} style={{ marginBottom: 8 }}>
				Ready for your journey?
			</Typography.Title>
			<Typography.Paragraph style={{ opacity: 0.85, marginBottom: 24 }}>
				We’ll guide you step by step. Click below when you’re ready to begin.
			</Typography.Paragraph>

			<Button type="primary" size="large" onClick={onBegin}>
				Let’s begin
			</Button>
		</Modal>
	);
}
