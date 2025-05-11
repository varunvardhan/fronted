import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { createAdmin } from "../service/auth.createUsers";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet";
import { ClipboardCopy, Loader2 } from "lucide-react";

const Signup = () => {
  const [registeredUser, setRegisteredUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const userData = await createAdmin(data);
      setRegisteredUser(userData);
      setIsRegistered(true);
      reset();
      toast.success("User successfully created!");
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) {
      toast.error("Nothing to copy!");
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Helmet>
        <title>Signup | BMI Copilot</title>
      </Helmet>

      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          {!isRegistered ? (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                Create User/Admin Account
              </h1>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Email or Username *
                  </label>
                  <input
                    {...register("identifier", {
                      required: "Email or Username is required",
                      pattern: {
                        value: /^(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,4}|[a-zA-Z0-9._]+)$/,
                        message: "Enter a valid email or username",
                      },
                    })}
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                      errors.identifier
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-indigo-500"
                    }`}
                    placeholder="email@example.com or username"
                    autoComplete="username"
                  />
                  {errors.identifier && (
                    <p className="mt-1 text-red-500 text-sm">{errors.identifier.message}</p>
                  )}
                </div>

                {/* New Admin Checkbox */}
                <div className="flex items-center">
                  <input
                    {...register("is_admin")}
                    type="checkbox"
                    id="is_admin"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_admin" className="ml-2 block text-sm text-gray-700">
                    Admin User 
                  </label>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Processing...
                      </>
                    ) : (
                      "Register"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                    disabled={isLoading}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Registration Successful</h2>
                <p className="text-gray-600 mt-1">Save these credentials securely</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                  <div className="truncate">
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium text-gray-800 truncate">
                      {registeredUser?.username || "N/A"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(registeredUser?.username)}
                    className="ml-2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                    title="Copy to clipboard"
                  >
                    <ClipboardCopy size={18} />
                  </button>
                </div>

                <div className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Temporary Password</p>
                    <p className="font-medium text-gray-800">
                      {registeredUser?.temporary_password || "N/A"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(registeredUser?.temporary_password)}
                    className="ml-2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                    title="Copy to clipboard"
                  >
                    <ClipboardCopy size={18} />
                  </button>
                </div>

                {/* Display Admin Status if needed */}
                {registeredUser?.is_admin !== undefined && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Admin Status</p>
                    <p className="font-medium text-gray-800">
                      {registeredUser.is_admin ? "Admin User" : "Regular User"}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsRegistered(false)}
                className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Register Another User
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;