export const TourExercises = [
	{
		name: 'Right Shoulder Flexion',
		video: {
			src: 'https://risecxlibrary.blob.core.windows.net/tour-videos/Right%20Shoulder%20Flexion.mp4',
		},
		visibility:
			'Tilt your camera or go backwards until you are fully inside the frame.',
		instruction:
			"Face sideways so your right shoulder is visible. Then, gently raise your right arm straight up, following the video guide. Pause briefly at the top. Once you're in position, the system will automatically take the capture.",
		finished:
			"Great job! You've successfully completed this movement. Let's continue to the next exercise.",
	},
	{
		name: 'Right Shoulder Extension',
		video: {
			src: 'https://risecxlibrary.blob.core.windows.net/tour-videos/Right%20Shoulder%20Extension.mp4',
		},
		visibility:
			'Tilt your camera or go backwards until you are fully inside the red frame.',
		instruction:
			'Position yourself sideways with your right shoulder visible. Keep your arm straight and slowly move it backward behind your body as far as comfortable. Hold the position while the system takes the measurement.',
		finished:
			"Great job! You've successfully completed this movement. Let's continue to the next exercise .",
	},
	{
		name: 'Left Shoulder Flexion',
		video: {
			src: 'https://risecxlibrary.blob.core.windows.net/tour-videos/Left%20Shoulder%20Flexion.mp4',
		},
		visibility:
			'Tilt your camera or go backwards until you are fully inside the red frame.',
		instruction:
			'Stand sideways with your left shoulder facing the camera. Keep your arm straight and gently raise it forward and upward until it reaches overhead. Pause at the top position for the system to capture.',
		finished:
			"Great job! You've successfully completed this movement. Let's continue to the next exercise .",
	},
	{
		name: 'Left Shoulder Extension',
		video: {
			src: 'https://risecxlibrary.blob.core.windows.net/tour-videos/Left%20Shoulder%20Extension.mp4',
		},
		visibility:
			'Tilt your camera or go backwards until you are fully inside the red frame.',
		instruction:
			'Turn so your left shoulder is visible to the camera. Keep your arm straight and slowly move it backward behind your body as far as you comfortably can. Hold steady for measurement.',
		finished:
			"Great job! You've successfully completed this movement. Let's continue to the next exercise.",
	},
	{
		name: 'Left Hip Internal Rotation',
		video: {
			src: 'https://risecxlibrary.blob.core.windows.net/tour-videos/Left%20Hip%20Internal%20Rotation.mp4',
		},
		visibility:
			'Tilt your camera or go backwards until you are fully inside the red frame.',
		instruction:
			"Sit with your left leg visible to the camera. Keep your thigh steady and rotate your lower leg inward (toward your body's center). Hold the rotated position while the system measures the angle.",
		finished:
			"Great job! You've successfully completed this movement. Let's continue to the next exercise.",
	},
	{
		name: 'Left Hip External Rotation',
		video: {
			src: 'https://risecxlibrary.blob.core.windows.net/tour-videos/Left%20Hip%20External%20Rotation.mp4',
		},
		visibility:
			'Tilt your camera or go backwards until you are fully inside the red frame.',
		instruction:
			"Remain seated with your left leg visible. Keep your thigh in place and rotate your lower leg outward (away from your body's center). Hold the position for measurement.",
		finished:
			"Great job! You've successfully completed this movement. Let's continue to the next exercise.",
	},
	{
		name: 'Right Hip Internal Rotation',
		video: {
			src: 'https://risecxlibrary.blob.core.windows.net/tour-videos/Right%20Hip%20Internal%20Rotation.mp4',
		},
		visibility:
			'Tilt your camera or go backwards until you are fully inside the red frame.',
		instruction:
			"Sit with your right leg visible to the camera. Keeping your thigh steady, rotate your lower leg inward toward your body's center. Maintain this position while the system captures the measurement.",
		finished:
			"Great job! You've successfully completed this movement. Let's continue to the next exercise.",
	},
	{
		name: 'Right Hip External Rotation',
		video: {
			src: 'https://risecxlibrary.blob.core.windows.net/tour-videos/Right%20Hip%20External%20Rotation.mp4',
		},
		visibility:
			'Tilt your camera or go backwards until you are fully inside the frame.',
		instruction:
			"Position yourself seated with your right leg visible. Keep your thigh stable and rotate your lower leg outward, away from your body's center. Hold steady for the system to record the angle.",
		finished: "Great job! You've successfully completed this movement.",
	},
	{
		name: 'Shoulder External Rotation',
		video: {
			src: 'https://risecxlibrary.blob.core.windows.net/assets/videos/Sittind_Shoulder_ER_bb170c52e8.mp4',
		},
		visibility:
			'Tilt your camera or go backwards until you are fully inside the frame.',
		instruction:
			'Sit upright with your elbows bent at 90 degrees and tucked close to your sides. Keep both elbows still and slowly rotate your forearms outward — away from your body — as shown in the video. Move only through your shoulder joint without lifting your elbows. Hold the position briefly for the system to capture the measurement.',
		finished:
			"Excellent! You've completed the shoulder external rotation. Now let’s proceed to the internal rotation measurement.",
	},
	{
		name: 'Shoulder Internal Rotation',
		video: {
			src: 'https://risecxlibrary.blob.core.windows.net/assets/videos/Sittind_Shoulder_IR_1b6dbf3830.mp4',
		},
		visibility:
			'Tilt your camera or go backwards until you are fully inside the frame.',
		instruction:
			'Remain seated upright with elbows bent at 90 degrees and close to your sides. From the starting position, rotate your forearms inward — toward your body — keeping elbows steady and shoulders relaxed. Move smoothly until you feel a gentle stretch, and hold briefly while the system takes the measurement.',
		finished:
			'Well done! You’ve completed both internal and external shoulder rotations.',
	},
];

