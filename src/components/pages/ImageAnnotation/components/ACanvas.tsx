import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AnnotationItem } from '../types';
import { drawAnnotations, drawAiLandmarks, drawConnections } from '../utils/canvas';
import { connections, USER_ROLES } from '@stores/constants';
import { ACanvasProps, Annotation } from '@stores/interfaces';
import { useTypedSelector } from '@stores/index';

const ACanvas: React.FC<ACanvasProps> = ({
  canvasState,
  setHoveredLandmark,
  canvasRef,
  imageLayerCanvasRef,
  aiLandMarks,
  hoveredLandmark,
  onStateChange,
  onMouseMove,
  onDimensionsChange,
  onCanvasClick,
  zoom: externalZoom,
  pan: externalPan,
  onZoomChange,
  onPanChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<number | null>(null);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [draggedAnnotationId, setDraggedAnnotationId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number; } | null>(null);
  const [dragMode, setDragMode] = useState<'free' | 'lock-x' | 'lock-y' | 'z-axis'>('free');
  const [initialZ, setInitialZ] = useState<number>(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const [resizeHandleIndex, setResizeHandleIndex] = useState<number | null>(
    null,
  );
  const user = useTypedSelector((state) => state.user)
  const isUser = user?.profile?.role === USER_ROLES.USER;
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 800,
    height: 450,
  });
  const [previousDimensions, setPreviousDimensions] = useState({
    width: 800,
    height: 450,
  });
  const [internalZoom, setInternalZoom] = useState(1);
  const [internalPan, setInternalPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const zoom = externalZoom !== undefined ? externalZoom : internalZoom;
  const pan = externalPan !== undefined ? externalPan : internalPan;
  const setZoom = onZoomChange || setInternalZoom;
  const setPan = onPanChange || setInternalPan;

  useEffect(() => {
    if (canvasState.selectedTool !== 'select') setSelectedLandmark(null);
  }, [canvasState.selectedTool]);

  useEffect(() => {
    if (!canvasState.image) return;

    const imgWidth = canvasState.image.naturalWidth;
    const imgHeight = canvasState.image.naturalHeight;

    const orientation = imgWidth > imgHeight ? '16:9' : '9:16';

    onStateChange({ canvasOrientation: orientation });
  }, []);

  const calculateCanvasDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const { clientWidth, clientHeight } = containerRef.current;

    let aspectRatio = canvasState.canvasOrientation === '16:9' ? 16 / 9 : 9 / 16;
    if (canvasState.image) {
      aspectRatio = canvasState.image.naturalWidth / canvasState.image.naturalHeight;
    }

    const availableWidth = clientWidth;
    const availableHeight = clientHeight;

    let width, height;

    const heightBasedWidth = availableHeight * aspectRatio;
    const widthBasedHeight = availableWidth / aspectRatio;

    if (heightBasedWidth <= availableWidth) {
      height = availableHeight;
      width = heightBasedWidth;
    } else {
      width = availableWidth;
      height = widthBasedHeight;
    }

    const newDimensions = { width: Math.floor(width), height: Math.floor(height) };

    setPreviousDimensions(newDimensions);
    setCanvasDimensions(newDimensions);
    onDimensionsChange(newDimensions.width, newDimensions.height);
  }, [
    canvasState.canvasOrientation,
    canvasState.image,
    canvasState.annotations,
    previousDimensions,
    onStateChange,
    onDimensionsChange,
  ]);


  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!canvasState.showGrid) return;

      ctx.save();
      ctx.strokeStyle = 'var(--color-gray-alpha-50)';
      ctx.lineWidth = 2;

      for (let x = 0; x <= width; x += canvasState.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += canvasState.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();
    },
    [canvasState.showGrid, canvasState.gridSize],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image first
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }

    drawGrid(ctx, canvas.width, canvas.height);

    drawAnnotations(
      ctx,
      canvasState.annotations,
      canvasState.selectedAnnotationId!,
    );

    const selectedAnn = canvasState.annotations.find(
      a => a.id === canvasState.selectedAnnotationId,
    );
    if (selectedAnn && selectedAnn.type !== 'freehand') {
      drawResizeHandles(ctx, selectedAnn.points);
    }

    if (canvasState.currentAnnotation) {
      drawAnnotations(
        ctx,
        [canvasState.currentAnnotation],
        canvasState.selectedAnnotationId!,
      );
    }

    drawConnections(ctx, aiLandMarks, connections);
    drawAiLandmarks(ctx, aiLandMarks, selectedLandmark ?? undefined);

    if (
      canvasState.isDragging &&
      dragStartPos &&
      canvasState.draggedLandmark !== null
    ) {
      const draggedLandmark = canvasState.landmarks.find(
        l => l.index === canvasState.draggedLandmark,
      );
      if (!draggedLandmark) return;

      ctx.setLineDash(dragMode === 'z-axis' ? [] : [5, 5]);
      ctx.strokeStyle =
        dragMode === 'z-axis'
          ? 'var(--color-purple-alpha-70)'
          : 'var(--color-blue-alpha-50)';
      ctx.lineWidth = dragMode === 'z-axis' ? 2 : 1;

      if (dragMode === 'z-axis') {
        ctx.beginPath();
        ctx.moveTo(draggedLandmark.x, draggedLandmark.y - 30);
        ctx.lineTo(draggedLandmark.x, draggedLandmark.y + 30);
        ctx.stroke();
        ctx.fillStyle = 'var(--color-purple-alpha-90)';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(
          `Z: ${draggedLandmark.z.toFixed(1)}`,
          draggedLandmark.x,
          draggedLandmark.y - 35,
        );
      } else {
        if (dragMode === 'free' || dragMode === 'lock-x') {
          ctx.beginPath();
          ctx.moveTo(0, draggedLandmark.y);
          ctx.lineTo(canvas.width, draggedLandmark.y);
          ctx.stroke();
        }
        if (dragMode === 'free' || dragMode === 'lock-y') {
          ctx.beginPath();
          ctx.moveTo(draggedLandmark.x, 0);
          ctx.lineTo(draggedLandmark.x, canvas.height);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }
  }, [canvasState, drawGrid, dragMode]);

  // Update imageRef when image changes
  useEffect(() => {
    if (canvasState.image) {
      imageRef.current = canvasState.image;
    }
  }, [canvasState.image]);

  useEffect(() => {
    onPoseResults();
    if (
      containerRef.current &&
      previousDimensions.width === 800 &&
      previousDimensions.height === 450
    ) {
      calculateCanvasDimensions();
    }
  }, [calculateCanvasDimensions, previousDimensions]);

  useEffect(() => {
    calculateCanvasDimensions();

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        calculateCanvasDimensions();
        draw();
      }, 100);
    };

    // Watch for window resize
    window.addEventListener('resize', handleResize);

    // Watch for container resize using ResizeObserver
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver && containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
        resizeObserver.disconnect();
      }
      clearTimeout(resizeTimeout);
    };
  }, [calculateCanvasDimensions, draw]);

  useEffect(
    () => draw(),
    [canvasState, hoveredLandmark, dragMode, canvasDimensions, draw],
  );

  useEffect(() => canvasRef.current?.focus(), []);

  useEffect(() => {
    if (canvasState.selectedTool === 'text') {
      const centerX = Math.floor(canvasDimensions.width / 2);
      const centerY = Math.floor(canvasDimensions.height / 2);
      onCanvasClick?.(centerX, centerY);
    }
  }, [canvasState.selectedTool]);

  const drawResizeHandles = (
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[] | undefined,
  ) => {
    const isText =
      canvasState?.annotations.find(
        an => an.id === canvasState.selectedAnnotationId,
      )?.type === 'text';

    if (!points || isText) return;
    const handleSize = 8;
    ctx.fillStyle = 'var(--color-blue-6)';

    points.forEach(p =>
      ctx.fillRect(
        p.x - handleSize / 2,
        p.y - handleSize / 2,
        handleSize,
        handleSize,
      ),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const { selectedAnnotationId, annotations, deletedAnnotationIds, landmarks, isDragging, draggedLandmark } = canvasState;

    if (['Delete', 'Backspace'].includes(e.key)) {
      if (selectedAnnotationId) {
        onStateChange({
          annotations: annotations.filter(a => a.id !== selectedAnnotationId),
          selectedAnnotationId: null,
          deletedAnnotationIds: [...(deletedAnnotationIds || []), selectedAnnotationId],
        });
      }
    }

    if (isDragging && draggedLandmark !== null) {
      const { altKey, shiftKey } = e;
      if (altKey && !shiftKey) {
        if (dragMode !== 'z-axis') {
          const lm = landmarks.find(l => l.index === draggedLandmark);
          lm && setInitialZ(lm.z);
        }
        setDragMode('z-axis');
      } else if (shiftKey && altKey) setDragMode('lock-y');
      else if (shiftKey) setDragMode('lock-x');
      else setDragMode('free');
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (canvasState.isDragging && canvasState.draggedLandmark !== null) {
      const { altKey, shiftKey } = e;
      if (!altKey && !shiftKey) setDragMode('free');
      else if (altKey && !shiftKey) setDragMode('z-axis');
      else if (shiftKey && !altKey) setDragMode('lock-x');
    }
  };

  const getTransformedCoordinates = useCallback((canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();

    // Get mouse position relative to the canvas bounding box
    let mouseX = clientX - rect.left;
    let mouseY = clientY - rect.top;

    // Find the center point of the bounding rect
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Reverse the pan (the pan happens after centering but before scaling)
    mouseX = mouseX - centerX - pan.x;
    mouseY = mouseY - centerY - pan.y;

    // Reverse the zoom by dividing by the scale factor
    mouseX = mouseX / zoom;
    mouseY = mouseY / zoom;

    // Add back the center to get position relative to top-left of unscaled canvas
    mouseX = mouseX + canvasDimensions.width / 2;
    mouseY = mouseY + canvasDimensions.height / 2;

    // Convert from canvas display coordinates to internal canvas coordinates
    const x = (mouseX / canvasDimensions.width) * canvas.width;
    const y = (mouseY / canvasDimensions.height) * canvas.height;

    return { x, y };
  }, [zoom, pan, canvasDimensions]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    // Calculate zoom change
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.5), 5);

    setZoom(newZoom);
  }, [zoom]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if Ctrl/Cmd key is pressed for panning
    if (e.buttons === 1 && (e.ctrlKey || e.metaKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const { x, y } = getTransformedCoordinates(canvas, e.clientX, e.clientY);
    const { selectedAnnotationId, annotations, selectedTool, landmarks, currentColor, currentThickness } = canvasState;

    // Scale landmarks from normalized (0-1) to pixel coordinates for click detection
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Find clicked landmark and its index in one pass
    let clickedLmIndex = -1;
    let clickedDistance = Infinity;

    landmarks.forEach((l, idx) => {
      if (!l.visible) return;

      // Convert normalized landmark coordinates to pixel coordinates
      const landmarkPixelX = l.x * canvasWidth;
      const landmarkPixelY = l.y * canvasHeight;

      // Check distance in pixel space
      const distance = Math.sqrt(
        Math.pow(x - landmarkPixelX, 2) + Math.pow(y - landmarkPixelY, 2)
      );

      // Find closest landmark within threshold
      if (distance <= 30 && distance < clickedDistance) {
        clickedDistance = distance;
        clickedLmIndex = idx;
      }
    });

    const clickedLm = clickedLmIndex >= 0 ? landmarks[clickedLmIndex] : null;

    if (selectedTool === 'select' && clickedLm && clickedLmIndex >= 0) {
      let mode: 'free' | 'lock-x' | 'lock-y' | 'z-axis' = 'free';
      if (e.shiftKey && e.altKey) mode = 'lock-y';
      else if (e.altKey) (mode = 'z-axis', setInitialZ(clickedLm.z || 0));
      else if (e.shiftKey) mode = 'lock-x';

      setDragMode(mode);
      setDragStartPos({ x, y });
      setSelectedLandmark(clickedLmIndex);
      onStateChange({
        draggedLandmark: clickedLmIndex,
        isDragging: true,
        lastMousePos: { x, y },
        selectedAnnotationId: null // Clear any selected annotation
      });
      return; // Exit early to prevent annotation selection
    }

    // PRIORITY 2: Handle annotation resize handles
    if (selectedAnnotationId) {
      const ann = annotations.find(a => a.id === selectedAnnotationId);
      const handleIdx = ann?.points.findIndex(p => Math.abs(p.x - x) < 6 && Math.abs(p.y - y) < 6);
      if (ann && handleIdx !== -1) {
        setResizeHandleIndex(handleIdx!);
        setDraggedAnnotationId(ann.id);
        return;
      }
    }

    // PRIORITY 3: Handle annotation selection
    if (selectedTool === 'select') {
      const margin = 5;
      const clickedAnnotation = annotations.find(a => {
        const pts = a.points;
        if (!pts.length) return false;

        if (a.type === 'freehand')
          return pts.some(p => x >= p.x - margin && x <= p.x + margin && y >= p.y - margin && y <= p.y + margin);

        if (a.type === 'text') {
          const p = pts[0],
            w = a.width || a.text.length * 10,
            h = a.height || a.fontSize || 20;
          return x >= p.x - margin && x <= p.x + w + margin && y >= p.y - h - margin && y <= p.y + margin;
        }

        if (pts.length === 1) {
          const p = pts[0];
          return x >= p.x - margin && x <= p.x + margin && y >= p.y - margin && y <= p.y + margin;
        }

        if (pts.length >= 2) {
          const [s, e] = pts;
          if (a.type === 'circle') {
            const cx = (s.x + e.x) / 2,
              cy = (s.y + e.y) / 2,
              r = Math.hypot(e.x - s.x, e.y - s.y),
              dist = Math.hypot(x - cx, y - cy);
            return dist <= r + margin;
          }
          return x >= Math.min(s.x, e.x) - margin && x <= Math.max(s.x, e.x) + margin &&
            y >= Math.min(s.y, e.y) - margin && y <= Math.max(s.y, e.y) + margin;
        }
        return false;
      });

      if (clickedAnnotation?.id) {
        onStateChange({ selectedAnnotationId: clickedAnnotation.id });
        const ref = clickedAnnotation.points[0];
        setDraggedAnnotationId(clickedAnnotation.id);
        setDragOffset({ x: x - ref.x, y: y - ref.y });
      } else onStateChange({ selectedAnnotationId: null });
    }

    // PRIORITY 4: Handle drawing tools
    if (selectedTool !== 'select') {
      onStateChange({
        isDrawing: true,
        currentAnnotation: {
          id: `annotation-${Date.now()}`,
          type: selectedTool as AnnotationItem['type'],
          points: [{ x, y }],
          color: currentColor,
          thickness: currentThickness,
        },
      });
    }
  };


  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle panning
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    const { x, y } = getTransformedCoordinates(canvas, e.clientX, e.clientY);
    onMouseMove({ x, y });

    if (resizeHandleIndex !== null && draggedAnnotationId) {
      onStateChange({
        annotations: canvasState.annotations.map(a =>
          a.id === draggedAnnotationId
            ? { ...a, points: a.points.map((p, i) => (i === resizeHandleIndex ? { x, y } : p)) }
            : a
        ),
      });
      return;
    }

    // Update hover detection to use same normalized coordinate logic
    if (canvasState.isEditMode && canvasState.selectedTool === 'select' && !canvasState.isDragging) {
      const hoveredIndex = canvasState.landmarks.findIndex(l => {
        if (!l.visible) return false;
        const landmarkPixelX = l.x * canvas.width;
        const landmarkPixelY = l.y * canvas.height;
        const distance = Math.sqrt(
          Math.pow(x - landmarkPixelX, 2) + Math.pow(y - landmarkPixelY, 2)
        );
        return distance <= 30;
      });
      setHoveredLandmark(hoveredIndex >= 0 ? hoveredIndex : null);
    } else if (!canvasState.isDragging) {
      setHoveredLandmark(null);
    }

    if (canvasState.isDragging && canvasState.draggedLandmark !== null && dragStartPos) {
      const l = canvasState.landmarks[canvasState.draggedLandmark];
      if (!l) return;

      // Convert pixel coordinates back to normalized coordinates (0-1 range)
      const normalizedX = x / canvas.width;
      const normalizedY = y / canvas.height;

      const deltaY = y - dragStartPos.y,
        z = Math.max(-100, Math.min(100, initialZ - deltaY * 0.5));
      const [newX, newY, newZ] =
        dragMode === 'z-axis'
          ? [l.x, l.y, z]
          : dragMode === 'lock-x'
            ? [normalizedX, l.y, l.z || 0]
            : dragMode === 'lock-y'
              ? [l.x, normalizedY, l.z || 0]
              : [normalizedX, normalizedY, l.z || 0];
      onStateChange({
        landmarks: canvasState.landmarks.map((m, idx) =>
          idx === canvasState.draggedLandmark ? { ...m, x: newX, y: newY, z: newZ } : m
        ),
        lastMousePos: { x, y },
      });
      return;
    }

    if (draggedAnnotationId && dragOffset)
      onStateChange({
        annotations: canvasState.annotations.map(a => {
          if (a.id !== draggedAnnotationId) return a;
          const dx = x - dragOffset.x,
            dy = y - dragOffset.y,
            ref = a.points[0];
          return {
            ...a,
            points: a.points.map(p => ({ x: dx + (p.x - ref.x), y: dy + (p.y - ref.y) })),
          };
        }),
      });

    if (canvasState.isDrawing && canvasState.currentAnnotation)
      onStateChange({
        currentAnnotation: {
          ...canvasState.currentAnnotation,
          points:
            canvasState.selectedTool === 'freehand'
              ? [...canvasState.currentAnnotation.points, { x, y }]
              : [
                canvasState.currentAnnotation.points[0],
                { x, y },
              ],
        },
      });
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (draggedAnnotationId) {
      setDraggedAnnotationId(null);
      setDragOffset(null);
    }
    if (resizeHandleIndex !== null) {
      setResizeHandleIndex(null);
      setDraggedAnnotationId(null);
    }
    if (canvasState.isDragging) {
      // Reset all drag-related states immediately
      onStateChange({ isDragging: false, draggedLandmark: null });
      setDragStartPos(null);
      setDragMode('free');
      setInitialZ(0);
    } else if (canvasState.isDrawing && canvasState.currentAnnotation) {
      onStateChange({
        annotations: [...canvasState.annotations, canvasState.currentAnnotation],
        isDrawing: false,
        currentAnnotation: null,
      });
    }
  };

  const onPoseResults = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !aiLandMarks) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    drawConnections(ctx, aiLandMarks, connections);
    drawAiLandmarks(ctx, aiLandMarks, selectedLandmark ?? undefined);
    setCurrentAnnotation({
      id: Date.now().toString(),
      landmarks: aiLandMarks,
      timestamp: Date.now(),
      imageName: 'unknown',
    });
  }, [selectedLandmark, aiLandMarks]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !currentAnnotation) return;
    const rect = canvasRef.current.getBoundingClientRect(),
      x = (e.clientX - rect.left) / canvasRef.current.width,
      y = (e.clientY - rect.top) / canvasRef.current.height;
    let closest = -1,
      dist = Infinity;
    currentAnnotation.landmarks.forEach((l, i) => {
      if (l.visible) {
        const d = Math.hypot(l.x - x, l.y - y);
        if (d < dist && d < 0.05) (dist = d), (closest = i);
      }
    });
    setSelectedLandmark(closest !== -1 ? closest : null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || selectedLandmark === null || !currentAnnotation) return;
    const rect = canvasRef.current!.getBoundingClientRect(),
      x = (e.clientX - rect.left) / canvasRef.current!.width,
      y = (e.clientY - rect.top) / canvasRef.current!.height;
    setCurrentAnnotation({
      ...currentAnnotation,
      landmarks: currentAnnotation.landmarks.map((l, i) =>
        i === selectedLandmark ? { ...l, x, y } : l
      ),
    });
    redrawCanvas();
    onStateChange({
      landmarks: canvasState.landmarks.map((l, i) =>
        i === selectedLandmark ? { ...l, x, y } : l
      ),
    });
  };

  const redrawCanvas = () => {
    if (!canvasRef.current || !imageRef.current || !currentAnnotation) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    drawConnections(ctx, currentAnnotation.landmarks, connections);
    drawAiLandmarks(ctx, currentAnnotation.landmarks, selectedLandmark ?? undefined);
  };

  useEffect(() => {
    const ctx = imageLayerCanvasRef.current?.getContext('2d');
    if (ctx && canvasState.image) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(canvasState.image, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }, [canvasState.image, canvasDimensions]);

  return (
    <div className="poc-annotation-canvas-container" ref={containerRef}>
      <div className="canvas-zoom-container">
        <div
          ref={canvasWrapperRef}
          className="canvas-wrapper canvas-wrapper-zoom"
          style={{
            width: canvasDimensions.width,
            height: canvasDimensions.height,
            transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}>
        <canvas
          ref={imageLayerCanvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
            height: '100%',
          }}
        />

        <canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          onClick={e => {
            if (isUser) return;
            handleCanvasClick(e);
          }}
          onMouseDown={e => {
            // Allow panning for all users
            if (e.buttons === 1 && (e.ctrlKey || e.metaKey)) {
              setIsPanning(true);
              setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
              return;
            }
            if (isUser) return;
            setIsDragging(true);
            handleMouseDown(e);
          }}
          onMouseMove={e => {
            // Allow panning for all users
            if (isPanning) {
              setPan({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y
              });
              return;
            }
            if (isUser) return;
            handleMouseMove(e);
            handleCanvasMouseMove(e);
          }}
          onMouseUp={() => {
            // Allow panning for all users
            if (isPanning) {
              setIsPanning(false);
              return;
            }
            if (isUser) return;
            setIsDragging(false);
            handleMouseUp();
          }}
          onMouseLeave={() => {
            // Allow panning for all users
            if (isPanning) {
              setIsPanning(false);
              return;
            }
            if (isUser) return;
            setIsDragging(false);
            handleMouseUp();
          }}
          onWheel={e => {
            handleWheel(e);
          }}
          onKeyDown={e => {
            if (isUser) return;
            handleKeyDown(e);
          }}
          onKeyUp={e => {
            if (isUser) return;
            handleKeyUp(e);
          }}
          tabIndex={0}
          className="annotation-canvas"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            cursor: isPanning
              ? 'grabbing'
              : isUser
                ? 'default'
                : canvasState.selectedTool === 'select'
                  ? 'move'
                  : 'crosshair',
            outline: 'none',
            height: '100%',
          }}
        />
        </div>
      </div>
    </div>
  );
};

export default ACanvas;