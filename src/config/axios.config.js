import axios from "axios";
import { getUserLoginData } from "../Helper/LocalStorageHelper";

const baseurl = "http://stage.copanelist.bookmyinterview.in";
//const baseurl = "http://127.00.1:9000";
//const baseurl = "http://3.108.63.116";

// Public axios instance (no auth)
export const publicAxios = axios.create({
    baseURL: baseurl,
    timeout: 30000,
});

// Private axios instance (with auth)
export const privateAxios = axios.create({
    baseURL: baseurl,
    timeout: 30000,
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
export const analyzeResumesBulk = async (jobDescription, resumes, notes) => {
    const formData = new FormData();
    formData.append("job_description", jobDescription);
    formData.append("additional_notes", notes);

    // Append multiple resume files
    resumes.forEach((resume, index) => {
        formData.append("resume", resume); // Ensure backend expects multiple files under "resume"
    });

    try {
        const response = await privateAxios.post("/api/auth/screening/analyze/", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return { success: false, message: "Unauthorized! Please log in again." };
        }
        return {
            success: false,
            message: error.response?.data?.message || "Failed to connect to the server."
        };
    }
};

// Fetch detailed analysis for a candidate
export const fetchCandidateAnalysis = async (submissionId) => {
    try {
      const response = await privateAxios.get(`/api/auth/screening-analysis/${submissionId}/`);
      return { success: true, data: response.data };
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return { success: false, message: "Unauthorized! Please log in again." };
      }
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch candidate analysis.",
      };
    }
  };

  

 