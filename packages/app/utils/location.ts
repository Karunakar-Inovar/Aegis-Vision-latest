/**
 * Location API utilities
 * Uses the Axios API client from app/axiosbase for consistency with auth patterns
 */
import API from "../axiosbase";
import { handleApiError } from "./helper";
import { API_ENDPOINTS, ERROR_MESSAGES, LOG_PREFIX } from "app/constants";

// Location type definition (matches API response)
export type Location = {
  LocationId: number;
  LocationName: string;
  LocationDescription?: string | null;
};

/**
 * Fetch all locations
 */
export const fetchLocations = async (): Promise<Location[]> => {
  try {
    const response = await API.post(API_ENDPOINTS.LOCATION.FETCH,{});
    // Handle both array response and single location wrapped in object
    return response?.location || response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.LOCATION}:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.LOCATION.FETCH_FAILED);
    throw new Error(errorMessage);
  }
};
