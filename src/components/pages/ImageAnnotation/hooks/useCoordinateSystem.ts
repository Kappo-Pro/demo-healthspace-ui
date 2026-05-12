/**
 * React Hook for using coordinate system
 */
import { useRef, useCallback, useMemo } from 'react';
import { CoordinateSystem, Point, Bounds } from '../utils/coordinateSystem';

export const useCoordinateSystem = (precision = 10) => {
  const elementRef = useRef<HTMLElement>(null);
  
  const coordinateSystem = useMemo(() => {
    if (!elementRef.current) return null;
    return CoordinateSystem.create(elementRef.current, precision);
  }, [elementRef.current, precision]);

  const screenToLocal = useCallback((screenX: number, screenY: number): Point | null => {
    if (!coordinateSystem) return null;
    return coordinateSystem.screenToLocal(screenX, screenY);
  }, [coordinateSystem]);

  const localToScreen = useCallback((localX: number, localY: number): Point | null => {
    if (!coordinateSystem) return null;
    return coordinateSystem.localToScreen(localX, localY);
  }, [coordinateSystem]);

  const angleFromCenter = useCallback((center: Point, point: Point): number => {
    if (!coordinateSystem) return 0;
    return coordinateSystem.angleFromCenter(center, point);
  }, [coordinateSystem]);

  const angleToPoint = useCallback((center: Point, angle: number, radius: number): Point => {
    if (!coordinateSystem) return { x: 0, y: 0 };
    return coordinateSystem.angleToPoint(center, angle, radius);
  }, [coordinateSystem]);

  const isPointInBounds = useCallback((point: Point, bounds: Bounds): boolean => {
    if (!coordinateSystem) return false;
    return coordinateSystem.isPointInBounds(point, bounds);
  }, [coordinateSystem]);

  const clampToBounds = useCallback((point: Point, bounds: Bounds): Point => {
    if (!coordinateSystem) return point;
    return coordinateSystem.clampToBounds(point, bounds);
  }, [coordinateSystem]);

  return {
    elementRef,
    coordinateSystem,
    screenToLocal,
    localToScreen,
    angleFromCenter,
    angleToPoint,
    isPointInBounds,
    clampToBounds
  };
};