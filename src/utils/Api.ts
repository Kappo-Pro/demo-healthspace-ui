import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import EventEmitter from '@services/EventEmitter';
import {
	STORAGE_KEY_TOKEN,
	STORAGE_KEY_TYPE,
	EVENT_REFRESH_TOKEN,
} from '@constants/authContants';
import { router } from '@routers/routers';

axios.defaults.baseURL = process.env.REACT_APP_ADMIN_HOST || 'https://api.vitalflow-demo.com';

let requestsToRefresh: Array<(token: string | null) => void> = [];
let isRefreshRequesting = false;

// Add a request interceptor
axios.interceptors.request.use(
	config => {
		const token = localStorage.getItem(STORAGE_KEY_TOKEN);
		const tokenType = localStorage.getItem(STORAGE_KEY_TYPE);
		if (token && tokenType && config?.headers) {
			config.headers['Authorization'] = `${tokenType} ${token}`;
		}
		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	},
);

// Response interceptor → handle 401s
axios.interceptors.response.use(
	response => response,
	(error: AxiosError) => {
		const response = error.response;
		const config = error.config as InternalAxiosRequestConfig | undefined;

		// Guard against cases with no response (network issues or SSL errors)
		if (!response) {
			// Log SSL certificate errors in development
			if (
				error.code === 'CERT_HAS_EXPIRED' ||
				error.code === 'ERR_CERT_DATE_INVALID'
			) {
				// SSL certificate error - logged for debugging in development
				console.warn('SSL certificate error detected:', error.code);
			} else if (error.request) {
				// Network request failed - no response received
				console.warn('Network request failed:', error.message);
			}
			return Promise.reject(error);
		}

		if (response.status === 401) {
			const token = localStorage.getItem(STORAGE_KEY_TOKEN);

			// No token at all → logout
			if (!token) {
				window.location.href = router.ROOT;
				return Promise.reject(error);
			}

			// If refresh not already running → trigger it
			if (!isRefreshRequesting) {
				isRefreshRequesting = true;

				const notifyAll = (newToken: string | null) => {
					requestsToRefresh.forEach(cb => cb(newToken));
					requestsToRefresh = []; // clear queue
					isRefreshRequesting = false; // reset
				};

				// Ask AuthContext (or whoever listens) to refresh
				EventEmitter.emit(EVENT_REFRESH_TOKEN, notifyAll);
			}

			// Queue the request until refresh finishes
			return new Promise((resolve, reject) => {
				requestsToRefresh.push((newToken: string | null) => {
					if (newToken && config) {
						const tokenType = localStorage.getItem(STORAGE_KEY_TYPE);
						if (tokenType && config.headers) {
							config.headers['Authorization'] = `${tokenType} ${newToken}`;
						}
						resolve(axios(config)); // retry request
					} else {
						reject(error); // refresh failed
					}
				});
			});
		}

		return Promise.reject(error);
	},
);

export default axios;
