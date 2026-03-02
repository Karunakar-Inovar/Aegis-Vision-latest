import API from "../axiosbase";
import { handleApiError } from "./helper";
import { API_ENDPOINTS, ERROR_MESSAGES, LOG_PREFIX } from "app/constants";
import { getItem, STORAGE_KEYS } from "./storage";

export type UpdateUserPayload = {
  userId?: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
};

export const updateUser = async (data: UpdateUserPayload) => {
  try {
    const token = getItem<string>(STORAGE_KEYS.TOKEN);

    const auth = getItem<any>(STORAGE_KEYS.AUTH);
    const userId = data.userId ?? auth?.id;

    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;

    const body = { ...data, userId };  

    const response = await API.put(API_ENDPOINTS.UPDATE_USER.UPDATE, body, config);

    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.USER} Error updating user:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.USER.UPDATE_FAILED);
    throw new Error(errorMessage);
  }
};