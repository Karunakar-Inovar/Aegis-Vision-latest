/**
 * Incident API utilities
 * Uses the Axios API client from app/axiosbase for consistency with auth patterns
 */
import API from "../axiosbase";
import { handleApiError } from "./helper";
import { API_ENDPOINTS, ERROR_MESSAGES, LOG_PREFIX } from "app/constants";
import { getItem, setItem, STORAGE_KEYS } from "./storage";

// Incident type definition (matches API response)
export type Incident = {
  IncidentId: number;
  IncidentType: string;
  IncidentName: string;
  IncidentTitle: string;
  SeverityLevel: string;
  SourceName: string;
  UseCaseName: string;
  CreatedDateTime: string;
  IncidentDescription?: string;
  IncidentStatus: string;
  ConfidencePercentage: number;
  IncidentHistory?: [
    {
      assignedTo: {
        id: string;
        name: string;
      };
      notes: string;
      dateTime: string;
      updateBy: string;
    },
  ];
  IncidentStatusId: number;
  Attachments?: Array<{
    AttachmentId: number;
    CreatedDateTime: string;
    ImagePath?: string;
    VideoPath?: string;
  }>;
  IncidentTypeName?: string;
  LocationName?: string
};

export type IncidentFilter = {
  incidentTitle?: string;
  incidentStatusId?: string;
  limit?: number;
  lastIncidentId?: number;
  lastDatetime?: string;
  incidentId?: string | number;
};

export type IncidentRequest = {
  filters?: IncidentFilter;
};

export type MetaData = {
  found: boolean;
  limit: number;
  has_more: boolean;
  total_count: number;
  returned_count: number;
  next_cursor?: any;
};

export type IncidentResponse = {
  incidents: Incident[];
  metaData?: MetaData;
};

export type IncidentType = {
  IncidentTypeId: number;
  IncidentTypeName: string;
  IncidentTypeDescription?: string;
};

export type IncidentTypeResponse = {
  data: IncidentType[];
  message?: string;
};

export type SeverityLevel = {
  SeverityLevelId: number;
  SeverityLevelName: string;
  SeverityLevelDescription?: string;
};

export type SeverityLevelResponse = {
  data: SeverityLevel[];
  message?: string;
};

export type CreateIncidentRequest = {
  incidentTypeId: number;
  incidentStatusId: number;
  severityLevelId: number;
  incidentTitle: string;
  incidentDescription?: string;
  location?: string;
  frameId: number;
  createdBy: string;
};

export type CreateIncidentResponse = {
  message?: string;
  incident?: any;
};

export type UpdateIncidentRequest = {
  incidentId: number;
  incidentStatusId: number;
  incidentHistory: Array<{
    assignedTo: {
      id: string;
      name: string;
    };
    notes: string;
    dateTime: string;
    updateBy: string;
  }>;
};

/**
 * Create a new incident
 */
export const createIncident = async (
  data: CreateIncidentRequest,
): Promise<CreateIncidentResponse> => {
  try {
    const response = await API.post(API_ENDPOINTS.INCIDENT.CREATE, data);
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.INCIDENT} Error creating incident:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.INCIDENT.CREATE_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Fetch all incident types
 */
export const fetchIncidentTypes = async (): Promise<IncidentTypeResponse> => {
  try {
    const response = await API.post(API_ENDPOINTS.INCIDENT.FETCH_TYPES, {});
    return response;
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.INCIDENT} Error fetching incident types:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.INCIDENT.FETCH_TYPES_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Fetch all severity levels
 */
export const fetchSeverityLevels = async (): Promise<SeverityLevelResponse> => {
  try {
    const response = await API.post(API_ENDPOINTS.SEVERITY_LEVEL.FETCH, {});
    return response;
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.INCIDENT} Error fetching severity levels:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.INCIDENT.FETCH_SEVERITY_LEVELS_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Fetch all incidents
 */
export const fetchIncidents = async (
  data: IncidentRequest = {},
): Promise<IncidentResponse> => {
  try {
    const response = await API.post(API_ENDPOINTS.INCIDENT.FETCH, { ...data });
    // Handle response structure - extract from nested object if needed
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.INCIDENT} Error fetching incidents:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.INCIDENT.FETCH_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Update incident with full details including history
 */
export const updateIncident = async (
  data: UpdateIncidentRequest,
): Promise<any> => {
  try {
    const response = await API.put(API_ENDPOINTS.INCIDENT.UPDATE, data);
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.INCIDENT} Error updating incident:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.INCIDENT.UPDATE_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Update incident status (legacy - use updateIncident for full updates)
 */
export const updateIncidentStatus = async (
  incidentId: number,
  statusId: number,
): Promise<any> => {
  try {
    const response = await API.put(API_ENDPOINTS.INCIDENT.UPDATE, {
      incidentId: Number(incidentId),
      incidentStatusId: Number(statusId),
    });
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.INCIDENT} Error updating incident:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.INCIDENT.UPDATE_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Get current incident from local storage
 */
export function getCurrentIncident(): Incident | null {
  return getItem<Incident>(STORAGE_KEYS.INCIDENT);
}

/**
 *set current incident from local storage
 */
export function setCurrentIncident(incident: Incident): boolean {
  return setItem<Incident>(STORAGE_KEYS.INCIDENT, incident);
}
