/**
 * Common error handler for API errors
 * Extracts error message from various error structures including validation errors
 */
function handleApiError(error: any, defaultMessage: string): string {
  console.error("[Auth] API error:", error);
  
  // Check for validation errors array
  if (error?.data?.errors && Array.isArray(error.data.errors) && error.data.errors.length > 0) {
    // Get the first validation error message
    return error.data.errors[0].message;
  }
  
  // Check for other error message formats
  if (error?.data?.message) {
    return error.data.message;
  }
  
  if (error?.data?.error) {
    return error.data.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  // Return default message if no specific error found
  return defaultMessage;
}


// convert file to base64 
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }

export { handleApiError , fileToBase64 };