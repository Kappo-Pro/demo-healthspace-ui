import { useTypedSelector } from '@stores/index'
import { Col, Row, Statistic, Typography } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import { useTranslation } from 'react-i18next';

function PatientExerciseInfo() {
  const { currentExercise } = useTypedSelector((state) => state.patientDetail.program.main)
  const { t } = useTranslation();

  return (
    <Content className='rehab-info-wraper' style={{ overflow: "hidden" }}>
      <Row gutter={[24, 24]}>
        <Col>
          <Typography.Title level={4}>
            {currentExercise?.name ? <>
              {(currentExercise?.name?.toUpperCase())}</>
              : <>
                {(currentExercise?.exerciseLibrary?.title?.toUpperCase())}</>
            }
          </Typography.Title>
          <Typography.Paragraph>{currentExercise?.name ? <>
            {(currentExercise?.description?.toUpperCase())}</>
            : <>
              {(currentExercise?.exerciseLibrary?.description?.toUpperCase())}</>
          }</Typography.Paragraph>
        </Col>
      </Row>
      <Row gutter={[24, 24]}>
        <Col span={6}>
          <Statistic title={t('Admin.data.rehab.addExercise.repetitions')} value={`${currentExercise?.reps}x`} />
        </Col>
        <Col span={6}>
          <Statistic title={t('Admin.data.rehab.addExercise.setsPerSession')} value={`${currentExercise?.sets}x`} />
        </Col>
        <Col span={6}>
          <Statistic title={t('Admin.data.rehab.addExercise.setsPerDay')} value={`${currentExercise?.dailyReps}x`} />
        </Col>
        <Col span={6}>
          <Statistic title={t('Admin.data.rehab.addExercise.sessionsPerWeek')} value={`${currentExercise?.weeklyReps}x`} />
        </Col>
      </Row>
    </Content>
  )
}

export default PatientExerciseInfo