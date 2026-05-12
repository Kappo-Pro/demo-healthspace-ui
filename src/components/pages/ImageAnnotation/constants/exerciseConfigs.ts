/**
 * Exercise configuration constants generated from sample.json
 * Contains all ROM exercise types with their calculation functions and landmark mappings
 */

export interface LandmarkInfo {
  index: number;
  name: string;
}

export interface ExerciseConfig {
  name: string;
  mobilityMapper: string;
  bodySideTitle: string;
  movementTitle: string;
  function: string; // JavaScript function as string
  landmarkIndices: LandmarkInfo[];
  description: string;
}

export type ExerciseConfigs = Record<string, ExerciseConfig>;

// Exercise configurations extracted from sample.json
export const EXERCISE_CONFIGS: ExerciseConfigs = {
  "Neck Flexion": {
    "name": "Neck Flexion",
    "mobilityMapper": "leftShoulder",
    "bodySideTitle": "Neck",
    "movementTitle": "Flexion",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions;\n  const dx = p2.x - p1.x;\n  const dy = p2.y - p1.y;\n  let angle = Math.atan2(dy, dx) * (180 / Math.PI);\n  let neckFlexion = Math.max(0, Math.abs(angle) - 90);\n  return Math.round(neckFlexion * 100) / 100;\n}",
    "landmarkIndices": [
      {
        "index": 7,
        "name": "Left Ear"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      },
      {
        "index": 0,
        "name": "Nose"
      }
    ],
    "description": "Neck Flexion is the forward tilting of the head, bringing the chin toward the chest. It is measured using the ear, shoulder, and nose position, with a motion range of 0° (neutral) to 50° (full chin-to-chest)."
  },
  "Neck Extension": {
    "name": "Neck Extension",
    "mobilityMapper": "leftShoulder",
    "bodySideTitle": "Neck",
    "movementTitle": "Extension",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions;\n  const dx = p0.x - p1.x;\n  const dy = p0.y - p1.y;\n  let angle = Math.atan2(dy, dx) * (180 / Math.PI);\n  let neckExtension = Math.max(0, 90 - Math.abs(angle)); \nconst roundedAngle = Math.round(neckExtension * 100) / 100;\n  return (roundedAngle * 3).toFixed(2);\n}",
    "landmarkIndices": [
      {
        "index": 7,
        "name": "Left Ear"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      },
      {
        "index": 0,
        "name": "Nose"
      }
    ],
    "description": "Neck Extension refers to tilting the head backward, tracked by comparing the ear and shoulder position to a vertical reference. The range of motion extends from 0° (neutral) to 60° (looking straight up)."
  },
  "Neck Left Lateral Flexion": {
    "name": "Neck Left Lateral Flexion",
    "mobilityMapper": "leftShoulder",
    "bodySideTitle": "Neck Left ",
    "movementTitle": "Lateral Flexion",
    "function": "(positions) => {\n const [p0, p1, p2] = positions;\n\n  // 1) Midpoint of shoulders\n  const midX = (p1.x + p2.x) / 2;\n  const midY = (p1.y + p2.y) / 2;\n\n  // 2) Vector from shoulder-midpoint to nose\n  const dx = p0.x - midX;\n  const dy = p0.y - midY;\n\n  // 3) Angle in degrees from the +X axis\n  let angle = Math.atan2(dy, dx) * (180 / Math.PI);\n\n  // 4) Shift so that 0° = upright\n  let angleFromVertical = angle + 90;\n\n  // 5) Assign variable to rounded angle\n const roundedAngle = (Math.round(angleFromVertical * 100) / 100) * 2.2;\n\n  // 6) Check if angle is greater than zero and return accordingly\n  return roundedAngle > 0 ? roundedAngle.toFixed(2) : 0;\n\n}",
    "landmarkIndices": [
      {
        "index": 0,
        "name": "Nose"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      },
      {
        "index": 12,
        "name": "Right Shoulder"
      }
    ],
    "description": "Neck Lateral Bending refers to tilting the head sideways, measured by tracking the position of the nose relative to the shoulders. The range of motion typically extends from 0° (neutral) to 45° (full lateral tilt), with movements beyond 30° considered significant."
  },
  "Neck Right Lateral Flexion": {
    "name": "Neck Right Lateral Flexion",
    "mobilityMapper": "rightShoulder",
    "bodySideTitle": "Neck Right ",
    "movementTitle": "Lateral Flexion",
    "function": "(positions) => {\n// Destructure the points you need.\n  const [p0, p1, p2] = positions;\n\n  // 1) Midpoint of shoulders\n  const midX = (p1.x + p2.x) / 2;\n  const midY = (p1.y + p2.y) / 2;\n\n  // 2) Vector from shoulder-midpoint to nose\n  const dx = p0.x - midX;\n  const dy = p0.y - midY;\n\n  // 3) Angle in degrees from the +X axis\n  let angle = Math.atan2(dy, dx) * (180 / Math.PI);\n\n  // 4) Shift so that 0° = upright\n  let angleFromVertical = angle + 90;\n\n  // 5) Assign variable to rounded angle\n  const roundedAngle = (Math.round(angleFromVertical * 100) / 100) * 2.2;\n\n  // 6) Check if angle is lesser than zero and return accordingly\n  return roundedAngle < 0 ? Math.abs(roundedAngle.toFixed(2)) : 0;\n}",
    "landmarkIndices": [
      {
        "index": 0,
        "name": "Nose"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      },
      {
        "index": 12,
        "name": "Right Shoulder"
      }
    ],
    "description": "Neck Lateral Bending refers to tilting the head sideways, measured by tracking the position of the nose relative to the shoulders. The range of motion typically extends from 0° (neutral) to 45° (full lateral tilt), with movements beyond 30° considered significant."
  },
  "Neck Left Rotation": {
    "name": "Neck Left Rotation",
    "mobilityMapper": "leftShoulder",
    "bodySideTitle": "Neck Left",
    "movementTitle": "Rotation",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions;\n\n  // Midpoint between shoulders\n  const midX = (p1.x + p2.x) / 2;\n  const midY = (p1.y + p2.y) / 2;\n\n  // Vector from shoulder-midpoint to nose\n  const dx = p0.x - midX;\n  const dy = p0.y - midY;\n\n  // Angle in degrees from the +X axis\n  let angle = Math.atan2(dy, dx) * (180 / Math.PI);\n\n  // Shift so that 0° = upright\n  let angleFromVertical = angle + 90;\n\n  // Ensure positive rotation\n  const neckRotation = angleFromVertical.toFixed(2);\n const leftRotation = neckRotation > 0 ? neckRotation * 4.2 : 0;\n  return leftRotation.toFixed(2);\n}",
    "landmarkIndices": [
      {
        "index": 0,
        "name": "Nose"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      },
      {
        "index": 12,
        "name": "Right Shoulder"
      }
    ],
    "description": "Neck Rotation refers to turning the head left or right, measured by tracking the nose position relative to the shoulders. The range of motion typically extends from 0° (neutral) to 80° (full rotation), with movements beyond 60° considered significant."
  },
  "Neck Right Rotation": {
    "name": "Neck Right Rotation",
    "mobilityMapper": "rightShoulder",
    "bodySideTitle": "Neck Right",
    "movementTitle": "Rotation",
    "function": "(positions) => {\n const [p0, p1, p2] = positions;\n\n  // Midpoint between shoulders\n  const midX = (p1.x + p2.x) / 2;\n  const midY = (p1.y + p2.y) / 2;\n\n  // Vector from shoulder-midpoint to nose\n  const dx = p0.x - midX;\n  const dy = p0.y - midY;\n\n  // Angle in degrees from the +X axis\n  let angle = Math.atan2(dy, dx) * (180 / Math.PI);\n\n  // Shift so that 0° = upright\n  let angleFromVertical = angle + 90;\n\n  // Ensure positive rotation\n  const neckRotation = angleFromVertical.toFixed(2);\n const rightRotation = neckRotation < 0 ? Math.abs(neckRotation * 3.5) : 0;\n  const leftRotation = neckRotation > 0 ? neckRotation * 4.2 : 0;\n  return rightRotation.toFixed(2);\n}",
    "landmarkIndices": [
      {
        "index": 0,
        "name": "Nose"
      },
      {
        "index": 12,
        "name": "Right Shoulder"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      }
    ],
    "description": "Neck Rotation refers to turning the head left or right, measured by tracking the nose position relative to the shoulders. The range of motion typically extends from 0° (neutral) to 80° (full rotation), with movements beyond 60° considered significant."
  },
  "Left Shoulder Flexion": {
    "name": "Left Shoulder Flexion",
    "mobilityMapper": "leftShoulder",
    "bodySideTitle": "Left Shoulder",
    "movementTitle": "Flexion",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions\n\n  const a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)\n  const b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)\n  const c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)\n  let angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI)\n\n  return Math.round(angle * 100) / 100\n}",
    "landmarkIndices": [
      {
        "index": 13,
        "name": "Left Elbow"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      },
      {
        "index": 23,
        "name": "Left Hip"
      }
    ],
    "description": "Shoulder flexion refers to the movement of the arm as it is raised forward and upward in front of the body. The range of motion for shoulder flexion typically extends from 0° (arm by the side) to about 180° (arm fully raised overhead). "
  },
  "Left Shoulder Extension": {
    "name": "Left Shoulder Extension",
    "mobilityMapper": "leftShoulder",
    "bodySideTitle": "Left Shoulder",
    "movementTitle": "Extension",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions\n\n  const a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)\n  const b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)\n  const c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)\n  let angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI)\n\n  return Math.round(angle * 100) / 100\n}",
    "landmarkIndices": [
      {
        "index": 13,
        "name": "Left Elbow"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      },
      {
        "index": 23,
        "name": "Left Hip"
      }
    ],
    "description": "Shoulder extension refers to the movement of the arm backward, away from the front of the body. The range of motion for shoulder extension typically extends from 0° (arm by the side) to about 45° to 60° (arm moving backward)."
  },
  "Left Elbow Flexion": {
    "name": "Left Elbow Flexion",
    "mobilityMapper": "leftElbow",
    "bodySideTitle": "Left Elbow",
    "movementTitle": "Flexion",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions\n\n  const a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)\n  const b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)\n  const c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)\n  let angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI)\n\n  return 180 - Math.round(angle * 100) / 100\n}",
    "landmarkIndices": [
      {
        "index": 11,
        "name": "Left Shoulder"
      },
      {
        "index": 13,
        "name": "Left Elbow"
      },
      {
        "index": 15,
        "name": "Left Wrist"
      }
    ],
    "description": "Elbow flexion refers to the bending movement at the elbow joint, where the forearm moves toward the upper arm, decreasing the angle between them. The range of motion for elbow flexion typically extends from 0° (arm fully extended) to about 140° to 150° (forearm fully bent towards the upper arm)."
  },
  "Left Shoulder Internal Rotation": {
    "name": "Left Shoulder Internal Rotation",
    "mobilityMapper": "leftShoulder",
    "bodySideTitle": "Left Shoulder",
    "movementTitle": "Internal Rotation",
    "function": "(positions, sizes) => {\n  const [p0, p1] = positions\n\n  const p0X = p0.x * sizes.width\n  const p0Y = p0.y * sizes.height\n  const p1X = p1.x * sizes.width\n  const p1Y = p1.y * sizes.height\n\n  const vectorAB = {\n    x: p0X - p1X,\n    y: p0Y - p1Y,\n  }\n  const vectorBC = {\n    x: 0,\n    y: sizes.height - p0Y,\n  }\n\n  const dotProduct = (vec1, vec2) => {\n    return vec1.x * vec2.x + vec1.y * vec2.y\n  }\n\n  const vectorLength = (vec) => {\n    return Math.sqrt(vec.x * vec.x + vec.y * vec.y)\n  }\n\n  const calculateAngleBetweenVectors = (vec1, vec2) => {\n    const dot = dotProduct(vec1, vec2)\n    const length1 = vectorLength(vec1)\n    const length2 = vectorLength(vec2)\n    const cosAngle = dot / (length1 * length2)\n    const angleRad = Math.acos(cosAngle)\n    const angleDeg = (angleRad * 180) / Math.PI\n    return angleDeg\n  }\n\n  const angle = calculateAngleBetweenVectors(vectorAB, vectorBC) - 90\n\n  return Math.abs(angle)\n}",
    "landmarkIndices": [
      {
        "index": 11,
        "name": "Left Shoulder"
      },
      {
        "index": 15,
        "name": "Left Wrist"
      }
    ],
    "description": "Shoulder internal rotation refers to the rotation of the arm towards the center of the body, where the front of the arm moves inward. The range of motion for shoulder internal rotation typically extends from about 0° (arm in a neutral position) to 70° to 90° (forearm and hand rotating inward across the body)"
  },
  "Left Shoulder External Rotation": {
    "name": "Left Shoulder External Rotation",
    "mobilityMapper": "leftShoulder",
    "bodySideTitle": "Left Shoulder",
    "movementTitle": "External Rotation",
    "function": "(positions, sizes) => {\n  const [p0, p1] = positions\n\n  const p0X = p0.x * sizes.width\n  const p0Y = p0.y * sizes.height\n  const p1X = p1.x * sizes.width\n  const p1Y = p1.y * sizes.height\n\n  const vectorAB = {\n    x: p0X - p1X,\n    y: p0Y - p1Y,\n  }\n  const vectorBC = {\n    x: 0,\n    y: sizes.height - p0Y,\n  }\n\n  const dotProduct = (vec1, vec2) => {\n    return vec1.x * vec2.x + vec1.y * vec2.y\n  }\n\n  const vectorLength = (vec) => {\n    return Math.sqrt(vec.x * vec.x + vec.y * vec.y)\n  }\n\n  const calculateAngleBetweenVectors = (vec1, vec2) => {\n    const dot = dotProduct(vec1, vec2)\n    const length1 = vectorLength(vec1)\n    const length2 = vectorLength(vec2)\n    const cosAngle = dot / (length1 * length2)\n    const angleRad = Math.acos(cosAngle)\n    const angleDeg = (angleRad * 180) / Math.PI\n    return angleDeg\n  }\n\n  const angle = calculateAngleBetweenVectors(vectorAB, vectorBC) - 90\n\n  return Math.abs(angle)\n}",
    "landmarkIndices": [
      {
        "index": 11,
        "name": "Left Shoulder"
      },
      {
        "index": 15,
        "name": "Left Wrist"
      }
    ],
    "description": "Shoulder external rotation refers to the outward rotation of the arm, where the front of the arm moves away from the body. The range of motion for shoulder external rotation typically extends from about 0° (arm in a neutral position) to 90° (forearm and hand rotating outward)."
  },
  "Left Wrist Flexion": {
    "name": "Left Wrist Flexion",
    "mobilityMapper": "leftElbow",
    "bodySideTitle": "Left Wrist",
    "movementTitle": "Flexion",
    "function": "(positions) => {\nconst [p0, p1, p2] = positions;\n  const ref = { x: -1, y: 0 };\n  const v = p2\n    ? { x: p2.x - p1.x, y: p2.y - p1.y }\n    : { x: 0, y: 0 };\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x * ref.x + ref.y * ref.y);\n  const magV = Math.sqrt(v.x * v.x + v.y * v.y);\n  if (magV === 0) return 0;\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n  const cross = ref.x * v.y - ref.y * v.x;\n  if (cross > 0) angle = -angle;\n  return angle > 0 ? angle : 0;\n}",
    "landmarkIndices": [
      {
        "index": 13,
        "name": "Left Elbow"
      },
      {
        "index": 15,
        "name": "Left Wrist"
      },
      {
        "index": 19,
        "name": "Left Index"
      }
    ],
    "description": "Wrist Flexion is the downward bending of the wrist toward the palm, measured by tracking the angle between the index finger and a horizontal reference from the wrist. The motion extends from 0° (neutral) to 60° or more."
  },
  "Left Wrist Extension": {
    "name": "Left Wrist Extension",
    "mobilityMapper": "leftElbow",
    "bodySideTitle": "Left Wrist",
    "movementTitle": "Extension",
    "function": "(positions) => {\nconst [p0, p1, p2] = positions;\n  const ref = { x: -1, y: 0 };\n  const v = p2\n    ? { x: p2.x - p1.x, y: p2.y - p1.y }\n    : { x: 0, y: 0 };\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x * ref.x + ref.y * ref.y);\n  const magV = Math.sqrt(v.x * v.x + v.y * v.y);\n  if (magV === 0) return 0;\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n  const cross = ref.x * v.y - ref.y * v.x;\n  if (cross > 0) angle = -angle;\n  return angle < 0 ? Math.abs(angle) : 0;\n}",
    "landmarkIndices": [
      {
        "index": 13,
        "name": "Left Elbow"
      },
      {
        "index": 15,
        "name": "Left Wrist"
      },
      {
        "index": 19,
        "name": "Left Index"
      }
    ],
    "description": "Wrist Extension is the upward bending of the wrist, measured by tracking how far the index finger moves above the wrist. The typical range extends from 0° (neutral) to 60° (full extension)."
  },
  "Left Wrist Ulnar Deviation": {
    "name": "Left Wrist Ulnar Deviation",
    "mobilityMapper": "leftElbow",
    "bodySideTitle": "Left Wrist ",
    "movementTitle": "Ulnar Deviation",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions; \n\n  // Define a horizontal reference vector (pointing to the left).\n  const ref = { x: -1, y: 0 };\n\n  // Compute the vector from the wrist to the middle fingertip.\n  const v = {\n    x: p2.x - p1.x,\n    y: p2.y - p1.y,\n  };\n\n  // Calculate dot product and magnitudes for angle calculation.\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x ** 2 + ref.y ** 2);\n  const magV = Math.sqrt(v.x ** 2 + v.y ** 2);\n\n  // Avoid division by zero.\n  if (magV === 0) return 0;\n\n  // Calculate unsigned angle.\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n\n  // Determine sign using cross product.\n  const cross = ref.x * v.y - ref.y * v.x;\n  if (cross < 0) angle = -angle;\n\n  return angle < 0 ? Math.abs(angle) : 0;\n}",
    "landmarkIndices": [
      {
        "index": 13,
        "name": "Left Elbow"
      },
      {
        "index": 15,
        "name": "Left Wrist"
      },
      {
        "index": 19,
        "name": "Left Index"
      }
    ],
    "description": "Wrist Ulnar Deviation is the inward bending of the wrist toward the pinky side, measured by tracking the movement of the index and pinky fingers relative to the wrist. The typical range extends from 0° (neutral) to 30° (full deviation)."
  },
  "Left Wrist Radial Deviation": {
    "name": "Left Wrist Radial Deviation",
    "mobilityMapper": "leftElbow",
    "bodySideTitle": "Left Wrist ",
    "movementTitle": "Radial Deviation",
    "function": "(positions) => {\n const [p0, p1, p2] = positions; // Extract parameters\n\n  // Define a horizontal reference vector (pointing to the left).\n  const ref = { x: -1, y: 0 };\n\n  // Compute the vector from the wrist to the middle fingertip.\n  const v = {\n    x: p2.x - p1.x,\n    y: p2.y - p1.y,\n  };\n\n  // Calculate dot product and magnitudes for angle calculation.\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x ** 2 + ref.y ** 2);\n  const magV = Math.sqrt(v.x ** 2 + v.y ** 2);\n\n  // Avoid division by zero.\n  if (magV === 0) return '0.00';\n\n  // Calculate unsigned angle.\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n\n  // Determine sign using cross product.\n  const cross = ref.x * v.y - ref.y * v.x;\n  if (cross < 0) angle = -angle;\n  return angle > 0 ? Math.abs(angle) : 0;\n}",
    "landmarkIndices": [
      {
        "index": 13,
        "name": "Left Elbow"
      },
      {
        "index": 15,
        "name": "Left Wrist"
      },
      {
        "index": 19,
        "name": "Left Index"
      }
    ],
    "description": "Wrist Radial Deviation is the outward bending of the wrist toward the thumb side, measured by tracking the movement of the index and pinky fingers relative to the wrist. The typical range extends from 0° (neutral) to 20° (full deviation)."
  },
  "Left Wrist Pronation": {
    "name": "Left Wrist Pronation",
    "mobilityMapper": "leftElbow",
    "bodySideTitle": "Left Wrist",
    "movementTitle": "Pronation",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions;\n  const ref = { x: 0, y: -1 };\n\n  // Compute the vector from the wrist to the thumb tip.\n  const v = {\n    x: p2.x - p1.x,\n    y: p2.y - p1.y,\n  };\n\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x ** 2 + ref.y ** 2);\n  const magV = Math.sqrt(v.x ** 2 + v.y ** 2);\n  if (magRef === 0 || magV === 0) return 0;\n\n  // Compute the unsigned angle between the vectors\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n\n  // Compute the cross product to determine the sign\n  const cross = ref.x * v.y - ref.y * v.x;\n  angle = cross < 0 ? -angle : angle;\n\n  const angleFix = angle.toFixed(2);\n\n  // (Optional) You may clamp or adjust the angle range if needed.\n  return angleFix < 0 ? Math.abs(angleFix) : 0;\n}",
    "landmarkIndices": [
      {
        "index": 13,
        "name": "Left Elbow"
      },
      {
        "index": 15,
        "name": "Left Wrist"
      },
      {
        "index": 21,
        "name": "Left Thumb"
      }
    ],
    "description": "Wrist Pronation refers to rotating the forearm so the palm faces downward, measured by tracking the position of the wrist relative to the elbow and index finger. The range of motion typically extends from 0° (neutral) to 90° (full pronation)."
  },
  "Left Wrist Supination": {
    "name": "Left Wrist Supination",
    "mobilityMapper": "leftElbow",
    "bodySideTitle": "Left Wrist",
    "movementTitle": "Supination",
    "function": "(positions) => {\n const [p0, p1, p2] = positions;\n\n  const ref = { x: 0, y: -1 };\n\n  // Compute the vector from the wrist to the thumb tip.\n  const v = {\n    x: p2.x - p1.x,\n    y: p2.y - p1.y,\n  };\n\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x ** 2 + ref.y ** 2);\n  const magV = Math.sqrt(v.x ** 2 + v.y ** 2);\n  if (magRef === 0 || magV === 0) return 0;\n\n  // Compute the unsigned angle between the vectors\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n\n  // Compute the cross product to determine the sign\n  const cross = ref.x * v.y - ref.y * v.x;\n  angle = cross < 0 ? -angle : angle;\n\n  const angleFix = angle.toFixed(2);\n\n  // (Optional) You may clamp or adjust the angle range if needed.\n  return angleFix > 0 ? Math.abs(angleFix) : 0;\n}",
    "landmarkIndices": [
      {
        "index": 13,
        "name": "Left Elbow"
      },
      {
        "index": 15,
        "name": "Left Wrist"
      },
      {
        "index": 21,
        "name": "Left Thumb"
      }
    ],
    "description": "Wrist Supination refers to rotating the forearm so the palm faces upward, measured by tracking the position of the wrist relative to the elbow and index finger. The range of motion typically extends from 0° (neutral) to 90° (full supination)."
  },
  "Left Shoulder Abduction": {
    "name": "Left Shoulder Abduction",
    "mobilityMapper": "leftShoulder",
    "bodySideTitle": "Left Shoulder",
    "movementTitle": "Abduction",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions\n\n  const a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)\n  const b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)\n  const c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)\n  let angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI)\n\n  return Math.round(angle * 100) / 100\n}",
    "landmarkIndices": [
      {
        "index": 13,
        "name": "Left Elbow"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      },
      {
        "index": 23,
        "name": "Left Hip"
      }
    ],
    "description": "Shoulder abduction refers to the movement of the arm away from the body in the lateral (side) direction. The range of motion for shoulder abduction typically extends from 0° (arm at the side) to about 180° (arm raised overhead in line with the body)."
  },
  "Right Shoulder Flexion": {
    "name": "Right Shoulder Flexion",
    "mobilityMapper": "rightShoulder",
    "bodySideTitle": "Right Shoulder ",
    "movementTitle": "Flexion",
    "function": "(positions) => {\n\tconst [p0, p1, p2] = positions\n\tconst a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)\n\tconst b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)\n\tconst c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)\n\tlet angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI)\n\treturn Math.round(angle * 100) / 100\n}",
    "landmarkIndices": [
      {
        "index": 14,
        "name": "Right Elbow"
      },
      {
        "index": 12,
        "name": "Right Shoulder"
      },
      {
        "index": 24,
        "name": "Right Hip"
      }
    ],
    "description": "Shoulder flexion refers to the movement of the arm as it is raised forward and upward in front of the body. The range of motion for shoulder flexion typically extends from 0° (arm by the side) to about 180° (arm fully raised overhead). "
  },
  "Right Shoulder Extension": {
    "name": "Right Shoulder Extension",
    "mobilityMapper": "rightShoulder",
    "bodySideTitle": "Right Shoulder",
    "movementTitle": "Extension",
    "function": "(positions) => {\n\tconst [p0, p1, p2] = positions\n\n\tconst a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)\n\tconst b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)\n\tconst c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)\n\tlet angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI)\n\n\treturn Math.round(angle * 100) / 100\n}",
    "landmarkIndices": [
      {
        "index": 14,
        "name": "Right Elbow"
      },
      {
        "index": 12,
        "name": "Right Shoulder"
      },
      {
        "index": 24,
        "name": "Right Hip"
      }
    ],
    "description": "Shoulder extension refers to the movement of the arm backward, away from the front of the body. The range of motion for shoulder extension typically extends from 0° (arm by the side) to about 45° to 60° (arm moving backward).\n"
  },
  "Right Elbow Flexion": {
    "name": "Right Elbow Flexion",
    "mobilityMapper": "rightElbow",
    "bodySideTitle": "Right Elbow",
    "movementTitle": "Flexion",
    "function": "(positions) => {\n\tconst [p0, p1, p2] = positions\n\n\tconst a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)\n\tconst b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)\n\tconst c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)\n\tlet angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI)\n\n\treturn 180 - (Math.round(angle * 100) / 100) \n}",
    "landmarkIndices": [
      {
        "index": 12,
        "name": "Right Shoulder"
      },
      {
        "index": 14,
        "name": "Right Elbow"
      },
      {
        "index": 16,
        "name": "Right Wrist"
      }
    ],
    "description": "Elbow flexion refers to the bending movement at the elbow joint, where the forearm moves toward the upper arm, decreasing the angle between them. The range of motion for elbow flexion typically extends from 0° (arm fully extended) to about 140° to 150° (forearm fully bent towards the upper arm)."
  },
  "Right Elbow Extension": {
    "name": "Right Elbow Extension",
    "mobilityMapper": "rightElbow",
    "bodySideTitle": "Right Elbow",
    "movementTitle": "Extension",
    "function": "(positions) => {\n\tconst [p0, p1, p2] = positions\n\n\tconst a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)\n\tconst b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)\n\tconst c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)\n\tlet angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI)\n\n\treturn 180 - (Math.round(angle * 100) / 100) \n}",
    "landmarkIndices": [
      {
        "index": 12,
        "name": "Right Shoulder"
      },
      {
        "index": 14,
        "name": "Right Elbow"
      },
      {
        "index": 16,
        "name": "Right Wrist"
      }
    ],
    "description": "Elbow extension refers to the straightening movement at the elbow joint, where the forearm moves away from the upper arm, increasing the angle between them. The range of motion for elbow extension typically extends from about 140° to 150° (when fully bent) back to 0° (arm fully straightened)."
  },
  "Right Shoulder Internal Rotation": {
    "name": "Right Shoulder Internal Rotation",
    "mobilityMapper": "rightShoulder",
    "bodySideTitle": "Right Shoulder",
    "movementTitle": "Internal Rotation",
    "function": "(positions, sizes) => {\n  const [p0, p1] = positions\n\n  const p0X = p0.x * sizes.width\n  const p0Y = p0.y * sizes.height\n  const p1X = p1.x * sizes.width\n  const p1Y = p1.y * sizes.height\n\n  const vectorAB = {\n    x: p0X - p1X,\n    y: p0Y - p1Y,\n  }\n  const vectorBC = {\n    x: 0,\n    y: sizes.height - p0Y,\n  }\n\n  const dotProduct = (vec1, vec2) => {\n    return vec1.x * vec2.x + vec1.y * vec2.y\n  }\n\n  const vectorLength = (vec) => {\n    return Math.sqrt(vec.x * vec.x + vec.y * vec.y)\n  }\n\n  const calculateAngleBetweenVectors = (vec1, vec2) => {\n    const dot = dotProduct(vec1, vec2)\n    const length1 = vectorLength(vec1)\n    const length2 = vectorLength(vec2)\n    const cosAngle = dot / (length1 * length2)\n    const angleRad = Math.acos(cosAngle)\n    const angleDeg = (angleRad * 180) / Math.PI\n    return angleDeg\n  }\n\n  const angle = calculateAngleBetweenVectors(vectorAB, vectorBC) -  90\n\n  return Math.abs(angle)\n}",
    "landmarkIndices": [
      {
        "index": 12,
        "name": "Right Shoulder"
      },
      {
        "index": 16,
        "name": "Right Wrist"
      }
    ],
    "description": "Shoulder internal rotation refers to the rotation of the arm towards the center of the body, where the front of the arm moves inward. The range of motion for shoulder internal rotation typically extends from about 0° (arm in a neutral position) to 70° to 90° (forearm and hand rotating inward across the body)"
  },
  "Right Shoulder External Rotation": {
    "name": "Right Shoulder External Rotation",
    "mobilityMapper": "rightShoulder",
    "bodySideTitle": "Right Shoulder",
    "movementTitle": "External Rotation",
    "function": "(positions, sizes) => {\n  const [p0, p1] = positions\n\n  const p0X = p0.x * sizes.width\n  const p0Y = p0.y * sizes.height\n  const p1X = p1.x * sizes.width\n  const p1Y = p1.y * sizes.height\n\n  const vectorAB = {\n    x: p0X - p1X,\n    y: p0Y - p1Y,\n  }\n  const vectorBC = {\n    x: 0,\n    y: sizes.height - p0Y,\n  }\n\n  const dotProduct = (vec1, vec2) => {\n    return vec1.x * vec2.x + vec1.y * vec2.y\n  }\n\n  const vectorLength = (vec) => {\n    return Math.sqrt(vec.x * vec.x + vec.y * vec.y)\n  }\n\n  const calculateAngleBetweenVectors = (vec1, vec2) => {\n    const dot = dotProduct(vec1, vec2)\n    const length1 = vectorLength(vec1)\n    const length2 = vectorLength(vec2)\n    const cosAngle = dot / (length1 * length2)\n    const angleRad = Math.acos(cosAngle)\n    const angleDeg = (angleRad * 180) / Math.PI\n    return angleDeg\n  }\n\n  const angle = calculateAngleBetweenVectors(vectorAB, vectorBC) - 90\n\n  return Math.abs(angle)\n}",
    "landmarkIndices": [
      {
        "index": 12,
        "name": "Right Shoulder"
      },
      {
        "index": 16,
        "name": "Right Wrist"
      }
    ],
    "description": "Shoulder external rotation refers to the outward rotation of the arm, where the front of the arm moves away from the body. The range of motion for shoulder external rotation typically extends from about 0° (arm in a neutral position) to 90° (forearm and hand rotating outward)."
  },
  "Right Wrist Flexion": {
    "name": "Right Wrist Flexion",
    "mobilityMapper": "rightElbow",
    "bodySideTitle": "Right Wrist",
    "movementTitle": "Flexion",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions;\n  const ref = { x: 1, y: 0 };\n  const v = p2\n    ? { x: p2.x - p1.x, y: p2.y - p1.y }\n    : { x: 0, y: 0 };\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x * ref.x + ref.y * ref.y);\n  const magV = Math.sqrt(v.x * v.x + v.y * v.y);\n  if (magV === 0) return 0;\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n  const cross = ref.x * v.y - ref.y * v.x;\n  if (cross < 0) angle = -angle;\n  return angle > 0 ? angle : 0;\n}",
    "landmarkIndices": [
      {
        "index": 14,
        "name": "Right Elbow"
      },
      {
        "index": 16,
        "name": "Right Wrist"
      },
      {
        "index": 20,
        "name": "Right Index"
      }
    ],
    "description": "Wrist Flexion is the downward bending of the wrist toward the palm, measured by tracking the angle between the index finger and a horizontal reference from the wrist. The motion extends from 0° (neutral) to 60° or more."
  },
  "Right Wrist Extension": {
    "name": "Right Wrist Extension",
    "mobilityMapper": "rightElbow",
    "bodySideTitle": "Right Wrist",
    "movementTitle": "Extension",
    "function": "(positions) => {\n const [p0, p1, p2] = positions;\n  const ref = { x: 1, y: 0 };\n  const v = p2\n    ? { x: p2.x - p1.x, y: p2.y - p1.y }\n    : { x: 0, y: 0 };\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x * ref.x + ref.y * ref.y);\n  const magV = Math.sqrt(v.x * v.x + v.y * v.y);\n  if (magV === 0) return 0;\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n  const cross = ref.x * v.y - ref.y * v.x;\n  if (cross < 0) angle = -angle;\n  return angle < 0 ? Math.abs(angle) : 0;\n}",
    "landmarkIndices": [
      {
        "index": 14,
        "name": "Right Elbow"
      },
      {
        "index": 16,
        "name": "Right Wrist"
      },
      {
        "index": 20,
        "name": "Right Index"
      }
    ],
    "description": "Wrist Extension is the upward bending of the wrist, measured by tracking how far the index finger moves above the wrist. The typical range extends from 0° (neutral) to 60° (full extension)."
  },
  "Right Wrist Ulnar Deviation": {
    "name": "Right Wrist Ulnar Deviation",
    "mobilityMapper": "rightElbow",
    "bodySideTitle": "Right Wrist ",
    "movementTitle": "Ulnar Deviation",
    "function": "(positions) => {\nconst [p0, p1, p2] = positions; // Extract parameters\n\n  // Define a horizontal reference vector (pointing to the right).\n  const ref = { x: 1, y: 0 };\n\n  // Compute the vector from the wrist to the middle fingertip.\n  const v = {\n    x: p2.x - p1.x,\n    y: p2.y - p1.y,\n  };\n\n  // Calculate dot product and magnitudes for angle calculation.\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x ** 2 + ref.y ** 2);\n  const magV = Math.sqrt(v.x ** 2 + v.y ** 2);\n\n  // Avoid division by zero.\n  if (magV === 0) return '0.00';\n\n  // Calculate unsigned angle.\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n\n  // Determine sign using cross product.\n  const cross = ref.x * v.y - ref.y * v.x;\n  if (cross < 0) angle = -angle;\n  \n  return angle > 0 ? angle : 0;\n}",
    "landmarkIndices": [
      {
        "index": 14,
        "name": "Right Elbow"
      },
      {
        "index": 16,
        "name": "Right Wrist"
      },
      {
        "index": 20,
        "name": "Right Index"
      }
    ],
    "description": "Wrist Ulnar Deviation is the inward bending of the wrist toward the pinky side, measured by tracking the movement of the index and pinky fingers relative to the wrist. The typical range extends from 0° (neutral) to 30° (full deviation)."
  },
  "Right Wrist Radial Deviation": {
    "name": "Right Wrist Radial Deviation",
    "mobilityMapper": "rightElbow",
    "bodySideTitle": "RightWrist ",
    "movementTitle": "Radial Deviation",
    "function": "(positions) => {\n const [p0, p1, p2] = positions; // Extract parameters\n\n  // Define a horizontal reference vector (pointing to the right).\n  const ref = { x: 1, y: 0 };\n\n  // Compute the vector from the wrist to the middle fingertip.\n  const v = {\n    x: p2.x - p1.x,\n    y: p2.y - p1.y,\n  };\n\n  // Calculate dot product and magnitudes for angle calculation.\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x ** 2 + ref.y ** 2);\n  const magV = Math.sqrt(v.x ** 2 + v.y ** 2);\n\n  // Avoid division by zero.\n  if (magV === 0) return '0.00';\n\n  // Calculate unsigned angle.\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n\n  // Determine sign using cross product.\n  const cross = ref.x * v.y - ref.y * v.x;\n  if (cross < 0) angle = -angle;\n  \n  return angle < 0 ? Math.abs(angle) : 0;\n}",
    "landmarkIndices": [
      {
        "index": 20,
        "name": "Right Index"
      },
      {
        "index": 16,
        "name": "Right Wrist"
      },
      {
        "index": 20,
        "name": "Right Index"
      }
    ],
    "description": "Wrist Radial Deviation is the outward bending of the wrist toward the thumb side, measured by tracking the movement of the index and pinky fingers relative to the wrist. The typical range extends from 0° (neutral) to 20° (full deviation)."
  },
  "Right Wrist Pronation": {
    "name": "Right Wrist Pronation",
    "mobilityMapper": "rightElbow",
    "bodySideTitle": "Right Wrist",
    "movementTitle": "Pronation",
    "function": "(positions) => {\n const [p0, p1, p2] = positions;\n  const ref = { x: 0, y: -1 };\n\n  // Compute the vector from the wrist to the thumb tip.\n  const v = {\n    x: p2.x - p1.x,\n    y: p2.y - p1.y,\n  };\n\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x * ref.x + ref.y * ref.y);\n  const magV = Math.sqrt(v.x * v.x + v.y * v.y);\n  if (magRef === 0 || magV === 0) return 0;\n\n  // Compute the unsigned angle between the vectors\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n\n  // Compute the cross product to determine the sign\n  const cross = ref.x * v.y - ref.y * v.x;\n  angle = cross > 0 ? -angle : angle;\n\n  const angleFix = angle.toFixed(2);\n\n  // (Optional) You may clamp or adjust the angle range if needed.\n  return angleFix < 0 ? Math.abs(angleFix) : 0;\n}",
    "landmarkIndices": [
      {
        "index": 14,
        "name": "Right Elbow"
      },
      {
        "index": 16,
        "name": "Right Wrist"
      },
      {
        "index": 22,
        "name": "Right Thumb"
      }
    ],
    "description": "Wrist Pronation refers to rotating the forearm so the palm faces downward, measured by tracking the position of the wrist relative to the elbow and index finger. The range of motion typically extends from 0° (neutral) to 90° (full pronation)."
  },
  "Right Wrist Supination": {
    "name": "Right Wrist Supination",
    "mobilityMapper": "rightElbow",
    "bodySideTitle": "Right Wrist",
    "movementTitle": "Supination",
    "function": "(positions) => {\nconst [p0, p1, p2] = positions;\n\n  const ref = { x: 0, y: -1 };\n\n  // Compute the vector from the wrist to the thumb tip.\n  const v = {\n    x: p2.x - p1.x,\n    y: p2.y - p1.y,\n  };\n\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x * ref.x + ref.y * ref.y);\n  const magV = Math.sqrt(v.x * v.x + v.y * v.y);\n  if (magRef === 0 || magV === 0) return 0;\n\n  // Compute the unsigned angle between the vectors\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n\n  // Compute the cross product to determine the sign\n  const cross = ref.x * v.y - ref.y * v.x;\n  angle = cross > 0 ? -angle : angle;\n\n  const angleFix = angle.toFixed(2);\n\n  // (Optional) You may clamp or adjust the angle range if needed.\n  return angleFix > 0 ? Math.abs(angleFix) : 0;\n}",
    "landmarkIndices": [
      {
        "index": 14,
        "name": "Right Elbow"
      },
      {
        "index": 16,
        "name": "Right Wrist"
      },
      {
        "index": 20,
        "name": "Right Index"
      }
    ],
    "description": "Wrist Supination refers to rotating the forearm so the palm faces upward, measured by tracking the position of the wrist relative to the elbow and index finger. The range of motion typically extends from 0° (neutral) to 90° (full supination)."
  },
  "Right Shoulder Abduction": {
    "name": "Right Shoulder Abduction",
    "mobilityMapper": "rightShoulder",
    "bodySideTitle": "Right Shoulder",
    "movementTitle": "Abduction",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions\n\n  const a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)\n  const b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)\n  const c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)\n  let angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI)\n\n  return Math.round(angle * 100) / 100\n}",
    "landmarkIndices": [
      {
        "index": 14,
        "name": "Right Elbow"
      },
      {
        "index": 12,
        "name": "Right Shoulder"
      },
      {
        "index": 24,
        "name": "Right Hip"
      }
    ],
    "description": "Shoulder abduction refers to the movement of the arm away from the body in the lateral (side) direction. The range of motion for shoulder abduction typically extends from 0° (arm at the side) to about 180° (arm raised overhead in line with the body)."
  },
  "Squat": {
    "name": "Squat",
    "mobilityMapper": "squat",
    "bodySideTitle": null,
    "movementTitle": "Squat",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions\n\n  const a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)\n  const b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)\n  const c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)\n  let angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI)\n\n  return 180 - Math.round(angle * 100) / 100\n}",
    "landmarkIndices": [
      {
        "index": 28,
        "name": "Right Ankle"
      },
      {
        "index": 26,
        "name": "Right Knee"
      },
      {
        "index": 24,
        "name": "Right Hip"
      }
    ],
    "description": "A squat involves a dynamic movement of the lower body, primarily at the hips, knees, and ankles. The range of motion for a squat typically extends from a standing position (0°) to about 90° or more at the knees when the thighs are parallel to the ground, and the hips are flexed. In deeper squats, the knees can bend beyond 90°, approaching full flexion"
  },
  "Lumbar Flexion": {
    "name": "Lumbar Flexion",
    "mobilityMapper": "leftHip",
    "bodySideTitle": "Lumbar",
    "movementTitle": "Flexion",
    "function": "(positions) => {\n const [p0, p1, p2] = positions;\n  const a = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2);\n  const b = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2);\n  const c = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);\n\n  let angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI);\n\n  // Convert the standard angle to lumbar flexion format\n  let lumbarFlexion = Math.max(0, 180 - angle); // Ensure no negative values\n\n  return Math.round(lumbarFlexion * 100) / 100;\n}",
    "landmarkIndices": [
      {
        "index": 23,
        "name": "Left Hip"
      },
      {
        "index": 25,
        "name": "Left Knee"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      }
    ],
    "description": "Lumbar Flexion involves bending the lower spine forward, calculated using the shoulder, hip, and knee positions. The movement ranges from 0° (standing straight) to 60° (deep forward bend)."
  },
  "Lumbar Extension": {
    "name": "Lumbar Extension",
    "mobilityMapper": "leftHip",
    "bodySideTitle": "Lumbar",
    "movementTitle": "Extension",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions; \n  const a = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2);\n  const b = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2);\n  const c = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);\n\n  let angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI);\n\n  // Ensure 0° when standing straight and increase with backward bending\n  angle = Math.abs(180 - angle);\n const lumbarExtension = (Math.round(angle * 100) / 100) * 1.3;\n  return lumbarExtension.toFixed(2);\n}",
    "landmarkIndices": [
      {
        "index": 23,
        "name": "Left Hip"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      },
      {
        "index": 25,
        "name": "Left Knee"
      }
    ],
    "description": "Lumbar Extension refers to bending the lower spine backward, measured by tracking the position of the shoulders relative to the hips. The range of motion typically extends from 0° (neutral standing position) to 30°-50° (full extension), with movements beyond 40° considered significant."
  },
  "Lumbar Left Lateral Flexion": {
    "name": "Lumbar Left Lateral Flexion",
    "mobilityMapper": "leftHip",
    "bodySideTitle": "Lumbar Left ",
    "movementTitle": " Lateral Flexion",
    "function": "(positions) => {\nconst [p0, p1, p2] = positions;\n\n  // 1) Midpoint of hips\n  const midX = (p1.x + p2.x) / 2;\n  const midY = (p1.y + p2.y) / 2;\n\n  // 2) Vector from hip-midpoint to nose\n  const dx = p0.x - midX;\n  const dy = p0.y - midY;\n\n  // 3) Angle in degrees from the +X axis\n  let angle = Math.atan2(dy, dx) * (180 / Math.PI);\n\n  // 4) Shift so that 0° = upright\n  let angleFromVertical = angle + 90;\n\n  // 5) Right flex is positive portion only\n  let rightFlex = Math.max(0, angleFromVertical);\n\n  // 6) Round to 2 decimals\n  return Math.round(rightFlex * 100) / 100;\n}",
    "landmarkIndices": [
      {
        "index": 0,
        "name": "Nose"
      },
      {
        "index": 23,
        "name": "Left Hip"
      },
      {
        "index": 24,
        "name": "Right Hip"
      }
    ],
    "description": "Lumbar lateral flexion refers to bending the torso sideways, measured by tracking the position of the shoulder relative to the hip and head. The range of motion typically extends from 0° (upright) to 25° or more.\n\n"
  },
  "Lumbar Right Lateral Flexion": {
    "name": "Lumbar Right Lateral Flexion",
    "mobilityMapper": "rightHip",
    "bodySideTitle": "Lumbar Right ",
    "movementTitle": " Lateral Flexion",
    "function": "(positions) => {\nconst [p0, p1, p2] = positions;\n\n  const midX = (p1.x + p2.x) / 2;\n  const midY = (p1.y + p2.y) / 2;\n\n  const dx = p0.x - midX;\n  const dy = p0.y - midY;\n\n  let angle = Math.atan2(dy, dx) * (180 / Math.PI);\n  let angleFromVertical = angle + 90;\n\n  // Left flex is the positive portion of the negative side\n  let leftFlex = Math.max(0, -angleFromVertical);\n\n  return Math.round(leftFlex * 100) / 100;\n}",
    "landmarkIndices": [
      {
        "index": 0,
        "name": "Nose"
      },
      {
        "index": 23,
        "name": "Left Hip"
      },
      {
        "index": 24,
        "name": "Right Hip"
      }
    ],
    "description": "Lumbar lateral flexion refers to bending the torso sideways, measured by tracking the position of the shoulder relative to the hip and head. The range of motion typically extends from 0° (upright) to 25° or more.\n\n"
  },
  "Lumbar Left Rotation": {
    "name": "Lumbar Left Rotation",
    "mobilityMapper": "leftHip",
    "bodySideTitle": "Lumbar Left ",
    "movementTitle": "Rotation",
    "function": "(positions) => {\n  const [p0, p1, p2, p3] = positions;\n\n  // Compute midpoints for hips and shoulders\n  const hipCenter = {\n    x: (p0.x + p1.x) / 2,\n    y: (p0.y + p1.y) / 2,\n  };\n\n  const shoulderCenter = {\n    x: (p2.x + p3.x) / 2,\n    y: (p2.y + p3.y) / 2,\n  };\n\n  // Compute torso vector (from hip center to shoulder center)\n  const v = {\n    x: shoulderCenter.x - hipCenter.x,\n    y: shoulderCenter.y - hipCenter.y,\n  };\n\n  // Define vertical reference vector (pointing straight up)\n  const ref = { x: 0, y: -1 };\n\n  // Calculate dot product and magnitudes\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x ** 2 + ref.y ** 2);\n  const magV = Math.sqrt(v.x ** 2 + v.y ** 2);\n\n  if (magV === 0) return '0.00'; // Avoid division by zero\n\n  // Calculate angle using acos (in degrees)\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n\n  // Determine sign using cross product\n  const cross = ref.x * v.y - ref.y * v.x;\n  if (cross < 0) angle = -angle;\n  const angleFix = (angle * 10).toFixed(2);\n const gain = 1.4;\n  return angleFix < 0 ? Math.abs(angleFix * gain) : 0;\n}",
    "landmarkIndices": [
      {
        "index": 23,
        "name": "Left Hip"
      },
      {
        "index": 24,
        "name": "Right Hip"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      }
    ],
    "description": "Lumbar Rotation involves twisting the torso left or right, measured by tracking the position of the nose relative to the hips. The range of motion typically extends from 0° (neutral) to 45° (full rotation), with movements beyond 30° considered significant."
  },
  "Lumbar Right Rotation": {
    "name": "Lumbar Right Rotation",
    "mobilityMapper": "rightHip",
    "bodySideTitle": "Lumbar Right ",
    "movementTitle": "Rotation",
    "function": "(positions) => {\n  const [p0, p1, p2, p3] = positions;\n\n  // Compute midpoints for hips and shoulders\n  const hipCenter = {\n    x: (p0.x + p1.x) / 2,\n    y: (p0.y + p1.y) / 2,\n  };\n\n  const shoulderCenter = {\n    x: (p2.x + p3.x) / 2,\n    y: (p2.y + p3.y) / 2,\n  };\n\n  // Compute torso vector (from hip center to shoulder center)\n  const v = {\n    x: shoulderCenter.x - hipCenter.x,\n    y: shoulderCenter.y - hipCenter.y,\n  };\n\n  // Define vertical reference vector (pointing straight up)\n  const ref = { x: 0, y: -1 };\n\n  // Calculate dot product and magnitudes\n  const dot = ref.x * v.x + ref.y * v.y;\n  const magRef = Math.sqrt(ref.x ** 2 + ref.y ** 2);\n  const magV = Math.sqrt(v.x ** 2 + v.y ** 2);\n\n  if (magV === 0) return '0.00'; // Avoid division by zero\n\n  // Calculate angle using acos (in degrees)\n  let angle = Math.acos(dot / (magRef * magV)) * (180 / Math.PI);\n\n  // Determine sign using cross product\n  const cross = ref.x * v.y - ref.y * v.x;\n  if (cross < 0) angle = -angle;\n  const angleFix = (angle * 10).toFixed(2);\n\n  return angleFix > 0 ? angleFix : 0;\n}",
    "landmarkIndices": [
      {
        "index": 23,
        "name": "Left Hip"
      },
      {
        "index": 24,
        "name": "Right Hip"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      }
    ],
    "description": "Lumbar Rotation involves twisting the torso left or right, measured by tracking the position of the nose relative to the hips. The range of motion typically extends from 0° (neutral) to 45° (full rotation), with movements beyond 30° considered significant."
  },
  "Left Knee Flexion": {
    "name": "Left Knee Flexion",
    "mobilityMapper": "leftKnee",
    "bodySideTitle": "Left Knee",
    "movementTitle": "Flexion",
    "function": "(positions, sizes) => {\n  const [p0, p1, p2] = positions\n  const p3 = {\n    x: p1.x + (p1.x - p0.x),\n    y: p1.y + (p1.y - p0.y),\n  };\n\n  \n  const vectorAngle = (x, y) => {\n    return Math.acos(\n      x.reduce((acc, n, i) => acc + n * y[i], 0) /\n      (Math.hypot(...x) * Math.hypot(...y))\n    );\n  };\n  \n  \n  const AB = { x: p2.x - p1.x, y: p2.y - p1.y };\n  const BC = { x: p3.x - p1.x, y: p3.y - p1.y };\n\n  let angle =\n    vectorAngle(\n      [AB.x * sizes.width, AB.y * sizes.height],\n      [BC.x * sizes.width, BC.y * sizes.height]\n    ) *\n    (180 / Math.PI);\n\n  return angle\n}",
    "landmarkIndices": [
      {
        "index": 23,
        "name": "Left Hip"
      },
      {
        "index": 25,
        "name": "Left Knee"
      },
      {
        "index": 27,
        "name": "Left Ankle"
      }
    ],
    "description": "Knee flexion refers to the bending movement at the knee joint, where the lower leg moves toward the back of the thigh, decreasing the angle between the thigh and the lower leg. The range of motion for knee flexion typically extends from 0° (leg fully straightened) to about 135° to 150° (leg fully bent)."
  },
  "Left Knee Extension": {
    "name": "Left Knee Extension",
    "mobilityMapper": "leftKnee",
    "bodySideTitle": "Left Knee",
    "movementTitle": "Extension",
    "function": "(positions, sizes) => {\n  const [p0, p1, p2] = positions\n  const p3 = {\n    x: p1.x + (p1.x - p0.x),\n    y: p1.y + (p1.y - p0.y),\n  };\n\n  \n  const vectorAngle = (x, y) => {\n    return Math.acos(\n      x.reduce((acc, n, i) => acc + n * y[i], 0) /\n      (Math.hypot(...x) * Math.hypot(...y))\n    );\n  };\n  \n  \n  const AB = { x: p2.x - p1.x, y: p2.y - p1.y };\n  const BC = { x: p3.x - p1.x, y: p3.y - p1.y };\n\n  let angle =\n    vectorAngle(\n      [AB.x * sizes.width, AB.y * sizes.height],\n      [BC.x * sizes.width, BC.y * sizes.height]\n    ) *\n    (180 / Math.PI);\n\n  return angle\n}",
    "landmarkIndices": [
      {
        "index": 23,
        "name": "Left Hip"
      },
      {
        "index": 25,
        "name": "Left Knee"
      },
      {
        "index": 27,
        "name": "Left Ankle"
      }
    ],
    "description": "Knee extension refers to the straightening movement at the knee joint, where the lower leg moves away from the back of the thigh, increasing the angle between the thigh and lower leg. The range of motion for knee extension typically extends from about 135° (when the knee is fully bent) to 0° (leg fully straightened)."
  },
  "Left Hip Internal Rotation": {
    "name": "Left Hip Internal Rotation",
    "mobilityMapper": "leftHip",
    "bodySideTitle": "Left Hip",
    "movementTitle": "Internal Rotation",
    "function": "(positions, sizes) => {\n  const [p0, p1] = positions\n\n  const p0X = p0.x * sizes.width\n  const p0Y = p0.y * sizes.height\n  const p1X = p1.x * sizes.width\n  const p1Y = p1.y * sizes.height\n\n  const vectorAB = {\n    x: p0X - p1X,\n    y: p0Y - p1Y,\n  }\n  const vectorBC = {\n    x: 0,\n    y: sizes.height - p0Y,\n  }\n\n  const dotProduct = (vec1, vec2) => {\n    return vec1.x * vec2.x + vec1.y * vec2.y\n  }\n\n  const vectorLength = (vec) => {\n    return Math.sqrt(vec.x * vec.x + vec.y * vec.y)\n  }\n\n  const calculateAngleBetweenVectors = (vec1, vec2) => {\n    const dot = dotProduct(vec1, vec2)\n    const length1 = vectorLength(vec1)\n    const length2 = vectorLength(vec2)\n    const cosAngle = dot / (length1 * length2)\n    const angleRad = Math.acos(cosAngle)\n    const angleDeg = (angleRad * 180) / Math.PI\n    return angleDeg\n  }\n\n  const angle = calculateAngleBetweenVectors(vectorAB, vectorBC) - 180\n\n  return Math.abs(angle)\n}",
    "landmarkIndices": [
      {
        "index": 25,
        "name": "Left Knee"
      },
      {
        "index": 27,
        "name": "Left Ankle"
      }
    ],
    "description": "Hip internal rotation refers to the movement of the thigh inward, towards the center of the body, while the hip joint remains stable. The range of motion for hip internal rotation typically extends from 0° (thigh in a neutral position) to about 30° to 45° (thigh rotated inward)."
  },
  "Left Hip External Rotation": {
    "name": "Left Hip External Rotation",
    "mobilityMapper": "leftHip",
    "bodySideTitle": "Left Hip",
    "movementTitle": "External Rotation",
    "function": "(positions, sizes) => {\n  const [p0, p1] = positions\n\n  const p0X = p0.x * sizes.width\n  const p0Y = p0.y * sizes.height\n  const p1X = p1.x * sizes.width\n  const p1Y = p1.y * sizes.height\n\n  const vectorAB = {\n    x: p0X - p1X,\n    y: p0Y - p1Y,\n  }\n  const vectorBC = {\n    x: 0,\n    y: sizes.height - p0Y,\n  }\n\n  const dotProduct = (vec1, vec2) => {\n    return vec1.x * vec2.x + vec1.y * vec2.y\n  }\n\n  const vectorLength = (vec) => {\n    return Math.sqrt(vec.x * vec.x + vec.y * vec.y)\n  }\n\n  const calculateAngleBetweenVectors = (vec1, vec2) => {\n    const dot = dotProduct(vec1, vec2)\n    const length1 = vectorLength(vec1)\n    const length2 = vectorLength(vec2)\n    const cosAngle = dot / (length1 * length2)\n    const angleRad = Math.acos(cosAngle)\n    const angleDeg = (angleRad * 180) / Math.PI\n    return angleDeg\n  }\n\n  const angle = calculateAngleBetweenVectors(vectorAB, vectorBC) - 180\n\n  return Math.abs(angle)\n}",
    "landmarkIndices": [
      {
        "index": 25,
        "name": "Left Knee"
      },
      {
        "index": 27,
        "name": "Left Ankle"
      }
    ],
    "description": "Hip external rotation refers to the movement of the thigh outward, away from the center of the body, while the hip joint remains stable. The range of motion for hip external rotation typically extends from 0° (thigh in a neutral position) to about 45° to 60° (thigh rotated outward)."
  },
  "Right Knee Flexion": {
    "name": "Right Knee Flexion",
    "mobilityMapper": "rightKnee",
    "bodySideTitle": "Right Knee",
    "movementTitle": "Flexion",
    "function": "(positions, sizes) => {\n  const [p0, p1, p2] = positions\n  const p3 = {\n    x: p1.x + (p1.x - p0.x),\n    y: p1.y + (p1.y - p0.y),\n  };\n\n  \n  const vectorAngle = (x, y) => {\n    return Math.acos(\n      x.reduce((acc, n, i) => acc + n * y[i], 0) /\n      (Math.hypot(...x) * Math.hypot(...y))\n    );\n  };\n  \n  \n  const AB = { x: p2.x - p1.x, y: p2.y - p1.y };\n  const BC = { x: p3.x - p1.x, y: p3.y - p1.y };\n\n  let angle =\n    vectorAngle(\n      [AB.x * sizes.width, AB.y * sizes.height],\n      [BC.x * sizes.width, BC.y * sizes.height]\n    ) *\n    (180 / Math.PI);\n\n  return angle\n}",
    "landmarkIndices": [
      {
        "index": 24,
        "name": "Right Hip"
      },
      {
        "index": 26,
        "name": "Right Knee"
      },
      {
        "index": 28,
        "name": "Right Ankle"
      }
    ],
    "description": "Knee flexion refers to the bending movement at the knee joint, where the lower leg moves toward the back of the thigh, decreasing the angle between the thigh and the lower leg. The range of motion for knee flexion typically extends from 0° (leg fully straightened) to about 135° to 150° (leg fully bent)."
  },
  "Right Knee Extension": {
    "name": "Right Knee Extension",
    "mobilityMapper": "rightKnee",
    "bodySideTitle": "Right Knee",
    "movementTitle": "Extension",
    "function": "(positions, sizes) => {\n  const [p0, p1, p2] = positions\n  const p3 = {\n    x: p1.x + (p1.x - p0.x),\n    y: p1.y + (p1.y - p0.y),\n  };\n\n  \n  const vectorAngle = (x, y) => {\n    return Math.acos(\n      x.reduce((acc, n, i) => acc + n * y[i], 0) /\n      (Math.hypot(...x) * Math.hypot(...y))\n    );\n  };\n  \n  \n  const AB = { x: p2.x - p1.x, y: p2.y - p1.y };\n  const BC = { x: p3.x - p1.x, y: p3.y - p1.y };\n\n  let angle =\n    vectorAngle(\n      [AB.x * sizes.width, AB.y * sizes.height],\n      [BC.x * sizes.width, BC.y * sizes.height]\n    ) *\n    (180 / Math.PI);\n\n  return angle\n}",
    "landmarkIndices": [
      {
        "index": 24,
        "name": "Right Hip"
      },
      {
        "index": 26,
        "name": "Right Knee"
      },
      {
        "index": 28,
        "name": "Right Ankle"
      }
    ],
    "description": "Knee extension refers to the straightening movement at the knee joint, where the lower leg moves away from the back of the thigh, increasing the angle between the thigh and lower leg. The range of motion for knee extension typically extends from about 135° (when the knee is fully bent) to 0° (leg fully straightened)."
  },
  "Right Hip Internal Rotation": {
    "name": "Right Hip Internal Rotation",
    "mobilityMapper": "rightHip",
    "bodySideTitle": "Right Hip",
    "movementTitle": "Internal Rotation",
    "function": "(positions, sizes) => {\n  const [p0, p1] = positions\n\n  const p0X = p0.x * sizes.width\n  const p0Y = p0.y * sizes.height\n  const p1X = p1.x * sizes.width\n  const p1Y = p1.y * sizes.height\n\n  const vectorAB = {\n    x: p0X - p1X,\n    y: p0Y - p1Y,\n  }\n  const vectorBC = {\n    x: 0,\n    y: sizes.height - p0Y,\n  }\n\n  const dotProduct = (vec1, vec2) => {\n    return vec1.x * vec2.x + vec1.y * vec2.y\n  }\n\n  const vectorLength = (vec) => {\n    return Math.sqrt(vec.x * vec.x + vec.y * vec.y)\n  }\n\n  const calculateAngleBetweenVectors = (vec1, vec2) => {\n    const dot = dotProduct(vec1, vec2)\n    const length1 = vectorLength(vec1)\n    const length2 = vectorLength(vec2)\n    const cosAngle = dot / (length1 * length2)\n    const angleRad = Math.acos(cosAngle)\n    const angleDeg = (angleRad * 180) / Math.PI\n    return angleDeg\n  }\n\n  const angle = calculateAngleBetweenVectors(vectorAB, vectorBC) - 180\n\n  return Math.abs(angle)\n}",
    "landmarkIndices": [
      {
        "index": 26,
        "name": "Right Knee"
      },
      {
        "index": 28,
        "name": "Right Ankle"
      }
    ],
    "description": "Hip internal rotation refers to the movement of the thigh inward, towards the center of the body, while the hip joint remains stable. The range of motion for hip internal rotation typically extends from 0° (thigh in a neutral position) to about 30° to 45° (thigh rotated inward)."
  },
  "Right Hip External Rotation": {
    "name": "Right Hip External Rotation",
    "mobilityMapper": "rightHip",
    "bodySideTitle": "Right Hip",
    "movementTitle": "External Rotation",
    "function": "(positions, sizes) => {\n  const [p0, p1] = positions\n\n  const p0X = p0.x * sizes.width\n  const p0Y = p0.y * sizes.height\n  const p1X = p1.x * sizes.width\n  const p1Y = p1.y * sizes.height\n\n  const vectorAB = {\n    x: p0X - p1X,\n    y: p0Y - p1Y,\n  }\n  const vectorBC = {\n    x: 0,\n    y: sizes.height - p0Y,\n  }\n\n  const dotProduct = (vec1, vec2) => {\n    return vec1.x * vec2.x + vec1.y * vec2.y\n  }\n\n  const vectorLength = (vec) => {\n    return Math.sqrt(vec.x * vec.x + vec.y * vec.y)\n  }\n\n  const calculateAngleBetweenVectors = (vec1, vec2) => {\n    const dot = dotProduct(vec1, vec2)\n    const length1 = vectorLength(vec1)\n    const length2 = vectorLength(vec2)\n    const cosAngle = dot / (length1 * length2)\n    const angleRad = Math.acos(cosAngle)\n    const angleDeg = (angleRad * 180) / Math.PI\n    return angleDeg\n  }\n\n  const angle = calculateAngleBetweenVectors(vectorAB, vectorBC) - 180\n\n  return Math.abs(angle)\n}",
    "landmarkIndices": [
      {
        "index": 26,
        "name": "Right Knee"
      },
      {
        "index": 28,
        "name": "Right Ankle"
      }
    ],
    "description": "Hip external rotation refers to the movement of the thigh outward, away from the center of the body, while the hip joint remains stable. The range of motion for hip external rotation typically extends from 0° (thigh in a neutral position) to about 45° to 60° (thigh rotated outward)."
  },
  "Right Hip Supine Flexion": {
    "name": "Right Hip Supine Flexion",
    "mobilityMapper": "rightHip",
    "bodySideTitle": "Right Hip",
    "movementTitle": "Supine Flexion",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions\n\n  const a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)\n  const b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)\n  const c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)\n  let angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI)\n\n  return 180 - Math.round(angle * 100) / 100\n}",
    "landmarkIndices": [
      {
        "index": 26,
        "name": "Right Knee"
      },
      {
        "index": 24,
        "name": "Right Hip"
      },
      {
        "index": 12,
        "name": "Right Shoulder"
      }
    ],
    "description": "Hip flexion refers to the movement of bringing the thigh forward and upward towards the torso. The range of motion for hip flexion typically extends from 0° (leg in a neutral, standing position) to about 120° to 130° (thigh raised toward the chest)."
  },
  "Left Hip Supine Flexion": {
    "name": "Left Hip Supine Flexion",
    "mobilityMapper": "leftHip",
    "bodySideTitle": "Left Hip",
    "movementTitle": "Supine Flexion",
    "function": "(positions) => {\n  const [p0, p1, p2] = positions\n\n  const a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)\n  const b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)\n  const c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)\n  let angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b)) * (180 / Math.PI)\n\n  return 180 - Math.round(angle * 100) / 100\n}",
    "landmarkIndices": [
      {
        "index": 25,
        "name": "Left Knee"
      },
      {
        "index": 23,
        "name": "Left Hip"
      },
      {
        "index": 11,
        "name": "Left Shoulder"
      }
    ],
    "description": "Hip flexion refers to the movement of bringing the thigh forward and upward towards the torso. The range of motion for hip flexion typically extends from 0° (leg in a neutral, standing position) to about 120° to 130° (thigh raised toward the chest)."
  }
} as const;

