import { BulkUpload } from '@pages/StartScan/BulkUpload';
import CreateRomModal from '@pages/StartScan/OCreateRomModal';
import { getCustomRomList } from '@stores/clinical/rom/customRom';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { CustomRom, CustomRomExercise } from '@types';
import { Button, Card, Empty, Pagination, Spin, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomRomDataItem } from './CustomRomDataItem';
import { USER_ROLES } from '@stores/constants';

const { Paragraph } = Typography;

interface RomCustomOptionsProps {
	isLoading: boolean;
	refresh: boolean;
	setRefresh: (refresh: boolean) => void;
	setLoading: (value: boolean) => void;
	setRomModalOpen: (value: boolean) => void;
	setShowRomSplash: (value: boolean) => void;
}

const ROM_PREVIEW_BASE_URL =
	'https://risecxlibrary.blob.core.windows.net/rom-preview/cards';

export default function CustomOptionsList(props: RomCustomOptionsProps) {
	const {
		isLoading,
		setLoading,
		refresh,
		setRefresh,
		setRomModalOpen,
		setShowRomSplash,
	} = props;
	const user = useTypedSelector(state => state.user);
	const isUser = user.profile.role === USER_ROLES.USER;
	const [programData, setProgramData] = useState<CustomRom[]>();
	const [page, setPage] = useState<number>(1);
	const [isCustomScanModalOpen, setCustomScanModalOpen] = useState(false);
	const [activeKey, setActiveKey] = useState<string>('1');
	const [subActiveKey, setSubActiveKey] = useState<string>('1');
	
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const customRom = useTypedSelector(state => state.rom.customRom.customRom);
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();

	useEffect(() => {
		setLoading(true);
		fetchHomeData(page);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, selectedUser, refresh]);

	useEffect(() => setProgramData(customRom.data), [customRom, refresh]);

	const updateProgramExercises = (
		id: string,
		exercises: CustomRomExercise[],
	) => {
		setProgramData(prevProgramData =>
			prevProgramData?.map(program =>
				program.id === id ? { ...program, exercises } : program,
			),
		);
	};

	const fetchHomeData = async (pageNumber: number) => {
		setPage(pageNumber);
		const payload = {
			userId: user.isPhysioterapist ? selectedUser?.id : user?.id,
			limit: 10,
			page: pageNumber,
			searchValue: '',
		};
		await dispatch(getCustomRomList(payload));
		setLoading(false);
	};

	return (
		<div>
			<div>
				<Tabs
  defaultActiveKey="romProgram"
  style={{ paddingLeft: 20, paddingRight: 20 }}
  items={[
    {
      key: 'romProgram',
      label: t('Patient.data.vitalscan-rom.romProgramTitle'),
      children: isLoading ? (
        <Spin
          style={{
            padding: 'var(--spacing-2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          tip="Loading"
          size="large"
        />
      ) : (
        <>
          {programData?.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-300">
                  {t('Patient.data.vitalscan-rom.noProgramsFound')}
                </span>
              }
            />
          ) : (
            <div style={{ marginTop: 12 }}>
              {programData?.map(program => (
                <CustomRomDataItem
                  key={program.id}
                  updateProgramExercises={exercises =>
                    updateProgramExercises(program.id, exercises)
                  }
                  program={program}
                  setRefresh={setRefresh}
                  refresh={refresh}
                  setRomModalOpen={setRomModalOpen}
                  setShowRomSplash={setShowRomSplash}
                />
              ))}
            </div>
          )}

          {customRom?.data?.length !== 0 && (
            <Pagination
              current={customRom?.pagination?.currentPage}
              showSizeChanger={false}
              onChange={fetchHomeData}
              total={customRom?.pagination?.totalCount}
            />
          )}
        </>
      ),
    },

    // ✅ BOTH tabs only when !isUser
    ...(!isUser
      ? [
          {
            key: 'bulkUpload',
            label: t('Patient.data.vitalscan-rom.bulkUpload'),
            children: <BulkUpload />,
          },
          {
            key: 'customScan',
            label: t('Patient.data.dashboardScreen.createCustomScan'),
            children: (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  padding: 'var(--spacing-8)',
                }}>
                <Card
                  hoverable
                  style={{
                    width: 400,
                    minHeight: 500,
                    backgroundImage: `url('/images/dashboard/vitalscan-rom-dashboard.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                  }}
                  onClick={() => setCustomScanModalOpen(true)}
                  bodyStyle={{
                    padding: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                  }}>
                  <div className="start-scan-card-content-container">
                    <img src="/images/dashboard/custom-rom.svg" alt="Custom ROM" />
                    <Button
                      size="large"
                      onClick={e => {
                        e.stopPropagation();
                        setCustomScanModalOpen(true);
                      }}>
                      {t('Patient.data.dashboardScreen.createCustomScan')}
                    </Button>
                  </div>
                </Card>
              </div>
            ),
          },
        ]
      : []),
  ]}
/>

			</div>

			<CreateRomModal
				isVisible={isCustomScanModalOpen}
				onCancel={() => setCustomScanModalOpen(false)}
				refresh={refresh}
				setRefresh={setRefresh}
				activeKey={activeKey}
				setActiveKey={setActiveKey}
				subActiveKey={subActiveKey}
				setSubActiveKey={setSubActiveKey}
			/>
		</div>
	);
}
