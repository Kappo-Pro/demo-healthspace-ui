import { Col, Row } from 'antd';
import FullScreen from './FullScreen';
import Menu from './Menu';
import Progress from './Progress';
import SwitchVideo from './SwitchVideo';

function Topbar(props: { isDashboard?: boolean }) {
	const { isDashboard } = props;

	return (
		<Row
			align="middle"
			justify="center"
			style={{ height: '35px', backgroundColor: 'var(--bg-page-dark)' }}>
			<Col span={12}>
				<Row style={{ paddingLeft: 8, lineHeight: '35px' }}>
					<Menu />
					<Progress />
				</Row>
			</Col>
			<Col span={12}>
				<Row
					justify="end"
					style={{ textAlign: 'end', paddingRight: 8, lineHeight: '35px' }}>
					<Col
						span={24}
						style={{
							height: '35px',
							display: 'flex',
							justifyContent: 'end',
							alignItems: 'center',
						}}>
						<FullScreen />
						<SwitchVideo />
					</Col>
				</Row>
			</Col>
		</Row>
	);
}

export default Topbar;
