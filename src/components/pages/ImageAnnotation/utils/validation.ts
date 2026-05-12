import validator from 'validator';

export interface Point {
  x: number;
  y: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface CanvasBounds {
  width: number;
  height: number;
  minX?: number;
  minY?: number;
  maxX?: number;
  maxY?: number;
}

/**
 * Validates a coordinate point within canvas bounds
 */
export function validatePoint(point: Point, canvasBounds: CanvasBounds, fieldName = 'point'): ValidationResult {
  // Check if point object is valid
  if (!point || typeof point !== 'object') {
    return { isValid: false, error: `${fieldName} must be a valid object` };
  }

  // Check if coordinates are numbers
  if (typeof point.x !== 'number' || typeof point.y !== 'number') {
    return { isValid: false, error: `${fieldName} coordinates must be numbers` };
  }

  // Check for NaN or Infinity
  if (!isFinite(point.x) || !isFinite(point.y)) {
    return { isValid: false, error: `${fieldName} coordinates must be finite numbers` };
  }

  // Check bounds
  const minX = canvasBounds.minX ?? 0;
  const minY = canvasBounds.minY ?? 0;
  const maxX = canvasBounds.maxX ?? canvasBounds.width;
  const maxY = canvasBounds.maxY ?? canvasBounds.height;

  if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
    return {
      isValid: false,
      error: `${fieldName} coordinates must be within bounds (${minX}-${maxX}, ${minY}-${maxY})`
    };
  }

  return { isValid: true };
}

/**
 * Validates an array of points for angle calculation
 */
export function validateAnglePoints(points: Point[], canvasBounds: CanvasBounds): ValidationResult {
  if (!Array.isArray(points) || points.length !== 3) {
    return { isValid: false, error: 'Angle calculation requires exactly 3 points' };
  }

  for (let i = 0; i < points.length; i++) {
    const pointValidation = validatePoint(points[i], canvasBounds, `point${i + 1}`);
    if (!pointValidation.isValid) {
      return pointValidation;
    }
  }

  // Check if points are collinear (would result in undefined angle)
  const [p1, p2, p3] = points;
  const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  if (Math.abs(crossProduct) < 1e-10) {
    return { isValid: false, error: 'Points cannot be collinear for angle calculation' };
  }

  return { isValid: true };
}

/**
 * Validates file upload parameters
 */
export function validateFileUpload(file: File): ValidationResult {
  // Check file exists
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/json'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type must be JPEG, PNG, or JSON' };
  }

  // Additional validation for JSON files
  if (file.type === 'application/json') {
    // File name validation
    if (!validator.isLength(file.name, { min: 1, max: 255 })) {
      return { isValid: false, error: 'File name must be 1-255 characters' };
    }

    // Basic filename sanitization check
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      return { isValid: false, error: 'File name contains invalid characters' };
    }
  }

  return { isValid: true };
}

/**
 * Validates and sanitizes text input for annotations
 */
export function validateAnnotationText(text: string): ValidationResult {
  // Check length
  if (!validator.isLength(text, { min: 0, max: 1000 })) {
    return { isValid: false, error: 'Text must be 0-1000 characters' };
  }

  // Check for potentially malicious content
  if (validator.contains(text, '<script>') || validator.contains(text, 'javascript:')) {
    return { isValid: false, error: 'Text contains potentially unsafe content' };
  }

  return { isValid: true };
}

/**
 * Sanitizes text input by removing HTML tags and encoding special characters
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Remove HTML tags
  const withoutTags = text.replace(/<[^>]*>/g, '');
  
  // Encode special characters
  return validator.escape(withoutTags);
}

/**
 * Validates landmark data structure with minimal requirements for export
 */
export function validateLandmarkDataMinimal(data: unknown): ValidationResult {
  // Check if data is an array
  if (!Array.isArray(data)) {
    return { isValid: false, error: 'Landmark data must be an array' };
  }

  // Check array length
  if (data.length > 1000) {
    return { isValid: false, error: 'Too many landmarks (max 1000)' };
  }

  // Validate each landmark with minimal requirements
  for (let i = 0; i < data.length; i++) {
    const landmark = data[i];
    
    if (!landmark || typeof landmark !== 'object') {
      return { isValid: false, error: `Landmark ${i} must be an object` };
    }

    const landmarkObj = landmark as Record<string, unknown>;

    // Only check for basic coordinate data
    if (!('x' in landmarkObj) || !('y' in landmarkObj)) {
      return { isValid: false, error: `Landmark ${i} missing coordinates` };
    }

    if (typeof landmarkObj.x !== 'number' || typeof landmarkObj.y !== 'number') {
      return { isValid: false, error: `Landmark ${i} coordinates must be numbers` };
    }

    if (!isFinite(landmarkObj.x) || !isFinite(landmarkObj.y)) {
      return { isValid: false, error: `Landmark ${i} coordinates must be finite` };
    }
  }

  return { isValid: true };
}

/**
 * Validates landmark data structure based on actual Landmark interface
 */
