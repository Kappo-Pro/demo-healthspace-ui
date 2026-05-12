import { useTranslation } from 'react-i18next';
import { Empty } from 'antd';
import ToggleMenu from '@atoms/ToggleMenu';

function EmptyStatePage() {
	const { t } = useTranslation();

	return (
		<div>
			<ToggleMenu />
			<Empty
				image="/images/empty.svg"
				imageStyle={{ height: 300, display: 'inline-block', marginTop: '10%' }}
				className='select-none'
				description={
					<span>
						<p
							className="font-bold text-center p-2"
							style={{ fontSize: 26, lineHeight: 'var(--spacing-5)', color:"var(--text-color)" }}
						>
							{t('Admin.data.selectUser.title')}
						</p>
						<p
							className="text-lg text-center"
							style={{ color:"var(--text-color-root)", maxWidth: 500, margin: '0 auto' }}
						>
							{t('Admin.data.selectUser.description')}
						</p>
					</span>
				}
			></Empty>
		</div>
	);
}

export default EmptyStatePage;
