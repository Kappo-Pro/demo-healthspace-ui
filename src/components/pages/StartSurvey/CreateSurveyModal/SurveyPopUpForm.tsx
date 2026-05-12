import { UntitledIcon } from '@atoms/Icon';
import { SurevyPopupFormProps } from '@types';
import { Button, Input, Select, Typography, message } from 'antd';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

const { Option } = Select;
const { TextArea } = Input;

export default function SurveyPopUpForm(props: SurevyPopupFormProps) {
	const {
		survey,
		setImgFile,
		imgFile,
		surveyTitle,
		surveyInstructions,
		setSurveyInstructions,
		surveyResultFeedback,
		setSurveyResultFeedback,
		setSurveyTitle,
		surveyDescription,
		setSurveyDescription,
		questionValue,
		setQuestionValue,
		setQuestionType,
		questionType,
		setQuestionList,
		questionList,
	} = props;
	const { t } = useTranslation();
	const imgInputRef = useRef<HTMLInputElement>(null);
	const [imgHover, setImgHover] = useState(false);
	const [idCounter, setIdCounter] = useState(1);
	const [isScored, setIsScored] = useState(false);

	const handleClickScore = () => {
		setIsScored(!isScored);
	};

	const handleImgChange = (e: { target: { files: unknown } }) => {
		const files = e.target.files;
		message.success(t('patient.activity.imageSelected'));
		if (files[0]) {
			setImgFile([files[0]]);
		}
	};

	const handleQuestion = () => {
		if (!questionValue.trim()) {
			message.warning(t('Admin.data.survey.errQuestionTitle'));
			return;
		}
		if (!questionType) {
			message.warning(t('Admin.data.survey.errQuestionTitle'));
			return;
		}
		const newQuestion = {
			id: idCounter.toString(),
			title: questionValue,
			description: 'Description',
			questionType: questionType,
			scored: isScored,
		};
		setQuestionList([...questionList, newQuestion]);
		setQuestionValue('');
		setQuestionType(undefined);
		setIdCounter(idCounter + 1);
	};

	return (
		<div className="survey-popup-form">
			<div className="image-upload imageUpload">
				{!survey?.id ? (
					<label
						className="image-upload-label"
						onMouseOver={() => setImgHover(true)}
						onMouseOut={() => setImgHover(false)}>
						<input
							type="file"
							accept="image/*"
							className="hidden"
							ref={imgInputRef}
							onChange={handleImgChange}
						/>
						{survey?.image ? (
							<div className="image-preview">
								<div
									style={{
										opacity: imgHover ? 1 : 0,
										transition: 'opacity 0.3s ease',
									}}
									className="image-hover">
									<span className="text">
										{t('Admin.data.survey.changeImage')}
									</span>
								</div>
								<img
									src={
										imgFile?.[0]
											? URL.createObjectURL(imgFile[0])
											: survey?.image
									}
									className="image"
								/>
							</div>
						) : (
							<div className="upload-placeholder">
								<div
									style={{ opacity: imgHover ? 100 : 0 }}
									className={`image-hover`}>
									<span className="text">
										{imgFile?.[0]
											? t('Admin.data.survey.changeImage')
											: survey?.image
												? t('Admin.data.survey.upload')
												: null}
									</span>
								</div>
								{!imgFile?.[0] ? (
									<div className="upload-instructions">
										<UntitledIcon name="upload" size={50} />
										<Paragraph>{t('Admin.data.survey.uploadImage')}</Paragraph>
									</div>
								) : (
									<>
										<img
											src={URL.createObjectURL(imgFile[0])}
											width={150}
											style={{ borderRadius: '12px' }}
										/>
									</>
								)}
							</div>
						)}
					</label>
				) : (
					<label className="image-upload-label">
						{survey?.image ? (
							<div className="image-preview">
								<img
									src={
										imgFile?.[0]
											? URL.createObjectURL(imgFile[0])
											: survey?.image
									}
									className="image"
								/>
							</div>
						) : (
							<div className="upload-placeholder">
								{!imgFile?.[0] ? (
									<div className="upload-instructions">
										<UntitledIcon name="upload" size={50} />
										<Paragraph>{t('Admin.data.survey.uploadImage')}</Paragraph>
									</div>
								) : (
									<>
										<img
											src={URL.createObjectURL(imgFile[0])}
											width={150}
											style={{ borderRadius: '12px' }}
										/>
									</>
								)}
							</div>
						)}
					</label>
				)}
				<div className="hearder-input-div">
					<Paragraph className="header-title-css">
						{t('Admin.data.survey.surveyTitle')}
					</Paragraph>
					<Input
						className="survey-title"
						value={surveyTitle}
						readOnly={survey?.clinicallyValidated}
						onChange={e => setSurveyTitle(e.target.value)}
					/>
					<Paragraph className="header-title-css">
						{t('Admin.data.survey.surveyDescription')}
					</Paragraph>
					{survey?.clinicallyValidated ? (
						<TextArea
							className="survey-title"
							value={surveyDescription}
							readOnly
							autoSize={{ minRows: 1.6, maxRows: 5 }}
						/>
					) : (
						<TextArea
							className="survey-title"
							value={surveyDescription}
							onChange={e => setSurveyDescription(e.target.value)}
							readOnly={survey?.clinicallyValidated}
							autoSize={{ minRows: 1.6, maxRows: 5 }}
						/>
					)}
				</div>
			</div>
			<div className="custom-outer-div">
				<div className="inner-outer-div">
					<Paragraph className="header-title-css">
						{t('Admin.data.survey.surveyInstructions')}
					</Paragraph>
					{survey?.clinicallyValidated ? (
						<TextArea
							className="survey-title"
							value={surveyInstructions}
							autoSize={{ minRows: 5, maxRows: 5 }}
							readOnly
						/>
					) : (
						<TextArea
							className="survey-title"
							value={surveyInstructions}
							onChange={e => setSurveyInstructions(e.target.value)}
							autoSize={{ minRows: 5, maxRows: 5 }}
						/>
					)}
				</div>
				<div className="inner-outer-div">
					<Paragraph className="header-title-css">
						{t('Admin.data.survey.surveyResultFeedback')}
					</Paragraph>
					{survey?.clinicallyValidated ? (
						<TextArea
							className="survey-title"
							value={surveyResultFeedback}
							autoSize={{ minRows: 5, maxRows: 5 }}
							readOnly
						/>
					) : (
						<TextArea
							className="survey-title"
							value={surveyResultFeedback}
							autoSize={{ minRows: 5, maxRows: 5 }}
							onChange={e => setSurveyResultFeedback(e.target.value)}
						/>
					)}
				</div>
			</div>

			{!survey?.clinicallyValidated && (
				<>
					<Paragraph className="header-title-css">
						{t('Admin.data.survey.questionTitle')}
					</Paragraph>
					<div className="question-section">
						<Input
							className="question-input"
							style={{ height: 42 }}
							value={questionValue}
							onChange={e => setQuestionValue(e.target.value)}
							className="w-full"
						/>
						<div className="select-container" style={{ marginTop: 0 }}>
							<div className="select-wrapper">
								<div className="select-row">
									{questionType != 'openText' && (
										<span
											onClick={handleClickScore}
											className={`score-btn ${isScored ? 'active' : ''}`}>
											{isScored
												? t('Admin.data.survey.scored')
												: t('Admin.data.survey.unscored')}
										</span>
									)}
									<Select
										className="question-type-select"
										bordered={false}
										onChange={value => setQuestionType(value)}
										value={questionType}
										placeholder={t('Admin.data.survey.type')}>
										<Option value="rate">
											<span className="rate-option-span">
												<UntitledIcon name="face-smile" size={20} />{' '}
											</span>
											{t('Admin.data.survey.rate')}
										</Option>
										<Option value="singleSelect">
											<span className="rate-option-span">
												<UntitledIcon name="layerSingle" size={20} />{' '}
											</span>
											{t('Admin.data.survey.singleSelect')}
										</Option>
										<Option value="multiSelect">
											<span className="rate-option-span">
												<UntitledIcon name="layerThree" size={20} />{' '}
											</span>
											{t('Admin.data.survey.multiSelect')}
										</Option>
										<Option value="openText">
											<span className="rate-option-span">
												<UntitledIcon name="clipboard-check" size={20} />{' '}
											</span>
											{t('Admin.data.survey.openText')}
										</Option>
									</Select>
									<Button
										onClick={handleQuestion}
										size="large"
										style={{ height: 42 }}>
										<UntitledIcon name="plus" size={20} />
										{t('Admin.data.survey.add')}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
