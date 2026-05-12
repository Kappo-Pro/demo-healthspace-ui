import { OnboardPathSkeleton } from '@atoms/Skeletons';
import { CONTENT_MANAGER_MOCK_DATA } from '@constants/plans';
import { OnboardFooter } from '@molecules/OnboardFooter';
import { HtmlSanitizer } from '@services/security';
import { PATIENT_ONBOARD, PLANS } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	fetchContentLibrary,
	getPlansByUserId,
} from '@stores/settings/settingsSlice';
import {
	setPainStatusButton,
	wellCheckNess,
} from '@stores/shared/onBoard/onBoard';
import { updatePlanByUserId } from '@stores/shared/settings/settings';
import { TOnBoardSymptomsProps } from '@types';
import { Card, Flex, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import FeatureCard from './FeatureCard';
import './style.css';

const { Title } = Typography;

export interface PlanFeature {
	title: string;
	planType: string;
	description: string;
	imageSrc: string;
}

export default function PatientPainStatus(props: TOnBoardSymptomsProps) {
	const { setActiveStep, setProgressPercent, setNavigatorDirection } = props;
	const dispatch = useTypedDispatch();
	const user = useTypedSelector(state => state.user);
	const savedUserPlans = useTypedSelector(
		state => state.settings.plans?.savedUserPlans,
	);
	const userPlanType = savedUserPlans?.planType;
	const [planFeatures, setPlanFeatures] = useState<PlanFeature[]>([]);
	const [selectedPlan, setSelectedPlan] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const plans = useTypedSelector(state => state.settings.content?.plans || []);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	useEffect(() => {
		initializePlans();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const initializePlans = async () => {
		const id = user.isPhysioterapist ? selectedUser?.id : user?.id;
		await dispatch(getPlansByUserId(id));
	};

	useEffect(() => {
		const hasValidPlans =
			Array.isArray(plans) && plans.length > 0 && plans.every(plan => plan?.id);
		const sourcePlans = hasValidPlans ? plans : [];
		const mockPlans = CONTENT_MANAGER_MOCK_DATA.plans || [];

		const finalPlans: PlanFeature[] = [];

		for (let i = 0; i < 3; i++) {
			const plan = sourcePlans[i] || {};
			const mock = mockPlans[i] || {};

			finalPlans.push({
				...mock,
				...plan,
				title: plan.title || mock.title || '',
				description: plan.description || mock.description || '',
				imageSrc: plan.thumbnail || mock.thumbnail || '',
				planType: plan.planType || mock.planType || '',
			});
		}
		setPlanFeatures(finalPlans);
	}, [plans]);

	useEffect(() => {
		fetchPlans();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchPlans = async () => {
		try {
			await dispatch(fetchContentLibrary());
		} catch (error) {
			console.error('❌ Error fetching plans:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const filteredFeatures = useMemo(() => {
		switch (userPlanType) {
			case PLANS.SCREENING:
				return [planFeatures[0]];
			case PLANS.EARLYINTERVENTION:
				return planFeatures.slice(0, 2);
			case PLANS.VIRTUALPT:
			default:
				return planFeatures;
		}
	}, [planFeatures, userPlanType]);

	const handleSelectPlan = (planType: string) => {
		setSelectedPlan(planType);
	};

	const handleContinue = async () => {
		if (!selectedPlan) return;

		setIsSubmitting(true);
		try {
			if (selectedPlan !== PATIENT_ONBOARD.VIRTUAL_PT) {
				setNavigatorDirection('forward');
				setProgressPercent(50);
				setActiveStep(5);
				dispatch(setPainStatusButton(PATIENT_ONBOARD.NO_PAIN));
				const params = { userId: user?.id, isWellCheckNess: true };
				await dispatch(wellCheckNess(params));
				dispatch(
					updatePlanByUserId({ userId: user?.id, planType: selectedPlan }),
				);
			} else {
				setNavigatorDirection('forward');
				setProgressPercent(30);
				setActiveStep(3);
				dispatch(setPainStatusButton(''));
				const params = { userId: user?.id, isWellCheckNess: false };
				await dispatch(wellCheckNess(params));
				dispatch(
					updatePlanByUserId({ userId: user?.id, planType: PLANS.VIRTUALPT }),
				);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleOptions = (str: string) => {
		const formattedStr = `
		<ul class="list-disc pl-5">
			${str.replace(/<p>/g, '<li>').replace(/<\/p>/g, '</li>')}
		</ul>
	`;

		const sanitized = HtmlSanitizer.sanitizePlanDescription(formattedStr);

		return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
	};

	// Loading state - show skeleton
	if (isLoading) {
		return <OnboardPathSkeleton cardCount={3} />;
	}

	// Single plan view (screening only)
	if (filteredFeatures?.length === 1 && filteredFeatures[0]) {
		return (
			<div className="container mx-auto mt-4">
				<Flex vertical align="center" justify="center">
					<Flex
						justify="center"
						gap={20}
						className="mb-10"
						style={{ width: '80%' }}>
						<Card className="feature-card" style={{ width: '80%' }}>
							<div className="select-none">
								<Flex vertical justify="space-between" className="h-auto">
									<Flex className="h-auto">
										<img
											src={planFeatures[0]?.imageSrc || ''}
											alt=""
											style={{
												objectFit: 'cover',
												height: '600px',
												width: '50%',
											}}
										/>
										<Flex
											vertical
											align="center"
											justify="center"
											className="w-[50%] p-4"
											style={{
												backgroundImage: "url('/images/dashboard/card-bg.png')",
												backgroundSize: 'cover',
												backgroundPosition: 'center',
											}}>
											<Flex
												justify="center"
												align="center"
												gap={15}
												className="text-white font-bold p-1">
												<Title
													level={3}
													className="font-bold text-white mt-2 text-[22px] text-center">
													{planFeatures[0]?.title?.toUpperCase()}
												</Title>
											</Flex>
											<div className="overflow-hidden sm:min-h-[150px] md:min-h-[180px] lg:min-h-[118px]">
												<div className="text-white font-inter text-[15px] font-light leading-[18.15px] mb-1 mr-1 ml-1 p-1 text-base">
													<p
														className="onboard-ul text-white px-8 py-2 rounded-lg"
														style={{
															backgroundColor:
																'color-mix(in srgb, var(--color-purple-600) 40%, transparent)',
															opacity: 0.9,
														}}>
														{handleOptions(planFeatures[0]?.description || '')}
													</p>
												</div>
											</div>
										</Flex>
									</Flex>
								</Flex>
							</div>
						</Card>
					</Flex>

					<OnboardFooter
						onContinue={async () => {
							setNavigatorDirection('forward');
							setProgressPercent(50);
							setActiveStep(5);
							dispatch(setPainStatusButton('noPain'));
							const params = { userId: user?.id, isWellCheckNess: true };
							await dispatch(wellCheckNess(params));
							dispatch(
								updatePlanByUserId({
									userId: user?.id,
									planType: planFeatures[0]?.planType,
								}),
							);
						}}
					/>
				</Flex>
			</div>
		);
	}

	// Multiple plans view
	return (
		<div className="container mx-auto mt-4">
			<Flex justify="center" gap={12}>
				{filteredFeatures?.map(
					(feature, index) =>
						feature && (
							<FeatureCard
								key={index}
								title={feature.title}
								description={feature.description}
								planType={feature.planType}
								imageSrc={feature.imageSrc}
								isSelected={selectedPlan === feature.planType}
								onSelect={handleSelectPlan}
							/>
						),
				)}
			</Flex>

			<OnboardFooter
				onContinue={handleContinue}
				disabled={!selectedPlan}
				loading={isSubmitting}
			/>
		</div>
	);
}
