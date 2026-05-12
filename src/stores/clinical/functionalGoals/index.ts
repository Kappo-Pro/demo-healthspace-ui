import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ProgramFilterOptions, StrapiPagination, SuggestedProgramItem } from '@types';
import qs from 'qs';
import { stringify } from 'qs';
import strapi from 'src/Strapi';

interface FunctionalGoalsState {
	popoverState: boolean;
	functionalGoals: GetDetails | null;
	joints: ProperDetails | null;
	categories: GetDetails | null;
	bodyRegions: ProperDetails | null;
	loading: boolean;
	error: string | null;
	jointWithBodyRegion: ProperDetails | null;
	selectedSideName: string;
	programSubgoals: ProperDetails | null;
	programExperienceLevels: ProperDetails | null;
	programTimeAvailabilities: ProperDetails | null;
	programWorkoutTypes: ProperDetails | null;
}

interface SystemLibrary {
	page: number;
	limit: number;
	title: string;
	filterOptions: ProgramFilterOptions;
}

interface ProgramResponse {
  data: SuggestedProgramItem[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface SystemTemplates {
	page: number;
	limit: number;
	title: string;
	filterOptions: ProgramFilterOptions;
}
export interface GetDetails {
	data: [
		{
			id: number;
			attributes: {
				name: string;
				description: string;
				thumbnail: string;
				createdAt: string;
				updatedAt: string;
				publishedAt: string;
			};
		},
	];
	meta: {
		pagination: StrapiPagination;
	};
}

export interface ProperDetails {
	data: [
		{
			id: number;
			name: string;
			locale: string;
			createdAt: string;
			updatedAt: string;
			publishedAt: string;
		},
	];
	meta: {
		pagination: StrapiPagination;
	};
}
export const getFunctionalGoals = createAsyncThunk(
	'getFunctionalGoals',
	async (): Promise<GetDetails> => {
		const { data } = await strapi.get('/functional-goals/');
		return data;
	},
);

export const getMySystemLibraryData = createAsyncThunk(
	'getMySystemLibraryData',
	async (payload: SystemLibrary): Promise<unknown> => {
		const { title } = payload;
		const queryObject: unknown = {
			pagination: {
				page: payload.page,
				pageSize: payload.limit,
			},
			populate: {
				exercise_video: true,
				exercise_image: true,
				joints: true,
				functional_goals: true,
				body_regions: true,
				exercise_categories: true,
			},
			filters: {
				body_regions: {
					id: {
						$in: payload.filterOptions.bodyRegionIds,
					},
				},
				exercise_categories: {
					id: {
						$in: payload.filterOptions.exerciseCategoriesIds,
					},
				},
				joints: {
					id: {
						$in: payload.filterOptions.jointsIds,
					},
				},
				functional_goals: {
					id: {
						$in: payload.filterOptions.functionalGoalsIds,
					},
				},
			},
		};

		// Handle "left" or "right" alone case
		if (title.toLowerCase() === 'left' || title.toLowerCase() === 'right') {
			queryObject.filters['$or'] = [
				{
					name: {
						$containsi: title.toLowerCase(),
					},
				},
				{
					description: {
						$containsi: title.toLowerCase(),
					},
				},
			];
		} else if (title.toLowerCase() === 'both') {
			queryObject.filters['$and'] = [
				{
					$or: [
						{
							name: {
								$notContainsi: 'left',
							},
						},
						{
							name: {
								$notContainsi: 'right',
							},
						},
					],
				},
				{
					$or: [
						{
							description: {
								$notContainsi: 'left',
							},
						},
						{
							description: {
								$notContainsi: 'right',
							},
						},
					],
				},
			];
		} else {
			queryObject.filters['$or'] = [
				{
					name: { $contains: title },
				},
				{
					reasons: {
						name: { $contains: title },
					},
				},
			];
		}

		const filters = queryObject.filters;
		if (filters['$or']) {
			filters['$or'] = filters['$or'].reduce(
				(acc: unknown, currentValue: unknown, index: number) => {
					acc[`$or[${index}]`] = currentValue;
					return acc;
				},
				{},
			);
		}
		const queryString = stringify(queryObject, { arrayFormat: 'brackets' });
		const { data } = await strapi.get(`/exercises?${queryString}`);
		return data;
	},
);

export const getMySystemTemplatesData = createAsyncThunk(
  'getMySystemTemplatesData',
  async (payload: SystemTemplates): Promise<SystemTemplates> => {
    const queryObject = stringify({
      pagination: {
        page: payload?.page || 1,
        pageSize: 10,
      },
      populate: {
        thumbnail: true,
        exercises: {
          populate: {
            strapiExerciseId: {
              populate: {
                exercise_video: true,
                exercise_image: true,
              },
            },
          },
        },
      },
      filters: {
        $or: [
          {
            name: {
              $contains: payload?.title || "",
            },
          },
        ],
        ...(payload.filterOptions.bodyRegionIds.length && {
          body_regions: {
            id: {
              $in: payload.filterOptions.bodyRegionIds,
            },
          },
        }),
        ...(payload.filterOptions.exerciseCategoriesIds.length && {
          categories: {
            id: {
              $in: payload.filterOptions.exerciseCategoriesIds,
            },
          },
        }),
        ...(payload.filterOptions.jointsIds.length && {
          joints: {
            id: {
              $in: payload.filterOptions.jointsIds,
            },
          },
        }),
        ...(payload.filterOptions.functionalGoalsIds.length && {
          functional_goals: {
            id: {
              $in: payload.filterOptions.functionalGoalsIds,
            },
          },
        }),
      },
    });

		const { data } = await strapi.get(`/program-templates?${queryObject}`);
		return data;
	},
);

export const getMySystemIntakeTemplatesData = createAsyncThunk<
	ProgramResponse,
	SystemTemplates
>(
	'getMySystemIntakeTemplatesData',
	async (payload, thunkAPI) => {
		const queryObject = qs.stringify({
			pagination: {
				page: payload?.page || 1,
				pageSize: 5,
			},
			populate: {
				thumbnail: true,
				exercises: {
					populate: {
						strapiExerciseId: {
							populate: {
								exercise_video: true,
								exercise_image: true,
							},
						},
					},
				},
				programSubgoals: true,
				programWorkoutTypes: true,
				programTimeAvailabilities: true,
				programExperienceLevels : true,
			},
			filters: {
				$or: [
					{
						name: {
							$contains: payload?.title || "",
						},
					},
				],
				...(payload.filterOptions.jointsIds && {
					joints: {
						id: {
							$in: payload.filterOptions.jointsIds,
						},
					},
				}),
				...(payload.filterOptions.goalSelection?.length && {
					programSubgoals: {
						id: {
							$in: payload.filterOptions.goalSelection,
						}
					},
				}),
				...(payload.filterOptions.workoutType?.length && {
					programWorkoutTypes: {
						id: {
							$in: payload.filterOptions.workoutType,
						}
					},
				}),
				...(payload.filterOptions.timeAvailability?.length && {
					programTimeAvailabilities: {
						id: {
							$in: payload.filterOptions.timeAvailability,
						}
					},
				}),
				...(payload.filterOptions.experienceLevel?.length && {
					programExperienceLevels: {
						id: {
							$in: payload.filterOptions.experienceLevel,
						}
					},
				}),
				...(payload.filterOptions.functionalGoalsIds.length && {
					functional_goals: {
						id: {
							$in: payload.filterOptions.functionalGoalsIds,
						},
					},
				}),
			},
		},
		{
    arrayFormat: 'brackets', 
    }
	);

		try {
			const { data } = await strapi.get(`/program-templates?${queryObject}`);
			return data;
		} catch (error: unknown) {
			return thunkAPI.rejectWithValue(error);
		}
	}
);

export const getJoints = createAsyncThunk(
	'getJoints',
	async (): Promise<ProperDetails> => {
		const { data } = await strapi.get('/joints/');
		return data;
	},
);

export const getCategories = createAsyncThunk(
	'getCategories',
	async (): Promise<GetDetails> => {
		const { data } = await strapi.get('/exercise-categories/');
		return data;
	},
);

export const getBodyRegions = createAsyncThunk(
	'getBodyRegions',
	async (): Promise<ProperDetails> => {
		const { data } = await strapi.get('/body-regions/');
		return data;
	},
);

export const getJointWithBodyRegion = createAsyncThunk(
	'getJointWithBodyRegion',
	async (): Promise<ProperDetails> => {
		const { data } = await strapi.get('/body-regions?populate[joints]=true');
		return data;
	},
);

export const getProgramSubgoal = createAsyncThunk(
	'getProgramSubgoal',
	async (): Promise<ProperDetails> => {
		const { data } = await strapi.get('/program-subgoals');
		return data;
	},
);

export const getProgramExpLevel = createAsyncThunk(
	'getProgramExpLevel',
	async (): Promise<ProperDetails> => {
		const { data } = await strapi.get('/program-experience-levels');
		return data;
	},
);

export const getProgramWorkOut = createAsyncThunk(
	'getProgramWorkOut',
	async (): Promise<ProperDetails> => {
		const { data } = await strapi.get('/program-workout-types');
		return data;
	},
);

export const getProgramTimeAvail = createAsyncThunk(
	'getProgramTimeAvail',
	async (): Promise<ProperDetails> => {
		const { data } = await strapi.get('/program-time-availabilities');
		return data;
	},
);

const initialState: FunctionalGoalsState = {
	popoverState: false,
	functionalGoals: null,
	joints: null,
	programSubgoals: null,
	programExperienceLevels: null,
	programTimeAvailabilities: null,
	programWorkoutTypes: null,
	categories: null,
	bodyRegions: null,
	loading: false,
	error: null,
	jointWithBodyRegion: null,
	selectedSideName: '',
};

export const functionalGoals = createSlice({
	name: 'functionalGoals',
	initialState,
	reducers: {
		setPopoverState: (state, action) => {
			state.popoverState = action.payload;
		},
		setSelectedSideName: (state, action) => {
			state.selectedSideName = action.payload;
		},
	},
	extraReducers: builder => {
		builder
			.addCase(getFunctionalGoals.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(getFunctionalGoals.fulfilled, (state, action) => {
				state.loading = false;
				state.functionalGoals = action.payload;
			})
			.addCase(getFunctionalGoals.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message ?? null;
			})
			.addCase(getJoints.fulfilled, (state, action) => {
				state.joints = action.payload;
			})
			.addCase(getProgramSubgoal.fulfilled, (state, action) => {
				state.programSubgoals = action.payload;
			})
			.addCase(getProgramExpLevel.fulfilled, (state, action) => {
				state.programExperienceLevels = action.payload;
			})
			.addCase(getProgramWorkOut.fulfilled, (state, action) => {
				state.programWorkoutTypes = action.payload;
			})
			.addCase(getProgramTimeAvail.fulfilled, (state, action) => {
				state.programTimeAvailabilities = action.payload;
			})
			.addCase(getCategories.fulfilled, (state, action) => {
				state.categories = action.payload;
			})
			.addCase(getBodyRegions.fulfilled, (state, action) => {
				state.bodyRegions = action.payload;
			})
			.addCase(getJointWithBodyRegion.fulfilled, (state, action) => {
				state.jointWithBodyRegion = action.payload;
			});
	},
});

export const { setPopoverState, setSelectedSideName } = functionalGoals.actions;

export default functionalGoals.reducer;
