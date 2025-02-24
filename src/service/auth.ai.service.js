import { privateAxios } from "../config/axios.config";

export const askAI = async (question, submissionId) => {
    try {
        const response = await privateAxios.post("/api/auth/ask-ai/", {
            question,
            submission_id: submissionId
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