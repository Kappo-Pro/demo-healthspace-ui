import { useTypedSelector } from '@stores/index'
import { Col, Row, Statistic, Typography } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import { useTranslation } from 'react-i18next';

function RehabExerciseInfo() {
  const { currentExercise } = useTypedSelector((state) => state.rehab.main)
	const { t } = useTranslation();

  return (
    <Content className='rehab-info-wraper'>
      <Row gutter={[24, 24]}>
        <Col>
          <Typography.Title level={4}>
            {currentExercise?.rehabExercisesLibrary?.title?.toUpperCase() ||
              currentExercise?.strapiExercise?.name.toUpperCase()}
          </Typography.Title>
          <Typography.Paragraph>{currentExercise?.rehabExercisesLibrary?.description || currentExercise?.strapiExercise?.description || ''}</Typography.Paragraph>
        </Col>
      </Row>
      <Row gutter={[24, 24]}>
        <Col span={6}>
          <Statistic title={t('Admin.data.rehab.addExercise.repetitions')} value={`${currentExercise?.repetitions}x`} />
        </Col>
        <Col span={6}>
          <Statistic title={t('Admin.data.rehab.addExercise.setsPerSession')} value={`${currentExercise?.setsPerSession}x`} />
        </Col>
        <Col span={6}>
          <Statistic title={t('Admin.data.rehab.addExercise.setsPerDay')} value={`${currentExercise?.setsPerDay}x`} />
        </Col>
        <Col span={6}>
          <Statistic title={t('Admin.data.rehab.addExercise.sessionsPerWeek')} value={`${currentExercise?.frequencyPerWeek}x`} />
        </Col>
      </Row>

    </Content>
  )
}

export default RehabExerciseInfo