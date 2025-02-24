import { privateAxios } from "../config/axios.config";  // Use privateAxios for auth

import { getUserLoginData } from "../Helper/LocalStorageHelper";


// Place this outside your function to ensure it runs
console.log("Script loading");

export const getUsersList = async () => {
    console.log("Function called");
    try {
        console.log("Before getting user data");
        const userData = getUserLoginData();
        console.log("User data retrieved:", userData);

        if (!userData || !userData.token) {
            throw new Error("No authentication token found. Please log in.");
        }

        console.log("About to make request");
        // Log the full request URL that will be used
        console.log("Request URL:", "/api/auth/users_list");
        
        const response = await privateAxios.get("/api/auth/users_list");
        console.log("Response received:", response);
        
        return response.data;
    } catch (error) {
        console.log("Type of error:", typeof error);
        console.log("Error name:", error.name);
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
        
        if (error.request) {
            console.log("Request was made but no response received");
        }
        
        throw error;
    }
};