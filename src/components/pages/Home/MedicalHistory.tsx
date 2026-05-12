import { painAssessmentInfoAction } from '@stores/clinical/painAssessment';
import { useTypedDispatch } from '@stores/index';
import { Checkbox, Col, Row } from 'antd';
import React from 'react';
import { MedicalHistories, Options } from './interface';

interface MedicalHistoryProps {
	savedMedicalHistoryData: MedicalHistories | undefined;
	medicalHistoryOptionsData: Options[];
	setSavedMedicalHistoryData: (value: MedicalHistories | undefined) => void;
}

const MedicalHistory: React.FC<MedicalHistoryProps> = ({
	savedMedicalHistoryData,
	medicalHistoryOptionsData,
	setSavedMedicalHistoryData,
}) => {
	const dispatch = useTypedDispatch();

	const setSelectedList = (name: string, value: boolean) => {
		let temp_data =
			(Array.isArray(savedMedicalHistoryData?.strapiMedicalHistoriesIds) &&
				savedMedicalHistoryData?.strapiMedicalHistoriesIds.filter(
					item => item != Number(name),
				)) ||
			[];
		if (value) {
			if (value) {
				if (Number(name) === 16) {
					temp_data = [];
				}
				temp_data.push(Number(name));
			}
		}
		setSavedMedicalHistoryData({
			...savedMedicalHistoryData,
			strapiMedicalHistoriesIds: temp_data,
		});
		dispatch(painAssessmentInfoAction.medicalHistoryInfo(temp_data));
	};

	return (
		<Row gutter={[16, 8]}>
			{medicalHistoryOptionsData?.map((option: Options) => (
				<Col span={12} key={option.id}>
					<Checkbox
						onChange={e => setSelectedList(String(option.id), e.target.checked)}
						checked={
							Array.isArray(
								savedMedicalHistoryData?.strapiMedicalHistoriesIds,
							) &&
							savedMedicalHistoryData?.strapiMedicalHistoriesIds.includes(
								option?.id,
							)
						}
						disabled={
							Array.isArray(
								savedMedicalHistoryData?.strapiMedicalHistoriesIds,
							) &&
							savedMedicalHistoryData?.strapiMedicalHistoriesIds.includes(16) &&
							option.id != 16
						}>
						{option?.name}
					</Checkbox>
					<label className="medical-associated-label"></label>
				</Col>
			))}
		</Row>
	);
};

export default MedicalHistory;
