import axios from "axios";
import { privateAxios } from "../config/axios.config";

export const createAdmin = async (userObject) => {
    try {
        console.log("Received userObject:", userObject);
        const response = await privateAxios.post("/api/auth/create-user/", userObject);
       
        return response.data;
    } catch (error) {
        console.error("Error creating admin:", error.response?.data || error.message);

        // Handle different types of errors
        if (error.response) {
            // Server responded with a status code outside of 2xx
            throw new Error(error.response.data?.message || `Request failed with status ${error.response.status}`);
        } else if (error.request) {
            // Request was made but no response received (network issue, timeout, etc.)
            throw new Error("No response from server. Please check your network connection.");
        } else {
            // Other unexpected errors
            throw new Error("An unexpected error occurred while creating admin.");
        }
    }
};
