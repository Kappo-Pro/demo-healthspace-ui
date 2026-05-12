import {
	createContext,
	useContext,
	useState,
	useEffect,
	useMemo,
	useCallback,
	PropsWithChildren} from 'react';
import axios, { AxiosError } from 'axios';
import '@utils/Api'; // Import to ensure axios config is loaded
import useLocalStorage from '@hooks/useLocalStorage';
import {
	EVENT_REFRESH_TOKEN,
	STORAGE_KEY_CREDENTIALS,
	STORAGE_KEY_REFRESH_TOKEN,
	STORAGE_KEY_TOKEN,
	STORAGE_KEY_TYPE} from '@constants/authContants';
import EventEmitter from '@services/EventEmitter';

interface ErrorResponse {
	message: string;
}

interface ExchangeTokenResponse {
	access_token: string;
	experies_in?: number;
	id_token?: string;
	refresh_token: string;
	refresh_token_id?: string;
	scope?: string;
	token_type?: string;
	userId?: string;
}

export interface Credentials {
	aud: string;
	exp: number;
	iat: number;
	iss: string;
	sub: string;
	jti: string;
	authenticationType: string;
	email: string;
	email_verified: boolean;
	applicationId: string;
	scope: string;
	roles: string[];
	sid: string;
	auth_time: number;
	tid: string;
}

interface AuthContextData {
	isAuthenticated: boolean;
	credentials: Credentials | null;
	isLoading: boolean;
	error: unknown | null;
	onLogin(): Promise<void>;
	onLogout(): Promise<void>;
	onExchangeToken(code: string): Promise<void>;
	onLoginByIdentityProvider(token: string, refreshToken: string): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({
	isAuthenticated: false,
	credentials: null,
	isLoading: false,
	onLogin: async () => {},
	onLogout: async () => {},
	onExchangeToken: async () => {},
	onLoginByIdentityProvider: async () => {},
	error: null,
});

export function AuthProvider({ children }: Readonly<PropsWithChildren>) {
	const [credentials, setCredentials] = useLocalStorage(
		STORAGE_KEY_CREDENTIALS,
		null,
	);
	const [type, setType] = useLocalStorage(STORAGE_KEY_TYPE, 'Bearer');
	const [token, setToken] = useLocalStorage(STORAGE_KEY_TOKEN, null);
	const [refreshToken, setRefreshToken] = useLocalStorage(
		STORAGE_KEY_REFRESH_TOKEN,
		null,
	);

	const [isAuthenticated, setIsAuthenticated] = useState(
		Boolean(credentials && type && token && refreshToken),
	);
	const [error, setError] = useState<null | string>(null);
	const [isLoading, setIsLoading] = useState(false);

	const login = useCallback(
		(data: ExchangeTokenResponse) => {
			const payload = JSON.parse(atob(data.access_token.split('.')[1]));

			if (data?.token_type) setType(data.token_type);
			setCredentials(payload);
			setToken(data?.access_token);
			setRefreshToken(data.refresh_token);
			setIsAuthenticated(true);
		},
		[setCredentials, setType, setToken, setRefreshToken, setIsAuthenticated],
	);

	const logout = useCallback(() => {
		localStorage.clear();
	}, []);

	const onLoginByIdentityProvider = useCallback(
		async (token: string, refreshToken: string) => {
			login({
				access_token: token,
				refresh_token: refreshToken,
			});
		},
		[login],
	);

	const onLogin = useCallback(async () => {
		setIsLoading(true);
		try {
			const { data } = await axios.get('/auth/login');

			window.location = data;
		} catch (e) {
			const error = e as AxiosError<ErrorResponse>;
			const errorMessage = error?.response?.data?.message || error?.message;
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const onLogout = useCallback(async () => {
		setIsLoading(true);
		try {
			const { data } = await axios.get('/auth/logout');

			logout();
			window.location.href = data;
		} catch (e) {
			const error = e as AxiosError<ErrorResponse>;
			const errorMessage = error?.response?.data?.message || error?.message;
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}, [logout]);

	const onExchangeToken = useCallback(
		async (code: string) => {
			setIsLoading(true);
			try {
				const { data } = await axios.post('/auth/token', {
					code,
					url: window.location.origin,
				});
				login(data);
			} catch {
				logout();
			} finally {
				setIsLoading(false);
			}
		},
		[login, logout],
	);

	const onRefreshToken = useCallback(
		async (callback?: (token: string | null) => void) => {
			setIsLoading(true);
			try {
				const { data } = await axios.post('/auth/refresh-token', {
					token,
					refreshToken,
				});

				callback?.(data.token);
				login({
					access_token: data.token,
					refresh_token: data.refreshToken,
					refresh_token_id: data.refreshTokenId,
				});
			} catch {
				setIsLoading(false);
				callback?.(null);
				onLogout();
			}
		},
		[login, token, refreshToken, onLogout],
	);

	useEffect(() => {
		EventEmitter.on(EVENT_REFRESH_TOKEN, cb => {
			onRefreshToken(cb);
		});

		return () => {
			EventEmitter.off(EVENT_REFRESH_TOKEN);
		};
	}, [onRefreshToken]);

	useEffect(() => {
		if (credentials && type && token && refreshToken) {
			setIsAuthenticated(true);
		}
	}, [credentials, type, token, refreshToken]);

	const authValues = useMemo(
		() => ({
			isAuthenticated,
			credentials,
			isLoading,
			error,
			onLogin,
			onLogout,
			onExchangeToken,
			onLoginByIdentityProvider,
		}),
		[
			isAuthenticated,
			credentials,
			isLoading,
			error,
			onLogin,
			onLogout,
			onExchangeToken,
			onLoginByIdentityProvider,
		],
	);

	return (
		<AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>
	);
}

export function UseAuth() {
	return useContext(AuthContext);
}
