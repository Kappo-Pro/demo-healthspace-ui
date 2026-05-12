import { UntitledIcon } from '@atoms/Icon';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	createProgram,
	createProgramTemplate,
	updateProgram,
} from '@stores/shared/patientDetail/program';
import {
	AddProgramPopupProps,
	DeleteExerciseIds,
	IProgramExercise,
	ThumbnailProps,
} from '@types';
import { Button, Flex, Modal, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddLibraryExerciseModal } from './AddLibraryExerciseModal';
import AddProgramItem from './AddProgramItem';

export const AddProgramPopup = ({
	isVisible,
	onOk,
	onCancel,
	isSaveTemplateVisible,
	selectedExercises,
	_deleteProgram,
	isEdit,
	setSelectedExercises,
	program,
	refresh,
	setRefresh,
	programId,
	strapiId,
	activeKey,
	thumbnailValue,
	setSearchValue,
}: AddProgramPopupProps) => {
	const [isSaving, setIsSaving] = useState(false);
	const [modalLabel, setModalLabel] = useState<string[]>();
	const [outLabel, setOutLabel] = useState<string[]>();
	const [isSaveTemplate, setSaveTemplate] = useState(false);
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const [programName, setProgramName] = useState<string>(program?.name ?? '');
	const [programDescription, setProgramDescription] = useState<string>(
		program?.description ?? '',
	);
	const _user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const [duration, setDuration] = useState<number>(program?.duration ?? 0);
	const [durationType, setDurationType] = useState<string>(
		program?.durationType ?? '',
	);
	const [programStartDate, setProgramStartDate] = useState<string>(
		program
			? dayjs(program?.startAt ? program?.startAt : program?.createdAt).format(
					'YYYY-MM-DD',
				)
			: '',
	);
	const [isLibraryModalVisible, SetLibraryModalVisible] = useState(false);
	const [deleteArray, setDeleteArray] = useState<DeleteExerciseIds[]>([]);
	const [imgFile, setImgFile] = useState<File | null>(null);

const [previewImage, setPreviewImage] = useState<string>(
  thumbnailValue || '/images/programs/ProgramDefaultImage.jpg',
);

const [previewUnSplashedImage, setPreviewUnSplashedImage] = useState<
  string | ThumbnailProps
>(program?.thumbnail || '/images/programs/ProgramDefaultImage.jpg');


useEffect(() => {
  if (!thumbnailValue) {
    fetch('/images/programs/ProgramDefaultImage.jpg')
      .then(res => res.blob())
      .then(blob => {
        const file = new File(
          [blob],
          'ProgramDefaultImage.jpg',
          { type: blob.type }
        );
        setImgFile(file);
      });
  }
}, [thumbnailValue]);


	const isOutOfLimit = selectedExercises?.some(
		item =>
			item.reps > 100 ||
			item.reps < 1 ||
			item.sets > 100 ||
			item.sets < 1 ||
			item.weeklyReps > 100 ||
			item.weeklyReps < 1 ||
			item.dailyReps > 100 ||
			item.dailyReps < 1,
	);
	const isWarning = selectedExercises?.some(
		item =>
			item.reps >= 15 ||
			item.sets >= 15 ||
			item.weeklyReps >= 15 ||
			item.dailyReps >= 15,
	);

	const getDefaultImageFile = async (): Promise<File> => {
  const response = await fetch('/images/programs/ProgramDefaultImage.jpg');
  const blob = await response.blob();

  return new File([blob], 'ProgramDefaultImage.jpg', {
    type: blob.type,
  });
};


	useEffect(() => {
		if (isOutOfLimit) {
			const modalLabelSet = new Set<string>();
			selectedExercises.forEach(item => {
				if (item.reps > 100 || item.reps < 1) {
					modalLabelSet.add(
						t('Admin.data.managePatient.rehab.exercises.repetitions'),
					);
				}
				if (item.sets > 100 || item.sets < 1) {
					modalLabelSet.add(
						t('Admin.data.managePatient.rehab.exercises.setsPerSession'),
					);
				}
				if (item.weeklyReps > 100 || item.weeklyReps < 1) {
					modalLabelSet.add(
						t('Admin.data.managePatient.rehab.exercises.sessionsPerWeek'),
					);
				}
				if (item.dailyReps > 100 || item.dailyReps < 1) {
					modalLabelSet.add(
						t('Admin.data.managePatient.rehab.exercises.setsPerDay'),
					);
				}
			});
			setOutLabel(Array.from(modalLabelSet));
			return;
		}

		if (isWarning) {
			const modalLabelSet = new Set<string>();
			selectedExercises.forEach(item => {
				if (item.reps >= 15) {
					modalLabelSet.add(
						t('Admin.data.managePatient.rehab.exercises.repetitions'),
					);
				}
				if (item.sets >= 15) {
					modalLabelSet.add(
						t('Admin.data.managePatient.rehab.exercises.setsPerSession'),
					);
				}
				if (item.weeklyReps >= 15) {
					modalLabelSet.add(
						t('Admin.data.managePatient.rehab.exercises.sessionsPerWeek'),
					);
				}
				if (item.dailyReps >= 15) {
					modalLabelSet.add(
						t('Admin.data.managePatient.rehab.exercises.setsPerDay'),
					);
				}
			});
			setModalLabel(Array.from(modalLabelSet));
			return;
		}
	}, [selectedExercises, isOutOfLimit, isWarning, t]);

	useEffect(() => {
		if (program) {
			setProgramStartDate(
				dayjs(program?.startAt ? program?.startAt : program?.createdAt).format(
					'YYYY-MM-DD',
				),
			);
			setProgramName(program?.name ?? '');
			setDuration(program?.duration ?? 0);
			setDurationType(program?.durationType ?? '');
			setProgramDescription(program?.description ?? '');
			// imgFile will be set by the useEffect that fetches the default image
			setPreviewImage(thumbnailValue);
			setPreviewUnSplashedImage(
				program?.thumbnail || '/images/programs/ProgramDefaultImage.jpg',
			);
		}
	}, [isVisible, program, thumbnailValue]);

	const handleCreateProgram = async () => {
		try {
			setIsSaving(true); // ✅ start loading

			const exercises = [];

			selectedExercises?.forEach((exercise, index) => {
				exercises.push({
					strapiExerciseId: exercise.strapiExerciseId || '',
					exerciseLibraryId: exercise.exerciseLibraryId || '',
					weeklyReps: exercise.weeklyReps,
					dailyReps: exercise.dailyReps,
					sets: exercise.sets,
					reps: exercise.reps,
					order: index + 1,
				});
			});

			const formData = new FormData();

			let imageFile = imgFile;

if (!imageFile) {
  imageFile = await getDefaultImageFile(); // convert to binary
}

			formData.append('name', programName);
			formData.append('duration', duration.toString());
			formData.append('durationType', durationType);
			formData.append('description', programDescription);
			formData.append('thumbnail', imageFile);

			if (selectedUser?.id) {
				formData.append('userId', String(selectedUser.id));
			} else {
				return;
			}

			exercises.forEach((exercise, index) => {
				Object.keys(exercise).forEach(key => {
					if (exercise[key]) {
						formData.append(
							`exercises[create][${index}][${key}]`,
							exercise[key],
						);
					}
				});
			});

			const data = await dispatch(createProgram(formData));

			if (data?.payload?.id) {
				handleReset();
				onCancel();
			}
		} catch (error) {
			message.error(
				t('Admin.data.menu.patientDetail.aiAssistantPrograms.createFailed'),
			);
		} finally {
			setIsSaving(false); // ✅ stop loading
		}
	};


	const handleReset = () => {
		setRefresh(prev => !prev);
		setSelectedExercises([]);
		setProgramName('');
		setDuration(parseInt(''));
		setDurationType('');
		setProgramStartDate('');
		onOk();
		if (setSearchValue) {
			setSearchValue('');
		}
		setSaveTemplate(false);
	};

	const handleRemoveExercise = (id: number | string) => {

		const filtered = selectedExercises.filter(exercise => {
			// Convert both to string for comparison to handle type mismatches
			const exerciseId = String(exercise?.id);
			const removeId = String(id);
			const shouldKeep = exerciseId !== removeId;
			return shouldKeep;
		});

		setSelectedExercises(filtered);
		const selected = selectedExercises.find(exercise => exercise?.id === id);
		const deleteData: DeleteExerciseIds[] = [...deleteArray];
		if (selected?.programId && selected.id) {
			deleteData.push({
				id: selected.id,
			});
		}
		setDeleteArray(deleteData);
	};

	const validateProgram = () => {
		if (selectedExercises.length <= 0) {
			message.error(
				t('Admin.data.menu.patientDetail.aiAssistantPrograms.selectAtLeast'),
			);
		} else if (!programName?.trim()) {
			message.error(
				t('Admin.data.menu.patientDetail.aiAssistantPrograms.programNameErr'),
			);
		} else if (!programDescription?.trim()) {
			message.error(
				t(
					'Admin.data.menu.patientDetail.aiAssistantPrograms.programDescriptionErr',
				),
			);
		} else if (!programStartDate) {
			message.error(
				t('Admin.data.menu.patientDetail.aiAssistantPrograms.startDateErr'),
			);
		} else if (!duration) {
			message.error(
				t('Admin.data.menu.patientDetail.aiAssistantPrograms.durationErr'),
			);
		} else if (duration <= 0) {
			message.error(
				t('Admin.data.menu.patientDetail.aiAssistantPrograms.durationValid'),
			);
		} else if (!durationType) {
			message.error(
				t('Admin.data.menu.patientDetail.aiAssistantPrograms.durationTypeErr'),
			);
		} else {
			isOutOfLimit
				? message.error({
						content:
							outLabel && outLabel.length > 0
								? outLabel.length > 1
									? `${outLabel.slice(0, -1).join(', ')} ${t('Admin.data.menu.patientDetail.aiAssistantPrograms.and')} ${outLabel[outLabel.length - 1]} ${t('Admin.data.menu.patientDetail.aiAssistantPrograms.validationBetween')}`
									: `${outLabel[0]} ${t('Admin.data.menu.patientDetail.aiAssistantPrograms.validationBetween')}`
								: t('No values exceeded the limit'),
					})
				: isWarning
					? message.info({
							content: (
								<div className="m-5" style={{ color: 'var(--text-primary)' }}>
									{modalLabel && modalLabel.length > 1
										? modalLabel.slice(0, -1).join(', ') +
											' ' +
											t('Admin.data.rehab.addExerciseFromLibrary.and') +
											' ' +
											modalLabel[modalLabel.length - 1]
										: modalLabel?.[0]}{' '}
									{t('Admin.data.rehab.addExerciseFromLibrary.greaterThan')}
									<Flex justify="center" className="mt-4">
										<div className="mr-[10px]">
											<Button
												onClick={() => message.destroy()}
												ghost={true}
												size="small">
												{t('Admin.data.rehab.addExerciseFromLibrary.cancel')}
											</Button>
										</div>
										<Button
											onClick={() => {
												message.destroy();
												isEdit ? handleEditProgram() : handleCreateProgram();
											}}
											size="small">
											{t('Admin.data.rehab.rehabPreAssessment.okText')}
										</Button>
									</Flex>
								</div>
							),
							className: 'program-warning',
							duration: 0,
							icon: <></>,
						})
					: isEdit
						? handleEditProgram()
						: handleCreateProgram();
		}
	};

	const handleEditProgram = async () => {
		if (isSaveTemplate) handleCreateProgramTemplate();
		setIsSaving(true)
		const exercises: IProgramExercise[] = [];
		const newItemList: IProgramExercise[] = [];
		selectedExercises?.map((exercise: IProgramExercise, index: number) => {
			const tempExercise: IProgramExercise = {
				weeklyReps: exercise.weeklyReps,
				dailyReps: exercise.dailyReps,
				sets: exercise.sets,
				reps: exercise.reps,
				order: index + 1,
			};
			if (exercise.programId) {
				tempExercise.id = exercise.id;
				exercises.push(tempExercise);
			} else {
				if (exercise.strapiExerciseId) {
					tempExercise.strapiExerciseId = exercise.strapiExerciseId;
				} else {
					tempExercise.exerciseLibraryId = exercise.exerciseLibraryId;
				}
				newItemList.push(tempExercise);
			}
		});

		const formData = new FormData();
		formData.append('name', programName);
		formData.append('duration', duration.toString());
		formData.append('durationType', durationType);
		formData.append('description', programDescription);
		formData.append('startAt', programStartDate);
		if (imgFile) {
			formData.append('thumbnail', imgFile);
		}
		newItemList.forEach((exercise, index) => {
			Object.keys(exercise).forEach(key => {
				formData.append(
					`exercises[create][${index}][${key}]`,
					exercise[key]?.toString(),
				);
			});
		});
		exercises.forEach((exercise, index) => {
			Object.keys(exercise).forEach(key => {
				formData.append(
					`exercises[update][${index}][${key}]`,
					exercise[key]?.toString(),
				);
			});
		});
		deleteArray.forEach((exercise, index) => {
			Object.keys(exercise).forEach(key => {
				formData.append(
					`exercises[delete][${index}][${key}]`,
					exercise[key]?.toString(),
				);
			});
		});
		if (program?.id) {
			const data = await dispatch(
				updateProgram({ programId: program.id, programData: formData }),
			);
			console.log("UPDATE RESPONSE 👉", data);

		if (data?.payload?.id) {
  message.success(
    t('Admin.data.menu.patientDetail.aiAssistantPrograms.updateSuccess'),
  );

  onCancel();
  setRefresh(prev => !prev);

} else if (data?.payload?.message) {
  // ✅ real backend message
  message.error(data.payload.message);

} else {
  message.error('Something went wrong!');
}

		}
		setIsSaving(false)
	};

const handleCreateProgramTemplate = async () => {
  try {
    const formData = new FormData();

    formData.append('name', programName);
    formData.append('duration', duration.toString());
    formData.append('durationType', durationType);
    formData.append('description', programDescription);

    if (imgFile) {
      formData.append('thumbnail', imgFile);
    }

    const exercises = selectedExercises.map((exercise, index) => {
      const tempExercise = {
        weeklyReps: exercise.weeklyReps,
        dailyReps: exercise.dailyReps,
        sets: exercise.sets,
        reps: exercise.reps,
        order: index + 1,
      };

      return exercise.strapiExerciseId
        ? { ...tempExercise, strapiExerciseId: exercise.strapiExerciseId }
        : { ...tempExercise, exerciseLibraryId: exercise.exerciseLibraryId };
    });

    exercises.forEach((exercise, index) => {
      Object.keys(exercise).forEach(key => {
        const value = exercise[key];

        if (value !== null && value !== undefined) {
          formData.append(
            `exercises[create][${index}][${key}]`,
            value.toString(),
          );
        }
      });
    });

    // ✅ unwrap = throw error if failed
    await dispatch(createProgramTemplate(formData)).unwrap();

    message.success(
      t('Admin.data.menu.patientDetail.aiAssistantPrograms.templateCreateSuccess'),
    );

    handleReset(); // only on success

  } catch (err: any) {
    // ✅ Only ONE error place
    const errorMessage =
      err?.message ||
      err?.payload?.message ||
      t('Admin.data.menu.patientDetail.aiAssistantPrograms.templateCreateFailed');

    message.error(errorMessage);
  }
};


	const itemSelection = (item: IProgramExercise[]) => {
		const results = selectedExercises.filter(
			({ id: id1 }) => !item.some(({ id: id2 }) => id2 === id1),
		);
		setSelectedExercises(item);
		const deleteData: DeleteExerciseIds[] = [...deleteArray];
		if (results.length > 0 && results[0]?.programId && results[0]?.id) {
			deleteData.push({
				id: results[0].id,
			});
		}
		setDeleteArray(deleteData);
	};

	return (
		<Modal
			title={
				<Typography.Text
					style={{
						fontSize: 'var(--font-size-xl)',
						fontWeight: 'var(--font-weight-semibold)',
						color: 'var(--text-primary)',
					}}>
					<UntitledIcon name="edit" />{' '}
					{isEdit
						? t('Admin.data.menu.patientDetail.aiAssistantPrograms.edit')
						: t('Admin.data.menu.patientDetail.aiAssistantPrograms.create')}
				</Typography.Text>
			}
			onOk={onOk}
			open={isVisible}
			style={{ top: 20 }}
			onCancel={onCancel}
			footer={false}
			width={MODAL_SIZES.LARGE}
			className="select-none"
			maskClosable={false}>
			<AddProgramItem
				selectedExercises={selectedExercises}
				isSaveTemplate={isSaveTemplate}
				isSaveTemplateVisible={isSaveTemplateVisible}
				setSelectedExercises={setSelectedExercises}
				validateProgram={validateProgram}
				handleRemoveExercise={handleRemoveExercise}
				setSaveTemplate={setSaveTemplate}
				SetLibraryModalVisible={SetLibraryModalVisible}
				programName={programName}
				setProgramName={setProgramName}
				setProgramStartDate={setProgramStartDate}
				programStartDate={programStartDate}
				duration={duration}
				setDuration={setDuration}
				setDurationType={setDurationType}
				durationType={durationType}
				programDescription={programDescription}
				setProgramDescription={setProgramDescription}
				isSaving={isSaving}
				imgFile={imgFile}
				setImgFile={setImgFile}
				previewImage={previewImage}
				setPreviewImage={setPreviewImage}
				previewUnSplashedImage={previewUnSplashedImage}
				setPreviewUnSplashedImage={setPreviewUnSplashedImage}
			/>
			<AddLibraryExerciseModal
				isVisible={isLibraryModalVisible}
				onOk={() => SetLibraryModalVisible(false)}
				onCancel={() => SetLibraryModalVisible(false)}
				selectedExercises={selectedExercises}
				setSelectedExercises={itemSelection}
			/>
		</Modal>
	);
};
