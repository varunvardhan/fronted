import { privateAxios } from "../config/axios.config";
import { getUserLoginData } from "../Helper/LocalStorageHelper";

// Common error handler
const handleApiError = (error) => {
  console.error("API Error:", {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    code: error.code,
    config: error.config
  });

  let errorMessage = error.message;

  if (error.response) {
    switch (error.response.status) {
      case 401:
        errorMessage = "Session expired. Please log in again.";
        break;
      case 403:
        errorMessage = "You don't have permission to access this resource.";
        break;
      case 404:
        errorMessage = "Endpoint not found. Please check the API URL.";
        break;
      default:
        errorMessage = error.response.data?.message || 
                      error.response.data?.detail || 
                      "Request failed";
    }
  } else if (error.code === 'ERR_NETWORK') {
    errorMessage = "Network error. Please check your internet connection.";
  }

  throw new Error(errorMessage);
};

// Common request handler
const makeAuthenticatedRequest = async (endpoint, expectedDataField) => {
  const userData = getUserLoginData();
  
  if (!userData?.token) {
    throw new Error("No authentication token found. Please log in.");
  }

  console.log(`Making request to ${endpoint}`);
  const response = await privateAxios.get(endpoint);
  console.log("API Response:", response);

  if (!response.data?.[expectedDataField]) {
    console.warn("Unexpected response structure:", response.data);
    throw new Error(`Invalid response format - missing ${expectedDataField}`);
  }

  return response.data;
};

// API functions
export const getUsersList = async () => {
  try {
    return await makeAuthenticatedRequest("/api/auth/users_list/", "users");
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchUserUsageStats = async () => {
  try {
    return await makeAuthenticatedRequest("/api/auth/admin/user-usage-stats/", "user_usage_summary");
  } catch (error) {
    return handleApiError(error);
  }
};

//delete user in super admin panel
export const deleteUser = async (userId) => {
  try {
    const userData = getUserLoginData();
    
    if (!userData?.token) {
      throw new Error("No authentication token found. Please log in.");
    }

    // Try multiple endpoint variations if needed
    const endpointsToTry = [
      `/api/auth/users/${userId}/delete/`
    ];

    let lastError = null;

    for (const endpoint of endpointsToTry) {
      try {
        const response = await privateAxios.delete(endpoint, {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
          }
        });

        if ([200, 201, 204].includes(response.status)) {
          return response.data;
        }
      } catch (error) {
        lastError = error;
        console.warn(`Attempt failed for endpoint ${endpoint}:`, error);
        continue;
      }
    }

    throw lastError || new Error("All delete attempts failed");
  } catch (error) {
    console.error("Delete user error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });

    let errorMessage = "Failed to delete user";
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = "Session expired. Please log in again.";
          break;
        case 403:
          errorMessage = "You don't have permission to delete users.";
          break;
        case 404:
          errorMessage = "User not found.";
          break;
        case 405:
          errorMessage = "Delete method not allowed for this endpoint.";
          break;
        default:
          errorMessage = error.response.data?.message || 
                       error.response.data?.detail || 
                       "Failed to delete user";
      }
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = "Network error. Please check your connection.";
    }

    throw new Error(errorMessage);
  }
};