export const Guide = {
	center:
		'Almost there! Just shift slightly to your center so we can see your full posture clearly.',
	centered: 'Perfect! You’re now in center. Let’s get into right position.',
	left: 'Now, gently turn your body so it mirrors the guide you see on your left.',
	right:
		'Now, gently turn your body so it mirrors the guide you see on your right.',
	chair: 'Please make sure you have chair with you for next exercise.',
	finished: `Congratulations! You have completed your guided tour. Well done!`,
};

export const DEFAULT_ASSISTANT = {
	name: 'Jessica',
	image: '/images/tutorial/sophia.png',
	voiceIndex: 3,
	voiceName: 'elevenlabs:Jessica',
};

export const bodyArr = [
	{
		x: 0.5077210664749146,
		y: 0.34981951117515564,
		z: -0.15938465297222137,
		visibility: 0.9998869895935059,
	},
	{
		x: 0.515877902507782,
		y: 0.3272940218448639,
		z: -0.15008261799812317,
		visibility: 0.9999254941940308,
	},
	{
		x: 0.5227711200714111,
		y: 0.3264200985431671,
		z: -0.14999626576900482,
		visibility: 0.9999075531959534,
	},
	{
		x: 0.5302457213401794,
		y: 0.3260836899280548,
		z: -0.15022221207618713,
		visibility: 0.9999286532402039,
	},
	{
		x: 0.498156875371933,
		y: 0.33114445209503174,
		z: -0.13288739323616028,
		visibility: 0.99992436170578,
	},
	{
		x: 0.4914083480834961,
		y: 0.33339232206344604,
		z: -0.13282854855060577,
		visibility: 0.999904990196228,
	},
	{
		x: 0.4849829077720642,
		y: 0.33654990792274475,
		z: -0.1328536719083786,
		visibility: 0.9999396800994873,
	},
	{
		x: 0.5479289889335632,
		y: 0.34035831689834595,
		z: -0.08378781378269196,
		visibility: 0.9999446272850037,
	},
	{
		x: 0.48163121938705444,
		y: 0.35958361625671387,
		z: -0.000482142495457083,
		visibility: 0.9999551177024841,
	},
	{
		x: 0.5247244238853455,
		y: 0.3784539997577667,
		z: -0.13315632939338684,
		visibility: 0.9999114274978638,
	},
	{
		x: 0.5005212426185608,
		y: 0.3848143219947815,
		z: -0.10900446027517319,
		visibility: 0.9997898936271667,
	},
	{
		x: 0.609727680683136,
		y: 0.4799530506134033,
		z: -0.028383150696754456,
		visibility: 0.999740719795227,
	},
	{
		x: 0.44887813925743103,
		y: 0.4855998456478119,
		z: 0.05267779901623726,
		visibility: 0.9992679357528687,
	},
	{
		x: 0.7104122042655945,
		y: 0.523442268371582,
		z: -0.18976005911827087,
		visibility: 0.9967691898345947,
	},
	{
		x: 0.36710599064826965,
		y: 0.5605570077896118,
		z: -0.08769010007381439,
		visibility: 0.9854109287261963,
	},
	{
		x: 0.6578724980354309,
		y: 0.3481176793575287,
		z: -0.3320702910423279,
		visibility: 0.985754668712616,
	},
	{
		x: 0.36920905113220215,
		y: 0.408622145652771,
		z: -0.3417057991027832,
		visibility: 0.9893768429756165,
	},
	{
		x: 0.6448774337768555,
		y: 0.3061940670013428,
		z: -0.35796746611595154,
		visibility: 0.9452747106552124,
	},
	{
		x: 0.3655650317668915,
		y: 0.35869768261909485,
		z: -0.3918374478816986,
		visibility: 0.9695752859115601,
	},
	{
		x: 0.6349586248397827,
		y: 0.2973468005657196,
		z: -0.32326000928878784,
		visibility: 0.9341021776199341,
	},
	{
		x: 0.3778991103172302,
		y: 0.3469083309173584,
		z: -0.3634246587753296,
		visibility: 0.9604222178459167,
	},
	{
		x: 0.6361451745033264,
		y: 0.3130396008491516,
		z: -0.3199006915092468,
		visibility: 0.9209113121032715,
	},
	{
		x: 0.3819606602191925,
		y: 0.3711463510990143,
		z: -0.3403209447860718,
		visibility: 0.9516990184783936,
	},
	{
		x: 0.553200364112854,
		y: 0.8125945925712585,
		z: -0.020125243812799454,
		visibility: 0.9980233907699585,
	},
	{
		x: 0.4343567490577698,
		y: 0.7783392071723938,
		z: 0.020101509988307953,
		visibility: 0.9952395558357239,
	},
	{
		x: 0.541254460811615,
		y: 0.949588418006897,
		z: -0.4191911220550537,
		visibility: 0.9275901317596436,
	},
	{
		x: 0.29756486415863037,
		y: 0.8579350113868713,
		z: -0.1645273119211197,
		visibility: 0.9174639582633972,
	},
	{
		x: 0.46331048011779785,
		y: 1.1524951457977295,
		z: -0.2777446210384369,
		visibility: 0.3807925581932068,
	},
	{
		x: 0.33536484837532043,
		y: 1.0666656494140625,
		z: -0.03921060636639595,
		visibility: 0.233409121632576,
	},
	{
		x: 0.4478591978549957,
		y: 1.1772478818893433,
		z: -0.2636375427246094,
		visibility: 0.3898875415325165,
	},
	{
		x: 0.3589194715023041,
		y: 1.096157193183899,
		z: -0.02754288539290428,
		visibility: 0.25541403889656067,
	},
	{
		x: 0.4497780203819275,
		y: 1.2260624170303345,
		z: -0.35863468050956726,
		visibility: 0.2508358061313629,
	},
	{
		x: 0.2904670834541321,
		y: 1.1490877866744995,
		z: -0.0846276730298996,
		visibility: 0.10176746547222137,
	},
];
