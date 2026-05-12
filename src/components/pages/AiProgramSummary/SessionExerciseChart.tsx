import { UntitledIcon } from '@atoms/Icon';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import { useTheme } from '@providers/ThemeProvider';
import { useTypedDispatch } from '@stores/index';
import { setSessionClicked } from '@stores/shared/patientDetail/program';
import { ProgramSessionResult } from '@types';
import { Button, Image, Modal, Row, Tag, Typography } from 'antd';
import moment from 'moment';
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
const { Paragraph } = Typography;

// Lazy load the heavy chart library
const Line = lazy(() =>
	import('@ant-design/charts').then(m => ({ default: m.Line })),
);

interface SessionInfoProps {
	exerciseTitle: string;
	exerciseProgramData: ProgramSessionResult[];
	programDescription: string;
	programTutorialVideo: string;
}

// Helper function to resolve CSS variables to actual color values
const getCSSVariableValue = (variable: string): string => {
	if (typeof window === 'undefined') return variable;
	const value = getComputedStyle(document.documentElement)
		.getPropertyValue(variable.replace('var(', '').replace(')', ''))
		.trim();
	return value || variable;
};


const customIcons = [
	{
		key: 0,
		value: 'TOO EASY',
		color: 'var(--color-success-400)',
		icon: (
			<UntitledIcon
				name="faceHappy"
				size={24}
				style={{ stroke: 'var(--color-success-400)' }}
			/>
		),
	},
	{
		key: 1,
		value: 'EASY',
		color: 'var(--color-success-500)',
		icon: (
			<UntitledIcon
				name="faceSmile"
				size={24}
				style={{ stroke: 'var(--color-success-500)' }}
			/>
		),
	},
	{
		key: 2,
		value: 'NORMAL',
		color: 'var(--color-warning-200)',
		icon: (
			<UntitledIcon
				name="faceNeutral"
				size={24}
				style={{ stroke: 'var(--color-warning-200)' }}
			/>
		),
	},
	{
		key: 3,
		value: 'HARD',
		color: 'var(--color-warning-600)',
		icon: (
			<UntitledIcon
				name="faceFrown"
				size={24}
				style={{ stroke: 'var(--color-warning-600)' }}
			/>
		),
	},
	{
		key: 4,
		value: 'TOO HARD',
		color: 'var(--color-warning-700)',
		icon: (
			<UntitledIcon
				name="faceSad"
				size={24}
				style={{ stroke: 'var(--color-warning-700)' }}
			/>
		),
	},
];

const getConfig = (
	chartData: {
		date: number;
		REHAB: number;
		screenshot?: string;
		video?: string;
		formattedDate: string;
	}[],
	t: (key: string) => string,
	isDark: boolean,
) => ({
	data: chartData,

	xField: 'date',
	yField: 'REHAB',

	/** 🔑 THIS IS MANDATORY */
	theme: isDark ? 'dark' : 'light',

	scale: {
		y: {
			domain: [0, 5],
			ticks: [0, 1, 2, 3, 4, 5],
			nice: false,
			sync: false,
		},
		x: {
			type: 'time',
		},
	},

	axis: {
		x: {
			labelFormatter: (v: number) =>
				moment(v).format('MMM D, HH:mm'),
			label: {
				style: {
					fill: isDark ? '#E5E7EB' : '#374151',
					fontSize: 12,
				},
			},
			line: {
				style: {
					stroke: isDark ? '#374151' : '#E5E7EB',
				},
			},
			tickLine: {
				style: {
					stroke: isDark ? '#374151' : '#E5E7EB',
				},
			},
		},
		y: {
			title: false,
			labelFormatter: (v: number) => `${v}`,
			label: {
				style: {
					fill: isDark ? '#E5E7EB' : '#374151',
					fontSize: 12,
				},
			},
			grid: {
				line: {
					style: {
						stroke: isDark ? '#374151' : '#E5E7EB',
						lineDash: [4, 4],
					},
				},
			},
		},
	},

	line: {
		style: {
			stroke: '#3B82F6',
			lineWidth: 2,
		},
	},

	point: {
		size: 5,
		shape: 'circle',
		style: {
			fill: '#3B82F6',
			stroke: isDark ? '#111827' : '#FFFFFF',
			lineWidth: 1.5,
		},
	},

	interaction: {
		tooltip: {
			render: (_event, { title }) => {
				const ts = Number(title);
				const d = chartData.find(item => item.date === ts);
				if (!d) return '';

				const icon = customIcons[d.REHAB];

				return `
          <div class="chart-tool-tip">
            <div style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              margin-bottom:8px;
            ">
              <div style="font-size:12px;   color:${isDark ? '#FFFFFF' : '#374151'}">
                ${moment(d.date).format('MMMM D, YYYY h:mm A')}
              </div>

              <div style="
                display:flex;
                align-items:center;
                gap:6px;
                color:${icon?.color};
                font-weight:500;
              ">
                <span>${icon?.value}</span>
              </div>
            </div>

            ${d.screenshot
						? `<img src="${d.screenshot}" class="chart-tooltip-media" />`
						: d.video
							? `<video src="${d.video}" controls class="chart-tooltip-media"></video>`
							: ''
					}
          </div>
        `;
			},
		},
	},

	slider: {
		x: {
			values: [0, 1],
			labelFormatter: (v: number) =>
				moment(Number(v)).format('MMMM D, YYYY h:mm A'),
		},
		height: 25,
	},
});

