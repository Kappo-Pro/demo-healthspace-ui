import { UntitledIcon } from '@atoms/Icon';
import { Col, Empty, Flex, Image, Modal, Row } from 'antd';
import moment from 'moment';

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './CustomCaptureScreenshots.css';

/* -------------------------------
   Custom Compare (No react-compare-image)
---------------------------------- */
interface CompareSliderProps {
	left: string;
	right: string;
	leftLabel: string;
	rightLabel: string;
}

function CompareSlider({
	left,
	right,
	leftLabel,
	rightLabel,
}: CompareSliderProps) {
	const [pos, setPos] = useState(50);
	const containerRef = useRef<HTMLDivElement>(null);

	// handle drag
	const onDrag = (e: MouseEvent | React.MouseEvent) => {
		if (!containerRef.current) return;

		const rect = containerRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		let percentage = (x / rect.width) * 100;

		if (percentage < 0) percentage = 0;
		if (percentage > 100) percentage = 100;

		setPos(percentage);
	};

	const startDrag = () => {
		window.addEventListener('mousemove', onDrag);
		window.addEventListener('mouseup', stopDrag);
	};

	const stopDrag = () => {
		window.removeEventListener('mousemove', onDrag);
		window.removeEventListener('mouseup', stopDrag);
	};

	return (
		<div
			ref={containerRef}
			className="compare-slider-container"
			onClick={onDrag}>
			{/* RIGHT IMAGE */}
			<img src={right} className="compare-slider-right-image" />

			{/* LEFT IMAGE clipped */}
			<img
				src={left}
				className="compare-slider-left-image"
				style={{
					clipPath: `inset(0 ${100 - pos}% 0 0)`,
				}}
			/>

			{/* WHITE CENTER LINE */}
			<div
				className="compare-slider-center-line"
				style={{
					left: `${pos}%`,
				}}
			/>

			{/* DRAG HANDLE WITH ARROWS */}
			<div
				onMouseDown={startDrag}
				className="compare-slider-handle"
				style={{
					left: `${pos}%`,
				}}>
				{/* Left Arrow */}
				<span className="compare-slider-arrow-left">‹</span>

				{/* Right Arrow */}
				<span className="compare-slider-arrow-right">›</span>
			</div>

			{/* LABEL LEFT */}
			<div className="compare-slider-label compare-slider-label-left">
				{leftLabel}
			</div>

			{/* LABEL RIGHT */}
			<div className="compare-slider-label compare-slider-label-right">
				{rightLabel}
			</div>
		</div>
	);
}

// Interface for screenshot data from parent
interface ScreenshotDataPoint {
	id: string;
	screenshot: string;
	value: number;
	score: number;
	normal: number;
	exerciseName: string;
	sessionTitle: string;
	createdAt: string;
}

// Interface for selected image with additional data
interface SelectedImage extends ScreenshotDataPoint {
	displayValue?: number;
}

interface CustomCaptureScreenshotsProps {
	screenshots: ScreenshotDataPoint[];
}

export default function CustomCaptureScreenshots({
	screenshots,
}: CustomCaptureScreenshotsProps) {
	const { t } = useTranslation();
	const [compareImage, setCompareImage] = useState(false);
	const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
	const showCompare = () => setCompareImage(!compareImage);

	const onSelectImage = (image: ScreenshotDataPoint) => {
		setSelectedImages(prevSelectedImages => {
			const exists = prevSelectedImages.find(img => img.id === image.id);
			if (exists) {
				return prevSelectedImages.filter(img => img.id !== image.id);
			} else if (prevSelectedImages.length < 2) {
				return [...prevSelectedImages, { ...image, displayValue: image.value }];
			}
			return prevSelectedImages;
		});
	};

	return (
		<>
			{selectedImages?.length > 0 && (
				<div
					className={`gallery-top ${
						selectedImages?.length === 2 ? 'active' : ''
					}`}>
					<button
						disabled={selectedImages?.length < 2}
						className={`btn-compare ${
							selectedImages?.length === 2 ? 'active' : ''
						}`}
						onClick={showCompare}>
						{t('patient.progress.omniRom.compare')}
					</button>
				</div>
			)}
			<Row gutter={[14, 8]} style={{ padding: 'var(--spacing-3)' }}>
				{screenshots && screenshots?.length > 0 ? (
					screenshots.map((item, index) => {
						const DateUtc =
							moment(item.createdAt).local().format('LL') +
							' ' +
							moment(item.createdAt).local().format('LT');

						return (
							<Col
								key={`col-${item.id}-${index}`}
								xs={{ span: 12 }}
								sm={{ span: 8 }}
								md={{ span: 6 }}
								lg={{ flex: '0 0 20%' }}
								xl={{ flex: '0 0 20%' }}>
								<div className="screenshot tipChart">
									<Image
										className={
											selectedImages?.some(img => img.id === item.id)
												? 'active'
												: ''
										}
										style={{ objectFit: 'cover' }}
										width="100%"
										height={125}
										src={item.screenshot}
										preview={{
											src: item.screenshot,
											mask: (
												<div className="screenshot-overlay">
													<UntitledIcon name="eye" size={24} />
												</div>
											),
											imageRender: () => (
												<div className="screenshot-preview">
													<img src={item.screenshot} alt={item.exerciseName} />
													<div className="screenshot-preview-date">{DateUtc}</div>
													<div className="screenshot-preview-score">{item.score}%</div>
												</div>
											),
										}}
									/>
									<UntitledIcon
										name="checkCircleFilled"
										size={20}
										className={
											selectedImages?.some(img => img.id === item.id)
												? 'select-icon active'
												: 'select-icon'
										}
										onClick={() => onSelectImage(item)}
									/>
									<div className="date">{DateUtc}</div>
									<div className="value">{item.score}%</div>
								</div>
							</Col>
						);
					})
				) : (
					<Flex
						align="center"
						justify="center"
						style={{ height: 'var(--spacing-24)', width: '100%' }}>
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={
								<span className="text-gray-300">
									{t('Patient.data.postures.noCaptureFound')}
								</span>
							}
						/>
					</Flex>
				)}
			</Row>
			{compareImage && selectedImages?.length === 2 && (
				<Modal
					title={t('patient.progress.omniRom.compareImages')}
					open={compareImage}
					onOk={showCompare}
					onCancel={showCompare}
					className="gallery-modal"
					centered
					width="60%">
					<CompareSlider
						left={selectedImages[0]?.screenshot}
						right={selectedImages[1]?.screenshot}
						leftLabel={`${moment(selectedImages[0]?.createdAt).local().format('LLL')} - ${selectedImages[0]?.score}% (${selectedImages[0]?.value}°)`}
						rightLabel={`${moment(selectedImages[1]?.createdAt).local().format('LLL')} - ${selectedImages[1]?.score}% (${selectedImages[1]?.value}°)`}
					/>
				</Modal>
			)}
		</>
	);
}
