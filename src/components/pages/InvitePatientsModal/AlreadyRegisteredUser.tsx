import { message as AntMessage } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import './AlreadyRegisteredUser.css';
import { useTranslation } from 'react-i18next';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
}

interface AlreadyRegisteredUserProps {
  message: typeof AntMessage;
  responseData: unknown;
}

const AlreadyRegisteredUser = ({ message, responseData }: AlreadyRegisteredUserProps) => {

  const {t} = useTranslation()
  return (
    <div className="bulk-invite-error-container select-none">
      <div className='main-div-icon'>
      <p className='heading-title'>
        <strong>{t('Admin.data.menu.userRoles.invitePatientModal.alreadyAccount')}</strong>
      </p>
      <p
        role="button"
        aria-label="Close message"
        className="close-icon-css"
        onClick={() => message.destroy()}
        style={{ cursor: 'pointer' }}
      >
        <UntitledIcon name="close" size={20} style={{ color: 'var(--text-secondary)' }} />
      </p>
    </div>
      <table className="error-table">
        <thead>
          <tr>
            <th>{t('Admin.data.menu.userRoles.invitePatientModal.firstName')}</th>
            <th>{t('Admin.data.menu.userRoles.invitePatientModal.lastName')}</th>
            <th>{t('Admin.data.menu.userRoles.invitePatientModal.emailText')}</th>
            <th>{t('Admin.data.menu.userRoles.invitePatientModal.mobilePhone')}</th>
          </tr>
        </thead>
        <tbody>
          {responseData?.payload?.usersAlreadyCreated?.map((user: User, index: number) => (
            <tr key={index}>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.mobilePhone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlreadyRegisteredUser;
