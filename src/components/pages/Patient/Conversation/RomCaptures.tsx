import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { Checkbox, Empty, Flex, Space, Spin, Tag } from 'antd';
import { useEffect, useState } from 'react';
import {
  getCoach,
  selectImageToCompare} from '@stores/activity/contacts/contacts';
import RomCaptureResult from './RomCaptureResult';
import { AddToReports } from '@atoms/AddToReports';
import { addReportId, deleteReportId, updateReportIds } from '@stores/content/report/reports';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useTranslation } from 'react-i18next';

const config = {
  data: [],
  padding: 'auto',
  xField: 'date',
  yField: 'ROM',

  tooltip: {
    customContent: (title: unknown, data: unknown[]) => {
      const exerciseData = data[0];
      return `<div class="tipChart">
            <div class="date">${title}</div>
            <div class="value">${exerciseData?.data.ROM}°</div>
            <div class="printscreen"><img width="300px" src='${exerciseData?.data.printScreen}' /></div>
          </div>`;
    },
  },
  label: {
    formatter: (datum: { ROM: string; }) => {
      return datum.ROM + '°';
    },
  },
  xAxis: { tickCount: 10 },
  point: {
    size: 5,
    shape: 'diamond',
    style: {
      fill: 'var(--surface-primary)',
      stroke: 'var(--color-info-500)',
      lineWidth: 2,
    },
  },
  meta: {
    ROM: {
      min: 0,
      max: 180,
    },
  },
  slider: {
    start: 0.0,
    end: 1,
  },
};

export const RomCaptures = () => {
  const { t } = useTranslation();
  const dispatch = useTypedDispatch();
  const { user, selectedUser, coach, gallery, reportIds } =
    useTypedSelector((state) => ({
      user: state.user,
      selectedUser: state.contacts.main.selectedUser,
      coach: state.contacts.main.coach,
      gallery: state.contacts.main.gallery,
      reportIds: state.reports.reportIds
    }));
  const [isLoading, setIsLoading] = useState(true);

  const onSelectImage = (index: number, id: string) => {
    dispatch(selectImageToCompare({ index, id, gallery }));
  };
  const isReportModal =  useTypedSelector(state => state.patientDetail.patientDetail.isReportModal)

  const handleChange = (e: CheckboxChangeEvent, exerciseId: string) => {
    const { checked } = e.target;

    if (checked) {
      const newRomResultsIds = [
        ...reportIds.romResultsIds,
        ...coach
          .filter((dataItem: { strapiOmniRomExerciseId: string }) => dataItem.strapiOmniRomExerciseId === exerciseId)
          .map((filteredItem: { id: string }) => filteredItem.id),
      ];

      dispatch(updateReportIds({ type: "romResultsIds", ids: newRomResultsIds }));
      dispatch(addReportId({ type: "exercisesSelectedRows", id: exerciseId }));
    } else {
      const updatedRomResultsIds = reportIds.romResultsIds.filter(
        (value) => !coach.some(
          (dataItem: { id: string, strapiOmniRomExerciseId: string }) => dataItem.strapiOmniRomExerciseId === exerciseId && dataItem.id === value
        )
      );

      dispatch(updateReportIds({ type: "romResultsIds", ids: updatedRomResultsIds }));
      dispatch(deleteReportId({ type: "exercisesSelectedRows", id: exerciseId }));
    }
  };

  const extraContentCaptureCollapse = (exerciseId: string, total: number) => {
    return (
      <Space>
        <Tag color="var(--color-purple-500)">{total}</Tag>
        <div
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <Checkbox
            checked={reportIds.exercisesSelectedRows.includes(exerciseId)}
            onChange={(event) => handleChange(event, exerciseId)}
            disabled={total === 0}
          />
        </div>
      </Space>
    );
  };

  useEffect(() => {
    dispatch(getCoach(user.isPhysioterapist ? selectedUser.id : user.id)).then(
      () => setIsLoading(false),
    );
  }, [selectedUser, user, dispatch]);

  return (
    <div className={'pl-5 pr-5'}>
      {isLoading ? (
        <Flex align="center" justify="center">
          <Spin
          
            size="large"
           />
        </Flex>
      ) : (
        <>
          <div>
            {coach?.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-gray-300">{t('Patient.data.vitalscan-rom.noCapturesFound')}</span>
                }
              />
            ) : (<>
            {!isReportModal && <div className="lower-content-container">
                <AddToReports />
              </div>}
              <div className='collapse-subpanel-wrap'>
              <RomCaptureResult extraContentCaptureCollapse={extraContentCaptureCollapse} config={config} onSelectImage={onSelectImage} />
              </div>
            </>)}
          </div>
        </>
      )}
    </div>
  );
};
