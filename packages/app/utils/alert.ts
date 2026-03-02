import {API} from "app/axiosbase";
import { handleApiError } from "app/utils/helper";
import { API_ENDPOINTS, ERROR_MESSAGES } from "app/constants";
import { LOG_PREFIX } from "app/constants";
import { getItem, setItem, STORAGE_KEYS } from "./storage";

export interface AlertItem {
  id: string | number;
  title?: string;
  message?: string;
  severity?: "critical" | "warning" | "info" | string;
  cameraId?: string | number;
  meta?: { location?: string; [key: string]: any };
  createdAt?: string | number | Date;
  [key: string]: any;
}

export interface Alert {
  FrameId: number;
  SourceId: number;
  UseCaseId: number;
  Timestamp: string;
  CapturedFrame?: any;
  CreatedBy: number;
  UpdatedBy?: number | null;
  DetectedObjectsId: number;
  TrackingId: number;
  ClassId: number;
  ClassName: string;
  FrameFileUrl: string;
  ConfidenceValue: number;
  AlertStatus: string;
  SourceName?: string;
  LocationName?: string;
  UseCaseName?: string;
  SeverityLevel?: string;
  DetectedObjectCreatedDateTime?: string;
}

export interface SeverityLevel {
  SeverityLevelId: number;
  SeverityLevelName: string;
  SeverityLevelDescription?: string;
}

export interface SeverityLevelResponse {
  data: SeverityLevel[];
  message?: string;
}

export interface AlertResponse {
  alerts: Alert[];
  metaData: {
    total_count: number;
    has_more: boolean;
    next_cursor: {
      cursor_id: number;
      cursor_datetime: string;
    } | null;
  } | null;
}

export const fetchAllAlerts = async(data: {} = {}): Promise<AlertResponse> => {
  try {
    const response = await API.post(API_ENDPOINTS.ALERT.FETCH, {...data});
    let alerts = response?.alerts?.get_alert?.data ?? [];

    if (!Array.isArray(alerts)) {
      if (alerts && typeof alerts === "object") {
        alerts = [alerts];
      } else {
        alerts = [];
      }
    }
    
    const metaData = response?.alerts?.get_alert?.metadata || null;
    
    return {
      alerts: alerts as Alert[],
      metaData
    };
  } catch (err: any) {
    console.error(`${LOG_PREFIX.ALERT} Error fetching alerts:`, err);
    const errorMessage = handleApiError(err, ERROR_MESSAGES.ALERT.FETCH_FAILED);
    throw new Error(errorMessage);
  }
}

export const fetchSeverityLevels = async(): Promise<SeverityLevel[]> => {
  try {
    const response = await API.post(API_ENDPOINTS.SEVERITY_LEVEL.FETCH);
    return response?.data ?? [];
  } catch (err: any) {
    console.error(`${LOG_PREFIX.ALERT} Error fetching severity levels:`, err);
    const errorMessage = handleApiError(err, ERROR_MESSAGES.ALERT.FETCH_SEVERITY_LEVELS_FAILED);
    throw new Error(errorMessage);
  }
}

export interface UpdateAlertPayload {
  detectedObjectsId: number;
  acknowledgeDescription: string;
  alertStatusId: number;
}

export const updateAlert = async(data: UpdateAlertPayload): Promise<any> => {
  try {
    const response = await API.post(API_ENDPOINTS.ALERT.UPDATE, data);
    return response;
  } catch (err: any) {
    console.error(`${LOG_PREFIX.ALERT} Error updating alert:`, err);
    const errorMessage = handleApiError(err, ERROR_MESSAGES.ALERT.UPDATE_FAILED);
    throw new Error(errorMessage);
  }
}


/**
 * Get current alert from local storage
 */
export function getCurrentAlert(): Alert | null {
  return getItem<Alert>(STORAGE_KEYS.ALERT);
}

/**
 *set current alert from local storage
 */
export function setCurrentAlert(alert: Alert): boolean {
  return setItem<Alert>(STORAGE_KEYS.ALERT, alert);
}