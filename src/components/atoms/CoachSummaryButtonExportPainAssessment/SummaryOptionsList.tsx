import { TPainAssessmentProps, TStrapiFactors } from '@types';
import { useTranslation } from 'react-i18next';
import './style.css';

interface TSummaryOption {
	item: TPainAssessmentProps;
}

const SummuryOptionsList = (props: TSummaryOption) => {
	const { item } = props;
	const { t } = useTranslation();
	const joinAttributes = (attributes: TStrapiFactors[]) => {
		return attributes
			.map((element: TStrapiFactors) => element.name)
			.join(' , ');
	};

	return (
		<div className='summary-option-list'>
			{
				<p className="title-container-type-one">
					{' '}
					Pain Level :{' '}
					<span className="font-regular">
						{item.painLevel ? item.painLevel : 0}
					</span>
				</p>
			}
			{item.strapiBodyPoint && (
				<p className="title-container-type-one">
					{' '}
					{t('Patient.data.summaryOptionList.location')}{' '}
					<span className="font-regular">
						{(item?.strapiBodyPoint?.name ?? '').toUpperCase()}
					</span>
				</p>
			)}
			{item.strapiAggravatingFactorsIds?.length > 0 && (
				<p className="title-container-type-two">
					{t('Patient.data.summaryOptionList.agrFactor')}{' '}
					<span className="font-regular">
						{joinAttributes(item.strapiAggravatingFactors)}
					</span>
				</p>
			)}
			{item.strapiRelievingFactorsIds?.length > 0 && (
				<p className="title-container-type-two">
					{t('Patient.data.summaryOptionList.relFactor')}{' '}
					<span className="font-regular">
						{joinAttributes(item.strapiRelievingFactors)}
					</span>
				</p>
			)}
			{item.strapiPainCausesIds?.length > 0 && (
				<p className="title-container-type-two">
					{t('Patient.data.summaryOptionList.cop')}{' '}
					<span className="font-regular">
						{joinAttributes(item.strapiPainCauses)}
					</span>
				</p>
			)}
			{item.strapiPainDurationId > 0 && (
				<p className="title-container-type-two">
					{t('Patient.data.summaryOptionList.dop')}{' '}
					<span className="font-regular">
						{item.strapiPainDuration?.name}
					</span>
				</p>
			)}
			{item.strapiPainFrequencyId > 0 && (
				<p className="title-container-type-two">
					{t('Patient.data.summaryOptionList.fop')}{' '}
					<span className="font-regular">
						{item.strapiPainFrequency?.name}
					</span>
				</p>
			)}
			{item.strapiPainStatusId > 0 && (
				<p className="title-container-type-two title-container-type-one">
					{t('Patient.data.summaryOptionList.sop')}{' '}
					<span className="font-regular">
						{item.strapiPainStatus?.name}
					</span>
				</p>
			)}
		</div>
	);
};

export default SummuryOptionsList;
