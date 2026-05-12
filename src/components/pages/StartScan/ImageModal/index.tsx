import { RehabVideoState } from '@types';
import { Flex } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useState } from 'react';
import BodypointsSelectionStep from '../BodyPointsSelectionStep';
import ImageModalContent from './ImageModalContent';
import './style.css';

interface IRomImageModal {
	setVideoState?: (value: RehabVideoState | undefined) => void;
}
const RomImageModal = (props: IRomImageModal) => {
	const [activeStep, setActiveStep] = useState(1);
	const { setVideoState } = props;

	return (
		<Content
			style={{
				margin: 'auto',
				width: '100%',
				maxWidth: '1000px',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
				padding: 'var(--spacing-4)',
			}}
			className="select-none">
			<Flex
				vertical
				align="center"
				justify="center"
				style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
				{activeStep === 1 && (
					<ImageModalContent
						{...props}
						activeStep={activeStep}
						setActiveStep={setActiveStep}
					/>
				)}
				{activeStep === 2 && setVideoState && (
					<BodypointsSelectionStep setVideoState={setVideoState} />
				)}
			</Flex>
		</Content>
	);
};

export default RomImageModal;
