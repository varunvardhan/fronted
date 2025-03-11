import axios from "axios";
import { getUserLoginData} from "../Helper/LocalStorageHelper";

const baseurl = "https://copanelist.bookmyinterview.in";
//const baseurl = "http://127.00.1:8000";

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

// Create a function for the resume analysis with proper auth
export const analyzeResume = async (jobDescription, resume, notes) => {
    const formData = new FormData();
    formData.append("job_description", jobDescription);
    formData.append("resume", resume);
    formData.append("additional_notes", notes);

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


