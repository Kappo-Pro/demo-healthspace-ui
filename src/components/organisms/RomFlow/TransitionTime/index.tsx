import { useVoiceControl } from '@atoms/RehabPreAssessment/VoiceControl';
import { Flex } from 'antd';
import Lottie from 'lottie-react';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import checkLogo from './VoiceRecordingLogo.json';

interface ExerciseTransitionTimeProps {
	transitionTime: number;
	setTransitionTime: (value: number) => void;
	setIsManual: (value: boolean) => void;
	setSavedVoice: (value: string) => void;
	savedVoice: string;
}

export const ExerciseTransitionTime = ({
	transitionTime,
	setSavedVoice,
	savedVoice,
	setTransitionTime,
	setIsManual,
}: ExerciseTransitionTimeProps) => {
	const transitionOptions = [3, 5, 8, 10];
	const { t } = useTranslation();

	// Note: Removed automatic fullscreen call on mount
	// Browsers block programmatic fullscreen requests without user interaction
	// Fullscreen should be triggered by explicit user action (button click)

	useEffect(() => {
		const voiceLowerCase = savedVoice.toLowerCase();
		if (savedVoice) {
			if (voiceLowerCase.includes('3') || voiceLowerCase.includes('three')) {
				setTransitionTime(3);
			} else if (
				voiceLowerCase.includes('5') ||
				voiceLowerCase.includes('five')
			) {
				setTransitionTime(5);
			} else if (
				voiceLowerCase.includes('8') ||
				voiceLowerCase.includes('eight')
			) {
				setTransitionTime(8);
			} else if (
				voiceLowerCase.includes('10') ||
				voiceLowerCase.includes('ten')
			) {
				setTransitionTime(10);
			} else if (voiceLowerCase.includes('manual')) {
				setIsManual(true);
				setTransitionTime(3);
			}
		}
	}, [savedVoice, setTransitionTime, setIsManual]);

	// Memoize callback to prevent VoiceControl from restarting on every render
	const handleVoiceTranscript = useCallback(
		(updatedTranscript: string) => {
			setSavedVoice(updatedTranscript);
		},
		[setSavedVoice],
	);

	useVoiceControl(handleVoiceTranscript);

	const isManualSelected = transitionTime === -1;

	return (
		<Flex
			vertical
			justify="center"
			align="center"
			className="w-full h-full"
			style={{
				position: 'absolute',
				backgroundColor: 'var(--bg-page)', /* Figma: colorBgLayout */
				zIndex: 10,
			}}>
			<Flex
				vertical
				justify="center"
				align="center"
				gap={46}
				style={{
					maxWidth: '800px',
					width: '100%',
					zIndex: 10,
					padding: 'var(--spacing-10) var(--spacing-5)',
				}}>
				{/* Title & Description - Combined */}
				<div
					style={{
						color: 'var(--text-primary)',
						fontSize: 'var(--font-size-xl)',
						fontWeight: 'var(--font-weight-semibold)',
						lineHeight: 'var(--line-height-relaxed)',
						textAlign: 'center',
						letterSpacing: 'var(--letter-spacing-tight)',
					}}>
					<p style={{ margin: 0 }}>
						The transition time for this exercise is {transitionTime > 0 ? transitionTime : 3} seconds.
					</p>
					<p style={{ margin: 0 }}>
						You can keep this time or choose from the options:
					</p>
				</div>

				{/* Time selection buttons */}
				<Flex
					justify="center"
					align="center"
					wrap="wrap"
					gap={27}>
					{transitionOptions.map(time => {
						const isSelected = transitionTime === time;
						return (
							<button
								key={time}
								onClick={() => {
									setTransitionTime(time);
									setIsManual(false);
								}}
								style={{
									padding: 'var(--spacing-1-5) var(--spacing-6)',
									height: '43px',
									borderRadius: 'var(--radius-xl)',
									cursor: 'pointer',
									border: '1px solid var(--border-default)',
									color: 'var(--text-primary)',
									fontSize: 'var(--font-size-lg)',
									fontWeight: 'var(--font-weight-normal)',
									backgroundColor: isSelected
										? 'var(--brand-primary)'
										: 'var(--surface-elevated)',
									...(isSelected && { color: 'var(--text-on-brand)', borderColor: 'var(--brand-primary)' }),
									transition: 'all var(--motion-duration-fast) var(--motion-ease-out)',
									letterSpacing: 'var(--letter-spacing-tight)',
								}}>
								{time} Sec
							</button>
						);
					})}
					<button
						onClick={() => {
							setIsManual(true);
							setTransitionTime(-1);
						}}
						style={{
							padding: 'var(--spacing-1-5) var(--spacing-6)',
							height: '43px',
							borderRadius: 'var(--radius-xl)',
							cursor: 'pointer',
							border: '1px solid var(--border-default)',
							color: 'var(--text-primary)',
							fontSize: 'var(--font-size-lg)',
							fontWeight: 'var(--font-weight-normal)',
							backgroundColor: isManualSelected
								? 'var(--brand-primary)'
								: 'var(--surface-elevated)',
							...(isManualSelected && { color: 'var(--text-on-brand)', borderColor: 'var(--brand-primary)' }),
							transition: 'all var(--motion-duration-fast) var(--motion-ease-out)',
							letterSpacing: 'var(--letter-spacing-tight)',
						}}>
						{t('Patient.data.vitalscan-rom.manualOpt')}
					</button>
				</Flex>

				{/* Voice instruction text */}
				<p
					style={{
						color: 'var(--text-primary)',
						fontSize: 'var(--font-size-lg)',
						fontWeight: 'var(--font-weight-normal)',
						margin: 0,
						textAlign: 'center',
						letterSpacing: 'var(--letter-spacing-tight)',
						lineHeight: 'var(--line-height-normal)',
					}}>
					Choose one of the options and say it out loud
				</p>

				{/* Voice indicator - Pill shaped */}
				<Flex
					align="center"
					justify="center"
					gap={22}
					style={{
						backgroundColor: 'var(--surface-elevated)',
						borderRadius: 'var(--radius-full)',
						padding: 'var(--spacing-3) var(--spacing-4)',
						width: '296px',
					}}>
					<svg
						width="22"
						height="22"
						viewBox="0 0 22 22"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={{ flexShrink: 0 }}>
						<path
							d="M17.1465 9.0243V10.8292C17.1465 14.3181 14.3182 17.1464 10.8294 17.1464M4.51221 9.0243V10.8292C4.51221 14.3181 7.3405 17.1464 10.8294 17.1464M10.8294 17.1464V19.8537M7.21956 19.8537H14.4392M10.8294 13.5366C9.33414 13.5366 8.12201 12.3244 8.12201 10.8292V4.51204C8.12201 3.01681 9.33414 1.80469 10.8294 1.80469C12.3246 1.80469 13.5367 3.01681 13.5367 4.51204V10.8292C13.5367 12.3244 12.3246 13.5366 10.8294 13.5366Z"
							stroke="var(--brand-primary)"
							strokeWidth="2.03052"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<Flex align="center" justify="center" style={{ width: '212px', height: 'var(--spacing-8)' }}>
						<Lottie
							animationData={checkLogo}
							loop={true}
							autoplay={true}
							style={{
								height: '100%',
								width: '100%',
								filter: 'grayscale(1) brightness(0.4)',
							}}
						/>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	);
};
