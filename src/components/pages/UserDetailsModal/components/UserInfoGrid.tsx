import React from 'react';
import { Row, Col, Typography, Tag } from 'antd';
import { UserInfoGridProps } from '../types';
import { USER_ROLES } from '@stores/constants';

const formatRole = (role?: string): string => {
  if (!role) return 'User';

  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return 'Super Admin';
    case USER_ROLES.ADMIN:
      return 'Admin';
    default:
      return 'User';
  }
};

export const UserInfoGrid: React.FC<UserInfoGridProps> = ({ userData }) => {
  const { profile } = userData;

  const formatHeight = () => {
    const imperial = profile?.imperialHeight
      ? `${Math.floor(profile.imperialHeight / 12)}'${profile.imperialHeight % 12}"`
      : '-';
    const metric = profile?.metricHeight ? `${profile.metricHeight} cm` : '-';
    return imperial === '-' && metric === '- cm' ? '-' : `${imperial} (${metric})`;
  };

  const formatWeight = () => {
    const imperial = profile?.imperialWeight ? `${profile.imperialWeight} lbs` : '-';
    const metric = profile?.metricWeight ? `${profile.metricWeight} kg` : '-';
    return imperial === '-' && metric === '- kg' ? '-' : `${imperial} (${metric})`;
  };

  const calculateAge = () => {
    if (!profile?.birthDate) return '-';
    const today = new Date();
    const birthDate = new Date(profile.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  const infoSections = [
    {
      title: 'Basic Information',
      items: [
        { label: 'Full Name', value: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || '-' },
        { label: 'Phone Number', value: profile?.phone || '-' },
        { label: 'Email', value: profile?.email || '-' },
        { label: 'Gender', value: profile?.gender || '-' },
        {
          label: 'Birth Date',
          value: profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString() : '-'
        },
        { label: 'Age', value: calculateAge() },
      ]
    },
    {
      title: 'Physical Information',
      items: [
        { label: 'Height', value: formatHeight() },
        { label: 'Weight', value: formatWeight() },
        { label: 'Pregnant', value: profile?.isPregnant ? 'Yes' : 'No', span: 24 },
      ]
    },
    {
      title: 'Account Information',
      items: [
        { label: 'Role', value: formatRole(profile?.role) },
        {
          label: 'Status',
          value: <Tag color={profile?.isActive ? 'success' : 'default'}>
            {profile?.isActive ? 'Active' : 'Inactive'}
          </Tag>
        },
        {
          label: 'Consent Form',
          value: <Tag color={profile?.consentPolicyRead ? 'success' : 'warning'}>
            {profile?.consentPolicyRead ? 'Accepted' : 'Not Accepted'}
          </Tag>
        },
        {
          label: 'Registered Date',
          value: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-'
        },
      ]
    }
  ];

  return (
    <div className="user-info-grid">
      {infoSections.map((section, idx) => (
        <div key={idx} className="info-section">
          <Typography.Title level={5}>{section.title}</Typography.Title>
          <Row gutter={[16, 16]}>
            {section.items.map((item, itemIdx) => (
              <Col key={itemIdx} xs={24} sm={'span' in item ? item.span : 12}>
                <div className="info-item">
                  <Typography.Text type="secondary" className="info-label">
                    {item.label}
                  </Typography.Text>
                  <Typography.Text strong className="info-value">
                    {item.value}
                  </Typography.Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};
