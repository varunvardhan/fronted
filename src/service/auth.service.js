import { publicAxios } from "../config/axios.config";
import { saveLoginDta } from "../Helper/LocalStorageHelper";

export const createUser = async (userObject) => {
  const result = await publicAxios.post("/users", userObject);
  return result.data;
};

export const loginUser = async (loginData) => {
  try {
    console.log("User input password:", loginData.password); // This shows the exact input
    console.log("Actual JSON stringified:", JSON.stringify(loginData, null, 2)); // Log request JSON

    const result = await publicAxios.post("/api/auth/login", loginData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return result.data;

    // If login is successful, store token in localStorage
    if (result.data && result.data.token && result.data.token.access) {
      const userData = {
        is_admin: result.data.is_admin,
        is_superadmin: result.data.is_superadmin
      };
      saveLoginDta(result.data.token.access, userData);
    }

    return result.data;
  } catch (error) {
    console.error("Login error:", error.response || error);
    throw error;
  }
};
export const saveLoginData = (token, userData) => {
  localStorage.setItem('token', token);
  localStorage.setItem('userData', JSON.stringify(userData));
};

export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};