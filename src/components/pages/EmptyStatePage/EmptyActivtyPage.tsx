import { useTranslation } from 'react-i18next';
import { Empty } from 'antd';
import ToggleMenu from '@atoms/ToggleMenu';

function EmptyActivityPage() {
	const { t } = useTranslation();

	return (
		<div><ToggleMenu />
			<Empty
				image="/images/emptyActivity.svg"
				className='select-none'
				imageStyle={{ height: 300, display: 'inline-block', marginTop: '10%' }}
				description={
					<span>
						<p
							className="font-bold text-center p-2"
							style={{ fontSize: 26, lineHeight: 'var(--spacing-5)', color:"var(--text-color)" }}
						>
							{' '}
							{t('Admin.data.inbox.title')}{' '}
						</p>
						<p className="text-lg text-center" style={{color:"var(--text-color-root)"}}>
							{t('Admin.data.inbox.description')}
						</p>
					</span>
				}
			></Empty>
		</div>
	);
}

export default EmptyActivityPage;
