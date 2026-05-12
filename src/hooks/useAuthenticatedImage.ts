import { useEffect, useState } from 'react';
import axios from '../utils/Api';

interface AuthenticatedImageState {
	blobUrl: string | null;
	loading: boolean;
	error: string | null;
}

/**
 * Fetches an image URL with authentication headers and returns a blob URL
 * that can be used in <img> tags without auth issues.
 *
 * Handles:
 * - Data URLs (base64) - returns as-is
 * - Full URLs requiring auth - fetches with axios, returns blob URL
 * - Cleanup of blob URLs on unmount
 */
export function useAuthenticatedImage(
	imageUrl: string | null,
): AuthenticatedImageState {
	const [state, setState] = useState<AuthenticatedImageState>({
		blobUrl: null,
		loading: false,
		error: null,
	});

	useEffect(() => {
		// Reset state when URL changes
		setState({ blobUrl: null, loading: false, error: null });

		if (!imageUrl) return;

		// Data URLs don't need auth - use directly
		if (imageUrl.startsWith('data:')) {
			setState({ blobUrl: imageUrl, loading: false, error: null });
			return;
		}

		// Check if URL has SAS token (Azure Blob Storage)
		const hasSasToken = imageUrl.includes('?sv=') || imageUrl.includes('&sv=');

		// HTTP URLs need to be fetched
		if (imageUrl.startsWith('http')) {
			let cancelled = false;
			const controller = new AbortController();

			setState(prev => ({ ...prev, loading: true }));

			// For SAS URLs, use native fetch without auth headers
			// For other URLs, use axios with auth headers
			const fetchPromise = hasSasToken
				? fetch(imageUrl, { signal: controller.signal }).then(response => {
						if (!response.ok) {
							throw new Error(
								`HTTP ${response.status}: ${response.statusText}`,
							);
						}
						return response.blob();
					})
				: axios
						.get(imageUrl, {
							responseType: 'blob',
							signal: controller.signal,
						})
						.then(response => response.data as Blob);

			fetchPromise
				.then(blob => {
					if (cancelled) return;

					const blobUrl = URL.createObjectURL(blob);

					setState({
						blobUrl,
						loading: false,
						error: null,
					});
				})
				.catch(err => {
					if (cancelled) return;

					console.error('Failed to load authenticated image:', err);
					setState({
						blobUrl: null,
						loading: false,
						error: err.message || 'Failed to load image',
					});
				});

			return () => {
				cancelled = true;
				controller.abort();
				// Cleanup blob URL if created
				if (state.blobUrl && state.blobUrl.startsWith('blob:')) {
					URL.revokeObjectURL(state.blobUrl);
				}
			};
		}

		// Fallback for unexpected formats
		setState({ blobUrl: imageUrl, loading: false, error: null });
	}, [imageUrl]);

	// Cleanup blob URL on unmount
	useEffect(() => {
		return () => {
			if (state.blobUrl && state.blobUrl.startsWith('blob:')) {
				URL.revokeObjectURL(state.blobUrl);
			}
		};
	}, [state.blobUrl]);

	return state;
}
