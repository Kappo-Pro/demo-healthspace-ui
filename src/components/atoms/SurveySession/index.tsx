import React, { useEffect, useState } from 'react';
import { useTypedDispatch } from "@stores/index";
import { getSurveyActivityStreamByData } from '@stores/activity/activityStream/activityStream';
import { ModalContentSkeleton } from '@atoms/Skeletons';
import { Empty, Flex, Typography } from 'antd';

const { Paragraph } = Typography;
import { useTranslation } from "react-i18next";
import { SurveyResult, SurveyQuestion, SurveyResultQuestionList } from '@types';
import { FaceSad } from '@vitalflow-icons/users/faceSad';
import { FaceFrown } from '@vitalflow-icons/users/faceFrown';
import { FaceNeutral } from '@vitalflow-icons/users/faceNeutral';
import { FaceSmile } from '@vitalflow-icons/users/faceSmile';
import { FaceHappy } from '@vitalflow-icons/users/faceHappy';
import './style.css'
import { FaceWink } from '@vitalflow-icons/users/faceWink';

export const SurveySession = ({ id }: { id: string }) => {
  const { t } = useTranslation();
  const [surveyData, setSurveyData] = useState<SurveyResult | null>(null);
  const dispatch = useTypedDispatch();
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async (id: string) => {
      setLoading(true)
      const data = await dispatch(getSurveyActivityStreamByData(id));
      setSurveyData(data?.payload);
      setLoading(false)
    };

    fetchData(id);
  }, [id, dispatch]);

  const getPainLevel = (painLevel: number, question: SurveyResultQuestionList) => {
    switch (painLevel) {
      case 1:
        return (
          <Flex gap={8}>
            <FaceFrown color={'stroke-rose-700'} width={20} height={20} />
            <span className='text-sm font-semibold text-rose-700'>{question?.selectedAnswer}</span>
          </Flex>
        );
      case 2:
        return (
          <Flex gap={8}>
            <FaceFrown color={'stroke-rose-500'} width={20} height={20} />
            <span className='text-sm font-semibold text-rose-500'>{question?.selectedAnswer}</span>
          </Flex>
        );
      case 3:
        return (
          <Flex gap={8}>
            <FaceSad color={'stroke-orange-400'} width={20} height={20} />
            <span className='text-sm font-semibold text-orange-400'>{question?.selectedAnswer}</span>
          </Flex>
        );
      case 4:
        return (
          <Flex gap={8}>
            <FaceSad color={'stroke-orange-300'} width={20} height={20} />
            <span className='text-sm font-semibold text-orange-300'>{question?.selectedAnswer}</span>
          </Flex>
        );
      case 5:
        return (
          <Flex gap={8}>
            <FaceNeutral color={'stroke-yellow-400'} width={20} height={20} />
            <span className='text-sm font-semibold text-yellow-400'>{question?.selectedAnswer}</span>
          </Flex>
        );
      case 6:
        return (
          <Flex gap={8}>
            <FaceNeutral color={'stroke-yellow-300'} width={20} height={20} />
            <span className='text-sm font-semibold text-yellow-300'>{question?.selectedAnswer}</span>
          </Flex>
        );
      case 7:
        return (
          <Flex gap={8}>
            <FaceSmile color={'stroke-green-300'} width={20} height={20} />
            <span className='text-sm font-semibold text-green-300'>{question?.selectedAnswer}</span>
          </Flex>
        );
      case 8:
        return (
          <Flex gap={8}>
            <FaceSmile color={'stroke-green-500'} width={20} height={20} />
            <span className='text-sm font-semibold text-green-500'>{question?.selectedAnswer}</span>
          </Flex>
        );
      case 9:
        return (
          <Flex gap={8}>
            <FaceWink color={'stroke-green-700'} width={20} height={20} />
            <span className='text-sm font-semibold text-green-700'>{question?.selectedAnswer}</span>
          </Flex>
        );
      case 10:
        return (
          <Flex gap={8}>
            <FaceHappy color={'stroke-cyan-500'} width={20} height={20} />
            <span className='text-sm font-semibold text-cyan-500'>{question?.selectedAnswer}</span>
          </Flex>
        );
      default:
        return null;
    }
  }

  let totalScore = 0;
  surveyData?.questionList?.forEach((question: SurveyQuestion) => {
    totalScore += question.score || 0;
  });

  return (
    <>
      {loading ? <ModalContentSkeleton /> :
        <>
          {!surveyData || Object.keys(surveyData).length === 0 ?
            <Empty className='empty' image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className='text-gray-300'>{t('Admin.data.survey.noResult')}</span>} /> :
            <Flex vertical>
              <Flex justify="space-between" style={{ marginBottom: 'var(--spacing-4)' }}>
                <Flex gap={8} style={{ padding: 'var(--spacing-2)' }}>
                  <p className=''><b>{t('Admin.data.survey.surveyName')} :</b> {surveyData?.title}</p>
                </Flex>
                <Flex gap={8} align="center" justify="center">
                  {totalScore !== 0 &&
                    <Paragraph className="survey-total-score">{t('Admin.data.survey.score')}: {totalScore}</Paragraph>
                  }
                </Flex>
              </Flex>
              {surveyData?.questionList?.map((question: SurveyQuestion, index: number) => (
                <div key={index} className="survey-container">
                  <Flex justify="space-between">
                    <Paragraph className="question">{index + 1} - {question.question}</Paragraph>
                    {question.score !== null &&
                      <Paragraph className="score">{question.score}</Paragraph>
                    }
                  </Flex>
                  <hr />
                  {question.answerList.length === 0 && question.questionType === 'rate' ? (
                    <Paragraph>{question.ratingLevel ? getPainLevel(question.ratingLevel, question) : null}</Paragraph>
                  ) : question.answerList.length > 0 && question.questionType !== 'rate' ? (
                    <ul>
                      {question.answerList.map((answer: string, aIndex: number) => (
                        <li key={aIndex} className="select-answer">- {answer}</li>
                      ))}
                    </ul>
                  ) : (
                    <ul>
                      <li className="select-answer">- {question.selectedAnswer}</li>
                    </ul>
                  )}
                </div>
              ))}
            </Flex>
          }</>}
    </>
  );
};
