/**
 * Service Worker Registration
 *
 * Story 4.3: Performance Optimization - AC5 (Caching Strategy)
 *
 * This module handles the registration and lifecycle of the service worker.
 * It provides offline capability and caching strategies for better performance.
 *
 * @module serviceWorkerRegistration
 */

// Configuration for service worker
const isLocalhost = Boolean(
	window.location.hostname === 'localhost' ||
		window.location.hostname === '[::1]' ||
		window.location.hostname.match(
			/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/,
		),
);

type Config = {
	onSuccess?: (registration: ServiceWorkerRegistration) => void;
	onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

/**
 * Register the service worker
 *
 * @param config - Configuration callbacks for success and update events
 */
export function register(config?: Config) {
	// Only register in true production environment (not sandbox/develop)
	// We use REACT_APP_ENV instead of NODE_ENV because sandbox builds also use NODE_ENV=production for optimization
	// but should NOT have aggressive service worker caching enabled
	if (
		process.env.REACT_APP_ENV === 'production' &&
		'serviceWorker' in navigator
	) {
		// The URL constructor is available in all browsers that support SW.
		const publicUrl = new URL(
			process.env.PUBLIC_URL || '',
			window.location.href,
		);
		if (publicUrl.origin !== window.location.origin) {
			// Service worker won't work if PUBLIC_URL is on a different origin
			return;
		}

		window.addEventListener('load', () => {
			const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

			if (isLocalhost) {
				// This is running on localhost. Check if a service worker still exists or not.
				checkValidServiceWorker(swUrl, config);

				// Add some additional logging to localhost, pointing developers to the
				// service worker/PWA documentation.
				navigator.serviceWorker.ready.then(() => {});
			} else {
				// Is not localhost. Just register service worker
				registerValidSW(swUrl, config);
			}
		});
	}
}

function registerValidSW(swUrl: string, config?: Config) {
	navigator.serviceWorker
		.register(swUrl)
		.then(registration => {
			registration.onupdatefound = () => {
				const installingWorker = registration.installing;
				if (installingWorker == null) {
					return;
				}
				installingWorker.onstatechange = () => {
					if (installingWorker.state === 'installed') {
						if (navigator.serviceWorker.controller) {
							// At this point, the updated precached content has been fetched,
							// but the previous service worker will still serve the older
							// content until all client tabs are closed.
							// eslint-disable-next-line no-console

							// Execute callback
							if (config && config.onUpdate) {
								config.onUpdate(registration);
							}
						} else {
							// At this point, everything has been precached.
							// It's the perfect time to display a
							// "Content is cached for offline use." message.
							// eslint-disable-next-line no-console

							// Execute callback
							if (config && config.onSuccess) {
								config.onSuccess(registration);
							}
						}
					}
				};
			};
		})
		.catch(_error => {
			// Service worker registration failed silently
		});
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
	// Check if the service worker can be found. If it can't reload the page.
	fetch(swUrl, {
		headers: { 'Service-Worker': 'script' },
	})
		.then(response => {
			// Ensure service worker exists, and that we really are getting a JS file.
			const contentType = response.headers.get('content-type');
			if (
				response.status === 404 ||
				(contentType != null && contentType.indexOf('javascript') === -1)
			) {
				// No service worker found. Probably a different app. Reload the page.
				navigator.serviceWorker.ready.then(registration => {
					registration.unregister().then(() => {
						window.location.reload();
					});
				});
			} else {
				// Service worker found. Proceed as normal.
				registerValidSW(swUrl, config);
			}
		})
		.catch(() => {
			// Failed to fetch service worker
		});
}

/**
 * Unregister the service worker
 */
export function unregister() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.ready
			.then(registration => {
				registration.unregister();
			})
			.catch(_error => {
				// Service worker unregistration failed silently
			});
	}
}