export function validateLandmarkData(data: unknown): ValidationResult {
  // Check if data is an array
  if (!Array.isArray(data)) {
    return { isValid: false, error: 'Landmark data must be an array' };
  }

  // Check array length
  if (data.length > 1000) {
    return { isValid: false, error: 'Too many landmarks (max 1000)' };
  }

  // Validate each landmark
  for (let i = 0; i < data.length; i++) {
    const landmark = data[i];
    
    // Check required properties
    if (!landmark || typeof landmark !== 'object') {
      return { isValid: false, error: `Landmark ${i} must be an object` };
    }

    // Essential properties that must exist
    const essentialProps = ['index', 'x', 'y', 'z'];
    for (const prop of essentialProps) {
      if (!(prop in landmark)) {
        return { isValid: false, error: `Landmark ${i} missing essential property: ${prop}` };
      }
    }

    // Cast to any for property access after validation
    const landmarkObj = landmark as Record<string, unknown>;

    // Validate index (must exist and be valid)
    if (typeof landmarkObj.index !== 'number' || !isFinite(landmarkObj.index) || landmarkObj.index < 0) {
      return { isValid: false, error: `Landmark ${i} index must be a non-negative number` };
    }

    // Validate coordinates (must exist and be valid)
    const coords = [
      { name: 'x', value: landmarkObj.x },
      { name: 'y', value: landmarkObj.y },
      { name: 'z', value: landmarkObj.z }
    ];

    for (const coord of coords) {
      if (typeof coord.value !== 'number' || !isFinite(coord.value)) {
        return { isValid: false, error: `Landmark ${i} ${coord.name} coordinate must be a finite number` };
      }
      
      // Reasonable bounds check (adjust as needed for your coordinate system)
      if (coord.value < -10000 || coord.value > 10000) {
        return { isValid: false, error: `Landmark ${i} ${coord.name} coordinate out of bounds (-10000 to 10000)` };
      }
    }

    // Validate optional properties if they exist
    if ('name' in landmarkObj && landmarkObj.name !== undefined) {
      if (typeof landmarkObj.name !== 'string' || !validator.isLength(landmarkObj.name, { min: 1, max: 100 })) {
        return { isValid: false, error: `Landmark ${i} name must be a string (1-100 characters)` };
      }
    }

    if ('color' in landmarkObj && landmarkObj.color !== undefined) {
      const colorValidation = validateColor(landmarkObj.color as string);
      if (!colorValidation.isValid) {
        return { isValid: false, error: `Landmark ${i} color invalid: ${colorValidation.error}` };
      }
    }

    if ('visible' in landmarkObj && landmarkObj.visible !== undefined) {
      if (typeof landmarkObj.visible !== 'boolean') {
        return { isValid: false, error: `Landmark ${i} visible must be a boolean` };
      }
    }

    if ('group' in landmarkObj && landmarkObj.group !== undefined) {
      if (typeof landmarkObj.group !== 'string' || !validator.isLength(landmarkObj.group, { min: 1, max: 50 })) {
        return { isValid: false, error: `Landmark ${i} group must be a string (1-50 characters)` };
      }
    }
  }

  return { isValid: true };
}

/**
 * Validates thickness/stroke width values
 */
export function validateThickness(thickness: number): ValidationResult {
  if (typeof thickness !== 'number' || !isFinite(thickness)) {
    return { isValid: false, error: 'Thickness must be a valid number' };
  }

  if (thickness < 1 || thickness > 20) {
    return { isValid: false, error: 'Thickness must be between 1 and 20' };
  }

  return { isValid: true };
}

/**
 * Validates color values (hex format)
 */
export function validateColor(color: string): ValidationResult {
  if (!color || typeof color !== 'string') {
    return { isValid: false, error: 'Color must be a string' };
  }

  // Check hex color format
  if (!/^#[0-9A-F]{6}$/i.test(color)) {
    return { isValid: false, error: 'Color must be in hex format (#RRGGBB)' };
  }

  return { isValid: true };
}

/**
 * Validates canvas dimensions
 */
export function validateCanvasDimensions(width: number, height: number): ValidationResult {
  if (typeof width !== 'number' || typeof height !== 'number') {
    return { isValid: false, error: 'Canvas dimensions must be numbers' };
  }

  if (!isFinite(width) || !isFinite(height)) {
    return { isValid: false, error: 'Canvas dimensions must be finite numbers' };
  }

  if (width < 1 || height < 1) {
    return { isValid: false, error: 'Canvas dimensions must be positive' };
  }

  if (width > 8192 || height > 8192) {
    return { isValid: false, error: 'Canvas dimensions too large (max 8192x8192)' };
  }

  return { isValid: true };
}

/**
 * Creates a safe validation error for user display
 */
export function createSafeErrorMessage(error: string): string {
  // Remove any potential system information from error messages
  const safeError = error.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
                        .replace(/\b[A-Za-z]:\\[^\s]+/g, '[PATH]')
                        .replace(/\b\/[^\s]+/g, '[PATH]');
  
  return safeError;
}