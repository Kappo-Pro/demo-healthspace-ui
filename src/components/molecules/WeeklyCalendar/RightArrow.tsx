import { ChevronRight } from '@vitalflow-icons/arrows/chevronRight';
import { useTranslation } from 'react-i18next';
import './arrow.css';

type TRightArrow = {
  onNextWeek: () => void
}

const RightArrow = (props: TRightArrow) => {

  const {onNextWeek} = props;
  const { t } = useTranslation();

  return (
    <button
      className="custom-weekly-arrow"
      onClick={onNextWeek}
      aria-label={t('patient.activity.nextWeek')}
      type="button"
    >
      <ChevronRight color='stroke-gray-900'/>
    </button>
  );
};

export default RightArrow;
