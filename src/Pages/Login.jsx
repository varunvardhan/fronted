import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { loginUser } from "../service/auth.service";


const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log("Attempting login with:", { ...data, password: "***" });
  
    try {
      const loginData = await loginUser(data);
      console.log("Login response:", loginData);
  
      if (loginData.token && loginData.token.access) {
        toast.success("Login Success");
  
        // Ensure roles is handled correctly
        const userRoles = loginData.user?.roles;
        const isSuperAdmin =
          Array.isArray(userRoles) 
            ? userRoles.some(role => role.roleName === "ROLE_SUPERADMIN") 
            : userRoles?.roleName === "ROLE_SUPERADMIN";
  
        const userData = {
          ROLE_SUPERADMIN: isSuperAdmin,
        };
  
        await login(loginData.token.access, userData); // Ensure async state is updated
  
        console.log("Navigating to:", isSuperAdmin ? "/SuperAdmin" : "/dashboard");
  
        // Navigate only after login is fully set
        navigate(isSuperAdmin ? "/SuperAdmin" : "/dashboard");
      } else {
        throw new Error("Invalid login data - missing token");
      }
    } catch (error) {
      console.error("Login error:", error);
  
      if (error.response) {
        switch (error.response.status) {
          case 401:
            toast.error("Invalid credentials");
            break;
          case 404:
            toast.error("User does not exist!");
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error(`Login failed: ${error.response.data?.message || error.response.statusText}`);
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };
  

  return (
    <div className="bg-slate-300 min-h-screen flex items-center justify-center">
      <Helmet>
        <title>Login | BMI Copanalist</title>
      </Helmet>
      <div className="w-full max-w-md p-8 space-y-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center">Login Here</h2>
        <p className="text-sm text-center">Login to Dashboard..</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register("email", {
                required: "Email is Required!",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              type="email"
              className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter your email"
            />
            {errors.email && <span className="text-red-400 py-2 block px-2">{errors.email.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              {...register("password", { required: "Password is Required!" })}
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter your password"
            />
            {errors.password && <span className="text-red-400 py-2 block px-2">{errors.password.message}</span>}
          </div>
          <div className="flex space-x-4">
            <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Login
            </button>
            <button type="reset" className="w-full py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">
              Reset
            </button>
          </div>
          <div className="text-center mt-2">
            <button type="button" className="text-indigo-600 hover:underline" onClick={() => alert('Redirecting to Forgot Password')}>
              Forgot Password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
