import { FormSkeleton } from '@atoms/Skeletons';
import { OnboardFooter } from '@molecules/OnboardFooter';
import { MedicalHistories } from '@pages/Home/interface';
import { painAssessmentInfoAction, saveEvaluation } from '@stores/clinical/painAssessment';
import { myLibraryInfoAction } from '@stores/content/library';
import { getEvaluationData, getMedicalHistoriesOptions } from '@stores/content/myLibrary/myLibrary';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { StrapiGeneral, TOnBoardSymptomsProps } from '@types';
import { Button } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import './style.css';

export default function MedicalHistory(props: TOnBoardSymptomsProps) {
  const { setActiveStep, setProgressPercent , setNavigatorDirection} = props
  const [selectedButtons, setSelectedButtons] = useState<StrapiGeneral[]>([]);
  const medicalHistoriesOptions = useTypedSelector((state) => state.myLibrary.myLibrary.medicalHistoriesOptions);
  const dispatch = useTypedDispatch();
  const medicalHistory = useTypedSelector((state) => state.painAssessment.medicalHistory);
  const user = useTypedSelector((state) => state.user);
  const painAssessmentInfo = useTypedSelector((state) => state.painAssessment.painAssessment);
  const associatedSymptoms = useTypedSelector((state) => state.painAssessment.associatedSymptoms);
  const [disableOtherOptions, setDisableOtherOptions] = useState(false);
  const painStatusButton = useTypedSelector((state) => state.onBoard.onBoard.painStatusButton);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [savedMedicalHistoryData, setSavedMedicalHistoryData] = useState<MedicalHistories>();

  const fetchMedicalHistory = useCallback(async () => {
    try {
      const data = await dispatch(getMedicalHistoriesOptions());
      const apiData = data.payload;
      dispatch(myLibraryInfoAction.medicalHistoriesOptionsinfo(apiData));
      setIsDataLoaded(true);
    } catch (error) {
      // Intentionally empty - error already logged
    }
  }, [dispatch]);

  const fetchSavedData = useCallback(async () => {
    const id = user.id;
    const payload = {
      userId: id,
      page: 1,
      limit: 1,
    };
    const data = await dispatch(getEvaluationData(payload));
    const apiData = data?.payload;
    if (apiData?.data?.length > 0) {
      setSavedMedicalHistoryData(apiData?.data[0]?.medicalHistories);
    }
  }, [dispatch, user.id]);

  useEffect(() => {
    fetchMedicalHistory();
    fetchSavedData();
  }, [fetchMedicalHistory, fetchSavedData])

  useEffect(() => {
    if (medicalHistory?.strapiMedicalHistoriesIds?.length) {
      const savedIds = medicalHistory?.strapiMedicalHistoriesIds;
      const preSelectedButtons = medicalHistoriesOptions?.data?.filter((item) => savedIds?.includes(item?.id));
      setSelectedButtons(preSelectedButtons);
      setDisableOtherOptions(savedIds?.includes(16));
    } else if (savedMedicalHistoryData?.strapiMedicalHistoriesIds?.length) {
      const savedIds = savedMedicalHistoryData?.strapiMedicalHistoriesIds;
      const preSelectedButtons = medicalHistoriesOptions?.data?.filter((item) => savedIds?.includes(item?.id));
      setSelectedButtons(preSelectedButtons);
      setDisableOtherOptions(savedIds?.includes(16));
    }
  }, [medicalHistory, medicalHistoriesOptions, savedMedicalHistoryData]);

  const handleButtonClick = (item: StrapiGeneral) => {
    if (item.id === 16) {
      if (selectedButtons.some((selected: StrapiGeneral) => selected?.id === 16)) {
        setSelectedButtons(selectedButtons?.filter((selected: StrapiGeneral) => selected?.id !== 16));
        setDisableOtherOptions(false);
      } else {
        setSelectedButtons([item]);
        setDisableOtherOptions(true);
      }
    } else if (!disableOtherOptions) {
      if (selectedButtons.some((selected: StrapiGeneral) => selected?.id === item?.id)) {
        setSelectedButtons(selectedButtons?.filter((selected: StrapiGeneral) => selected?.id !== item?.id));
      } else {
        setSelectedButtons([...selectedButtons, item]);
      }
    }
  }

  const handleNextClick = async () => {
    const strapiMedicalHistories = selectedButtons.map((item: StrapiGeneral) => item.id);
    const payload = {
      strapiMedicalHistoriesIds: strapiMedicalHistories,
    };
    dispatch(painAssessmentInfoAction.medicalHistoryInfo(payload));

    const finalPayload = {
      userId: user?.id,
      painAssessments: painStatusButton === "noPain" ? [] : painAssessmentInfo,
      healthSigns: painStatusButton === "noPain" ? [] : associatedSymptoms,
      medicalHistories: payload
    }
    const data = await saveEvaluation(finalPayload);
    if (data) {
      setNavigatorDirection('forward')
      if (setActiveStep) {
        setActiveStep(6);
      }
      setProgressPercent(60);
    }
  }

  if (!isDataLoaded) {
    return <FormSkeleton />;
  }


  return (
    <div className="medical-container">
      <div className='medical-subcontainer'>
        <div className="content-div-associated">
          {medicalHistoriesOptions?.data.map((item: StrapiGeneral) => {
            return (
              <Button key={item?.id}
                className={`onboard-list-button-css ${selectedButtons.some((selected: StrapiGeneral) => selected?.id === item?.id) ? 'selected' : ''}`}
                onClick={() => handleButtonClick(item)}
                disabled={disableOtherOptions && item.id !== 16}
              >
                {item?.name}
              </Button>
            )
          })}
        </div>
        <OnboardFooter
          onContinue={handleNextClick}
          disabled={selectedButtons.length === 0}
        />
      </div>
    </div>
  )
}
