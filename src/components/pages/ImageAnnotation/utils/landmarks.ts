import { Landmark } from '../types';

export const LANDMARK_DEFINITIONS: Omit<Landmark, 'x' | 'y' | 'z' | 'visible'>[] = [
  // Shoulders (teal)
  { index: 11, name: "Left Shoulder", color: "#4ECDC4", group: "shoulders" },
  { index: 12, name: "Right Shoulder", color: "#4ECDC4", group: "shoulders" },
  
  // Arms/Elbows/Wrists (blue)  
  { index: 13, name: "Left Elbow", color: "#45B7D1", group: "arms" },
  { index: 14, name: "Right Elbow", color: "#45B7D1", group: "arms" },
  { index: 15, name: "Left Wrist", color: "#45B7D1", group: "arms" },
  { index: 16, name: "Right Wrist", color: "#45B7D1", group: "arms" },
  
  // Hands/Fingers (green)
  { index: 17, name: "Left Pinky", color: "#96CEB4", group: "hands" },
  { index: 18, name: "Right Pinky", color: "#96CEB4", group: "hands" },
  { index: 19, name: "Left Index", color: "#96CEB4", group: "hands" },
  { index: 20, name: "Right Index", color: "#96CEB4", group: "hands" },
  { index: 21, name: "Left Thumb", color: "#96CEB4", group: "hands" },
  { index: 22, name: "Right Thumb", color: "#96CEB4", group: "hands" },
  
  // Hips (pink)
  { index: 23, name: "Left Hip", color: "#F38BA8", group: "hips" },
  { index: 24, name: "Right Hip", color: "#F38BA8", group: "hips" },
  
  // Legs/Knees/Ankles (yellow)
  { index: 25, name: "Left Knee", color: "#FFD93D", group: "legs" },
  { index: 26, name: "Right Knee", color: "#FFD93D", group: "legs" },
  { index: 27, name: "Left Ankle", color: "#FFD93D", group: "legs" },
  { index: 28, name: "Right Ankle", color: "#FFD93D", group: "legs" },
  
  // Feet (light blue)  
  { index: 29, name: "Left Heel", color: "#A8DADC", group: "feet" },
  { index: 30, name: "Right Heel", color: "#A8DADC", group: "feet" },
  { index: 31, name: "Left Foot Index", color: "#A8DADC", group: "feet" },
  { index: 32, name: "Right Foot Index", color: "#A8DADC", group: "feet" },
  
  // Neck (purple)
  { index: 33, name: "Neck", color: "#DDA0DD", group: "neck" }
];

// Connections between landmarks to show skeletal structure
export const LANDMARK_CONNECTIONS = [
  // Torso
  [11, 12], // left shoulder to right shoulder
  [11, 33], // left shoulder to neck  
  [12, 33], // right shoulder to neck
  // Removed [11, 23] and [12, 24] connections
  [23, 24], // left hip to right hip
  
  // Left arm
  [11, 13], // left shoulder to left elbow
  [13, 15], // left elbow to left wrist
  [15, 17], // left wrist to left pinky
  [15, 19], // left wrist to left index
  [15, 21], // left wrist to left thumb
  
  // Right arm  
  [12, 14], // right shoulder to right elbow
  [14, 16], // right elbow to right wrist
  [16, 18], // right wrist to right pinky
  [16, 20], // right wrist to right index
  [16, 22], // right wrist to right thumb
  
  // Left leg
  [23, 25], // left hip to left knee
  [25, 27], // left knee to left ankle
  [27, 29], // left ankle to left heel
  [27, 31], // left ankle to left foot index
  
  // Right leg
  [24, 26], // right hip to right knee  
  [26, 28], // right knee to right ankle
  [28, 30], // right ankle to right heel
  [28, 32], // right ankle to right foot index
];

export const LANDMARK_GROUPS = {
  shoulders: { name: "Shoulders", color: "#4ECDC4" },
  arms: { name: "Arms", color: "#45B7D1" },
  hands: { name: "Hands", color: "#96CEB4" },
  hips: { name: "Hips", color: "#F38BA8" },
  legs: { name: "Legs", color: "#FFD93D" },
  feet: { name: "Feet", color: "#A8DADC" },
  neck: { name: "Neck", color: "#DDA0DD" }
};

