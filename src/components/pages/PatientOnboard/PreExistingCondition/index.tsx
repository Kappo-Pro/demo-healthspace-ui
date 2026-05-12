import {
	CONTENT_MANAGER_MOCK_DATA,
	PRE_DEFAULT_QUESTIONS,
} from '@constants/plans';
import { OnboardFooter } from '@molecules/OnboardFooter';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { IPreExistingConditions } from '@stores/interfaces';
import { updatePreExistingConditionAgree } from '@stores/shared/onBoard/onBoard';
import { TOnBoardSymptomsProps } from '@types';
import { Checkbox } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './style.css';

const DEFAULT_TITLE = CONTENT_MANAGER_MOCK_DATA.preExistingConditions.title;

const DEFAULT_QUESTIONS = PRE_DEFAULT_QUESTIONS;

const DEFAULT_THUMBNAIL =
	CONTENT_MANAGER_MOCK_DATA.preExistingConditions.thumbnail;
const PreExistingConditions = (props: TOnBoardSymptomsProps) => {
	const { setActiveStep, setProgressPercent, setNavigatorDirection } = props;
	const { t } = useTranslation();
	const [isChecked, setIsChecked] = useState(false);
	const user = useTypedSelector(state => state.user);
	const dispatch = useTypedDispatch();
	const selectedUser = useTypedSelector(
		state => state.contacts.main.selectedUser,
	);
	const preExistingConditionAgree = useTypedSelector(
		state => state.onBoard.onBoard.preExistingConditionAgree,
	);
	const [preExistingConditionsData, setPreExistingConditionsData] =
		useState<IPreExistingConditions>();
	const preExistingConditions = useTypedSelector(
		state => state.settings.content.preExistingConditions,
	);

	useEffect(() => {
		setPreExistingConditionsData({
			...preExistingConditionsData,
			title: preExistingConditions?.title
				? preExistingConditions?.title
				: DEFAULT_TITLE,
			description: preExistingConditions?.description
				? preExistingConditions?.description
				: DEFAULT_QUESTIONS,
			thumbnail: preExistingConditions?.thumbnail
				? preExistingConditions?.thumbnail
				: DEFAULT_THUMBNAIL,
		});
	}, [preExistingConditions]);

	useEffect(() => {
		if (
			user?.profile?.preExistingConditionsRead ||
			selectedUser?.profile?.preExistingConditionsRead
		) {
			setIsChecked(true);
		} else if (preExistingConditionAgree) {
			setIsChecked(true);
		}
	}, []);

	const handleNextClick = async () => {
		const id = user?.id || selectedUser?.id;
		const savedData = await dispatch(updatePreExistingConditionAgree(id));
		if (savedData.payload) {
			setNavigatorDirection('forward');
			if (setActiveStep) {
				setActiveStep(6);
			}
			setProgressPercent(60);
		}
	};

	const splitDescriptionHtml = (htmlString: string): string[] => {
		if (!htmlString) return [];

		return htmlString
			.split(/<\/p>/i) // split each paragraph
			.map(item => item.replace(/<p>/i, '').trim()) // remove <p>
			.filter(Boolean); // remove empty items
	};

	return (
		<div className="pre-existing-wrapper">
			<div
				className="pre-existing-card"
				style={{
					position: 'relative',
					backgroundImage: `url(${preExistingConditionsData?.thumbnail})`,
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center',
					borderRadius: 12,
					overflow: 'hidden',
				}}>
				{/* Background opacity overlay */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.45)', // control opacity here
						zIndex: 1,
					}}
				/>

				{/* Content */}
				<div
					className="pre-existing-container"
					style={{
						position: 'relative',
						zIndex: 2,
					}}>
					<div className="pre-existing-questions">
						{typeof preExistingConditionsData?.description === 'string'
							? splitDescriptionHtml(preExistingConditionsData.description).map(
									(item, index) => (
										<div key={index} className="pre-existing-question-card">
											<p className="pre-existing-question-text">{item}</p>
										</div>
									),
								)
							: preExistingConditionsData?.description?.map((item, index) => (
									<div key={index} className="pre-existing-question-card">
										<p className="pre-existing-question-text">{item}</p>
									</div>
								))}
					</div>

					<div className="pre-existing-acknowledge">
						<Checkbox
							checked={isChecked}
							onChange={e => setIsChecked(e.target.checked)}
							className="pre-existing-checkbox">
							<span className="pre-existing-checkbox-label">
								{preExistingConditionsData?.title}
							</span>
						</Checkbox>
					</div>
				</div>
			</div>

			<OnboardFooter onContinue={handleNextClick} disabled={!isChecked} />
		</div>
	);
};

export default PreExistingConditions;
