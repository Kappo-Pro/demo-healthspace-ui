import { ChevronLeft } from '@vitalflow-icons/arrows/chevronLeft';
import { useTranslation } from 'react-i18next';
import './arrow.css';

type TLeftArrow = {
  onPreviousWeek: () => void
}

const LeftArrow = (props: TLeftArrow) => {

  const {onPreviousWeek} = props;
  const { t } = useTranslation();

  return (
    <button
      className='custom-weekly-arrow'
      onClick={onPreviousWeek}
      aria-label={t('patient.activity.previousWeek')}
      type="button"
    >
      <ChevronLeft color='stroke-gray-900'/>
    </button>
  );
};

export default LeftArrow;
