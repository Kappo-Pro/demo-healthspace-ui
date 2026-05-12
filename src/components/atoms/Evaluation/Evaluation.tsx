import { EvaluationDataItem } from '@atoms/EvaluationDataItem';
import { getEvaluationActivityStreamById } from '@stores/activity/activityStream/activityStream';
import { useTypedDispatch } from '@stores/index';
import { TDataProps } from '@types';
import { ModalContentSkeleton } from '@atoms/Skeletons';
// REMOVED: import { Spin } from "antd";
import './style.css';
import { useEffect, useState } from 'react';

export const Evaluation = ({ evaluationId }: { evaluationId: string }) => {
	const [evaluationData, setEvaluationData] = useState<
		TDataProps | undefined
	>();
	const dispatch = useTypedDispatch();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async (evaluationId: string) => {
			const action = await dispatch(
				getEvaluationActivityStreamById({ evaluationId }),
			);
			setEvaluationData(action.payload);
			setLoading(false);
		};

		fetchData(evaluationId);
	}, [evaluationId, dispatch]);

	if (loading) {
		return <ModalContentSkeleton />;
	}

	if (!evaluationData) {
		return null;
	}

	return <EvaluationDataItem evaluationData={evaluationData} />;
};