// Pose-specific landmark positions (normalized for 800x600 canvas)
const FRONT_POSE_POSITIONS: Record<number, { x: number; y: number; z: number }> = {
  // Shoulders
  11: { x: 300, y: 180, z: 0 },    // Left Shoulder
  12: { x: 500, y: 180, z: 0 },    // Right Shoulder
  
  // Arms (A-pose - extended horizontally)
  13: { x: 200, y: 180, z: 0 },    // Left Elbow
  14: { x: 600, y: 180, z: 0 },    // Right Elbow
  15: { x: 120, y: 180, z: 0 },    // Left Wrist
  16: { x: 680, y: 180, z: 0 },    // Right Wrist
  
  // Hands
  17: { x: 100, y: 170, z: 0 },    // Left Pinky
  18: { x: 700, y: 170, z: 0 },    // Right Pinky
  19: { x: 110, y: 190, z: 0 },    // Left Index
  20: { x: 690, y: 190, z: 0 },    // Right Index
  21: { x: 130, y: 185, z: 0 },    // Left Thumb
  22: { x: 670, y: 185, z: 0 },    // Right Thumb
  
  // Hips
  23: { x: 340, y: 300, z: 0 },    // Left Hip
  24: { x: 460, y: 300, z: 0 },    // Right Hip
  
  // Legs
  25: { x: 340, y: 420, z: 0 },    // Left Knee
  26: { x: 460, y: 420, z: 0 },    // Right Knee
  27: { x: 340, y: 540, z: 0 },    // Left Ankle
  28: { x: 460, y: 540, z: 0 },    // Right Ankle
  
  // Feet
  29: { x: 340, y: 550, z: 0 },    // Left Heel
  30: { x: 460, y: 550, z: 0 },    // Right Heel
  31: { x: 340, y: 570, z: 0 },    // Left Foot Index
  32: { x: 460, y: 570, z: 0 },    // Right Foot Index
  
  // Neck
  33: { x: 400, y: 150, z: 0 }     // Neck
};

const SIDE_LEFT_POSE_POSITIONS: Record<number, { x: number; y: number; z: number }> = {
  // Shoulders (left shoulder visible, right behind)
  11: { x: 400, y: 180, z: 0 },    // Left Shoulder (visible)
  12: { x: 400, y: 180, z: -20 },  // Right Shoulder (behind)
  
  // Arms (relaxed at sides)
  13: { x: 420, y: 250, z: 0 },    // Left Elbow
  14: { x: 420, y: 250, z: -20 },  // Right Elbow (behind)
  15: { x: 430, y: 320, z: 0 },    // Left Wrist
  16: { x: 430, y: 320, z: -20 },  // Right Wrist (behind)
  
  // Hands
  17: { x: 425, y: 330, z: 0 },    // Left Pinky
  18: { x: 425, y: 330, z: -20 },  // Right Pinky (behind)
  19: { x: 435, y: 320, z: 0 },    // Left Index
  20: { x: 435, y: 320, z: -20 },  // Right Index (behind)
  21: { x: 440, y: 315, z: 0 },    // Left Thumb
  22: { x: 440, y: 315, z: -20 },  // Right Thumb (behind)
  
  // Hips (left hip visible, right behind)
  23: { x: 400, y: 300, z: 0 },    // Left Hip (visible)
  24: { x: 400, y: 300, z: -20 },  // Right Hip (behind)
  
  // Legs (left leg visible, right behind)
  25: { x: 400, y: 420, z: 0 },    // Left Knee
  26: { x: 400, y: 420, z: -20 },  // Right Knee (behind)
  27: { x: 400, y: 540, z: 0 },    // Left Ankle
  28: { x: 400, y: 540, z: -20 },  // Right Ankle (behind)
  
  // Feet
  29: { x: 380, y: 550, z: 0 },    // Left Heel
  30: { x: 380, y: 550, z: -20 },  // Right Heel (behind)
  31: { x: 420, y: 570, z: 0 },    // Left Foot Index
  32: { x: 420, y: 570, z: -20 },  // Right Foot Index (behind)
  
  // Neck
  33: { x: 400, y: 150, z: 0 }     // Neck
};

