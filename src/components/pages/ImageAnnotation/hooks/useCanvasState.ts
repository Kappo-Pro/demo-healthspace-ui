import { useState, useCallback } from 'react';
import { CanvasState, HistoryState, Landmark } from '../types';
import { createDefaultLandmarks, calculateNeckPosition, createLandmarksByPose } from '../utils/landmarks';

export function useCanvasState() {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    image: null,
    landmarks: createDefaultLandmarks(),
    annotations: [],
    originalAnnotations: [],
    isEditMode: true,  // Default to edit mode
    selectedTool: 'select',
    currentColor: '#f04438', // --color-error-500
    currentThickness: 2,
    currentFontSize: 24,
    draggedLandmark: null,
    isDragging: false,
    lastMousePos: { x: 0, y: 0 },
    dragMode: 'free',
    keys: {
      shift: false,
      alt: false
    },
    isDrawing: false,
    currentAnnotation: null,
    isCompactMode: false,
    showGrid: false,
    gridSize: 40,
    canvasOrientation: '16:9',
    poseView: 'front',
    angleTool: {
      isActive: false,
      centerX: 400,
      centerY: 300,
      radius: 150,
      phi: 0,
      theta0: 0, // 0° - pointing right
      theta1: Math.PI / 2, // 90° - pointing down
      locked: false,
      mode: 'free',
      visible: true
    },
    deletedAnnotationIds: []
  });

  // Track current canvas dimensions for landmark scaling
  const [currentCanvasDimensions, setCurrentCanvasDimensions] = useState({ width: 800, height: 450 });

  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      landmarks: [...canvasState.landmarks],
      annotations: [...canvasState.annotations]
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    if (newHistory.length > 50) { // Limit history size
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  }, [canvasState.landmarks, canvasState.annotations, history, historyIndex]);

  const updateCanvasState = useCallback((updates: Partial<CanvasState>) => {
    setCanvasState(prev => ({ ...prev, ...updates }));
    
    // Save to history if landmarks or annotations changed
    if (updates.landmarks || updates.annotations) {
      setTimeout(saveToHistory, 100);
    }
  }, [saveToHistory]);

  // Function to update canvas dimensions for landmark scaling
  const updateCanvasDimensions = useCallback((width: number, height: number) => {
    setCurrentCanvasDimensions({ width, height });
  }, []);

  // Function to scale landmarks to fit within canvas bounds
  const scaleLandmarksToCanvas = useCallback((landmarks: Landmark[], canvasWidth: number, canvasHeight: number) => {
    // Default pose dimensions (800x600 for front pose)
    const defaultWidth = 800;
    const defaultHeight = 600;
    
    // Calculate scale factors
    const scaleX = canvasWidth / defaultWidth;
    const scaleY = canvasHeight / defaultHeight;
    
    // Apply scaling to landmarks
    return landmarks.map(landmark => ({
      ...landmark,
      x: Math.max(10, Math.min(canvasWidth - 10, landmark.x * scaleX)),
      y: Math.max(10, Math.min(canvasHeight - 10, landmark.y * scaleY))
    }));
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setCanvasState(prev => ({
        ...prev,
        landmarks: prevState.landmarks,
        annotations: prevState.annotations
      }));
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setCanvasState(prev => ({
        ...prev,
        landmarks: nextState.landmarks,
        annotations: nextState.annotations
      }));
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  const toggleLandmarkVisibility = useCallback((index: number) => {
    const updatedLandmarks = canvasState.landmarks.map(landmark =>
      landmark.index === index 
        ? { ...landmark, visible: !landmark.visible }
        : landmark
    );
    updateCanvasState({ landmarks: updatedLandmarks });
  }, [canvasState.landmarks, updateCanvasState]);

  const toggleGroupVisibility = useCallback((group: string) => {
    const groupLandmarks = canvasState.landmarks.filter(l => l.group === group);
    const allVisible = groupLandmarks.every(l => l.visible);
    
    const updatedLandmarks = canvasState.landmarks.map(landmark =>
      landmark.group === group 
        ? { ...landmark, visible: !allVisible }
        : landmark
    );
    updateCanvasState({ landmarks: updatedLandmarks });
  }, [canvasState.landmarks, updateCanvasState]);

  const loadPresetPosition = useCallback((preset: string) => {
    let targetPoseView: 'front' | 'side-left' | 'side-right' = 'front';
    
    // Map preset values to pose views
    if (preset === 'side-left' || preset === 'facing-left') {
      targetPoseView = 'side-left';
    } else if (preset === 'side-right' || preset === 'facing-right') {
      targetPoseView = 'side-right';
    } else if (preset === 'front' || preset === 'neutral' || preset === 'back-neutral') {
      targetPoseView = 'front';
    }
    // For AI Process and exercise-specific presets, default to front view for now
    // TODO: Implement specific landmark configurations for each exercise
    
    // Create landmarks for the selected pose view
    let landmarks = createLandmarksByPose(targetPoseView);
    
    // Scale landmarks to fit current canvas dimensions
    landmarks = scaleLandmarksToCanvas(landmarks, currentCanvasDimensions.width, currentCanvasDimensions.height);
    
    // Update neck position based on shoulders if image is loaded
    if (canvasState.image) {
      const neckLandmark = landmarks.find(l => l.index === 33);
      if (neckLandmark) {
        const neckPos = calculateNeckPosition(landmarks);
        neckLandmark.x = Math.max(10, Math.min(currentCanvasDimensions.width - 10, neckPos.x));
        neckLandmark.y = Math.max(10, Math.min(currentCanvasDimensions.height - 10, neckPos.y));
        neckLandmark.z = neckPos.z;
      }
    }
    
    updateCanvasState({ 
      landmarks: landmarks,
      poseView: targetPoseView
    });
  }, [canvasState.image, updateCanvasState, scaleLandmarksToCanvas, currentCanvasDimensions]);

  const resetLandmarks = useCallback(() => {
    // Cycle through pose views: front -> side-left -> side-right -> front
    const poseViewOrder: Array<'front' | 'side-left' | 'side-right'> = ['front', 'side-left', 'side-right'];
    const currentIndex = poseViewOrder.indexOf(canvasState.poseView);
    const nextIndex = (currentIndex + 1) % poseViewOrder.length;
    const nextPoseView = poseViewOrder[nextIndex];
    
    loadPresetPosition(nextPoseView);
  }, [canvasState.poseView, loadPresetPosition]);

  const toggleCompactMode = useCallback(() => {
    updateCanvasState({ isCompactMode: !canvasState.isCompactMode });
  }, [canvasState.isCompactMode, updateCanvasState]);

  // AngleTool functions
  const toggleAngleTool = useCallback(() => {
    updateCanvasState({
      angleTool: {
        ...canvasState.angleTool,
        isActive: !canvasState.angleTool.isActive
      }
    });
  }, [canvasState.angleTool, updateCanvasState]);

  const updateAngleToolState = useCallback((updates: Partial<typeof canvasState.angleTool>) => {
    updateCanvasState({
      angleTool: {
        ...canvasState.angleTool,
        ...updates
      }
    });
  }, [canvasState.angleTool, updateCanvasState]);

  const moveAngleTool = useCallback((deltaX: number, deltaY: number) => {
    updateCanvasState({
      angleTool: {
        ...canvasState.angleTool,
        centerX: canvasState.angleTool.centerX + deltaX,
        centerY: canvasState.angleTool.centerY + deltaY
      }
    });
  }, [canvasState.angleTool, updateCanvasState]);

  const updateAngleToolAngles = useCallback((theta0: number, theta1: number) => {
    updateCanvasState({
      angleTool: {
        ...canvasState.angleTool,
        theta0,
        theta1
      }
    });
  }, [canvasState.angleTool, updateCanvasState]);

  const saveAngleAnnotation = useCallback(() => {
    const { angleTool } = canvasState;
    const angleAnnotation = {
      id: `angle-${Date.now()}`,
      type: 'angle' as const,
      centerX: angleTool.centerX,
      centerY: angleTool.centerY,
      radius: angleTool.radius,
      theta0: angleTool.theta0,
      theta1: angleTool.theta1,
      angle: Math.abs(angleTool.theta1 - angleTool.theta0) * (180 / Math.PI),
      units: 'deg' as const,
      points: [
        { x: angleTool.centerX, y: angleTool.centerY }
      ],
      color: '#6941c6', // --brand-primary (purple-700)
      thickness: 2
    };

    updateCanvasState({
      annotations: [...canvasState.annotations, angleAnnotation]
    });

    return angleAnnotation;
  }, [canvasState.angleTool, canvasState.annotations, updateCanvasState]);


  return {
    canvasState,
    setCanvasState,
    updateCanvasState,
    updateCanvasDimensions,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    toggleLandmarkVisibility,
    toggleGroupVisibility,
    resetLandmarks,
    loadPresetPosition,
    toggleCompactMode,
    // AngleTool functions
    toggleAngleTool,
    updateAngleToolState,
    moveAngleTool,
    updateAngleToolAngles,
    saveAngleAnnotation
  };
}