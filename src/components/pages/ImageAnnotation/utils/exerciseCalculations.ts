/**
 * Utility functions for ROM exercise calculations
 * These functions handle angle calculations for different exercise types
 */

import { getExerciseConfig, getExerciseLandmarks } from '../constants/exerciseConfigs';

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface ImageSizes {
  width: number;
  height: number;
}

/**
 * Calculate the angle for a specific exercise based on landmark positions
 * @param exerciseName - Name of the exercise
 * @param landmarks - Array of all landmark positions
 * @param imageSizes - Optional image dimensions (required for some exercises)
 * @returns Calculated angle value or null if calculation fails
 */
export const calculateExerciseAngle = (
  exerciseName: string,
  landmarks: Position[],
  imageSizes?: ImageSizes,
): number | null => {
  try {
    const config = getExerciseConfig(exerciseName);
    if (!config) {
      console.warn(`Exercise config not found for: ${exerciseName}`);
      return null;
    }

    // Get the landmark indices required for this exercise
    const landmarkIndices = config.landmarkIndices.map(l => l.index);

    // Extract the required positions in order
    const positions = landmarkIndices.map(index => {
      const landmark = landmarks[index];
      if (!landmark) {
        throw new Error(`Landmark at index ${index} not found`);
      }
      return landmark;
    });

    // Create a function from the string and execute it
     
    const calculateAngle = new Function('positions', 'sizes', `
      return (${config.function})(positions, sizes);
    `);

    const result = calculateAngle(positions, imageSizes);

    // Handle results that might be strings (some functions return .toFixed() results)
    return typeof result === 'string' ? parseFloat(result) : result;
  } catch (error) {
    console.error(`Error calculating angle for ${exerciseName}:`, error);
    return null;
  }
};

/**
 * Get the landmark indices that should be visible/highlighted for an exercise
 * @param exerciseName - Name of the exercise
 * @returns Array of landmark indices that should be visible
 */
export const getVisibleLandmarksForExercise = (exerciseName: string): number[] => {
  const landmarkIndices = getExerciseLandmarks(exerciseName);

  // Also include related body part landmarks based on exercise name
  const additionalLandmarks = getAdditionalLandmarksByBodyPart(exerciseName);

  return [...new Set([...landmarkIndices, ...additionalLandmarks])];
};

/**
 * Get additional landmark indices to show based on body part
 * This helps provide context for the exercise visualization
 */
const getAdditionalLandmarksByBodyPart = (exerciseName: string): number[] => {
  const name = exerciseName.toLowerCase();

  // Neck exercises
  if (name.includes('neck')) {
    return [0, 7, 8, 11, 12]; // Nose, ears, shoulders
  }

  // Left shoulder exercises
  if (name.includes('left shoulder')) {
    return [11, 13, 15, 23]; // Left shoulder, elbow, wrist, hip
  }

  // Right shoulder exercises
  if (name.includes('right shoulder')) {
    return [12, 14, 16, 24]; // Right shoulder, elbow, wrist, hip
  }

  // Left elbow exercises
  if (name.includes('left elbow')) {
    return [11, 13, 15]; // Left shoulder, elbow, wrist
  }

  // Right elbow exercises
  if (name.includes('right elbow')) {
    return [12, 14, 16]; // Right shoulder, elbow, wrist
  }

  // Left wrist exercises
  if (name.includes('left wrist')) {
    return [13, 15, 17, 19, 21]; // Left elbow, wrist, thumb, index, pinky
  }

  // Right wrist exercises
  if (name.includes('right wrist')) {
    return [14, 16, 18, 20, 22]; // Right elbow, wrist, thumb, index, pinky
  }

  // Hip exercises
  if (name.includes('hip')) {
    if (name.includes('left')) {
      return [23, 25, 27, 29, 31]; // Left hip, knee, ankle, heel, toe
    }
    if (name.includes('right')) {
      return [24, 26, 28, 30, 32]; // Right hip, knee, ankle, heel, toe
    }
  }

  // Knee exercises
  if (name.includes('knee')) {
    if (name.includes('left')) {
      return [23, 25, 27]; // Left hip, knee, ankle
    }
    if (name.includes('right')) {
      return [24, 26, 28]; // Right hip, knee, ankle
    }
  }

  // Lumbar exercises
  if (name.includes('lumbar')) {
    return [11, 12, 23, 24]; // Both shoulders and hips
  }

  // Squat
  if (name.includes('squat')) {
    return [23, 24, 25, 26, 27, 28]; // Both hips, knees, ankles
  }

  return [];
};

/**
 * Validate if landmarks are sufficient for an exercise calculation
 * @param exerciseName - Name of the exercise
 * @param landmarks - Array of all landmark positions
 * @returns true if all required landmarks are present and visible
 */
export const validateLandmarksForExercise = (
  exerciseName: string,
  landmarks: Position[],
): boolean => {
  const requiredIndices = getExerciseLandmarks(exerciseName);

  return requiredIndices.every(index => {
    const landmark = landmarks[index];
    return landmark && landmark.x !== undefined && landmark.y !== undefined;
  });
};

/**
 * Get a human-readable description of which landmarks are missing
 * @param exerciseName - Name of the exercise
 * @param landmarks - Array of all landmark positions
 * @returns Array of missing landmark names
 */
export const getMissingLandmarks = (
  exerciseName: string,
  landmarks: Position[],
): string[] => {
  const config = getExerciseConfig(exerciseName);
  if (!config) return [];

  const missing: string[] = [];

  config.landmarkIndices.forEach(({ index, name }) => {
    const landmark = landmarks[index];
    if (!landmark || landmark.x === undefined || landmark.y === undefined) {
      missing.push(name);
    }
  });

  return missing;
};
