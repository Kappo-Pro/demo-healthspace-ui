import axios from 'axios';

const strapi = axios.create({
	baseURL: process.env.REACT_APP_STRAPI_HOST,
	headers: {
		Authorization: `Bearer ${process.env.REACT_APP_STRAPI_KEY}`,
		'Content-Type': 'application/json',
	},
});

// Add error interceptor for better error handling
strapi.interceptors.response.use(
	response => response,
	error => {
		// Gracefully handle SSL certificate errors in development
		if (
			error.code === 'CERT_HAS_EXPIRED' ||
			error.code === 'ERR_CERT_DATE_INVALID'
		) {
			// Intentionally silent - SSL cert errors are expected in development
			console.warn(
				'Strapi SSL certificate error (development environment):',
				error.code,
			);
		} else if (error.response) {
			// Server responded with error status
			console.error(
				'Strapi API error:',
				error.response.status,
				error.response.data,
			);
		} else if (error.request) {
			// Request made but no response received
			console.error('Strapi network error: No response received');
		}
		return Promise.reject(error);
	},
);

export default strapi;
