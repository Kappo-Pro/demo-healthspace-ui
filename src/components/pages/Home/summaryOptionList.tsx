import { useEffect, useState } from 'react';
import { Options, PainAssessments } from './interface';
import { TStrapiBodyPoints } from '@molecules/MBodyPoints/interface';
import { useTranslation } from 'react-i18next';
import {
	getOptionsData,
	getBodyPointStrapi} from '@stores/content/myLibrary/myLibrary';
import { useTypedDispatch } from '@stores/index';
import { Descriptions, Divider } from 'antd';

export interface BodyPointOption {
	aggravatingFactors: [];
	relievingFactors: [];
	painCauses: [];
	painDurations: [];
	painFrequencies: [];
	painStatuses: [];
}

interface TOption {
	item: PainAssessments;
	isLast?: boolean;
}

const SummuryOptionList = (props: TOption) => {
	const [bodyPointOptionList, setBodyPointOptionList] =
		useState<BodyPointOption>();
	const [bodyPointList, setBodyPointList] = useState<TStrapiBodyPoints[]>();
	const { item, isLast = false } = props;
	const dispatch = useTypedDispatch();
	useEffect(() => {
		getBodyPointOptions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Mount-only - getBodyPointOptions is stable

	const getBodyPointOptions = async () => {
		const data = await dispatch(getBodyPointStrapi());
		const strapiData = data.payload;
		setBodyPointList(strapiData);
		const getOptionData = await dispatch(
			getOptionsData({ id: item.strapiBodyPointId }),
		);
		const apiData = getOptionData.payload;
		setBodyPointOptionList(apiData);
	};
	const { t } = useTranslation();

	// Get location name for title
	const locationName = bodyPointList
		?.find(
			(element: TStrapiBodyPoints) =>
				element.id == item.strapiBodyPointId,
		)
		?.name.toUpperCase();

	// Get aggravating factors
	const aggravatingFactors = bodyPointOptionList?.aggravatingFactors
		? bodyPointOptionList?.aggravatingFactors
				.filter((element: Options) =>
					item.strapiAggravatingFactorsIds.includes(element.id),
				)
				.map((filteredElement: Options) => filteredElement.name)
				.join(', ')
		: null;

	// Get relieving factors
	const relievingFactors = bodyPointOptionList?.relievingFactors
		? bodyPointOptionList?.relievingFactors
				.filter((element: Options) =>
					item.strapiRelievingFactorsIds.includes(element.id),
				)
				.map((filteredElement: Options) => filteredElement.name)
				.join(', ')
		: null;

	// Get pain causes
	const painCauses = bodyPointOptionList?.painCauses
		? bodyPointOptionList?.painCauses
				.filter((element: Options) =>
					item.strapiPainCausesIds.includes(element.id),
				)
				.map((filteredElement: Options) => filteredElement.name)
				.join(', ')
		: null;

	// Get duration of pain
	const durationOfPain = bodyPointOptionList?.painDurations
		? bodyPointOptionList?.painDurations?.find(
				(element: Options) => element.id == item.strapiPainDurationId,
			)?.name
		: null;

	// Get frequency of pain
	const frequencyOfPain = bodyPointOptionList?.painFrequencies
		? bodyPointOptionList?.painFrequencies?.find(
				(element: Options) => element.id == item.strapiPainFrequencyId,
			)?.name
		: null;

	// Get status of pain
	const statusOfPain = bodyPointOptionList?.painStatuses
		? bodyPointOptionList?.painStatuses.find(
				(element: Options) => element.id == item.strapiPainStatusId,
			)?.name
		: null;

	const descriptionsStyle = {
		marginBottom: 0,
		'--ant-descriptions-title-margin-bottom': 'var(--spacing-1)',
	} as React.CSSProperties;

	return (
		<>
			<Descriptions
				title={locationName}
				column={1}
				size="small"
				style={descriptionsStyle}
			>
				<Descriptions.Item label={t('Patient.data.summaryOptionList.painLevel', 'Pain Level')}>
					{item.painLevel ? item.painLevel : 0}
				</Descriptions.Item>
				{item.strapiAggravatingFactorsIds?.length > 0 && aggravatingFactors && (
					<Descriptions.Item label={t('Patient.data.summaryOptionList.agrFactor')}>
						{aggravatingFactors}
					</Descriptions.Item>
				)}
				{item.strapiRelievingFactorsIds?.length > 0 && relievingFactors && (
					<Descriptions.Item label={t('Patient.data.summaryOptionList.relFactor')}>
						{relievingFactors}
					</Descriptions.Item>
				)}
				{item.strapiPainCausesIds?.length > 0 && painCauses && (
					<Descriptions.Item label={t('Patient.data.summaryOptionList.cop')}>
						{painCauses}
					</Descriptions.Item>
				)}
				<Descriptions.Item label={t('Patient.data.summaryOptionList.dop')}>
					{durationOfPain}
				</Descriptions.Item>
				<Descriptions.Item label={t('Patient.data.summaryOptionList.fop')}>
					{frequencyOfPain}
				</Descriptions.Item>
				<Descriptions.Item label={t('Patient.data.summaryOptionList.sop')}>
					{statusOfPain}
				</Descriptions.Item>
			</Descriptions>
			{!isLast && <Divider style={{ margin: 'var(--spacing-4) 0', borderColor: 'var(--input-border)' }} />}
		</>
	);
};

export default SummuryOptionList;
