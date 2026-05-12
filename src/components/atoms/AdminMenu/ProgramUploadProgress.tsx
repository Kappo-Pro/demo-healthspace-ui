import { ChevronRight } from '@vitalflow-icons/arrows/chevronRight';
import VideoPlayer from '@organisms/ProgramFlow/CompletionScreen/VideoPlayer';
import { UploadBar } from '@organisms/ProgramFlow/UploadBar';
// REMOVED: import { useTypedSelector } from '@stores/index';
import { ProgramExerciseUpload } from '@types';
import { Avatar, Flex, Popover, Progress, Typography } from 'antd';
import { PROGRESS_COLORS } from '@atoms/Progress/progressConfig';

const { Paragraph } = Typography;

export const ProgramUploadProgress = ({
	progressData,
}: {
	progressData: ProgramExerciseUpload;
}) => {
	return (
		<Popover
			title={progressData.program?.name}
			content={
				<Flex vertical gap={12}>
					{progressData.exercises.map((item, index) => {
						return (
							<Flex className="w-80 h-16 rounded-xl" align="center" justify="space-between" gap={8}>
								<Flex align="center">
									<VideoPlayer
										className="w-20 h-14 p-1 m-1 rounded-lg"
										video={item?.video}
										controls={false}
									/>
									<Paragraph className="font-semibold">{item?.name?.toUpperCase()}</Paragraph>
								</Flex>
								<Progress
									type="circle"
									percent={progressData.progress[index]}
									strokeColor={PROGRESS_COLORS.SUCCESS}
									width={50}
									format={percent => (
										<span className="font-bold" style={{ color: 'var(--text-success)' }}>
											{percent}%
										</span>
									)}
								/>
							</Flex>
						);
					})}
				</Flex>
			}
			placement="right">
			<Flex className="bg-black/35 h-16 w-full rounded-2xl cursor-pointer mb-4" justify="space-around" align="center">
				<Flex className="h-12 p-2 w-[100%]" align="center">
					<Avatar
						style={{
							backgroundColor:
								progressData?.user?.profile?.avatarColor || 'var(--brand-primary)',
							color: 'var(--text-on-brand)',
							fontSize: '27px',
						}}
						alt="avatar"
						size={45}>
						{progressData?.user?.profile?.fullName?.charAt(0).toUpperCase()}
					</Avatar>
					<span className=" ml-3">
						{progressData?.user?.profile?.fullName}
						<UploadBar
							uploadProgress={Math.ceil(
								progressData?.progress?.reduce(
									(partialSum, a) => partialSum + a,
									0,
								) / progressData?.progress.length,
							)}
						/>
					</span>
				</Flex>
				<ChevronRight color="stroke-white mr-3" />
			</Flex>
		</Popover>
	);
};
