import { AddToReports } from "@atoms/AddToReports"
import { useTypedDispatch, useTypedSelector } from "@stores/index"
import { ActivityFeedSkeleton } from '@atoms/Skeletons'
import { Empty, Pagination } from "antd"
import { useTranslation } from "react-i18next"
import { UntitledIcon } from '@atoms/Icon'
import { useEffect, useState } from "react"
import { getSurveyByIdList, getSurveyResult } from '@stores/content/survey/survey'
import { SurveyResult, SurveyResultQuestionList } from '@types'
import SurveySummaryContent from "./SurveySummaryContent"
import './style.css'

export default function AiAssistantSurveySummary() {
  const [activePanelKey, setActivePanelKey] = useState<string | string[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true)
  const [surveyIdData, setSurveyIdData] = useState('')
  const { t } = useTranslation()
  const dispatch = useTypedDispatch()
  const user = useTypedSelector((state) => state.user)
  const { selectedUser } = useTypedSelector((state) => state.contacts.main)
  const surveyResult = useTypedSelector((state) => state.survey.survey.surveyResult)
  const [surveySessionData, setSurveySessionData] = useState<SurveyResult[]>([])
  const [currentCount, setCurrentCount] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(10)
  const [selectedCollapse, setSelectedCollapse] = useState<string[] | string | undefined>();
  const stateId = useTypedSelector(state => state.patientDetail.patientDetail.stateId)
  const surveyStateId = useTypedSelector(state => state.patientDetail.patientDetail.surveyStateId)
  const isReportModal = useTypedSelector(state => state.patientDetail.patientDetail.isReportModal)

  const getPainLevel = (painLevel: number, question: SurveyResultQuestionList) => {
    switch (painLevel) {
      case 1:
        return (
          <div className='pain-level-div'>
            <UntitledIcon name="face-frown" size={20} color="var(--color-error-700)" />
            <span className='pain-level-label pain-fisrt-emoji'>{question?.selectedAnswer}</span>
          </div>
        );
      case 2:
        return (
          <div className='pain-level-div'>
            <UntitledIcon name="face-frown" size={20} color="var(--color-error-500)" />
            <span className='pain-level-label pain-second-emoji'>{question?.selectedAnswer}</span>
          </div>
        );
      case 3:
        return (
          <div className='pain-level-div'>
            <UntitledIcon name="face-sad" size={20} color="var(--color-warning-500)" />
            <span className='pain-level-label pain-third-emoji'>{question?.selectedAnswer}</span>
          </div>
        );
      case 4:
        return (
          <div className='pain-level-div'>
            <UntitledIcon name="face-sad" size={20} color="var(--color-warning-400)" />
            <span className='pain-level-label pain-fourth-emoji'>{question?.selectedAnswer}</span>
          </div>
        );
      case 5:
        return (
          <div className='pain-level-div'>
            <UntitledIcon name="face-neutral" size={20} color="var(--color-warning-600)" />
            <span className='pain-level-label pain-fifth-emoji'>{question?.selectedAnswer}</span>
          </div>
        );
      case 6:
        return (
          <div className='pain-level-div'>
            <UntitledIcon name="face-neutral" size={20} color="var(--color-warning-300)" />
            <span className='pain-level-label pain-sixth-emoji'>{question?.selectedAnswer}</span>
          </div>
        );
      case 7:
        return (
          <div className='pain-level-div'>
            <UntitledIcon name="face-smile" size={20} color="var(--color-success-300)" />
            <span className='pain-level-label pain-seventh-emoji'>{question?.selectedAnswer}</span>
          </div>
        );
      case 8:
        return (
          <div className='pain-level-div'>
            <UntitledIcon name="face-smile" size={20} color="var(--color-success-500)" />
            <span className='pain-level-label pain-eighth-emoji'>{question?.selectedAnswer}</span>
          </div>
        );
      case 9:
        return (
          <div className='pain-level-div'>
            <UntitledIcon name="face-wink" size={20} color="var(--color-success-700)" />
            <span className='pain-level-label pain-ninth-emoji'>{question?.selectedAnswer}</span>
          </div>
        );
      case 10:
        return (
          <div className='pain-level-div'>
            <UntitledIcon name="face-happy" size={20} color="var(--color-info-500)" />
            <span className='pain-level-label pain-tenth-emoji'>{question?.selectedAnswer}</span>
          </div>
        );
      default:
        return null;
    }
  }
  useEffect(() => {
    fetchSurveyData(1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedUser])

  const fetchSurveyData = async (page: number) => {
    const payload = {
      userId: user.isPhysioterapist ? selectedUser?.id : user?.id,
      limit: 10,
      page: page,
    }
    await dispatch(getSurveyResult(payload)).then(() => setIsLoading(false))
  }

  useEffect(() => {
    handleClick(surveyStateId)
    handlePanelChange(surveyStateId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateId, surveyStateId])

  const handlePanelChange = (key: string | string[]) => {
    setActivePanelKey(key);
  };

  const handleClick = (surveyId: string) => {
    if (activePanelKey !== surveyId) {
      setSurveyIdData(surveyId);
      setIsLoading(true);
      fetchSurveyByIdData(surveyId, 1)
    } else {
      setActivePanelKey('');
    }
  }

  const fetchSurveyByIdData = async (surveyId: string, page: number) => {
    const payload = {
      surveyId: surveyId,
      limit: 10,
      page: page,
    };
    if(surveyId){
    const getSurveyByIdData = await dispatch(getSurveyByIdList(payload)) as { payload: { data: SurveyResult[], pagination: { currentPage: number, totalCount: number } } };
    setSurveySessionData(getSurveyByIdData?.payload?.data || []);
    setCurrentCount(getSurveyByIdData?.payload?.pagination?.currentPage || 0);
    setTotalCount(getSurveyByIdData?.payload?.pagination?.totalCount || 0);
    }
    setIsLoading(false)
  };

  const pageHandle = (page: number) => {
    setCurrentCount(page);
    fetchSurveyByIdData(surveyIdData, 1)
  }

  return (
    <div className="survey-main-container">
      <>
        {surveyResult?.data?.length === 0 && isLoading ? <ActivityFeedSkeleton count={6} /> :
          (<>
            {surveyResult?.data?.length === 0 ? (
              <Empty
                description={t('Admin.data.survey.noResult')}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <>
                {!isReportModal && <div className="add-to-report-button">
                  <AddToReports />
                </div>}
                {
                  // TODO: Consider using length ?? defaultValue or length?.property instead of length!
                  (surveyResult?.data?.length ?? 0) > 0 ?
                    <>
                      <div className='collapse-wrapper'>
                        {
                          surveyResult?.data?.map((item: SurveyResult, index: number) => {
                            return (
                              <SurveySummaryContent handlePanelChange={handlePanelChange} handleClick={handleClick} item={item} activePanelKey={activePanelKey} index={index} selectedCollapse={selectedCollapse}
                                setSelectedCollapse={setSelectedCollapse} isLoading={isLoading} surveySessionData={surveySessionData} getPainLevel={getPainLevel} setSurveyIdData={setSurveyIdData}
                                totalCount={totalCount} currentCount={currentCount} pageHandle={pageHandle} fetchSurveyByIdData={fetchSurveyByIdData} surveyIdData={surveyIdData} />
                            )
                          })
                        }
                      </div>
                      <Pagination
                        current={surveyResult?.pagination?.currentPage}
                        showSizeChanger={false}
                        onChange={fetchSurveyData}
                        total={surveyResult?.pagination?.totalCount}
                      />
                    </>
                    : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className='empty-result'>{t('Admin.data.survey.noResult')}</span>} />
                }
              </>
            )}</>)
        }
      </>
    </div>
  )
}