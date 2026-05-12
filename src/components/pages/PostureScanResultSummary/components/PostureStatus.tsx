import { Empty, Flex, Typography } from 'antd';
import StatusBar from './StatusBar';
import { PostureData } from '@types';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface Posture {
	label: string;
	leftValue: number;
	rightValue: number;
}

const PostureStatus = ({ posture }: { posture: PostureData | null }) => {
	const { t } = useTranslation();
	const allowedKeys = [
		'head',
		'ear',
		'shoulder',
		'elbow',
		'hip',
		'knee',
		'ankle',
	];

	const isAllZero = allowedKeys.every(key => {
		const value = posture?.[key as keyof PostureData];
		return !value || value === 0;
	});

	if (isAllZero) {
		return (
			<div className="posture-status-bar-css">
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={t('Patient.data.postures.scanResult.noPostureDataAvailable')}
				/>
			</div>
		);
	}

	const data: Posture[] = allowedKeys?.map(key => {
		const isRightSide = posture?.view?.toLowerCase() === 'right';
		const rawValue = posture?.[key as keyof PostureData];
		const value =
			rawValue === null || rawValue === 0 || typeof rawValue !== 'number'
				? 0
				: rawValue;
		return {
			label: key,
			leftValue: !isRightSide ? value : 0,
			rightValue: isRightSide ? value : 0,
		};
	});

	return (
		<div className="posture-status-bar-css">
			<Flex justify="space-between" className="posture-row-css">
				<Text type="secondary">{t('Patient.data.postures.scanResult.left')}</Text>
				<Text type="secondary">{t('Patient.data.postures.scanResult.right')}</Text>
			</Flex>
			<Flex vertical gap={4}>
				{data?.map((item, index: number) => (
					<StatusBar
						key={index}
						label={item.label}
						leftValue={item.leftValue}
						rightValue={item.rightValue}
						posture={posture}
					/>
				))}
			</Flex>
		</div>
	);
};

export default PostureStatus;
