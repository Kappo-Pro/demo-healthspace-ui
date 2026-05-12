import { Col, Collapse, Row, Tabs, Image, Modal, Spin } from 'antd';
import moment from 'moment';
import { lazy, Suspense, useEffect, useState } from 'react';

// Lazy load the heavy chart library
const Line = lazy(() => import('@ant-design/charts').then(m => ({ default: m.Line })));
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setGalleryImages } from '@stores/activity/contacts/contacts';
import { useTranslation } from 'react-i18next';
import { UntitledIcon } from '@atoms/Icon';
import ReactCompareImage from 'react-compare-image';
import { RomCaptureResultProps } from '@types';
import '../../Contacts/Contacts.css';


export default function RomCaptureResult(props: RomCaptureResultProps) {
  const { aiAssistant, extraContentCaptureCollapse, config, onSelectImage } = props
  const dispatch = useTypedDispatch();
  const { t } = useTranslation();
  const [compareImage, setCompareImage] = useState(false);
  const { coach, exercises, gallery } =
    useTypedSelector((state) => ({
      coach: state.contacts.main.coach,
      exercises: state.contacts.main.exercises,
      gallery: state.contacts.main.gallery
    }));

  const showCompare = () => setCompareImage(!compareImage);

  const headerCaptureCollapse = (label: string | React.ReactNode) => {
    return <>{label}</>;
  };

  useEffect(() => {
    dispatch(setGalleryImages({ exercises, coach }));
  }, [exercises, coach, dispatch]);

  return (
    <Collapse
      className={`select-none ${aiAssistant ? 'bg-white' : 'bg-gray-50'
        } py-0.5`}
      bordered={false}
    >
      {exercises?.map((exercise, index: number) => {
        const dataItems = coach?.filter(
          (dataItem) => dataItem?.strapiOmniRomExerciseId === exercise?.id,
        );
        config.data = dataItems?.map((item) => {
          const DateUtc = moment(item.createdAt)
            .local()
            .format('LLL');
          return {
            date: DateUtc,
            ROM: item.value,
            printScreen: item.screenshot,
          };
        });

        return (
          dataItems?.length > 0 &&
          exercise?.name && (
            <Collapse.Panel
              className="header-panel bg-white !border !border-gray-200 !rounded-xl mt-2"
              header={headerCaptureCollapse(exercise?.name)}
              key={`panel-${index}`}
              extra={extraContentCaptureCollapse(
                exercise?.id,
                dataItems?.length,
              )}
            >
              <Tabs
                type="card"
                className="rounded-lg m-5"
                defaultActiveKey="1"
                items={[
                  {
                    label: t('patient.progress.omniRom.chart'),
                    key: '1',
                    children: (
                      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}><Spin size="large"  /></div>}>
                        <Line {...config} />
                      </Suspense>
                    ),
                  },
                  {
                    label: t(
                      'Patient.data.myProgress.omniRom.screenshots',
                    ),
                    key: '2',
                    children: (
                      <div style={{ marginTop: 'var(--spacing-5)' }}>
                        {gallery?.exerciseImages?.length > 0 && (
                          <div
                            className={`gallery-top ${gallery.imagesToCompare.length === 2
                              ? 'active'
                              : ''
                              }`}

                          >
                            <button
                              disabled={
                                gallery.imagesToCompare.length < 2
                              }
                              className={`btn-compare ${gallery.imagesToCompare.length === 2
                                ? 'active'
                                : ''
                                }`}
                              onClick={showCompare}
                            >
                              {t('patient.progress.omniRom.compare')}
                            </button>
                          </div>
                        )}
                        <Row gutter={[14, 8]}>

                          {Object.keys(gallery?.images).length &&
                            gallery?.images[
                            dataItems[0]?.strapiOmniRomExerciseId
                            ] &&
                            gallery?.images[
                              dataItems[0]?.strapiOmniRomExerciseId
                            ].map((gImage, index: number) => {
                              const DateUtc = moment(gImage?.date)
                                .local()
                                .format('LLL');
                              return (
                                <Col
                                  key={`col-${index}`}
                                  xs={{ span: 12 }}
                                  sm={{ span: 12 }}
                                  lg={{ span: 5 }}
                                  xxl={{ span: 5 }}
                                >
                                  <div className="screenshot tipChart">
                                    <Image
                                      className={
                                        gImage.isSelected
                                          ? 'active'
                                          : ''
                                      }
                                      className="object-contain"
                                      width="100%"
                                      height={125}
                                      src={gImage.src}
                                      preview={{
                                        src: gImage.src,
                                        mask: (
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <UntitledIcon name="eye" size={18} />
                                          </div>
                                        ),
                                        width: "auto",
                                        height: "auto"
                                      }}
                                    />
                                    <UntitledIcon
                                      name="checkCircleFilled"
                                      size={20}
                                      className={
                                        gImage.isSelected
                                          ? 'select-icon active'
                                          : 'select-icon'
                                      }
                                      onClick={onSelectImage.bind(
                                        this,
                                        index,
                                        gImage?.exercise?.id,
                                      )}
                                    />
                                    <div className="date">
                                      {DateUtc}
                                    </div>
                                    <div className="value">
                                      {gImage.result}°
                                    </div>
                                  </div>
                                </Col>
                              );
                            })}
                        </Row>
                        {compareImage && (

                          <Modal
                            title={t(
                              'Patient.data.myProgress.omniRom.compareImages',
                            )}
                            open={compareImage}
                            onOk={showCompare}
                            onCancel={showCompare}
                            className="gallery-modal"
                            centered
                            width="60%"
                          >
                            <div className="screen-gallery">
                              <ReactCompareImage
                                className="gallery-compare"
                                leftImage={
                                  gallery.imagesToCompare[0]?.src
                                }
                                rightImage={
                                  gallery.imagesToCompare[1]?.src
                                }
                                leftImageLabel={
                                  moment(
                                    gallery.imagesToCompare[0]?.date,
                                  )
                                    .local()
                                    .format('LLL') +
                                  t(
                                    'Patient.data.myProgress.omniRom.result',
                                  ) +
                                  gallery.imagesToCompare[0]?.result +
                                  '°'
                                }
                                rightImageLabel={
                                  moment(
                                    gallery.imagesToCompare[1]?.date,
                                  )
                                    .local()
                                    .format('LLL') +
                                  t(
                                    'Patient.data.myProgress.omniRom.result',
                                  ) +
                                  gallery.imagesToCompare[1]?.result +
                                  '°'
                                }
                              />
                            </div>
                          </Modal>
                        )}
                      </div>
                    ),
                  },
                ]}
              ></Tabs>
            </Collapse.Panel>
          )
        );
      })}
    </Collapse>
  )
}
