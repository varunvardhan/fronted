import React from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { loginUser } from "../service/auth.service";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

      if (loginData.token?.access) {
        toast.success("Login Success");

      
        // Ensure roles are handled correctly
        const userRoles = loginData.user?.roles;
        const isSuperAdmin = Array.isArray(userRoles)
          ? userRoles.some((role) => role.roleName === "ROLE_SUPERADMIN")
          : userRoles?.roleName === "ROLE_SUPERADMIN";

        await login(loginData.token.access, { ROLE_SUPERADMIN: isSuperAdmin });

        console.log("Navigating to:", isSuperAdmin ? "/SuperAdmin" : "/dashboard");
        navigate(isSuperAdmin ? "/SuperAdmin" : "/dashboard");
      } else {
        throw new Error("Invalid login data - missing token");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 401:
            toast.error("Invalid credentials", { theme: "colored" });
            break;
          case 404:
            toast.error("User does not exist!");
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error(`Login failed: ${data?.message || error.response.statusText}`);
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
            <label className="block text-sm font-medium mb-1">Email or Username</label>
            <input
              {...register("identifier", {
                required: "Email or Username is required!",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,4}$|^[a-zA-Z0-9._]+$/,
                  message: "Enter a valid email or username",
                },
              })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter your email or username"
            />
            {errors.identifier && <span className="text-red-400 py-2 block px-2">{errors.identifier.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              {...register("password", { required: "Password is required!" })}
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
        </form>
      </div>
    </div>
  );
};

export default Login;
