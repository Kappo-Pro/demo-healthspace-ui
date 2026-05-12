import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

export interface PosturalBodyPoints {
	ears: number;
	shoulder: number;
	elbow: number;
	hip: number;
	knee: number;
	ankle: number;
	coordinates: NormalizedLandmark[];
	screenshot: string | null;
}

export enum PosturalView {
	FRONT = 'front',
	LEFT = 'left',
	RIGHT = 'right',
	BACK = 'back',
}

export type PosturalViewLinked = {
	next: PosturalViewLinked | null;
	value: PosturalView;
};

export interface PosturalAnalysisState {
	view: PosturalViewLinked | null;
	front: PosturalBodyPoints;
	left: PosturalBodyPoints;
	right: PosturalBodyPoints;
	back: PosturalBodyPoints;
}

export const linkedListPosturalView = () =>
	Object.values(PosturalView).reduceRight(
		(next: PosturalViewLinked | null, value) => ({ value, next }),
		null,
	);

const initialAnalysis: PosturalBodyPoints = {
	ears: 0,
	shoulder: 0,
	elbow: 0,
	hip: 0,
	knee: 0,
	ankle: 0,
	coordinates: [],
	screenshot: null,
};

const initialState: PosturalAnalysisState = {
	view: linkedListPosturalView(),
	front: { ...initialAnalysis },
	back: { ...initialAnalysis },
	left: { ...initialAnalysis },
	right: { ...initialAnalysis },
};

const PosturalAnalysis: Slice<PosturalAnalysisState> = createSlice({
	name: 'postureAnalysis',
	initialState,
	reducers: {
		goToView: (
			state: PosturalAnalysisState,
			action: PayloadAction<PosturalView>,
		) => {
			let linkedList = linkedListPosturalView();

			while (linkedList) {
				if (linkedList.value === action.payload) {
					state.view = linkedList;
					break;
				}
				linkedList = linkedList.next;
			}
		},
		changeSide: (
			state: PosturalAnalysisState,
			action: PayloadAction<PosturalViewLinked>,
		): void => {
			state.view = action.payload;
		},
	},
});

export const actions = {
	...PosturalAnalysis.actions,
	// fetchExampleData,
};

export default PosturalAnalysis.reducer;
