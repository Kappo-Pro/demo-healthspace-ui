export interface Landmark {
  index: number;
  name: string;
  color: string;
  x: number;
  y: number;
  z: number;
  visible: boolean;
  group: string;
}

export interface AnnotationItem {
  id: string;
  type: 'freehand' | 'line' | 'circle' | 'arrow' | 'text' | 'angle' | 'rectangle' | 'square' | 'triangle' | 'oval';
  points: Array<{ x: number; y: number }>;
  color: string;
  thickness: number;
  text?: string;
  fontSize?: number;
  // Angle-specific properties
  angle?: number;
  theta0?: number;
  theta1?: number;
  radius?: number;
  centerX?: number;
  centerY?: number;
  units?: 'deg' | 'rad';
}

export interface CanvasState {
  selectedAnnotationId?: string | null;
  image: HTMLImageElement | null;
  landmarks: Landmark[];
  originalAnnotations: AnnotationItem[];
  annotations: AnnotationItem[];
  isEditMode: boolean;
  selectedTool: string;
  currentColor: string;
  currentThickness: number;
  currentFontSize: number;
  draggedLandmark: number | null;
  isDragging: boolean;
  lastMousePos: { x: number; y: number };
  dragMode: 'free' | 'lock-x' | 'lock-y' | 'z-axis';
  keys: {
    shift: boolean;
    alt: boolean;
  };
  deletedAnnotationIds: string[]
  isDrawing: boolean;
  currentAnnotation: AnnotationItem | null;
  isCompactMode: boolean;
  showGrid: boolean;
  gridSize: number;
  canvasOrientation: '16:9' | '9:16';
  poseView: 'front' | 'side-left' | 'side-right';
  // AngleTool state
  angleTool: {
    isActive: boolean;
    centerX: number;
    centerY: number;
    radius: number;
    phi: number;
    theta0: number;
    theta1: number;
    locked: boolean;
    mode: 'free' | 'lock' | 'resize' | 'rotate';
    visible: boolean;
  };
}

export interface HistoryState {
  landmarks: Landmark[];
  annotations: AnnotationItem[];
}
