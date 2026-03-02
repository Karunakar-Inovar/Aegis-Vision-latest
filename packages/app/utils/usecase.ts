/**
 * Use Case API utilities
 * Uses the Axios API client from app/axiosbase for consistency with auth patterns
 */
import API from "../axiosbase";
import { handleApiError } from "./helper";
import { API_ENDPOINTS, ERROR_MESSAGES, LOG_PREFIX } from "app/constants";

// Use Case type definition (matches API response)
export type UseCase = {
  UseCaseId: number;
  UseCaseName: string;
  UseCaseDescription?: string | null;
};

export type MetaData = {
  found: boolean;
  limit: number;
  has_more: boolean;
  total_count: number;
  returned_count: number;
  next_cursor?: any
};

export type UseCaseResponse = {
  useCases: UseCase[];
  metaData?: MetaData;
};

// Use Case Accuracy type definition (matches API response)
export type UseCaseAccuracy = {
  accuracy: number;
  UseCaseId: number;
  UseCaseName: string;
};

export type UseCaseAccuraciesResponse = {
  useCaseAccuracies: UseCaseAccuracy[];
  message?: string;
};

/**
 * Fetch all use cases
 */
export const fetchUseCases = async (data = {}): Promise<UseCaseResponse> => {
  try {
    const response = await API.post(API_ENDPOINTS.USE_CASE.FETCH, { ...data });
    // Handle both array response and single use case wrapped in object
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.USE_CASE}:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.USE_CASE.FETCH_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Delete a use case
 * @param useCaseId - The ID of the use case to delete
 */
export const deleteUseCase = async (useCaseId: number): Promise<void> => {
  try {
    await API.delete(`${API_ENDPOINTS.USE_CASE.DELETE}/${useCaseId}`);
  } catch (error: any) {
    console.error(`${LOG_PREFIX.USE_CASE}:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.USE_CASE.DELETE_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Fetch use case accuracies
 * @returns Promise containing array of use case accuracies
 */
export const fetchUseCaseAccuracies = async (): Promise<UseCaseAccuraciesResponse> => {
  try {
    const response = await API.get(API_ENDPOINTS.USE_CASE.FETCH_ACCURACIES);
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.USE_CASE} Error fetching accuracies:`, error);
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.USE_CASE.FETCH_ACCURACIES_FAILED,
    );
    throw new Error(errorMessage);
  }
};