// Exercise names for dropdown/autocomplete (sorted alphabetically)
export const EXERCISE_NAMES = [
  'Left Elbow Flexion',
  'Left Hip External Rotation',
  'Left Hip Internal Rotation',
  'Left Hip Supine Flexion',
  'Left Knee Extension',
  'Left Knee Flexion',
  'Left Shoulder Abduction',
  'Left Shoulder Extension',
  'Left Shoulder External Rotation',
  'Left Shoulder Flexion',
  'Left Shoulder Internal Rotation',
  'Left Wrist Extension',
  'Left Wrist Flexion',
  'Left Wrist Pronation',
  'Left Wrist Radial Deviation',
  'Left Wrist Supination',
  'Left Wrist Ulnar Deviation',
  'Lumbar Extension',
  'Lumbar Flexion',
  'Lumbar Left Lateral Flexion',
  'Lumbar Left Rotation',
  'Lumbar Right Lateral Flexion',
  'Lumbar Right Rotation',
  'Neck Extension',
  'Neck Flexion',
  'Neck Left Lateral Flexion',
  'Neck Left Rotation',
  'Neck Right Lateral Flexion',
  'Neck Right Rotation',
  'Right Elbow Extension',
  'Right Elbow Flexion',
  'Right Hip External Rotation',
  'Right Hip Internal Rotation',
  'Right Hip Supine Flexion',
  'Right Knee Extension',
  'Right Knee Flexion',
  'Right Shoulder Abduction',
  'Right Shoulder Extension',
  'Right Shoulder External Rotation',
  'Right Shoulder Flexion',
  'Right Shoulder Internal Rotation',
  'Right Wrist Extension',
  'Right Wrist Flexion',
  'Right Wrist Pronation',
  'Right Wrist Radial Deviation',
  'Right Wrist Supination',
  'Right Wrist Ulnar Deviation',
  'Squat'
] as const;

// Helper function to get exercise config by name
export const getExerciseConfig = (exerciseName: string): ExerciseConfig | null => {
  return EXERCISE_CONFIGS[exerciseName] || null;
};

// Helper function to get landmark indices for an exercise
export const getExerciseLandmarks = (exerciseName: string): number[] => {
  const config = getExerciseConfig(exerciseName);
  return config?.landmarkIndices.map(l => l.index) || [];
};

// Helper function to get landmark names for an exercise
export const getExerciseLandmarkNames = (exerciseName: string): string[] => {
  const config = getExerciseConfig(exerciseName);
  return config?.landmarkIndices.map(l => l.name) || [];
};
