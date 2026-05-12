import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const container = document.getElementById('root');
if (container) {
	const root = createRoot(container);
	root.render(<App />);
} else {
	throw new Error('Root container not found');
}

// Register service worker for offline support and caching (Story 4.3: AC5)
// This improves performance and enables offline capability
serviceWorkerRegistration.register({
	onSuccess: () => {},
	onUpdate: _registration => {
		// Optional: Show user notification to refresh
		// You can add a toast notification here to inform users
	},
});
