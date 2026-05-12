export const topbarHeight = '35px';

export const videoSize = {
	width: 1280,
	height: 720,
};
export const drawOptions = {
	color: 'var(--text-color-on-dark)',
	lineWidth: 5,
	visibilityMin: 0.65,
};

export const Landmark = Array.from({ length: 33 }, (_, i) => i);

export const landmarksToRemove = [
	0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 17, 18, 19, 20, 21, 22, 29, 30, 31, 32,
];

export const gridSpacing = 50;
export const dashArray = [5, 5];

export const landmarksMapping = {
	front: {
		head: [12, 11, 0],
		ear: [8, 7],
		shoulder: [12, 11],
		elbow: [14, 13],
		hip: [24, 23],
		knee: [26, 25],
		ankle: [28, 27],
	},
	back: {
		head: [12, 11, 0],
		ear: [8, 7],
		shoulder: [12, 11],
		elbow: [14, 13],
		hip: [24, 23],
		knee: [26, 25],
		ankle: [28, 27],
	},
	left: {
		ear: [7, 11, 27],
		shoulder: [11, 13, 27],
		elbow: [13, 23, 27],
		hip: [23, 25, 27],
		knee: [25, 27, 27],
	},
	right: {
		ear: [8, 12, 28],
		shoulder: [12, 14, 28],
		elbow: [14, 24, 28],
		hip: [24, 26, 28],
		knee: [26, 28, 28],
	},
};
