import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '@atoms/Loading';
import { UseAuth } from '@contexts/AuthContext';
import { router } from '@routers/routers';
function LoginCallback() {
	const [searchParams] = useSearchParams();
	const {
		onExchangeToken,
		isLoading,
		isAuthenticated,
		onLoginByIdentityProvider,
	} = UseAuth();
	const [isRequestingExchangeToken, setRequestExchangeToken] = useState(false);
	const [isLoginByIdentityProvider, setLoginByIdentityProvider] =
		useState(false);
	const navigate = useNavigate();
	const code = searchParams.get('code');
	const token = searchParams.get('token');
	const refreshToken = searchParams.get('refreshToken');

	useEffect(() => {
		if (!isAuthenticated && code && !isLoading && !isRequestingExchangeToken) {
			setRequestExchangeToken(true);
			onExchangeToken(code);
		}
	}, [
		isAuthenticated,
		code,
		isLoading,
		onExchangeToken,
		isRequestingExchangeToken,
	]);

	useEffect(() => {
		if (
			!isAuthenticated &&
			token &&
			refreshToken &&
			!isLoading &&
			!isLoginByIdentityProvider
		) {
			setLoginByIdentityProvider(true);
			onLoginByIdentityProvider(token, refreshToken);
		}
	}, [
		isAuthenticated,
		token,
		refreshToken,
		isLoading,
		isLoginByIdentityProvider,
		onLoginByIdentityProvider,
	]);

	useEffect(() => {
		if (isAuthenticated) {
			// Use replace to avoid back button issues
			navigate(router.ROOT, { replace: true });
		}
	}, [isAuthenticated, navigate]);

	return <Loading />;
}

export default LoginCallback;