const CustomModalInfo = (props: {
	name: string;
	description: string;
	video: string;
}) => {
	const { name, description, video } = props;

	const modalContent = (
		<div
			className="select-none"
			style={{ textAlign: 'center', marginTop: '10%' }}>
			<video
				controls
				className="video"
				preload="metadata"
				src={video}
				width="100%"
				height="100%"
			/>
			<div className="select-none mt-6">
				<Typography.Title level={5}>{name}</Typography.Title>
				<Typography.Text>{description}</Typography.Text>
			</div>
		</div>
	);
	Modal.info({
		title: null,
		content: modalContent,
		maskClosable: true,
		icon: null,
		okButtonProps: { style: { display: 'none' } },
		closable: true,
	});
};

export const SessionExerciseChart = ({
	exerciseTitle,
	exerciseProgramData,
	programDescription,
	programTutorialVideo,
}: SessionInfoProps) => {
	const { t } = useTranslation();
	const { isDark } = useTheme();

	const chartData = exerciseProgramData?.map(
    (data: ProgramSessionResult) => ({
      date: moment(data.createdAt).valueOf(), // timestamp
      REHAB: Number(data.exerciseDifficultyLevel ?? 0),
      screenshot: data.thumbnail,
      video: data.video,
      formattedDate: moment(data.createdAt).format(
        'MMM D, YYYY hh:mm A',
      ),
    }),
  ) ?? [];

  const config = getConfig(chartData, t, isDark);

	const dispatch = useTypedDispatch();
	return (
		<div className="session-exercise-chart">
			<div className="chart-header-container">
				<Button
					className="arrow-left"
					onClick={() => dispatch(setSessionClicked(false))}>
					<UntitledIcon name="arrowLeft" />
				</Button>
				<span className="exercise-title">{exerciseTitle}</span>
				<Tag
					style={{
						backgroundColor: 'var(--color-purple-600)',
						color: 'var(--text-on-color)',
						borderColor: 'var(--color-purple-600)',
					}}>
					{exerciseProgramData?.length} Sessions
				</Tag>
			</div>
			<Suspense fallback={<ActivityFeedSkeleton count={6} />}>
				<Line
					height={300}
					padding={[40, 40, 80, 40]}
					// className="line-chart"
					{...config}
				/>
			</Suspense>
			<Row className="exercise-program-data-container">
	{exerciseProgramData?.map((data: ProgramSessionResult) => {
		return (
			<div className="exercise-video-player-container">

				{/* Media Wrapper */}
				<div
					style={{
						width: '250px',
						height: '160px',
						overflow: 'hidden',
						borderTopLeftRadius: '16px',
						borderTopRightRadius: '16px',
					}}
				>
					{data?.video ? (
						<video
							controls
							preload="metadata"
							src={data?.video}
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								borderRadius: 'inherit',
							}}
						/>
					) : (
						<Image
							src={data?.thumbnail}
							rootClassName='exercise-image-view'
							preview={false}
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								borderRadius: 'inherit',
							}}
						/>
					)}
				</div>

				<div>
					<span
						className="info-container"
						onClick={() =>
							CustomModalInfo({
								video: programTutorialVideo,
								name: exerciseTitle,
								description: programDescription,
							})
						}>
						<UntitledIcon name="infoCircle" />
					</span>
				</div>

				<div
					className="date-container"
					style={{ marginTop: '-8px' }}
				>
					<span style={{ color: 'var(--text-on-dark)' }}>
						{moment(data.createdAt).local().format('LLL')}
					</span>
				</div>

			</div>
		);
	})}
</Row>

		</div>
	);
};
