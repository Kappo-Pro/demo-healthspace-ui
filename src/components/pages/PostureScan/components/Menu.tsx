import { Col, Tooltip } from 'antd';
import { MdMenu } from 'react-icons/md';
import { UseMenu } from '../context/Menu.context';

function Menu() {
	const { onToggleMenu } = UseMenu();

	return (
		<Col
			span={2}
			style={{
				height: '35px',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}>
			<Tooltip title={'Menu'}>
				<MdMenu
					size={30}
					style={{ cursor: 'pointer' }}
					onClick={onToggleMenu}
					display={'none'}
					color="var(--color-gray-600)"
				/>
			</Tooltip>
		</Col>
	);
}

export default Menu;
