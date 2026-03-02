/**
 * Organization API utilities
 * Uses the Axios API client from app/axiosbase for consistency with auth patterns
 */
import API from "../axiosbase";
import { handleApiError } from "./helper";
import { API_ENDPOINTS, ERROR_MESSAGES, LOG_PREFIX } from "app/constants";

// Organization type definition
export type Organization = {
  OrganizationId: number;
  OrganizationName: string;
  OrganizationDomain?: string | null;
  IndustryId: number;
  CompanySizeId: number;
  Logo?: {
    data: number[];
    type: string;
  };
  IndustryName?: string;
  CompanySizeName?: string;
  LicenseKey?: string;
};

// Industry type definition
export type OrganizationIndustry = {
  OrganizationIndustryId: number;
  OrganizationIndustryName: string;
};

// Company Size type definition
export type OrganizationSize = {
  OrganizationSizeId: number;
  OrganizationSize: string;
};

export type UpdateOrganizationDto = {
  organizationId?: number;
  organizationName: string;
  organizationDomain?: string | null;
  industryId: number;
  companySizeId: number;
  logo?: string | null;
  licenseKey?: string;
};

/**
 * Fetch organization details
 */
export const fetchOrganization = async (): Promise<Organization> => {
  try {
    const response = await API.post(API_ENDPOINTS.ORGANIZATION.FETCH);
    return response?.organization[response?.organization?.length -  1] || response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.ORGANIZATION} Error fetching organization:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.ORGANIZATION.FETCH_FAILED);
    throw new Error(errorMessage);
  }
};

/**
 * Fetch all industries
 */
export const fetchIndustries = async (): Promise<OrganizationIndustry[]> => {
  try {
    const response = await API.post(API_ENDPOINTS.ORGANIZATION.FETCH_INDUSTRIES);
    return response.organizationIndustry || response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.ORGANIZATION} Error fetching industries:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.ORGANIZATION.FETCH_INDUSTRIES_FAILED);
    throw new Error(errorMessage);
  }
};

/**
 * Fetch all company sizes
 */
export const fetchCompanySizes = async (): Promise<OrganizationSize[]> => {
  try {
    const response = await API.post(API_ENDPOINTS.ORGANIZATION.FETCH_COMPANY_SIZES);
    return response.organizationSize || response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.ORGANIZATION} Error fetching company sizes:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.ORGANIZATION.FETCH_COMPANY_SIZES_FAILED);
    throw new Error(errorMessage);
  }
};

/**
 * Upsert organization (create or update)
 */
export const upsertOrganization = async (data: UpdateOrganizationDto): Promise<Organization> => {
  try {
    // Convert base64 logo to Buffer if needed
    let logoBuffer = null;
    if (data.logo && data.logo.startsWith('data:image')) {
      // Extract base64 data
      const base64Data = data.logo.split(',')[1];
      logoBuffer = base64Data; // API will handle base64 string
    }

    const payload = {
      organizationId: data.organizationId,
      organizationName: data.organizationName,
      organizationDomain: data.organizationDomain || null,
      industryId: data.industryId,
      companySizeId: data.companySizeId,
      logo: logoBuffer,
      licenseKey: data.licenseKey,
    };

    const response = await API.post(API_ENDPOINTS.ORGANIZATION.UPSERT, payload);
    return response.data[0];
  } catch (error: any) {
    console.error(`${LOG_PREFIX.ORGANIZATION} Error upserting organization:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.ORGANIZATION.UPDATE_FAILED);
    throw new Error(errorMessage);
  }
};