const SIDE_RIGHT_POSE_POSITIONS: Record<number, { x: number; y: number; z: number }> = {
  // Shoulders (right shoulder visible, left behind)
  11: { x: 400, y: 180, z: -20 },  // Left Shoulder (behind)
  12: { x: 400, y: 180, z: 0 },    // Right Shoulder (visible)
  
  // Arms (relaxed at sides)
  13: { x: 380, y: 250, z: -20 },  // Left Elbow (behind)
  14: { x: 380, y: 250, z: 0 },    // Right Elbow
  15: { x: 370, y: 320, z: -20 },  // Left Wrist (behind)
  16: { x: 370, y: 320, z: 0 },    // Right Wrist
  
  // Hands
  17: { x: 375, y: 330, z: -20 },  // Left Pinky (behind)
  18: { x: 375, y: 330, z: 0 },    // Right Pinky
  19: { x: 365, y: 320, z: -20 },  // Left Index (behind)
  20: { x: 365, y: 320, z: 0 },    // Right Index
  21: { x: 360, y: 315, z: -20 },  // Left Thumb (behind)
  22: { x: 360, y: 315, z: 0 },    // Right Thumb
  
  // Hips (right hip visible, left behind)
  23: { x: 400, y: 300, z: -20 },  // Left Hip (behind)
  24: { x: 400, y: 300, z: 0 },    // Right Hip (visible)
  
  // Legs (right leg visible, left behind)
  25: { x: 400, y: 420, z: -20 },  // Left Knee (behind)
  26: { x: 400, y: 420, z: 0 },    // Right Knee
  27: { x: 400, y: 540, z: -20 },  // Left Ankle (behind)
  28: { x: 400, y: 540, z: 0 },    // Right Ankle
  
  // Feet
  29: { x: 420, y: 550, z: -20 },  // Left Heel (behind)
  30: { x: 420, y: 550, z: 0 },    // Right Heel
  31: { x: 380, y: 570, z: -20 },  // Left Foot Index (behind)
  32: { x: 380, y: 570, z: 0 },    // Right Foot Index
  
  // Neck
  33: { x: 400, y: 150, z: 0 }     // Neck
};

export function createFrontPoseLandmarks(): Landmark[] {
  return LANDMARK_DEFINITIONS.map(def => ({
    ...def,
    ...FRONT_POSE_POSITIONS[def.index],
    visible: def.group !== 'hands' && def.group !== 'feet'
  }));
}

export function createSideLeftPoseLandmarks(): Landmark[] {
  return LANDMARK_DEFINITIONS.map(def => ({
    ...def,
    ...SIDE_LEFT_POSE_POSITIONS[def.index],
    visible: def.group !== 'hands' && def.group !== 'feet'
  }));
}

export function createSideRightPoseLandmarks(): Landmark[] {
  return LANDMARK_DEFINITIONS.map(def => ({
    ...def,
    ...SIDE_RIGHT_POSE_POSITIONS[def.index],
    visible: def.group !== 'hands' && def.group !== 'feet'
  }));
}

export function createDefaultLandmarks(): Landmark[] {
  return createFrontPoseLandmarks(); // Default to front pose
}

export function createLandmarksByPose(poseView: 'front' | 'side-left' | 'side-right'): Landmark[] {
  switch (poseView) {
    case 'front':
      return createFrontPoseLandmarks();
    case 'side-left':
      return createSideLeftPoseLandmarks();
    case 'side-right':
      return createSideRightPoseLandmarks();
    default:
      return createFrontPoseLandmarks();
  }
}

export function calculateNeckPosition(landmarks: Landmark[]): { x: number; y: number; z: number } {
  const leftShoulder = landmarks.find(l => l.index === 11);
  const rightShoulder = landmarks.find(l => l.index === 12);
  
  if (leftShoulder && rightShoulder) {
    return {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2 - 20, // Slightly above shoulders
      z: (leftShoulder.z + rightShoulder.z) / 2 // Average depth
    };
  }
  
  return { x: 200, y: 80, z: 0 }; // Default position
}

export function calculateDistance3D(landmark1: Landmark, landmark2: Landmark): number {
  return Math.sqrt(
    Math.pow(landmark2.x - landmark1.x, 2) +
    Math.pow(landmark2.y - landmark1.y, 2) +
    Math.pow(landmark2.z - landmark1.z, 2)
  );
}

export function calculateAngle3D(landmark1: Landmark, landmark2: Landmark, landmark3: Landmark): number {
  // Calculate vectors
  const v1 = {
    x: landmark1.x - landmark2.x,
    y: landmark1.y - landmark2.y,
    z: landmark1.z - landmark2.z
  };
  
  const v2 = {
    x: landmark3.x - landmark2.x,
    y: landmark3.y - landmark2.y,
    z: landmark3.z - landmark2.z
  };
  
  // Calculate dot product
  const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  
  // Calculate magnitudes
  const magnitude1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const magnitude2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
  
  // Calculate angle in radians, then convert to degrees
  const angle = Math.acos(dotProduct / (magnitude1 * magnitude2));
  return (angle * 180) / Math.PI;
}