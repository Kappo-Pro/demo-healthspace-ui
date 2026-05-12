import { OnboardFunctionalGoalsSkeleton } from '@atoms/Skeletons';
import { OnboardFooter } from '@molecules/OnboardFooter';
import { FUNCTIONAL_GOAL_IDS } from '@constants/plans';
import { getFunctionalGoals, GetDetails } from '@stores/clinical/functionalGoals';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { savedFunctionalGoal, updateFunctionalGoal } from '@stores/shared/onBoard/onBoard';
import { getFunctionalGoalById } from '@stores/shared/settings/settings';
import { TOnBoardSymptomsProps } from '@types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AnimationCard from './AnimationCard';
import { FEATURES_MOCK } from './FeaturesMock';
import './style.css';

export interface FeatureProps {
  title: string;
  backgroundStyle: string;
  hoverBackgroundStyle: string;
  description: string;
  imageSrc: string;
}

export default function FunctionalGoals(props: TOnBoardSymptomsProps) {
  const { setActiveStep, setProgressPercent ,navigatorDirection,  setNavigatorDirection} = props;
  const { t } = useTranslation();
  const dispatch = useTypedDispatch();
  const savedFunctionalGoals = useTypedSelector((state) => state.onBoard.onBoard.savedFunctionalGoals);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Record<string, number[]>>({});
  const { user, selectedUser } = useTypedSelector((state) => ({
    user: state.user,
    selectedUser: state.contacts.main.selectedUser,
  }))
  const [functionalGoalList, setFunctionalGoalList] = useState<GetDetails>();
  const getFunctionalGoalsData = useTypedSelector(state => state.functionalGoals.functionalGoals)
  const functionalGoals = useTypedSelector(state => state.settings.content.functionalGoals)


  useEffect(() => {
    fetchFunctionalGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount-only effect - initial data fetch

  useEffect(() => {
    const updatedGoals = getFunctionalGoalsData?.data.map(goal => {
      const matched = functionalGoals?.find(
        fg => fg?.functionalGoalId === goal?.id
      );
      const matchedMock = FEATURES_MOCK.find((item) => item.id === Number(goal?.id));

      return {
        id: goal?.id,
        attributes: {
          ...goal?.attributes,
          name: matched?.title || goal.attributes?.name || matchedMock?.name,
          description: matched?.description || t(`Patient.data.functionalGoals.description-${goal?.id}`) || "",
          thumbnail: matched?.thumbnail || "",
          personaImage: matchedMock?.personaImage || "",
        },
      };
    });

    setFunctionalGoalList({
      data: updatedGoals,
      // TODO: Consider using meta ?? defaultValue or meta?.property instead of meta!
      meta: getFunctionalGoalsData?.meta,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFunctionalGoalsData, functionalGoals]); // t intentionally excluded - static translation function

  useEffect(() => {
    let savedIds: number[] = [];
    if (savedFunctionalGoals?.functionalGoalsIds?.length) {
      savedIds = savedFunctionalGoals?.functionalGoalsIds;
    } else if (selectedUser?.functionalGoals?.length) {
      const lastIndex = selectedUser.functionalGoals.length - 1;
      savedIds = selectedUser.functionalGoals[lastIndex]?.functionalGoalsIds || [];
    }
    if (savedIds.length > 0 && Array.isArray(functionalGoalList?.data)) {
      const preSelectedCards: Record<string, number[]> = {};
  
      functionalGoalList.data.forEach(({ id, attributes }) => {
        if (savedIds.includes(id)) {
          preSelectedCards[attributes.name] = [id];
        }
      });
  
      setSelectedCards(preSelectedCards);
    } else {
      setSelectedCards({});
    }
  }, [savedFunctionalGoals, selectedUser, functionalGoalList]);

  useEffect(() => {
    fetchingFunctionalGoalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount-only effect - initial data fetch

  const fetchFunctionalGoals = async () => {
    for (const id of FUNCTIONAL_GOAL_IDS) {
      await dispatch(getFunctionalGoalById(id));
    }
  };

  const fetchingFunctionalGoalData = async () => {
    await dispatch(getFunctionalGoals());
    setIsDataLoaded(true);
  };

  const handleNextClick = async () => {
    const functionalGoalsIds = Object.values(selectedCards).flat();
    const payload = {
      functionalGoalsIds,
    };
    savedFunctionalGoals.length > 0 ? await dispatch(updateFunctionalGoal({ userId: user?.id, payload })) : await dispatch(savedFunctionalGoal({ userId: user?.id, payload }))
    setNavigatorDirection('forward')
    setActiveStep?.(7);
    setProgressPercent(70);
  };

  const handleCardSelect = (title: string) => {
    setSelectedCards((prev) => {
      const newState = { ...prev };
      if (newState[title]) {
        delete newState[title];
      } else {
        const matchedGoal = functionalGoalList?.data?.find(
          (goal) => goal.attributes.name === title
        );
  
        if (matchedGoal) {
          newState[title] = matchedGoal.id;
        }
      }
      return newState;
    });
  };

  if (!isDataLoaded) {
    return <OnboardFunctionalGoalsSkeleton />;
  }


  return (
    <div className="functional-container">
      <div className="functional-cards-wrapper">
        <div className="functional-card-div">
          {functionalGoalList?.data?.map((feature, index: number) => (
            <AnimationCard
              key={index}
              setActiveStep={setActiveStep}
              setProgressPercent={setProgressPercent}
              {...feature}
              handleCardSelection={handleCardSelect}
              isSelected={!!selectedCards[feature.attributes?.name]}
            />
          ))}
        </div>
      </div>
      <OnboardFooter
        onContinue={handleNextClick}
        disabled={Object.keys(selectedCards).length === 0}
      />
    </div>
  );
}