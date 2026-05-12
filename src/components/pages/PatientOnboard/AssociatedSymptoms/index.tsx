import { FormSkeleton } from '@atoms/Skeletons';
import { OnboardFooter } from '@molecules/OnboardFooter';
import { HealthSigns } from '@pages/Home/interface';
import { painAssessmentInfoAction } from '@stores/clinical/painAssessment';
import { myLibraryInfoAction } from '@stores/content/library';
import { getEvaluationData, getHealthSignOptions } from '@stores/content/myLibrary/myLibrary';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { StrapiGeneral, TOnBoardSymptomsProps } from '@types';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import './style.css';

export default function AssociatedSymptoms(props: TOnBoardSymptomsProps) {
  const { setActiveStep, setProgressPercent , setNavigatorDirection } = props;
  const dispatch = useTypedDispatch();
  const user = useTypedSelector((state) => state.user);
  const [selectedButtons, setSelectedButtons] = useState<StrapiGeneral[]>([]);
  const healthSignOptions = useTypedSelector((state) => state.myLibrary.myLibrary.healthSignOptions);
  const associatedSymptoms = useTypedSelector((state) => state.painAssessment.associatedSymptoms);
  const [savedSymptomsData, setSavedSymptomsData] = useState<HealthSigns>();
  const [disableOtherOptions, setDisableOtherOptions] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    fetchAssociatedSymptoms();
    fetchSavedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount-only effect - initial data fetch

  const fetchAssociatedSymptoms = async () => {
    try {
      const data = await dispatch(getHealthSignOptions());
      const apiData = data.payload;
      dispatch(myLibraryInfoAction.healthSignOptionsInfo(apiData));
      setIsDataLoaded(true);
    } catch (error) {
      // Silently handle health sign fetch errors
      // Context: User will see empty form if data unavailable
      console.error('[AssociatedSymptoms] Error fetching health signs:', error);
    }
  };

  const fetchSavedData = async () => {
    const id = user.id;
    const payload = {
      userId: id,
      page: 1,
      limit: 1,
    };
    const data = await dispatch(getEvaluationData(payload));
    const apiData = data.payload;
    if (apiData.data.length > 0) {
      setSavedSymptomsData(apiData.data[0].healthSigns);
    }
  }

  useEffect(() => {
    if (associatedSymptoms?.strapiHealthSignsIds?.length) {
      const savedIds = associatedSymptoms?.strapiHealthSignsIds;
      const preSelectedButtons = healthSignOptions?.data?.filter((item) => savedIds?.includes(item?.id));
      setSelectedButtons(preSelectedButtons);
      setDisableOtherOptions(savedIds?.includes(17));
    } else if (savedSymptomsData?.strapiHealthSignsIds?.length) {
      const savedIds = savedSymptomsData.strapiHealthSignsIds;
      const preSelectedButtons = healthSignOptions?.data?.filter((item) => savedIds?.includes(item?.id));
      setSelectedButtons(preSelectedButtons);
      setDisableOtherOptions(savedIds?.includes(17));
    }
  }, [associatedSymptoms, healthSignOptions, savedSymptomsData]);

  const handleButtonClick = (item: StrapiGeneral) => {
    if (item.id === 17) {
      if (selectedButtons.some((selected: StrapiGeneral) => selected.id === 17)) {
        setSelectedButtons(selectedButtons?.filter((selected: StrapiGeneral) => selected.id !== 17));
        setDisableOtherOptions(false);
      } else {
        setSelectedButtons([item]);
        setDisableOtherOptions(true);
      }
    } else if (!disableOtherOptions) {
      if (selectedButtons.some((selected: StrapiGeneral) => selected.id === item.id)) {
        setSelectedButtons(selectedButtons?.filter((selected: StrapiGeneral) => selected.id !== item.id));
      } else {
        setSelectedButtons([...selectedButtons, item]);
      }
    }
  };

  const handleNextClick = () => {
    const strapiHealthSigns = selectedButtons.map((item: StrapiGeneral) => item.id);
    const payload = {
      strapiHealthSignsIds: strapiHealthSigns,
    };
    dispatch(painAssessmentInfoAction.associatedSymptomsInfo(payload));
    setNavigatorDirection('forward')
    if (setActiveStep) {
      setActiveStep(5);
    }
    setProgressPercent(50);
  };

  if (!isDataLoaded) {
    return <FormSkeleton />;
  }

 

  return (
    <div className="medical-container">
      <div className="medical-subcontainer">
        <div className="content-div-associated">
          {healthSignOptions?.data?.map((item: StrapiGeneral) => (
            <Button
              key={item.id}
              className={`onboard-list-button-css ${selectedButtons.some((selected: StrapiGeneral) => selected.id === item.id) ? 'selected' : ''
                }`}
              onClick={() => handleButtonClick(item)}
              disabled={disableOtherOptions && item.id !== 17}
            >
              {item?.name}
            </Button>
          ))}
        </div>
        <OnboardFooter
          onContinue={handleNextClick}
          disabled={selectedButtons.length === 0}
        />
      </div>
    </div>
  );
}
