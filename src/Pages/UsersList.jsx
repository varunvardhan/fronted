import React, { useState, useEffect, useMemo } from "react";
import { getUsersList, deleteUser } from "../service/users.service"; 
import { toast } from "react-hot-toast";
import { Helmet } from "react-helmet";
import { Loader2, Search, ChevronDown, ChevronUp, Copy, ClipboardCheck, Trash } from "lucide-react";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "ascending"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedPassword, setCopiedPassword] = useState(null);
  const usersPerPage = 10; // Changed to 10 for better testing

  //delete user function
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to permanently delete this user?")) {
      try {
        setLoading(true);
        await deleteUser(userId);
        toast.success("User deleted successfully");
        
        // Optimistically update the UI instead of full refresh
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        
        // Reset pagination if needed
        if (currentUsers.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      } catch (err) {
        console.error("Delete error details:", err);
        toast.error(
          err.response?.data?.message || 
          err.message || 
          "Failed to delete user. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }
  };


  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsersList();
      if (response && response.users) {
        setUsers(response.users);
        setCurrentPage(1); // Reset to first page on new fetch
        toast.success(`${response.users.length} users fetched successfully`);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to fetch users");
      toast.error(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Handle sort request
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user => 
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.id && user.id.toString().includes(searchTerm))
    );
  }, [searchTerm, users]);

  // Sort users
  const sortedUsers = useMemo(() => {
    let sortableItems = [...filteredUsers];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        // Handle null/undefined values
        if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
        if (!a[sortConfig.key]) return 1;
        if (!b[sortConfig.key]) return -1;
        
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredUsers, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const currentUsers = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * usersPerPage;
    const lastPageIndex = firstPageIndex + usersPerPage;
    return sortedUsers.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, sortedUsers, usersPerPage]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Render sort indicator
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? 
      <ChevronUp className="inline ml-1 h-4 w-4" /> : 
      <ChevronDown className="inline ml-1 h-4 w-4" />;
  };

  // Copy to clipboard function
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${type} copied to clipboard`);
        if (type === 'password') {
          setCopiedPassword(text);
          setTimeout(() => setCopiedPassword(null), 2000);
        }
      })
      .catch(() => toast.error("Failed to copy"));
  };

  return (
    <div className="p-6">
      <Helmet>
        <title>User List | BMI Copilot</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by ID, username or email..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center disabled:opacity-50 min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Loading...
                </>
              ) : (
                "Refresh"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("id")}
                  >
                    <div className="flex items-center">
                      ID
                      {renderSortIcon("id")}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("username")}
                  >
                    <div className="flex items-center">
                      Username
                      {renderSortIcon("username")}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("email")}
                  >
                    <div className="flex items-center">
                      Email
                      {renderSortIcon("email")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Password Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delete
                </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="truncate max-w-[180px]">{user.email}</span>
                          <button 
                            onClick={() => copyToClipboard(user.email, 'email')}
                            className="ml-2 text-gray-400 hover:text-indigo-600"
                            title="Copy email"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.password ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {user.password ? "Password Set" : "No Password"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.password && (
                          <button
                            onClick={() => copyToClipboard(user.password, 'password')}
                            className={`flex items-center text-xs ${
                              copiedPassword === user.password 
                                ? 'text-green-600' 
                                : 'text-indigo-600 hover:text-indigo-800'
                            }`}
                            title="Copy password"
                          >
                            {copiedPassword === user.password ? (
                              <>
                                <ClipboardCheck size={14} className="mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={14} className="mr-1" />
                                Copy Password
                              </>
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={loading}
                        className="flex items-center text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Delete user permanently"
                      >
                        {loading ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="mr-1 h-4 w-4" />
                        )}
                        Delete
                      </button>
                    </td>
                    </tr>

                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      {loading ? "Loading users..." : "No users found matching your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="mb-2 sm:mb-0 text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * usersPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * usersPerPage, sortedUsers.length)}
                </span>{' '}
                of <span className="font-medium">{sortedUsers.length}</span> users
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                  title="First page"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                  title="Previous page"
                >
                  ‹
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-md text-sm font-medium min-w-[40px] ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                  title="Next page"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                  title="Last page"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;