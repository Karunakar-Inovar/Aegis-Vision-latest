/**
 * Incident Status API utilities
 * Fetches dynamic incident status options from the API
 */
import API from "../axiosbase";
import { handleApiError } from "./helper";
import { API_ENDPOINTS, ERROR_MESSAGES, LOG_PREFIX } from "app/constants";

// Incident status type definition
export type IncidentStatus = {
  id: string;
  label: string;
  value: string;
};

/**
 * Fetch all incident statuses
 */
export const fetchIncidentStatuses = async (): Promise<IncidentStatus[]> => {
  try {
    const response = await API.post(API_ENDPOINTS.INCIDENT.FETCH_STATUS, {});
    
    // Handle response structure - extract status array from response
    const statuses = response.data || response.data || response;
    
    // Transform API response to match our IncidentStatus type
    return statuses.map((status: any) => ({
      id: status.IncidentStatusId?.toString() || status.id?.toString(),
      label: status.IncidentName,
      value: status.IncidentStatusId,
    }));
  } catch (error: any) {
    console.error(`${LOG_PREFIX.INCIDENT} Error fetching incident statuses:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.INCIDENT.FETCH_STATUS_FAILED);
    throw new Error(errorMessage);
  }
};
