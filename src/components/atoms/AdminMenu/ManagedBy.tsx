import { useTypedSelector } from '@stores/index';
import { Avatar, Flex, Typography } from 'antd';

const { Paragraph } = Typography;
import { useTranslation } from 'react-i18next';

export default function ManagedBy() {
	const { t } = useTranslation();
	const user = useTypedSelector(state => state.user);
	const selectedUser = useTypedSelector(
		state => state.contacts.main.selectedUser,
	);

	const physiotherapistData = user?.isPhysioterapist
		? selectedUser?.physiotherapistPatientAssociationPatientIdRelation
		: user?.physiotherapistPatientAssociationPatientIdRelation;

	return (
		<>
			{physiotherapistData?.length > 0 && (
				<ul
					className="mt-2.5"
					style={{
						background: 'var(--user-menu-bg-color)',
						borderRadius: 'var(--radius-lg)',
					}}>
					<div className="functional-button-div pl-4">
						<Paragraph className="text-sm font-bold">
							{t('admin.roles.physiotherapist')}
						</Paragraph>
					</div>
					<div
						className="mt-2 mb-2.5"
						style={{
							paddingLeft: 'var(--spacing-1-5)',
						}}>
						{physiotherapistData?.map(relation => {
							const physiotherapist = relation?.physiotherapist;
							if (!physiotherapist) return null;
							const { profile } = physiotherapist;
							const fullName =
								`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
							return (
								<Flex className="p-2">
									{profile?.imageUrl ? (
										<Avatar
											style={{
												width: '41px',
												height: 'var(--spacing-10)',
												border: '3px solid white',
											}}
											src={profile?.imageUrl}
											alt={`${profile?.firstName} ${profile?.lastName}`}
										/>
									) : (
										<Avatar
											style={{
												backgroundColor:
													profile?.avatarColor || 'var(--brand-primary)',
												width: '41px',
												height: 'var(--spacing-10)',
												border: '3px solid white',
											}}
											alt={`${profile?.firstName} ${profile?.lastName}`}>
											{profile?.firstName
												? profile?.firstName.charAt(0).toUpperCase()
												: 'U'}
										</Avatar>
									)}
									<span className="ml-2 text-[var(--surface-disabled)]">
										<span className="block text-sm font-semibold">
											<strong>{profile?.firstName ? fullName : ''}</strong>
										</span>
										<span className="block text-sm font-regular">
											{profile?.email}
										</span>
									</span>
								</Flex>
							);
						})}
					</div>
				</ul>
			)}
		</>
	);
}
