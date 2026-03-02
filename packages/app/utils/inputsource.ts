/**
 * Input Source API utilities
 * Uses the Axios API client from app/axiosbase for consistency with auth patterns
 */
import API from "../axiosbase";
import { handleApiError } from "./helper";
import { API_ENDPOINTS, ERROR_MESSAGES, LOG_PREFIX } from "app/constants";

// Input Source Detail type definition (matches API response)
export type InputSourceDetail = {
  InputSourceId: number;
  SourceId: number;
  SourceName: string;
  InputSourceDescription?: string | null;
  WebrtcUrl?: string;
  OriginalFPS?: number;
  LocationId?: number;
  SourceUrl?: string;
  LocationName?: string;
  UseCaseId?: number;
  UseCaseName?: string;
  InputSourceResolutionId?: number;
  ResolutionName?: string;
  ResolutionWidth?: number;
  ResolutionHeight?: number;
  TargetFPS?: number;
  IsActive?: boolean;
  CreatedAt?: string;
  InputSourceStatus?: string;
  UpdatedAt?: string;
};

export type MetaData = {
  found: boolean;
  limit: number;
  has_more: boolean;
  total_count: number;
  returned_count: number;
  next_cursor?: any;
};

export type InputSourceResponse = {
  inputSource: InputSourceDetail[];
  metaData?: MetaData;
};

/**
 * Fetch all input sources
 */
export const fetchInputSources = async (
  data = {},
): Promise<InputSourceResponse> => {
  try {
    const response = await API.post(API_ENDPOINTS.INPUT_SOURCE.FETCH, {
      ...data,
    });
    return response;
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.INPUT_SOURCE} Error fetching input sources:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.INPUT_SOURCE.FETCH_FAILED,
    );
    throw new Error(errorMessage);
  }
};

export type InputSourceDetails = {
  gstPipeline: string;
  webrtcPipeline: string;
  width: number;
  height: number;
  fps: number;
  codec: string;
  originalFps?: number;
};

/**
 * Fetch input source details by URL
 */
export const fetchInputSourceDetails = async (
  sourceUrl: string,
): Promise<InputSourceDetails> => {
  try {
    const response = await API.post(API_ENDPOINTS.INPUT_SOURCE.FETCH_DETAILS, {
      sourceUrl,
    });
    // Handle both array response and single input source wrapped in object
    return response?.inputSourceDetails;
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.INPUT_SOURCE} Error fetching input source details:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.INPUT_SOURCE.FETCH_DETAILS_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Create a new input source (camera)
 */
export interface CreateInputSourceRequest {
  sourceName?: string;
  sourceUrl?: string;
  sourceTypeId?: number;
  locationId?: number;
  useCaseId?: number;
  inputSourceResolutionId?: number;
  originalFps?: number;
  gstreamerUrl?: string;
  webrtcUrl?: string;
  targetFps?: number;
  width?: number;
  height?: number;
  createdBy?: number;
  isActive?: boolean;
}

export interface UpdateInputSourceRequest extends CreateInputSourceRequest {
  sourceId: number;
  updatedBy: number;
  isActive?: boolean;
}

export const createInputSource = async (
  data: CreateInputSourceRequest,
): Promise<InputSourceDetail> => {
  try {
    const response = await API.post(API_ENDPOINTS.INPUT_SOURCE.CREATE, data);
    // Handle response structure - extract from nested object if needed
    return response.inputSource || response;
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.INPUT_SOURCE} Error creating input source:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.INPUT_SOURCE.CREATE_FAILED,
    );
    throw new Error(errorMessage);
  }
};

export const deleteInputSource = async (sourceId: number): Promise<void> => {
  try {
    await API.delete(
      `${API_ENDPOINTS.INPUT_SOURCE.DELETE}?sourceId=${sourceId}`,
    );
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.INPUT_SOURCE} Error deleting input source:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.INPUT_SOURCE.DELETE_FAILED,
    );
    throw new Error(errorMessage);
  }
};

export const updateInputSource = async (
  data: UpdateInputSourceRequest,
): Promise<void> => {
  try {
    await API.put(API_ENDPOINTS.INPUT_SOURCE.UPDATE, data);
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.INPUT_SOURCE} Error updating input source:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.INPUT_SOURCE.UPDATE_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Online Input Source type definition
 */
export type OnlineInputSourceDetail = {
  sourceId: number;
  sourceName: string;
  location: string;
  targetFps: number;
  resolution: string;
  status: string | null;
  statusId: number | null;
};

export type OnlineInputSourceResponse = {
  inputSourceDetails: {
    inputSourceDetails: OnlineInputSourceDetail[];
    onlineCameraCount: number;
    cameraCount: number;
  };
};

/**
 * Fetch online input sources
 */
export const fetchOnlineInputSources = async (): Promise<OnlineInputSourceResponse> => {
  try {
    const response = await API.get<OnlineInputSourceResponse>(API_ENDPOINTS.INPUT_SOURCE.FETCH_ONLINE, {});
    return response;
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.INPUT_SOURCE} Error fetching online input sources:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.INPUT_SOURCE.FETCH_ONLINE_FAILED,
    );
    throw new Error(errorMessage);
  }
};
