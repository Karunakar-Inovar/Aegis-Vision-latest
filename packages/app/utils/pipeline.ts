/**
 * Pipeline API utilities
 * Uses the Axios API client from app/axiosbase for consistency with auth patterns
 */
import { re } from "../../../apps/storybook/storybook-static/sb-manager/globals-runtime";
import API from "../axiosbase";
import { STREAM_API } from "../axiosbase";
import { handleApiError } from "./helper";
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES, LOG_PREFIX } from "app/constants";

export type InputSource = {
  IsActive: boolean;
  SourceId: number;
  LocationId: number;
  SourceName: string;
  LocationName: string;
  InputSourceStatus: string;
};

// Pipeline Detail type definition (matches API response)
export type PipelineDetail = {
  PipelineId: number;
  PipelineName: string;
  PipelineDescription?: string | null;
  InputSourceId?: number;
  InputSourceName?: string;
  UseCaseId?: number;
  UseCaseName: string;
  ModelId?: number;
  ModelName?: string;
  IsActive?: boolean;
  CreatedDateTime?: string;
  UpdatedDateTime?: string;
  IncidentCount?: number;
  AlertCount?: number;
  NotificationChannels?: string[];
  CreatedBy?: number;
  UpdatedBy?: number;
  useCase: string;
  InputSources: InputSource[];
  TotalInputSourceCount?: number;
  ActiveInputSourceCount?: number;
  UseCase?: string;
};

export type MetaData = {
  limit: number;
  has_more: boolean;
  next_cursor?: any;
  total_count: number;
  returned_count: number;
};

export type PipelineResponse = {
  pipeline: PipelineDetail[];
  metaData?: MetaData;
  message?: string;
};

/**
 * Fetch all pipelines
 */
export const fetchPipelines = async (data = {}): Promise<PipelineResponse> => {
  try {
    const response = await API.post(API_ENDPOINTS.PIPELINE.FETCH, { ...data });
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.PIPELINE} Error fetching pipelines:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.PIPELINE.FETCH_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Create a new pipeline
 */
export interface CreatePipelineRequest {
  pipelineName: string;
  inputSourceId: number[];
  useCaseId: number;
  createdBy?: string;
}

export const createPipeline = async (
  data: CreatePipelineRequest,
): Promise<PipelineDetail> => {
  try {
    const response = await API.post(API_ENDPOINTS.PIPELINE.CREATE, data);
    // Handle response structure - extract from nested object if needed
    return response.pipeline || response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.PIPELINE} Error creating pipeline:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.PIPELINE.CREATE_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing pipeline
 */
export interface UpdatePipelineRequest extends CreatePipelineRequest {
  pipelineId: number;
  updatedBy: string;
}

export const updatePipeline = async (
  data: UpdatePipelineRequest,
): Promise<void> => {
  try {
    await API.put(API_ENDPOINTS.PIPELINE.UPDATE, data);
  } catch (error: any) {
    console.error(`${LOG_PREFIX.PIPELINE} Error updating pipeline:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.PIPELINE.UPDATE_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Delete a pipeline
 */
export const deletePipeline = async (pipelineId: number): Promise<void> => {
  try {
    await API.delete(
      `${API_ENDPOINTS.PIPELINE.DELETE}?pipelineId=${pipelineId}`,
    );
  } catch (error: any) {
    console.error(`${LOG_PREFIX.PIPELINE} Error deleting pipeline:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.PIPELINE.DELETE_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Start a pipeline
 */
export interface StartPipelineResponse {
  status: string;
  message: string;
  instance_id?: string;
}

export const startInputSource = async (
  CameraID: number, 
  PipelineID: number
): Promise<StartPipelineResponse> => {
  try {
    const response = await STREAM_API.post(API_ENDPOINTS.PIPELINE.INPUTSOURCESTART, { 
      CameraID, 
      PipelineID 
    });
    return { 
      status: "success", 
      message: SUCCESS_MESSAGES.PIPELINE.STARTED,
      instance_id: response.data?.instance_id || response.instance_id
    };
  } catch (error: any) {
    console.error(`${LOG_PREFIX.PIPELINE} Error starting pipeline:`, error);
    console.log('errorMessage: ', error);
    return { 
      status: "error", 
      message: error.response?.data?.error || error.response?.data?.message || ERROR_MESSAGES.PIPELINE.START_FAILED
    };
  }
};

/**
 * Stop a pipeline
 */
export const stopInputSource = async (
  CameraID: number, 
  PipelineID: number
): Promise<void> => {
  try {
    await STREAM_API.post(API_ENDPOINTS.PIPELINE.INPUTSOURCESTOP, { 
      CameraID, 
      PipelineID 
    });
  } catch (error: any) {
    console.error(`${LOG_PREFIX.PIPELINE} Error stopping pipeline:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.PIPELINE.STOP_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Restart a pipeline
 */
export interface RestartPipelineResponse {
  status: string;
  message?: string;
  instance_id: string;
  webrtc?: {
    signaling: {
      url: string;
    }
  };
}

export const restartInputSource = async (
  CameraID: number, 
  PipelineID: number
): Promise<RestartPipelineResponse> => {
  try {
    const response = await STREAM_API.post(API_ENDPOINTS.PIPELINE.INPUTSOURCERESTART, { 
      CameraID, 
      PipelineID
    });
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.PIPELINE} Error restarting pipeline:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.PIPELINE.RESTART_FAILED,
    );
    throw new Error(errorMessage);
  }
};


export const startPipeline = async (
  PipelineID: number
): Promise<StartPipelineResponse> => {
  try {
    const response = await STREAM_API.post(API_ENDPOINTS.PIPELINE.START, {
      PipelineID
    });
    return {
      status: "success",
      message: SUCCESS_MESSAGES.PIPELINE.STARTED,
      instance_id: response.data?.instance_id || response.instance_id
    };
  } catch (error: any) {
    console.error(`${LOG_PREFIX.PIPELINE} Error starting pipeline:`, error);
    console.log('errorMessage: ', error);
    return {
      status: "error",
      message: error.response?.data?.error || error.response?.data?.message || ERROR_MESSAGES.PIPELINE.START_FAILED
    };
  }
};

/**
 * Stop a pipeline
 */
export const stopPipeline = async (
  PipelineID: number
): Promise<void> => {
  try {
    await STREAM_API.post(API_ENDPOINTS.PIPELINE.STOP, {
      PipelineID
    });
  } catch (error: any) {
    console.error(`${LOG_PREFIX.PIPELINE} Error stopping pipeline:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.PIPELINE.STOP_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Restart a pipeline
 */
export interface RestartPipelineResponse {
  status: string;
  message?: string;
  instance_id: string;
  webrtc?: {
    signaling: {
      url: string;
    }
  };
}

export const restartPipeline = async (
  PipelineID: number
): Promise<RestartPipelineResponse> => {
  try {
    const response = await STREAM_API.post(API_ENDPOINTS.PIPELINE.RESTART, {
      PipelineID
    });
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.PIPELINE} Error restarting pipeline:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.PIPELINE.RESTART_FAILED,
    );
    throw new Error(errorMessage);
  }
};
