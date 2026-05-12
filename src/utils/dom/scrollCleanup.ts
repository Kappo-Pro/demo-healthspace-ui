/**
 * Utility to forcefully restore application scroll state and clear modal artifacts.
 *
 * Ant Design's Modal component sometimes fails to remove its scroll-locking
 * classes, inline styles, and even the backdrop masks during rapid transitions,
 * multiple openings, or component unmounting race conditions.
 */

export const forceRestoreScroll = () => {
	// Use requestAnimationFrame to ensure we run after any immediate React/AntD updates
	requestAnimationFrame(() => {
		try {
			const body = document.body;
			const html = document.documentElement;

			// 1. Remove inline styles often left by AntD
			body.style.overflow = '';
			body.style.paddingRight = '';
			body.style.width = '';
			body.style.position = '';
			body.style.top = ''; // AntD sometimes sets top when locking
			body.style.pointerEvents = ''; // CRITICAL: Restore pointer events on body

			html.style.overflow = '';
			html.style.paddingRight = '';
			html.style.pointerEvents = ''; // CRITICAL: Restore pointer events on html

			// 2. Clear common AntD scroll-lock classes
			const classesToRemove = [
				'ant-scrolling-effect',
				'ant-modal-open',
				'ant-drawer-open',
			];

			classesToRemove.forEach(cls => {
				body.classList.remove(cls);
				html.classList.remove(cls);
			});

			// 3. SELECTIVE CLEANUP: Only hide artifacts that are truly orphaned
			// Check for visible modals first
			const visibleModals = document.querySelectorAll(
				'.ant-modal-wrap:not([style*="display: none"])',
			);

			// Only clean up if NO modals are visible
			if (visibleModals.length === 0) {
				const lingeringArtifacts = document.querySelectorAll(
					'.ant-modal-root, .ant-modal-mask, .ant-modal-wrap, .ant-drawer-mask, .ant-drawer-wrapper-body',
				);

				lingeringArtifacts.forEach(el => {
					// Only hide if element is already hidden or has display:none
					const computedStyle = window.getComputedStyle(el);
					if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
						(el as HTMLElement).style.pointerEvents = 'none';
						(el as HTMLElement).style.opacity = '0';
					}
				});
			}

			// 4. Force a resize event to nudge the browser into re-calculating layout
			window.dispatchEvent(new Event('resize'));

		} catch (err) {
			console.warn('❌ Failed to force restore scroll/UI:', err);
		}
	});
};
