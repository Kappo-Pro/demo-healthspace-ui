/**
 * TypeScript Interfaces for Strapi v4 Recommendations API
 *
 * This file defines the complete type structure for the Strapi recommendations system,
 * following Strapi v4 conventions where all API responses use { data: [], meta: {} } structure
 * and all relations are wrapped in { data: [] } objects.
 *
 * @see Data Architecture doc lines 55-86
 * @module services/api/types/recommendations
 */

/**
 * Strapi Media File Interface
 * Represents image/video assets attached to recommendations
 *
 * @example
 * {
 *   id: 1,
 *   attributes: {
 *     url: "/uploads/thumbnail.jpg",
 *     alternativeText: "Exercise demonstration",
 *     width: 1920,
 *     height: 1080,
 *     formats: { thumbnail: { url: "/uploads/thumb_thumbnail.jpg" } }
 *   }
 * }
 */
export interface StrapiMedia {
  id: number;
  attributes: {
    /** Full URL path to the media file */
    url: string;
    /** Accessible alternative text for screen readers */
    alternativeText: string;
    /** Original width in pixels */
    width: number;
    /** Original height in pixels */
    height: number;
    /** Auto-generated responsive image formats (optional) */
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  };
}

/**
 * Strapi v4 Media Data Wrapper
 * Wraps single media relation in { data: StrapiMedia | null } structure
 */
export interface StrapiMediaData {
  data: StrapiMedia | null;
}

/**
 * Functional Goal Interface
 * Represents patient care objectives (mobility, pain reduction, etc.)
 *
 * @example
 * {
 *   id: 3,
 *   attributes: {
 *     name: "Improve Mobility",
 *     description: "Increase range of motion and reduce stiffness"
 *   }
 * }
 */
export interface StrapiFunctionalGoal {
  id: number;
  attributes: {
    /** Display name of the functional goal */
    name: string;
    /** Detailed description of the goal */
    description: string;
  };
}

/**
 * Strapi v4 Functional Goals Array Wrapper
 * Wraps multiple functional goal relations in { data: [] } structure
 */
export interface StrapiFunctionalGoalsData {
  data: StrapiFunctionalGoal[];
}

/**
 * Recommendation Type/Category Interface
 * Classifies recommendations (exercise, education, lifestyle, etc.)
 *
 * @example
 * {
 *   id: 2,
 *   attributes: {
 *     name: "Exercise"
 *   }
 * }
 */
export interface StrapiRecommendationType {
  id: number;
  attributes: {
    /** Name of the recommendation type/category */
    name: string;
  };
}

/**
 * Strapi v4 Recommendation Types Array Wrapper
 * Wraps multiple type/category relations in { data: [] } structure
 */
export interface StrapiRecommendationTypesData {
  data: StrapiRecommendationType[];
}

/**
 * Main Recommendation Interface
 * Core recommendation entity with title, content, and relations
 *
 * @example
 * {
 *   id: 42,
 *   attributes: {
 *     title: "Gentle Shoulder Stretches",
 *     recommendation: "## Instructions\n\n1. Stand with feet shoulder-width apart...",
 *     vitalflowId: 1001,
 *     media: { data: { id: 5, attributes: { url: "/uploads/demo.jpg", ... } } },
 *     functionalGoals: { data: [{ id: 3, attributes: { name: "Improve Mobility", ... } }] },
 *     recommendationTypes: { data: [{ id: 2, attributes: { name: "Exercise" } }] },
 *     createdAt: "2025-10-15T10:30:00.000Z",
 *     publishedAt: "2025-10-15T14:00:00.000Z"
 *   }
 * }
 */
export interface StrapiRecommendation {
  /** Unique Strapi entity ID */
  id: number;
  attributes: {
    /** Display title of the recommendation */
    title: string;
    /** Markdown-formatted recommendation content */
    recommendation: string;
    /** Optional VitalFlow internal ID for legacy integration */
    vitalflowId?: number;
    /** Optional featured image/video (single relation) */
    media?: StrapiMediaData;
    /** Associated functional goals (many-to-many relation) */
    functionalGoals?: StrapiFunctionalGoalsData;
    /** Recommendation types/categories (many-to-many relation) */
    recommendationTypes?: StrapiRecommendationTypesData;
    /** Alternative field for categories (many-to-many relation) */
    recommendationCategories?: StrapiRecommendationTypesData;
    /** ISO 8601 timestamp of creation */
    createdAt?: string;
    /** ISO 8601 timestamp of last update */
    updatedAt?: string;
    /** ISO 8601 timestamp of publication (null if draft) */
    publishedAt?: string;
  };
}

/**
 * Strapi v4 Pagination Metadata
 * Standard pagination structure returned in API responses
 *
 * @example
 * {
 *   page: 1,
 *   pageSize: 25,
 *   pageCount: 4,
 *   total: 87
 * }
 */
export interface StrapiPagination {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages available */
  pageCount: number;
  /** Total count of all items across all pages */
  total: number;
}

/**
 * Strapi v4 API Response Wrapper
 * Complete response structure from GET /api/recommendations endpoint
 *
 * @example
 * {
 *   data: [
 *     { id: 1, attributes: { title: "Morning Stretches", ... } },
 *     { id: 2, attributes: { title: "Posture Tips", ... } }
 *   ],
 *   meta: {
 *     pagination: { page: 1, pageSize: 25, pageCount: 4, total: 87 }
 *   }
 * }
 */
export interface StrapiRecommendationResponse {
  /** Array of recommendation entities */
  data: StrapiRecommendation[];
  /** Response metadata including pagination */
  meta: {
    pagination: StrapiPagination;
  };
}

/**
 * Recommendation Query Filter Parameters
 * Used for filtering and pagination in API requests
 *
 * @example
 * {
 *   functionalGoalIds: [1, 3, 5],
 *   personaId: 2,
 *   recommendationType: "Exercise",
 *   page: 1,
 *   pageSize: 25
 * }
 */
export interface RecommendationFilters {
  /** Filter by functional goal IDs (many-to-many) */
  functionalGoalIds?: number[];
  /** Filter by persona/user type ID */
  personaId?: number;
  /** Filter by target audience ID */
  audienceId?: number;
  /** Filter by recommendation type name */
  recommendationType?: string;
  /** Requested page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
}
