import axios from "axios";
import { getUserLoginData } from "../Helper/LocalStorageHelper";


const baseurl = "https://stage.copanelist.bookmyinterview.in";
//const baseurl = "http://127.00.1:9000";
//const baseurl = "http://3.108.63.116";


// Public axios instance (no auth)
export const publicAxios = axios.create({
    baseURL: baseurl,
    timeout: 120000,
});

// Private axios instance (with auth)
export const privateAxios = axios.create({
    baseURL: baseurl,
    timeout: 120000,
});

// Add auth interceptor to private axios
privateAxios.interceptors.request.use(
    (config) => {
        const userData = getUserLoginData();
        if (userData && userData.token) {
            config.headers.Authorization = `Bearer ${userData.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Bulk upload resume analysis with proper auth
export const analyzeResumesBulk = async (jobDescription, resumes, notes, cv_notes) => {
    const formData = new FormData();
    formData.append("job_description", jobDescription);
    formData.append("additional_notes", notes);
    formData.append("cv_notes", cv_notes);

    resumes.forEach((resume) => {
        formData.append("resume", resume);
    });

    try {
        const response = await privateAxios.post("/api/auth/screening/analyze/", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        // Response validation
        if (!response.data?.results) {
            return {
                success: false,
                message: "Invalid response format: missing results array",
                errorType: "api",
                statusCode: 200 // Special case for malformed successful response
            };
        }

        return { 
            success: true, 
            data: response.data
        };
    } catch (error) {
        // Network Error (no response received)
        if (error.code === 'ERR_NETWORK') {
            return {
                success: false,
                message: "Network error: Please check your internet connection",
                errorType: "network"
            };
        }
        
        // API Error (received response with error status)
        if (error.response) {
            // 401 Unauthorized
            if (error.response.status === 401) {
                return { 
                    success: false, 
                    message: "Unauthorized! Please log in again.",
                    errorType: "authentication",
                    statusCode: 401
                };
            }
            
            // Other API errors
            return {
                success: false,
                message: error.response.data?.message || "API Error: Failed to analyze resumes",
                errorType: "api",
                statusCode: error.response.status
            };
        }
        
        // Other Axios errors (timeouts, cancelations)
        return {
            success: false,
            message: error.message || "Request failed",
            errorType: "request"
        };
    }
};

// Fetch detailed analysis for a candidate
export const fetchCandidateAnalysis = async (submissionId) => {
    try {
        const response = await privateAxios.get(`/api/auth/screening-analysis/${submissionId}/`);
        
        // Response validation
        if (!response.data?.ai_analysis) {
            return {
                success: false,
                message: "Invalid response format: missing analysis data",
                errorType: "api",
                statusCode: 200
            };
        }

        return { 
            success: true, 
            data: response.data 
        };
    } catch (error) {
        // Network Error
        if (error.code === 'ERR_NETWORK') {
            return {
                success: false,
                message: "Network error: Please check your internet connection",
                errorType: "network"
            };
        }
        
        // API Error
        if (error.response) {
            // 401 Unauthorized
            if (error.response.status === 401) {
                return { 
                    success: false, 
                    message: "Unauthorized! Please log in again.",
                    errorType: "authentication",
                    statusCode: 401
                };
            }
            
            // Other API errors
            return {
                success: false,
                message: error.response.data?.message || "API Error: Failed to fetch analysis",
                errorType: "api",
                statusCode: error.response.status
            };
        }
        
        // Other Axios errors
        return {
            success: false,
            message: error.message || "Request failed",
            errorType: "request"
        };
    }
}; 

// Fetch user usage statistics
export const fetchUserUsageStats = async () => {
    console.log('[fetchUserUsageStats] Starting to fetch user usage stats');
    
    try {
        console.log('[fetchUserUsageStats] Making API request to /api/auth/admin/user-usage-stats/');
        const response = await privateAxios.get("/api/auth/admin/user-usage-stats/");
        
        console.log('[fetchUserUsageStats] API response received:', {
            status: response.status,
            data: response.data,
            headers: response.headers
        });

        // Response validation
        if (!response.data?.user_usage_summary) {
            console.error('[fetchUserUsageStats] Invalid response format - missing user_usage_summary');
            return {
                success: false,
                message: "Invalid response format: missing user_usage_summary",
                errorType: "api",
                statusCode: 200
            };
        }

        console.log('[fetchUserUsageStats] Successfully fetched user stats:', {
            count: response.data.user_usage_summary.length,
            sample: response.data.user_usage_summary[0] // Show first item as sample
        });

        return { 
            success: true, 
            data: response.data.user_usage_summary 
        };
    } catch (error) {
        console.error('[fetchUserUsageStats] Error occurred:', error);
        
        // Network Error
        if (error.code === 'ERR_NETWORK') {
            console.error('[fetchUserUsageStats] Network error:', error.message);
            return {
                success: false,
                message: "Network error: Please check your internet connection",
                errorType: "network"
            };
        }
        
        // API Error
        if (error.response) {
            console.error('[fetchUserUsageStats] API error response:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });

            // 401 Unauthorized
            if (error.response.status === 401) {
                console.error('[fetchUserUsageStats] Authentication failed - 401 Unauthorized');
                return { 
                    success: false, 
                    message: "Unauthorized! Please log in again.",
                    errorType: "authentication",
                    statusCode: 401
                };
            }
            
            // Other API errors
            console.error('[fetchUserUsageStats] API error:', error.response.data?.message || 'Unknown API error');
            return {
                success: false,
                message: error.response.data?.message || "API Error: Failed to fetch user stats",
                errorType: "api",
                statusCode: error.response.status
            };
        }
        
        // Other Axios errors
        console.error('[fetchUserUsageStats] Request failed:', error.message || 'Unknown request error');
        return {
            success: false,
            message: error.message || "Request failed",
            errorType: "request"
        };
    } finally {
        console.log('[fetchUserUsageStats] API call completed');
    }
};


// For Resum fetch and view 
// Helper function to get file extension from MIME type
const getFileExtension = (mimeType) => {
    const extensions = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/octet-stream': 'bin' // fallback
    };
    return extensions[mimeType.toLowerCase()] || 'bin';
  };
  
  // Configure axios instance
  const apiClient = axios.create({
    baseURL: 'https://stage.copanelist.bookmyinterview.in/api/auth',
    headers: {
      'Accept': 'application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/octet-stream',
    }
  });
  
  // Add response interceptor to handle blob responses
  apiClient.interceptors.response.use(
    (response) => {
      if (response.config.responseType === 'blob') {
        const fileType = response.headers['content-type'] || response.data.type || 'application/pdf';
        const blob = new Blob([response.data], { type: fileType });
        
        return {
          data: {
            url: URL.createObjectURL(blob),
            type: fileType,
            name: `resume_${response.config.submissionId || 'unknown'}.${getFileExtension(fileType)}`
          }
        };
      }
      return response;
    },
    (error) => {
      console.error('Axios error:', error);
      return Promise.reject(error);
    }
  );
  
  // Export the configured fetch function
  export const fetchResumeFromApi = async (submissionId) => {
    try {
        
      const response = await apiClient.get(`/temp-resume/${submissionId}/`, {
        responseType: 'blob',
        submissionId // Pass submissionId to access it in the interceptor
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching resume:', error);
      throw error;
    }
  };

  // =====================
// Create Interview Link (Job Snippet)
// =====================
export const createInterviewLink = async (jobData) => {
  try {
    const response = await privateAxios.post(
      "/api/auth/jobs/create-interview-link/",
      jobData
    );

    return {
      success: true,
      data: response.data,
      statusCode: response.status,
    };
  } catch (error) {
    // Network Error (no response received)
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Network error: Please check your internet connection",
        errorType: "network",
      };
    }

    // API Error (received response with error status)
    if (error.response) {
      // 401 Unauthorized
      if (error.response.status === 401) {
        return {
          success: false,
          message: "Unauthorized! Please log in again.",
          errorType: "authentication",
          statusCode: 401,
        };
      }

      // Other API errors
      return {
        success: false,
        message:
          error.response.data?.message ||
          "API Error: Failed to create interview link",
        errorType: "api",
        statusCode: error.response.status,
      };
    }

    // Other Axios errors (timeouts, cancelations, etc.)
    return {
      success: false,
      message: error.message || "Request failed",
      errorType: "request",
    };
  }
};

export const fetchJobByJobId = async (jobId) => {
  try {
    const response = await publicAxios.get(`/api/auth/jobs/${jobId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleAxiosErrors(error);
  }
};

/*
export const submitCandidateInterview = async (jobId, candidate) => {
  try {
    const formData = new FormData();
    formData.append("job_id", jobId);
    formData.append("name", candidate.name);
    formData.append("email", candidate.email);
    formData.append("resume", candidate.resume);

    const response = await publicAxios.post(
      `/api/auth/jobs/submit-interview/`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    return handleAxiosErrors(error);
  }
};*/
