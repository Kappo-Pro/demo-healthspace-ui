import { Button, Flex, Typography } from 'antd';

const { Paragraph } = Typography;
import { UserListSkeleton } from '@atoms/Skeletons';
import { Avatar, Empty, Input, message, Modal, Pagination } from 'antd';
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { UntitledIcon } from '@atoms/Icon';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { ArrowLeft } from '@vitalflow-icons/arrows/arrowLeft';
import './AssignedPTModal.css'
import { getAllAdmin, savePhysiotherapistToPatient, updateShowPopStatus } from '@stores/patients/admin/adminPatient';
import { getUserById } from '@stores/activity/contacts/contacts';
import { Physiotherapist } from '@types';

const AssignedPTModal = ({setShowModal , PtDetails} : {setShowModal: (value: boolean) => void, PtDetails: Physiotherapist}) => {

  const { t } = useTranslation()
  const dispatch = useTypedDispatch()
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [isPTModal, setPTModal] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const allAdminList = useTypedSelector((state) => state.adminDashboardPatient.allAdminList)
  const { user } = useTypedSelector((state) => ({ user: state.user }))

  const [ptId, setPtId] = useState<unknown>(PtDetails?.id || null);
  const [PTName, setPTName] = useState('');

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (PtDetails) {
      setPtId(PtDetails?.id);
      setPTName(`${PtDetails?.profile?.firstName || ''} ${PtDetails?.profile?.lastName || ''}`.trim());
    } else {
      // No PT details provided - reset state
      setPtId(null);
      setPTName('');
    }
  }, [PtDetails]);

  const onPageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    fetchData(pageNumber);
  }

  const fetchData = async (page: number) => {
    setLoading(true)
    const payload = {
      limit: 10,
      page: page,
      search: searchText
    }
    await dispatch(getAllAdmin(payload));
    setLoading(false)
  }

  const handleBack = () => {
    setPTModal(false);
    setIsModalOpen(true);
  }

  const handleClick = (user: unknown) => {
    setPTName(`${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim());
    setPtId(user?.id);
    setPTModal(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setIsModalOpen(false);
    if (PtDetails?.id !== ptId) {
      const payload = {
        physiotherapistId: ptId,
        patientId: user?.id,
      };
      const data = await dispatch(savePhysiotherapistToPatient(payload));
      if (data) {
        message.success(t('Admin.data.menu.userRoles.successPatientAssigned'));
      }
    }

    if (user?.physiotherapistPatientAssociationPatientIdRelation?.some((relation) => relation.showPopup)) {
      for (const relation of user.physiotherapistPatientAssociationPatientIdRelation) {
        if (relation.showPopup) {
          await dispatch(updateShowPopStatus({ showPopup: false, id: relation.id }));
        }
      }
      message.success(t('Admin.data.menu.userRoles.updatedSuccess'));
      await dispatch(getUserById(user?.id));
    }
    setShowModal(false);
  }

  useEffect(() => {
    fetchData(currentPage)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchData(1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

  return (
    <Modal
      open={isModalOpen}
      centered
      width={420}
      footer={null}
      destroyOnHidden
      maskClosable={false}
      closable={false}
      onCancel={() => {
        setIsModalOpen(false);
      }}
      className="select-none"
      className={`${'modal-container'}`}>
      {isPTModal ? <>
        <div style={{ marginBottom: 'var(--spacing-2-5)', cursor: "pointer" }} onClick={handleBack}>
          <ArrowLeft color='stroke-gray-400' />
        </div>
        {loading ? (
					<UserListSkeleton count={6} />
				) : <>
          {allAdminList?.data?.length > 0 ? <>
            <Input
              prefix={<UntitledIcon name="search" size={16} style={{ color: "var(--color-neutral-500)" }} />}
              placeholder={t('Admin.data.menu.userRoles.userPopup.search')}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ marginBottom: 'var(--spacing-2-5)' }}
            />
            {allAdminList?.data?.map((users: unknown) =>
              <Flex onClick={() => handleClick(users)} align="center" gap={8} className='flex-container-pt-list'>
                {users?.profile?.imageUrl ? (
                  <Avatar src={users?.profile?.imageUrl} alt="avatar" size={35} />
                ) : (
                  <Avatar
                    style={{
                      backgroundColor: users?.profile?.avatarColor || 'var(--brand-primary)',
                    }}
                    className='custom-avatar-pt-profile'
                    alt="avatar"
                    size={35}>
                    {users?.profile?.firstName ? users?.profile?.firstName?.charAt(0)?.toUpperCase() : 'U'}
                  </Avatar>
                )}
                <span>
                  {users?.profile?.firstName +
                    ' ' +
                    users?.profile?.lastName}
                </span>
              </Flex>
            )}
            <hr className='line-seperation' />
            {
              <Flex justify="center" className="createProgramModalPagination">
                <Pagination
                  current={currentPage}
                  onChange={onPageChange}
                  total={allAdminList?.pagination?.total || 0}
                  showSizeChanger={false}
                />
              </Flex>
            }
          </> : <>
            <Empty />
          </>}</>}</> :
        <Flex vertical gap={12}>
          <Flex align="center" justify="center" className="font-bold">{t('Admin.data.menu.userRoles.userPopup.title')}</Flex>
          <Paragraph>{t('Admin.data.menu.userRoles.userPopup.description')}</Paragraph>
          <Flex align="center" justify="center" style={{ padding: '0.4rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-gray-100)' }}><b className='text-pt'>{t('Admin.data.menu.userRoles.userPopup.physioAssignLabel')}&nbsp;</b> {PTName}</Flex>
          <Paragraph>{t('Admin.data.menu.userRoles.userPopup.physioAssignDesc')}</Paragraph>
          <Flex gap={8} align="center" justify="center">
            <Button onClick={() => setPTModal(true)}>{t('Admin.data.menu.userRoles.userPopup.chooseAnother')}</Button>
            <Button block onClick={handleSubmit}>{t('Admin.data.menu.userRoles.userPopup.continue')}</Button>
          </Flex>
        </Flex>}
    </Modal>
  )
}

export default AssignedPTModal