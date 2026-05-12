import { Col, Typography } from 'antd';
import { PosturalAnalytics, UseControls } from '../context/Controls.context';
const { Text } = Typography;

function Progress() {
	const { positions, onGetCurrent } = UseControls();

	if (!positions.length) return null;

	const total = positions.length;

	const view = onGetCurrent() as Partial<PosturalAnalytics>;

	const viewNumber = onGetCurrent(true);

	return (
		<Col
			span={12}
			style={{
				height: '35px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'flex-start',
			}}>
			<Text style={{ color: 'var(--text-color-on-dark)' }}>
				{`${+viewNumber + 1}/${total} ${view?.name?.toUpperCase()}`}
			</Text>
		</Col>
	);
}

export default Progress;
