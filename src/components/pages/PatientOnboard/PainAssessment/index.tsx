import { OnboardFooter } from '@molecules/OnboardFooter';
import { EvaluationData } from '@pages/Home/interface';
import { getEvaluationData } from '@stores/content/myLibrary/myLibrary';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { TOnBoardSymptomsProps } from '@types';
import { useEffect, useState } from 'react';
import MBodyPoints from '../MBodyPoints';
import './style.css';

export default function PainAssessment(props: TOnBoardSymptomsProps) {
	const { setActiveStep, setProgressPercent, setNavigatorDirection } = props;
	const [isLoading, setIsLoading] = useState(true);
	const [savedEvaluationData, setSavedEvaluationData] =
		useState<EvaluationData>();
	const dispatch = useTypedDispatch();
	const user = useTypedSelector(state => state.user);

	useEffect(() => {
		fetchSavedData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

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
			setSavedEvaluationData(apiData.data[0]);
		}
	};

	const handleNextClick = () => {
		setNavigatorDirection('forward');
		setActiveStep(4);
		setProgressPercent(40);
	};

	return (
		<>
			<div
				className="pain-assessment select-none"
				style={{ margin: '0px auto', width: '90%' }}>
				<MBodyPoints
					assessmentData={savedEvaluationData?.painAssessments || []}
					savedEvaluationData={savedEvaluationData}
					setSavedEvaluationData={setSavedEvaluationData}
					isLoading={isLoading}
					setIsLoading={setIsLoading}
				/>
			</div>
			<OnboardFooter onContinue={handleNextClick} />
		</>
	);
}
