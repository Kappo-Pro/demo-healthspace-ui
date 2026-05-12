// REMOVED: import { useTranslation } from 'react-i18next';
import './style.css';
import { Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { PostureCaptureData } from './PostureCaptureData';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { getPostureByPage } from '@stores/posture/postures/postures';

export const PostureCaptures = () => {
	const [activeKey, setActiveKey] = useState('1');
	const dispatch = useTypedDispatch();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	useEffect(() => {
		handlePostureGetApi(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, selectedUser]); // dispatch is stable, handlePostureGetApi intentionally excluded - function redefined on every render

	const handlePostureGetApi = async (page: number) => {
		await dispatch(
			getPostureByPage({
				userId: user.isPhysioterapist ? selectedUser?.id : user?.id,
				page,
			}),
		);
	};

	return (
		<div className="posture-captures">
		<div className="posture-card-container" style={{backgroundColor:'var(--card-bg-color)', paddingLeft:'var(--spacing-4)',paddingRight:'var(--spacing-4)', borderRadius: 'var(--radius-lg)'}}>
			<Tabs
				defaultActiveKey={activeKey}
				className="tabs"
				activeKey={activeKey}
				onChange={value => setActiveKey(value)}
				destroyInactiveTabPane
				items={[
					{
						label: 'Front',
						key: '1',
						children: <PostureCaptureData side={'front'} />,
					},
					{
						label: 'Back',
						key: '2',
						children: <PostureCaptureData side={'back'} />,
					},
					{
						label: 'Left',
						key: '3',
						children: <PostureCaptureData side={'left'} />,
					},
					{
						label: 'Right',
						key: '4',
						children: <PostureCaptureData side={'right'} />,
					},
				]}
			/>
			</div>
		</div>
	);
};
