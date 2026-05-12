import { Landmark, AnnotationItem } from '../types';
import { LANDMARK_CONNECTIONS } from './landmarks';

/**
 * Resolve CSS custom property value from design system
 * For canvas rendering which requires actual color values
 */
const getCSSVar = (varName: string, fallback: string): string => {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
};

// Design system color references for canvas
// Note: Canvas API requires actual color values, not CSS variables
// These hex values are fallbacks that match the design tokens
const CANVAS_COLORS = {
  white: getCSSVar('--color-white', '#ffffff'), // design-token-fallback
  primary: getCSSVar('--brand-primary', '#6941c6'), // design-token-fallback
  success: getCSSVar('--color-success-500', '#12b76a'), // design-token-fallback
  error: getCSSVar('--color-error-500', '#f04438'), // design-token-fallback
  textSecondary: getCSSVar('--text-secondary', '#374151'), // design-token-fallback
  info: getCSSVar('--color-info-500', '#1890ff'), // design-token-fallback
};

/**
 * Convert hex color to rgba with opacity
 */
const hexToRgbaFromToken = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const drawConnections = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  connections: [number, number][]
) => {
  ctx.strokeStyle = CANVAS_COLORS.white;
  ctx.lineWidth = 4;

  connections.forEach(([start, end]) => {
    const startLandmark = landmarks[start];
    const endLandmark = landmarks[end];

    if (
      !startLandmark ||
      !endLandmark ||
      startLandmark.visible === false ||
      endLandmark.visible === false
    ) {
      return;
    }

    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(startLandmark.x * ctx.canvas.width, startLandmark.y * ctx.canvas.height);
    ctx.lineTo(endLandmark.x * ctx.canvas.width, endLandmark.y * ctx.canvas.height);
    ctx.stroke();
  });
};

