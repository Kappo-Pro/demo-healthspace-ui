import { Logo } from '@atoms/Logo';
import type { LogoStyle } from '@atoms/Logo/types';

interface RomLogoHeaderProps {
	/** Override z-index if needed */
	zIndex?: number;
	/** Use outline style when overlaying camera feed */
	overCamera?: boolean;
}

/**
 * Persistent logo icon for ROM workflow
 * Displays VitalFlow icon at bottom left across all ROM screens
 * Uses same Logo component as sidebar for consistency
 *
 * @param overCamera - When true, uses outline-dark style for better visibility over camera feed
 */
export const RomLogoHeader = ({ zIndex = 20, overCamera = false }: RomLogoHeaderProps) => {
	const logoStyle: LogoStyle = overCamera ? 'outline' : 'color';
	const theme = overCamera ? 'dark' : undefined;

	return (
		<div
			style={{
				position: 'absolute',
				bottom: 'calc(var(--spacing-5) - 15px)',
				left: 'var(--spacing-5)',
				zIndex,
				pointerEvents: 'none',
			}}>
			<Logo variant="icon" logoStyle={logoStyle} theme={theme} width={64} />
		</div>
	);
};

export default RomLogoHeader;
