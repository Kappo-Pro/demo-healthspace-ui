import React, { useEffect, useState } from 'react';
import { useTypedDispatch } from "@stores/index";
import { getProgramActivityStreamByData } from '@stores/activity/activityStream/activityStream';
import { ModalContentSkeleton } from '@atoms/Skeletons';
import { Flex, Modal, Typography } from "antd";
import { InfoCircle } from "@vitalflow-icons/general/infoCircle";
import { useTranslation } from "react-i18next";
import { FaceFrown } from '@vitalflow-icons/users/faceFrown';
import { FaceSad } from '@vitalflow-icons/users/faceSad';
import { FaceNeutral } from '@vitalflow-icons/users/faceNeutral';
import { FaceSmile } from '@vitalflow-icons/users/faceSmile';
import { FaceWink } from '@vitalflow-icons/users/faceWink';
import { FaceHappy } from '@vitalflow-icons/users/faceHappy';
import { ProgramSessionActivity } from '@types';
import './style.css'

const { Title, Text } = Typography;

export const ProgramSession = ({ id }: { id: string }) => {
  const { t } = useTranslation();
  const [programData, setProgramData] = useState<ProgramSessionActivity>();
  const dispatch = useTypedDispatch();

  useEffect(() => {
    const fetchData = async (id: string) => {
      const data = await dispatch(getProgramActivityStreamByData(id));
      setProgramData(data?.payload);
    };

    fetchData(id);
  }, [id, dispatch]);

  const CustomModalInfo = (props: { name: string; description: string; video: string }) => {
    const { name, description, video } = props;

    const modalContent = (
      <Flex vertical align="center" justify="center" className="modal-style">
        <video
          controls
          className="video"
          preload="metadata"
          src={video}
          width="100%"
          height="100%"
        />
        <div className="no-select-margin-top">
          <Title level={5}>{name}</Title>
          <Text>{description}</Text>
        </div>
      </Flex>
    );
    Modal.info({
      title: null,
      content: modalContent,
      maskClosable: true,
      icon: null,
      okButtonProps: { style: { display: 'none' } },
      closable: true
    });
  };

  if (!programData) {
    return <ModalContentSkeleton />;
  }
  const handleExtraHeader = (dataItems: ProgramSessionActivity) => {
    const getStatusComponent = () => {
      switch (dataItems?.overallCondition) {
        case "improving":
          return <span className='status status-improving'>{t('Admin.data.menu.patientDetail.aiAssistantListSessions.improving')}</span>
        case "worsening":
          return <span className='status status-worsening'>{t('Admin.data.menu.patientDetail.aiAssistantListSessions.worsening')}</span>
        case "noChange":
          return <span className='status status-nochange'>{t('Admin.data.menu.patientDetail.aiAssistantListSessions.noChange')}</span>
        default:
          return null;
      }
    };

    const painLevelData = {
      0: { color: 'text-cyan-500', icon: <FaceHappy color={'stroke-cyan-500'} width={20} height={20} /> },
      1: { color: 'text-green-700', icon: <FaceWink color={'stroke-green-700'} width={20} height={20} /> },
      2: { color: 'text-green-500', icon: <FaceSmile color={'stroke-green-500'} width={20} height={20} /> },
      3: { color: 'text-green-300', icon: <FaceSmile color={'stroke-green-300'} width={20} height={20} /> },
      4: { color: 'text-yellow-300', icon: <FaceNeutral color={'stroke-yellow-300'} width={20} height={20} /> },
      5: { color: 'text-yellow-400', icon: <FaceNeutral color={'stroke-yellow-400'} width={20} height={20} /> },
      6: { color: 'text-orange-300', icon: <FaceSad color={'stroke-orange-300'} width={20} height={20} /> },
      7: { color: 'text-orange-400', icon: <FaceSad color={'stroke-orange-400'} width={20} height={20} /> },
      8: { color: 'text-rose-500', icon: <FaceFrown color={'stroke-rose-500'} width={20} height={20} /> },
      9: { color: 'text-rose-600', icon: <FaceFrown color={'stroke-rose-600'} width={20} height={20} /> },
      10: { color: 'text-rose-700', icon: <FaceFrown color={'stroke-rose-700'} width={20} height={20} /> },
    };

    const getPainLevel = () => {
      const painLevelDataItem = painLevelData[dataItems?.painLevel];
      if (painLevelDataItem) {
        return (
          <Flex gap={8} className={painLevelDataItem.color}>
            <span className='text-sm font-semibold'>{dataItems?.painLevel}</span>
            {painLevelDataItem.icon}
          </Flex>
        );
      }
      return null;
    }

    const statusComponent = getStatusComponent()
    const painLevelComponent = getPainLevel()
    return (
      <Flex align="center" justify="flex-end" className="flex-1" onClick={(e) => e.stopPropagation()}>
        <Flex align="center" justify="center">
          <span className='custom-padding'>{statusComponent}</span>
          <span className='pain-level-icon-css'>{painLevelComponent}</span>
        </Flex>
      </Flex>
    )
  }

  return (
    <>
      <Flex justify="space-between" align="center" style={{ padding: 'var(--spacing-2)' }}>
        <p className=''><b>{t('Admin.data.menu.patientDetail.aiAssistantPrograms.programName')} :</b> {programData?.program?.name}</p>
        <Paragraph>{handleExtraHeader(programData)}</Paragraph>
      </Flex>
      <Flex wrap="wrap">
      {programData?.programSessionResult?.map((item) => (
        <div key={item.id} className="video-item">
          <div className='video-id' key={item.id}>
            <video
              controls
              className="video rounded-md"
              preload="metadata"
              src={item?.video}
              width="100%"
              height="100%"
            />
            <span
              className="custom-modal"
              onClick={() => CustomModalInfo({
                video: item?.programExercise?.exerciseLibrary?.videoUrl || item?.programExercise?.strapiExercise?.assets[0]?.video?.data?.url,
                name: item?.programExercise?.exerciseLibrary?.title || item?.programExercise?.strapiExercise?.name,
                description: item?.programExercise?.exerciseLibrary?.description || item?.programExercise?.strapiExercise?.description,
              })}
            >
              <InfoCircle width={17} height={17} color="stroke-gray-700" />
            </span>
            <Flex justify="space-between" className="custom-name-container">
              <span>{item?.programExercise?.exerciseLibrary?.title || item?.programExercise?.strapiExercise?.name}</span>
            </Flex>
          </div>
        </div>
      ))}
      </Flex>
    </>
  );
};
