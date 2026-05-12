import { UntitledIcon } from '@atoms/Icon';
import strapi from '@strapi';
import { Modal, Typography } from 'antd';
import { stringify } from 'qs';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IApiDataItem {
	exercise_video?: {
		url: string;
	}[];
	trueToForm?: {
		url: string;
	};
	exercise_image?: {
		url: string;
	}[];
	name?: string;
}

export default function TrueToFormPatientOnboard() {
	const [apiData, setApiData] = useState<IApiDataItem[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPage, setTotalPage] = useState<number>(1);
	const [modalVisible, setModalVisible] = useState(false);
	const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const { t } = useTranslation();

	useEffect(() => {
		fetchData(10, currentPage);
	}, [currentPage]);

	const fetchData = async (limit: number, current: number) => {
		const query = stringify({
			pagination: {
				page: current,
				pageSize: limit,
			},
			populate: {
				trueToForm: true,
				exercise_video: true,
				exercise_image: true,
			},
		});
		const { data } = await strapi.get(`/exercises?${query}`);
		if (data?.data?.length) {
			setApiData(prev => [...prev, ...(data?.data ?? [])]);
			setTotalPage(data?.meta?.pagination?.pageCount);
		}
	};

	const handleNextPage = () => {
		totalPage != currentPage && setCurrentPage(prev => prev + 1);
	};

	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(prev => prev - 1);
		}
	};

	const scrollLeft = () => {
		if (scrollRef.current) {
			const currentPosition = scrollRef.current?.scrollLeft;
			const targetPosition = currentPosition - 400;
			scrollToPosition(targetPosition, 300);
		}
		if (scrollRef.current?.scrollLeft === 0) {
			handlePreviousPage();
		}
	};

	const scrollRight = () => {
		if (scrollRef.current) {
			const currentPosition = scrollRef.current?.scrollLeft;
			const targetPosition = currentPosition + 400;
			scrollToPosition(targetPosition, 300);
		}
		if (
			scrollRef.current &&
			scrollRef.current.scrollLeft + scrollRef.current.offsetWidth >=
				scrollRef.current.scrollWidth
		) {
			handleNextPage();
		}
	};

	const scrollToPosition = (targetPosition: number, duration: number) => {
		const startTime = performance.now();
		const start = scrollRef.current?.scrollLeft ?? 0;

		const scroll = (timestamp: number) => {
			const elapsed = timestamp - startTime;
			const progress = Math.min(elapsed / duration, 1);
			if (scrollRef.current) {
				scrollRef.current.scrollLeft =
					start + (targetPosition - start) * progress;
			}
			if (progress < 1) {
				requestAnimationFrame(scroll);
			}
		};

		requestAnimationFrame(scroll);
	};

	const handleImageClick = (videoUrl: string) => {
		setActiveVideoUrl(videoUrl);
		setModalVisible(true);
	};

	const handleCloseModal = () => {
		setModalVisible(false);
		if (videoRef.current) {
			videoRef.current.pause();
			videoRef.current.currentTime = 0;
		}
		setActiveVideoUrl(null);
	};

	return (
		<div className="true-to-form-container">
			<Typography className="true-to-form-header">
				<span className="true-to-form-title">
					{t('Patient.data.onboard.trueToFormTitle')}
				</span>
				<span className="true-to-form-description">
					{t('Patient.data.onboard.trueToFormDescription')}
				</span>
			</Typography>
			<div className="image-navigation-container">
				<div
					className="horizontal-scroll-container"
					ref={scrollRef}
					style={{ position: 'relative' }}>
					{(apiData ?? []).map((item, index) => {
						const videoUrl = item?.trueToForm?.url;
						if (videoUrl) {
							return (
								<div
									key={index}
									className="custom-image-container-true-form"
									onClick={e => {
										e.stopPropagation();
										handleImageClick(videoUrl);
									}}>
									<div className="image-wrapper-form">
										<img
											src={item?.exercise_image?.[0]?.url}
											alt={item?.name}
											className="true-to-form-image saturate-image"
										/>
										<div className="title-true-form">
											<span>{item?.name}</span>
										</div>
									</div>
								</div>
							);
						}
					})}
				</div>
				<div className="navigation-buttons">
					<span className="nav-button left" onClick={scrollLeft}>
						<UntitledIcon name="leftOutlined" size={16} style={{ color: 'var(--stroke-default-white)' }} />
					</span>
					<span className="nav-button right" onClick={scrollRight}>
						<UntitledIcon name="rightOutlined" size={16} style={{ color: 'var(--stroke-default-white)' }} />
					</span>
				</div>
			</div>
			<Modal
				open={modalVisible}
				onCancel={handleCloseModal}
				width="60%"
				footer={null}
				centered
				destroyOnHidden>
				<div className="modal-video-wrapper">
					{activeVideoUrl && (
						<video
							ref={videoRef}
							autoPlay
							controls
							className="modal-video"
							src={activeVideoUrl}
						/>
					)}
				</div>
			</Modal>
		</div>
	);
}
