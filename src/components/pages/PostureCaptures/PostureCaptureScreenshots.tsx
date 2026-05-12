import { UntitledIcon } from '@atoms/Icon';
import { useTypedSelector } from '@stores/index';
import { Posture, PostureAnalysisItem } from '@types';
import { Col, Empty, Flex, Image, Modal, Row } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './PostureCaptureScreenshots.css';

/* -------------------------------
   CUSTOM COMPARE SLIDER
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

	const onDrag = (e: MouseEvent) => {
		if (!containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();

		const x = e.clientX - rect.left;
		let p = (x / rect.width) * 100;

		if (p < 0) p = 0;
		if (p > 100) p = 100;

		setPos(p);
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

			{/* CIRCLE HANDLE WITH ARROWS */}
			<div
				onMouseDown={startDrag}
				className="compare-slider-handle"
				style={{
					left: `${pos}%`,
				}}>
				<span className="compare-slider-arrow compare-slider-arrow-left">
					‹
				</span>
				<span className="compare-slider-arrow compare-slider-arrow-right">
					›
				</span>
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

/* -------------------------------
   MAIN COMPONENT
---------------------------------- */
export default function PostureCaptureScreenshots({
	angle,
}: {
	angle: string;
}) {
	const { t } = useTranslation();
	const postureData = useTypedSelector(state => state.postures.postures.data);

	const [compareImage, setCompareImage] = useState(false);
	const [selectedImages, setSelectedImages] = useState<PostureAnalysisItem[]>(
		[],
	);

	const showCompare = () => setCompareImage(!compareImage);

	const onSelectImage = (image: PostureAnalysisItem) => {
		setSelectedImages(prev => {
			if (prev.includes(image)) {
				return prev.filter(i => i !== image);
			}
			if (prev.length < 2) return [...prev, image];
			return prev;
		});
	};

	const filteredImages = postureData
		?.flatMap(
			(session: Posture) =>
				session?.postureAnalytics?.filter(item => item?.view === angle) ?? [],
		)
		.filter((item): item is PostureAnalysisItem => item != null);

	return (
		<>
			{selectedImages.length > 0 && (
				<div
					className={`gallery-top ${selectedImages.length === 2 ? 'active' : ''}`}>
					<button
						disabled={selectedImages.length < 2}
						className={`btn-compare ${selectedImages.length === 2 ? 'active' : ''}`}
						onClick={showCompare}>
						{t('patient.progress.omniRom.compare')}
					</button>
				</div>
			)}

			<Row gutter={[14, 8]} style={{ padding: 'var(--spacing-3)' }}>
				{filteredImages && filteredImages.length > 0 ? (
					filteredImages.map((dataItem, index) => {
						const formattedDate =
							moment(dataItem?.createdAt).local().format('LL') +
							'\n' +
							moment(dataItem?.createdAt).local().format('LT');

						return (
							<Col
								key={`col-${index}`}
								xs={{ span: 12 }}
								sm={{ span: 8 }}
								md={{ span: 6 }}
								lg={{ flex: '0 0 20%' }}
								xl={{ flex: '0 0 20%' }}>
								<div className="screenshot tipChart">
									<Image
										className={
											selectedImages.includes(dataItem) ? 'active' : ''
										}
										style={{ objectFit: 'cover' }}
										width="100%"
										height={125}
										src={dataItem.screenshot}
										preview={{
											src: dataItem.screenshot,
											mask: (
												<div
													style={{
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
													}}>
													<UntitledIcon name="eye" size={18} />
												</div>
											),
										}}
									/>

									<UntitledIcon
										name="checkCircleFilled"
										size={20}
										className={
											selectedImages.includes(dataItem)
												? 'select-icon active'
												: 'select-icon'
										}
										onClick={() => onSelectImage(dataItem)}
									/>

									<div className="date">{formattedDate}</div>
									<div className="value">{dataItem?.ear}°</div>
								</div>
							</Col>
						);
					})
				) : (
					<Flex
						justify="center"
						align="center"
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

			{/* COMPARE MODAL */}
			{compareImage && selectedImages.length === 2 && (
				<Modal
					title={t('patient.progress.omniRom.compareImages')}
					open={compareImage}
					onOk={showCompare}
					onCancel={showCompare}
					className="gallery-modal"
					centered
					width="60%">
					<CompareSlider
						left={selectedImages[0].screenshot}
						right={selectedImages[1].screenshot}
						leftLabel={`${moment(selectedImages[0].createdAt).local().format('LLL')} - ${selectedImages[0].ear}°`}
						rightLabel={`${moment(selectedImages[1].createdAt).local().format('LLL')} - ${selectedImages[1].ear}°`}
					/>
				</Modal>
			)}
		</>
	);
}
