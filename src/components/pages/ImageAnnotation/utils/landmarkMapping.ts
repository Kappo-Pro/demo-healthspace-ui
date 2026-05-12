/**
 * Landmark mapping and repositioning utilities
 * Handles intelligent landmark transformation when exercise changes
 */

import { getExerciseConfig, getExerciseLandmarks } from '../constants/exerciseConfigs';

export interface Position {
  x: number;
  y: number;
  z?: number;
  visible?: boolean;
  visibility?: number;
}

/**
 * MediaPipe Pose Landmark indices mapping
 * Maps landmark indices to their anatomical positions
 */
const LANDMARK_MAP = {
  // Face/Head
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,

  // Upper Body
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,

  // Lower Body
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

/**
 * Left-Right landmark pairs for mirroring
 */
const MIRROR_PAIRS: Record<number, number> = {
  // Face
  1: 4, 4: 1,   // Eyes inner
  2: 5, 5: 2,   // Eyes
  3: 6, 6: 3,   // Eyes outer
  7: 8, 8: 7,   // Ears
  9: 10, 10: 9, // Mouth

  // Upper body
  11: 12, 12: 11, // Shoulders
  13: 14, 14: 13, // Elbows
  15: 16, 16: 15, // Wrists
  17: 18, 18: 17, // Pinky
  19: 20, 20: 19, // Index
  21: 22, 22: 21, // Thumb

  // Lower body
  23: 24, 24: 23, // Hips
  25: 26, 26: 25, // Knees
  27: 28, 28: 27, // Ankles
  29: 30, 30: 29, // Heels
  31: 32, 32: 31, // Foot index
};

/**
 * Anatomical correspondence between body parts
 * Used for intelligent mapping when changing body regions
 */
const ANATOMICAL_CORRESPONDENCE = {
  // Upper body to lower body mapping
  11: 23, 12: 24, // Shoulder → Hip
  13: 25, 14: 26, // Elbow → Knee
  15: 27, 16: 28, // Wrist → Ankle
  17: 29, 18: 30, // Pinky → Heel
  19: 31, 20: 32, // Index → Foot

  // Lower body to upper body mapping
  23: 11, 24: 12, // Hip → Shoulder
  25: 13, 26: 14, // Knee → Elbow
  27: 15, 28: 16, // Ankle → Wrist
  29: 17, 30: 18, // Heel → Pinky
  31: 19, 32: 20, // Foot → Index
};

/**
 * Determine if an exercise is on the left or right side
 */
const getExerciseSide = (exerciseName: string): 'left' | 'right' | 'center' | null => {
  const name = exerciseName.toLowerCase();
  if (name.includes('left')) return 'left';
  if (name.includes('right')) return 'right';
  if (name.includes('neck') || name.includes('lumbar') || name.includes('squat')) return 'center';
  return null;
};

/**
 * Get the body part category from exercise name
 */
const getBodyPart = (exerciseName: string): string => {
  const name = exerciseName.toLowerCase();

  if (name.includes('neck')) return 'neck';
  if (name.includes('shoulder')) return 'shoulder';
  if (name.includes('elbow')) return 'elbow';
  if (name.includes('wrist')) return 'wrist';
  if (name.includes('hip')) return 'hip';
  if (name.includes('knee')) return 'knee';
  if (name.includes('ankle')) return 'ankle';
  if (name.includes('lumbar')) return 'lumbar';
  if (name.includes('squat')) return 'squat';

  return 'unknown';
};

/**
 * Mirror a landmark position horizontally (for left-right conversion)
 */
const mirrorPosition = (position: Position): Position => {
  return {
    ...position,
    x: 1 - position.x, // Normalize coordinates are 0-1, so mirror by inverting
  };
};

/**
 * Map landmark index from one side to another
 */
const mapLandmarkIndex = (
  index: number,
  fromSide: 'left' | 'right',
  toSide: 'left' | 'right',
): number => {
  if (fromSide === toSide) return index;
  return MIRROR_PAIRS[index] ?? index;
};

/**
 * Map landmark to anatomically corresponding landmark
 * (e.g., shoulder → hip, elbow → knee)
 */
const mapToCorrespondingBodyPart = (index: number): number => {
  return ANATOMICAL_CORRESPONDENCE[index] ?? index;
};

/**
 * Calculate the best mapping strategy between two exercises
 */
interface MappingStrategy {
  type: 'same' | 'mirror' | 'body-part' | 'body-part-mirror' | 'new';
  requiresMirror: boolean;
  requiresBodyPartMapping: boolean;
}

const determineMappingStrategy = (
  fromExercise: string,
  toExercise: string,
): MappingStrategy => {
  const fromSide = getExerciseSide(fromExercise);
  const toSide = getExerciseSide(toExercise);
  const fromBodyPart = getBodyPart(fromExercise);
  const toBodyPart = getBodyPart(toExercise);

  const sameBodyPart = fromBodyPart === toBodyPart;
  const sameSide = fromSide === toSide;

  if (sameBodyPart && sameSide) {
    return { type: 'same', requiresMirror: false, requiresBodyPartMapping: false };
  }

  if (sameBodyPart && !sameSide) {
    return { type: 'mirror', requiresMirror: true, requiresBodyPartMapping: false };
  }

  if (!sameBodyPart && sameSide) {
    return { type: 'body-part', requiresMirror: false, requiresBodyPartMapping: true };
  }

  if (!sameBodyPart && !sameSide) {
    return { type: 'body-part-mirror', requiresMirror: true, requiresBodyPartMapping: true };
  }

  return { type: 'new', requiresMirror: false, requiresBodyPartMapping: false };
};

/**
 * Main function to reposition landmarks when exercise changes
 */
export const repositionLandmarksForNewExercise = (
  currentLandmarks: Position[],
  fromExercise: string,
  toExercise: string,
): Position[] => {
  const fromConfig = getExerciseConfig(fromExercise);
  const toConfig = getExerciseConfig(toExercise);

  if (!fromConfig || !toConfig) {
    console.warn('Exercise config not found, returning original landmarks');
    return currentLandmarks;
  }

  const strategy = determineMappingStrategy(fromExercise, toExercise);
  const fromLandmarkIndices = fromConfig.landmarkIndices.map(l => l.index);
  const toLandmarkIndices = toConfig.landmarkIndices.map(l => l.index);

  // Create new landmarks array (copy of current)
  const newLandmarks = currentLandmarks.map((lm) => ({
    ...lm,
    visible: false // Start with all hidden, then show relevant ones
  }));

  // Apply repositioning based on strategy
  if (strategy.type === 'same') {
    // Same exercise - just update visibility
    toLandmarkIndices.forEach(idx => {
      if (newLandmarks[idx]) {
        newLandmarks[idx].visible = true;
      }
    });
  } else if (strategy.type === 'mirror') {
    // Mirror landmarks from one side to the other
    toLandmarkIndices.forEach((toIdx, i) => {
      const fromIdx = fromLandmarkIndices[i];
      if (fromIdx !== undefined && currentLandmarks[fromIdx]) {
        // Copy the landmark and mirror its position
        newLandmarks[toIdx] = {
          ...mirrorPosition(currentLandmarks[fromIdx]),
          visible: true,
        };
      }
    });
  } else if (strategy.type === 'body-part') {
    // Map to corresponding body part (e.g., shoulder → hip)
    toLandmarkIndices.forEach((toIdx, i) => {
      const fromIdx = fromLandmarkIndices[i];
      if (fromIdx !== undefined && currentLandmarks[fromIdx]) {
        // Copy the landmark to new body part position
        newLandmarks[toIdx] = {
          ...currentLandmarks[fromIdx],
          visible: true,
        };
      }
    });
  } else if (strategy.type === 'body-part-mirror') {
    // Map body part AND mirror
    toLandmarkIndices.forEach((toIdx, i) => {
      const fromIdx = fromLandmarkIndices[i];
      if (fromIdx !== undefined && currentLandmarks[fromIdx]) {
        // Copy the landmark, map body part, and mirror
        newLandmarks[toIdx] = {
          ...mirrorPosition(currentLandmarks[fromIdx]),
          visible: true,
        };
      }
    });
  } else {
    // New/unknown - just make target landmarks visible
    toLandmarkIndices.forEach(idx => {
      if (newLandmarks[idx]) {
        newLandmarks[idx].visible = true;
      }
    });
  }

  return newLandmarks;
};

/**
 * Get suggested landmarks to highlight for an exercise
 */
export const getSuggestedVisibleLandmarks = (exerciseName: string): number[] => {
  const config = getExerciseConfig(exerciseName);
  if (!config) return [];

  const requiredIndices = config.landmarkIndices.map(l => l.index);
  const bodyPart = getBodyPart(exerciseName);
  const side = getExerciseSide(exerciseName);

  // Add contextual landmarks based on body part
  const contextualLandmarks: number[] = [];

  if (bodyPart === 'neck') {
    contextualLandmarks.push(0, 7, 8, 11, 12); // Nose, ears, shoulders
  } else if (bodyPart === 'shoulder') {
    if (side === 'left') {
      contextualLandmarks.push(11, 13, 15, 23); // Left chain
    } else if (side === 'right') {
      contextualLandmarks.push(12, 14, 16, 24); // Right chain
    }
  } else if (bodyPart === 'elbow') {
    if (side === 'left') {
      contextualLandmarks.push(11, 13, 15); // Shoulder-elbow-wrist
    } else if (side === 'right') {
      contextualLandmarks.push(12, 14, 16);
    }
  } else if (bodyPart === 'wrist') {
    if (side === 'left') {
      contextualLandmarks.push(13, 15, 17, 19, 21); // Elbow, wrist, fingers
    } else if (side === 'right') {
      contextualLandmarks.push(14, 16, 18, 20, 22);
    }
  } else if (bodyPart === 'hip') {
    if (side === 'left') {
      contextualLandmarks.push(23, 25, 27); // Hip-knee-ankle
    } else if (side === 'right') {
      contextualLandmarks.push(24, 26, 28);
    }
  } else if (bodyPart === 'knee') {
    if (side === 'left') {
      contextualLandmarks.push(23, 25, 27);
    } else if (side === 'right') {
      contextualLandmarks.push(24, 26, 28);
    }
  } else if (bodyPart === 'lumbar') {
    contextualLandmarks.push(11, 12, 23, 24); // All core landmarks
  } else if (bodyPart === 'squat') {
    contextualLandmarks.push(11, 12, 23, 24, 25, 26, 27, 28);
  }

  // Combine required and contextual, remove duplicates
  return [...new Set([...requiredIndices, ...contextualLandmarks])];
};

/**
 * Update landmark visibility based on exercise
 */
export const updateLandmarkVisibility = (
  landmarks: Position[],
  exerciseName: string,
): Position[] => {
  const visibleIndices = getSuggestedVisibleLandmarks(exerciseName);

  return landmarks.map((lm, idx) => ({
    ...lm,
    visible: visibleIndices.includes(idx),
  }));
};

/**
 * Get a human-readable description of the mapping change
 */
export const getMappingDescription = (fromExercise: string, toExercise: string): string => {
  const strategy = determineMappingStrategy(fromExercise, toExercise);

  switch (strategy.type) {
    case 'same':
      return 'Exercise type unchanged - landmarks remain the same';
    case 'mirror':
      return 'Mirrored landmarks from opposite side';
    case 'body-part':
      return 'Mapped landmarks to corresponding body part';
    case 'body-part-mirror':
      return 'Mapped and mirrored landmarks to opposite side and body part';
    case 'new':
      return 'New exercise requires different landmarks';
    default:
      return 'Landmark positions updated';
  }
};
