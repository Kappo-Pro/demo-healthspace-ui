import { Logo as CarespaceLogo } from '@atoms/Logo';
import type { LogoStyle } from '@atoms/Logo/types';

interface PostureLogoProps {
	/** Use outline style when overlaying camera feed */
	overCamera?: boolean;
}

/**
 * Persistent logo icon for Posture workflow
 * Uses same Logo component as ROM for consistency
 */
function Logo({ overCamera = true }: PostureLogoProps) {
	const logoStyle: LogoStyle = overCamera ? 'outline' : 'color';
	const theme = overCamera ? 'dark' : undefined;

	return (
		<div
			style={{
				position: 'absolute',
				bottom: 'calc(var(--spacing-5) - 15px)',
				left: 'var(--spacing-5)',
				zIndex: 20,
				pointerEvents: 'none',
			}}>
			<CarespaceLogo variant="icon" logoStyle={logoStyle} theme={theme} width={64} />
		</div>
	);
}

export default Logo;