export const drawAiLandmarks = (
  ctx: CanvasRenderingContext2D,
	landmarks: {x: number, y:number, visible: boolean}[],
  selectedLandmark?: number
) => {
  if (!Array.isArray(landmarks) || landmarks.length === 0) return;
  const headIndices = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const leftIndices = new Set([11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31]);
  const rightIndices = new Set([12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32]);
  landmarks.forEach((landmark, index) => {
    if (headIndices.has(index)) return;

    if (landmark.visible === false) return;

    const x = landmark.x * ctx.canvas.width;
    const y = landmark.y * ctx.canvas.height;

    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    if (index === selectedLandmark) {
    ctx.fillStyle = "#00f000";
    } else if (leftIndices.has(index)) {
      ctx.fillStyle = "#6941c6";
    } else if (rightIndices.has(index)) {
      ctx.fillStyle = "#F59712";
    } else {
      ctx.fillStyle = "#808080";
    }
    ctx.fill();
  });
};


 export function drawLandmarks(
		ctx: CanvasRenderingContext2D,
		landmarks: Landmark[],
		isEditMode: boolean,
		draggedLandmark: number | null,
  hoveredLandmark: number | null = null
 ): void {
		// Draw connections first (behind landmarks)
		if (landmarks.length > 0) {
			ctx.strokeStyle = '#E5E7EB';
			ctx.lineWidth = 2;
			ctx.setLineDash([5, 5]);

			LANDMARK_CONNECTIONS.forEach(([index1, index2]) => {
				const landmark1 = landmarks.find(l => l.index === index1 && l.visible);
				const landmark2 = landmarks.find(l => l.index === index2 && l.visible);

				if (landmark1 && landmark2) {
					ctx.beginPath();
					ctx.moveTo(landmark1.x, landmark1.y);
					ctx.lineTo(landmark2.x, landmark2.y);
					ctx.stroke();
				}
			});

			// Draw center line from neck through torso
			const neck = landmarks.find(l => l.index === 33 && l.visible);
			const leftShoulder = landmarks.find(l => l.index === 11 && l.visible);
			const rightShoulder = landmarks.find(l => l.index === 12 && l.visible);
			const leftHip = landmarks.find(l => l.index === 23 && l.visible);
			const rightHip = landmarks.find(l => l.index === 24 && l.visible);

			if (neck && leftShoulder && rightShoulder && leftHip && rightHip) {
				// Calculate midpoints
				const shoulderMidpoint = {
					x: (leftShoulder.x + rightShoulder.x) / 2,
					y: (leftShoulder.y + rightShoulder.y) / 2,
        z: (leftShoulder.z + rightShoulder.z) / 2
				};

				const hipMidpoint = {
					x: (leftHip.x + rightHip.x) / 2,
					y: (leftHip.y + rightHip.y) / 2,
        z: (leftHip.z + rightHip.z) / 2
				};

				// Draw line from neck through shoulder midpoint to hip midpoint
				ctx.beginPath();
				ctx.moveTo(neck.x, neck.y);
				ctx.lineTo(shoulderMidpoint.x, shoulderMidpoint.y);
				ctx.lineTo(hipMidpoint.x, hipMidpoint.y);
				ctx.stroke();

				// Draw non-draggable dots at midpoints
				ctx.setLineDash([]);

				// Shoulder midpoint dot
				ctx.beginPath();
				ctx.arc(shoulderMidpoint.x, shoulderMidpoint.y, 4, 0, 2 * Math.PI);
				ctx.fillStyle = '#9CA3AF';
				ctx.fill();
				ctx.strokeStyle = 'white';
				ctx.lineWidth = 1.5;
				ctx.stroke();

				// Hip midpoint dot
				ctx.beginPath();
				ctx.arc(hipMidpoint.x, hipMidpoint.y, 4, 0, 2 * Math.PI);
				ctx.fillStyle = '#9CA3AF';
				ctx.fill();
				ctx.strokeStyle = 'white';
				ctx.lineWidth = 1.5;
				ctx.stroke();

				ctx.setLineDash([5, 5]);
			}

			ctx.setLineDash([]);
		}

		// Sort landmarks by z-coordinate for proper depth rendering
		const sortedLandmarks = [...landmarks].sort((a, b) => b.z - a.z);

		// Draw landmarks
		sortedLandmarks.forEach(landmark => {
			if (!landmark.visible) return;

			const isDragged = draggedLandmark === landmark.index;
			const isHovered = hoveredLandmark === landmark.index;

			// Calculate size based on z-coordinate (depth)
			const depthScale = Math.max(0.5, 1 + landmark.z / 100);
			const baseRadius = 6;
			let radius = baseRadius * depthScale;

			// Increase size for dragged or hovered landmarks
			if (isDragged) {
				radius *= 1.3;
			} else if (isHovered) {
				radius *= 1.2;
			}

			const strokeWidth = isDragged ? 3 : isHovered ? 2.5 : 2;

			// Calculate opacity based on depth (further = more transparent)
			const opacity = Math.max(0.3, 1 - Math.abs(landmark.z) / 200);

			// Add shadow effect for depth (only when not dragging for performance)
			if (landmark.z > 0 && !isDragged) {
				ctx.beginPath();
				ctx.arc(landmark.x + 2, landmark.y + 2, radius, 0, 2 * Math.PI);
				ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * opacity})`;
				ctx.fill();
			}

			// Special highlight for hovered landmark (Z-axis control ready) - simplified
			if (isHovered && isEditMode) {
				ctx.beginPath();
				ctx.arc(landmark.x, landmark.y, radius + 4, 0, 2 * Math.PI);
				ctx.strokeStyle = hexToRgbaFromToken(CANVAS_COLORS.primary, 0.6);
				ctx.lineWidth = 2;
				ctx.stroke();
			}

			// Landmark circle
			ctx.beginPath();
			ctx.arc(landmark.x, landmark.y, radius, 0, 2 * Math.PI);

			// Apply opacity to the landmark color
			const color = hexToRgba(landmark.color, opacity);
			ctx.fillStyle = color;
			ctx.fill();

			ctx.strokeStyle = hexToRgbaFromToken(CANVAS_COLORS.white, opacity);
			ctx.lineWidth = strokeWidth;
			ctx.stroke();

			// Add depth indicator ring for landmarks with significant z-values (only when not dragging)
			if (Math.abs(landmark.z) > 20 && !isDragged) {
				ctx.beginPath();
				ctx.arc(landmark.x, landmark.y, radius + 3, 0, 2 * Math.PI);
      ctx.strokeStyle = landmark.z > 0
        ? hexToRgbaFromToken(CANVAS_COLORS.success, 0.5)
        : hexToRgbaFromToken(CANVAS_COLORS.error, 0.5);
				ctx.lineWidth = 1;
				ctx.stroke();
			}

			// Landmark labels only for hovered/dragged landmarks for performance
			if (isEditMode && (isHovered || isDragged)) {
				ctx.fillStyle = hexToRgbaFromToken(CANVAS_COLORS.textSecondary, opacity);
				ctx.font = '12px system-ui';
				ctx.textAlign = 'center';
      ctx.fillText(landmark.index.toString(), landmark.x, landmark.y - radius - 5);

				// Show z-coordinate with enhanced visibility
				ctx.font = '11px system-ui';
				ctx.fillStyle = hexToRgbaFromToken(CANVAS_COLORS.info, opacity);
      ctx.fillText(`z:${landmark.z.toFixed(1)}`, landmark.x, landmark.y + radius + 15);
			}
		});
 }

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function drawAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: AnnotationItem[],
  selectedId: string
): void {
  annotations.forEach(annotation => {
    ctx.setLineDash([]); // 🔧 Ensure no dashed lines
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    if (annotation.id === selectedId) {
      ctx.shadowColor = 'rgba(255, 255, 0, 0.9)';
      ctx.shadowBlur = 10;
    }

    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = annotation.thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (annotation.type) {
  case 'freehand':
    if (annotation.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
      annotation.points.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
    break;

  case 'line':
    if (annotation.points.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
      ctx.lineTo(annotation.points[1].x, annotation.points[1].y);
      ctx.stroke();
    }
    break;

  case 'circle':
    if (annotation.points.length >= 2) {
      const radius = Math.sqrt(
        Math.pow(annotation.points[1].x - annotation.points[0].x, 2) +
        Math.pow(annotation.points[1].y - annotation.points[0].y, 2)
      );
      ctx.beginPath();
      ctx.arc(annotation.points[0].x, annotation.points[0].y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
    break;

  case 'rectangle':
    if (annotation.points.length >= 2) {
      const start = annotation.points[0];
      const end = annotation.points[1];
      const width = end.x - start.x;
      const height = end.y - start.y;
      ctx.strokeRect(start.x, start.y, width, height);
    }
    break;

  case 'square':
    if (annotation.points.length >= 2) {
      const start = annotation.points[0];
      const end = annotation.points[1];
      const size = Math.min(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
      const width = size * Math.sign(end.x - start.x);
      const height = size * Math.sign(end.y - start.y);
      ctx.strokeRect(start.x, start.y, width, height);
    }
    break;

  case 'oval':
    if (annotation.points.length >= 2) {
      const start = annotation.points[0];
      const end = annotation.points[1];
      const centerX = (start.x + end.x) / 2;
      const centerY = (start.y + end.y) / 2;
      const radiusX = Math.abs(end.x - start.x) / 2;
      const radiusY = Math.abs(end.y - start.y) / 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
    break;

  case 'triangle':
    if (annotation.points.length >= 2) {
      const start = annotation.points[0];
      const end = annotation.points[1];
      const top = { x: (start.x + end.x) / 2, y: start.y };
      const left = { x: start.x, y: end.y };
      const right = { x: end.x, y: end.y };

      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(left.x, left.y);
      ctx.lineTo(right.x, right.y);
      ctx.closePath();
      ctx.stroke();
    }
    break;

  case 'arrow':
    if (annotation.points.length >= 2) {
      const start = annotation.points[0];
      const end = annotation.points[1];
      drawArrow(ctx, start.x, start.y, end.x, end.y); // you already have this helper
    }
    break;

  case 'text':
  if (annotation.points.length > 0 && annotation.text) {
    ctx.fillStyle = annotation.color;
    ctx.font = `${annotation.fontSize || 16}px system-ui`;
    ctx.textAlign = 'left';

    if (annotation.id === selectedId) {
      ctx.shadowColor = 'rgba(255, 255, 0, 0.9)';
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    const lines = annotation.text.split('\n');
    const lineHeight = (annotation.fontSize || 16) + 4;

    lines.forEach((line, i) => {
      ctx.fillText(
        line,
        annotation.points[0].x,
        annotation.points[0].y + i * lineHeight
      );
    });
  }
  break;
}

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  });
}



function drawArrow(
  ctx: CanvasRenderingContext2D, 
  fromX: number, 
  fromY: number, 
  toX: number, 
  toY: number
): void {
  const headlen = 15;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  
  // Draw line
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  
  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle - Math.PI / 6),
    toY - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle + Math.PI / 6),
    toY - headlen * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

export function getCanvasCoordinates(
  canvas: HTMLCanvasElement, 
  clientX: number, 
  clientY: number
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

export function isPointNearLandmark(
  point: { x: number; y: number },
  landmark: Landmark,
  threshold = 20
): boolean {
  const distance = Math.sqrt(
    Math.pow(point.x - landmark.x, 2) +
    Math.pow(point.y - landmark.y, 2)
  );
  return distance <= threshold;
}