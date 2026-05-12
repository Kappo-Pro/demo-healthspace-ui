import { lazy, Suspense } from "react";
import { Card, Flex, QRCode, Typography, Spin } from "antd";
import { ResponsiveImage } from '@atoms/ResponsiveImage';
import { useTranslation } from 'react-i18next';

// Lazy load the heavy ReactQuill editor
const ReactQuill = lazy(() => import("react-quill"));

const toolbarOptions = [
	[{ font: [] }],
	[{ size: ['small', false, 'large', 'huge'] }],
	['bold', 'italic', 'underline', 'strike'],
	[{ color: [] }, { background: [] }],
	[{ align: [] }],
	[{ list: 'ordered' }, { list: 'bullet' }],
	['blockquote', 'link'],
	['clean'],
];

const { Paragraph } = Typography;

interface TextEditorType {
  content: string,
  setContent: (value:string) => void
  activeKey: string | number
  instanceLink: string
  username: string
  password: string
  inviteCode: string
}

const TextEditor = (props: TextEditorType) => {
  const { t } = useTranslation();
  const {content, setContent, instanceLink, username, password, inviteCode} = {...props}

  return (
    <>
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}><Spin size="large"  /></div>}>
      <ReactQuill
          modules={{ toolbar: toolbarOptions }}
          theme="snow"
          value={content}
          onChange={setContent}
          style={{ marginTop: 10 }}
          className="custom-quill"
        />
    </Suspense>
				<div
					className="grid" style={{
						gridTemplateColumns: '2fr 3fr',
						paddingTop: 'var(--spacing-4)',
						paddingBottom: 'var(--spacing-4)',
						gap: 'var(--spacing-4)',
						alignItems: 'start' }}>
					{
						<Card
							title={t('Admin.data.menu.userRoles.invitePatientModal.credentialInformations')}
							style={{
								gridColumn: 'span 1',
								borderRadius: 'var(--radius-lg)',
								paddingBottom: 0
							}}>
							<Paragraph>
								<strong>{t('Admin.data.menu.userRoles.invitePatientModal.instanceLink')}:</strong>{' '}
								<a
									href="#"
									style={{ color: 'var(--text-link)', textDecoration: 'none' }}>
									{instanceLink}
								</a>
							</Paragraph>
							<Paragraph>
								<strong>{t('Admin.data.menu.userRoles.invitePatientModal.username')}:</strong> {username}
							</Paragraph>
							<Paragraph>
								<strong>{t('Admin.data.menu.userRoles.invitePatientModal.password')}:</strong> {password}
							</Paragraph>
							<Flex align="center">
								<Paragraph>
									<strong>{t('Admin.data.menu.userRoles.invitePatientModal.inviteCode')}:</strong> {inviteCode}
								</Paragraph>
							</Flex>
						</Card>
				}
				<Card
					title={t('Admin.data.menu.userRoles.invitePatientModal.downloadApp')}
					style={{
						gridColumn: 'span 1',
						borderRadius: 'var(--radius-lg)',
						height: '100%',
					}}>
					<Flex align="center" justify="space-around" gap={16} style={{ height: '100%', margin: '-4px' }}>
						<Flex gap="middle" vertical justify="center" align="center">
							<a
								href="https://apps.apple.com/in/app/vitalflow-ai/id6450214866"
								target="_blank"
								rel="noopener noreferrer"
								style={{ display: 'block', lineHeight: 0 }}>
								<QRCode
									value="https://apps.apple.com/in/app/vitalflow-ai/id6450214866"
									size={90}
								/>
							</a>
							<a
								href="https://apps.apple.com/in/app/vitalflow-ai/id6450214866"
								target="_blank"
								rel="noopener noreferrer"
								style={{ display: 'inline-block' }}>
								<ResponsiveImage
									src="/images/dashboard/app-store.png"
									alt={t('Admin.data.menu.userRoles.invitePatientModal.appleStoreAlt')}
									className="h-12 w-32 inline cursor-pointer"
								/>
							</a>
						</Flex>
						<Flex gap="middle" vertical justify="center" align="center">
							<a
								href="https://play.google.com/store/apps/details?id=com.nexturn.vitalflowai"
								target="_blank"
								rel="noopener noreferrer"
								style={{ display: 'block', lineHeight: 0 }}>
								<QRCode
									value="https://play.google.com/store/apps/details?id=com.nexturn.vitalflowai"
									size={90}
								/>
							</a>
							<a
								href="https://play.google.com/store/apps/details?id=com.nexturn.vitalflowai"
								target="_blank"
								rel="noopener noreferrer"
								style={{ display: 'inline-block' }}>
								<ResponsiveImage
									src="/images/dashboard/btn-android.png"
									alt={t('Admin.data.menu.userRoles.invitePatientModal.androidStoreAlt')}
									className="h-12 w-32 inline cursor-pointer"
								/>
							</a>
						</Flex>
					</Flex>
				</Card>
				</div>
    </>
  )
}

export default TextEditor;