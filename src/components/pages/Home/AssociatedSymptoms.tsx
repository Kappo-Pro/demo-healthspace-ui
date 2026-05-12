import { painAssessmentInfoAction } from '@stores/clinical/painAssessment';
import { useTypedDispatch } from '@stores/index';
import { Checkbox, Col, Row } from 'antd';
import React from 'react';
import { HealthSigns, Options, THealthSignsOptions } from './interface';

interface AssociatedSymptomsProps {
	list: THealthSignsOptions[];
	savedSymptomsData: HealthSigns | undefined;
	setSavedSymptomsData: (value: HealthSigns | undefined) => void;
}

const AssociatedSymptoms: React.FC<AssociatedSymptomsProps> = ({
	list,
	savedSymptomsData,
	setSavedSymptomsData,
}) => {
	const dispatch = useTypedDispatch();

	const setSelectedList = (name: string, value: boolean) => {
		let temp_data =
			(Array.isArray(savedSymptomsData?.strapiHealthSignsIds) &&
				savedSymptomsData?.strapiHealthSignsIds.filter(
					item => item != Number(name),
				)) ||
			[];
		if (value) {
			if (Number(name) == 17) {
				temp_data = [];
			}
			temp_data.push(Number(name));
		}
		setSavedSymptomsData({
			...savedSymptomsData,
			strapiHealthSignsIds: temp_data,
		});
		dispatch(painAssessmentInfoAction.associatedSymptomsInfo(temp_data));
	};

	return (
		<Row gutter={[16, 8]}>
			{list?.map((option: Options) => (
				<Col span={12} key={option.id}>
					<Checkbox
						onChange={e => setSelectedList(String(option.id), e.target.checked)}
						checked={
							Array.isArray(savedSymptomsData?.strapiHealthSignsIds) &&
							savedSymptomsData?.strapiHealthSignsIds.includes(option.id)
						}
						disabled={
							Array.isArray(savedSymptomsData?.strapiHealthSignsIds) &&
							savedSymptomsData?.strapiHealthSignsIds.includes(17) &&
							option.id != 17
						}>
						{option?.name}
					</Checkbox>
					<label className="medical-associated-label"></label>
				</Col>
			))}
		</Row>
	);
};

export default AssociatedSymptoms;
