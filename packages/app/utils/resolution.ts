/**
 * Resolution API utilities
 * Uses the Axios API client from app/axiosbase for consistency with auth patterns
 */
import API from "../axiosbase";
import { handleApiError } from "./helper";
import { API_ENDPOINTS, ERROR_MESSAGES, LOG_PREFIX } from "app/constants";

// Resolution type definition (matches API response)
export type Resolution = {
  InputSourceResolutionId: number;
  ResolutionName: string;
  ResolutionWidth: number;
  ResolutionHeight: number;
};

/**
 * Fetch all resolutions
 */
export const fetchResolutions = async (): Promise<Resolution[]> => {
  try {
    const response = await API.post(API_ENDPOINTS.RESOLUTION.FETCH, {});
    // Handle both array response and single resolution wrapped in object
    return response?.inputSourceResolution || response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.RESOLUTION}:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.RESOLUTION.FETCH_FAILED);
    throw new Error(errorMessage);
  }
};
