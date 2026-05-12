import { Route, Routes } from 'react-router-dom';
import { lazyLoad } from '@utils/lazyLoad';
import { router } from '@routers/routers';
import { Result } from 'antd/lib';
import { UntitledIcon } from '@atoms/Icon';

// Lazy-loaded page components (code-split for better performance)
const LoginCallback = lazyLoad(() =>
	import('src/auth').then(m => ({ default: m.LoginCallback })),
);
const DesignSystem = lazyLoad(() => import('@pages/DesignSystem'));
const Loading = lazyLoad(() => import('@atoms/Loading'));

function Public() {
	return (
		<Routes>
			<Route path={router.LOGINCALLBACK} element={<LoginCallback />} />
			{/* Design System demo page - public access for designers and developers */}
			<Route path={router.DESIGN_SYSTEM} element={<DesignSystem />} />
			<Route
				path={router.TEST}
				element={
					// TODO: Consider using updated ?? defaultValue or updated?.property instead of updated!
					<Result icon={<UntitledIcon name="smile" />} title="Great, Develop updated! #1" />
				}
			/>
			{/* Catch-all route for root path and unmatched routes */}
			<Route path="*" element={<Loading />} />
		</Routes>
	);
}

export default Public;
