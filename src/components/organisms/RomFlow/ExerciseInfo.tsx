import { useTypedSelector } from '@stores/index';
import { Col, Row, Typography } from 'antd';
import { Content } from 'antd/lib/layout/layout';

function ExerciseInfo() {
	const { currentExercise } = useTypedSelector(state => state.rom.main);

	return (
		<Content className="rehab-info-wraper overflow-hidden">
			<Row gutter={[24, 24]}>
				<Col>
					<Typography.Title level={4}>
						{(currentExercise?.name
							? currentExercise?.name
							: currentExercise?.title
						)?.toUpperCase()}
					</Typography.Title>
					<Typography.Paragraph>
						{currentExercise?.description?.toUpperCase()}
					</Typography.Paragraph>
				</Col>
			</Row>
		</Content>
	);
}

export default ExerciseInfo;
