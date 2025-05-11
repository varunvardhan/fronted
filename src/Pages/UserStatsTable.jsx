import React, { useState, useEffect, useMemo } from "react";
import { fetchUserUsageStats } from "../service/users.service";
import { toast } from "react-hot-toast";
import { Helmet } from "react-helmet";
import { Loader2, Search, ChevronDown, ChevronUp } from "lucide-react";

const UserStatsTable = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "user_id",
    direction: "ascending"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const statsPerPage = 10;

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUserUsageStats();
      if (response.user_usage_summary) {
        setStats(response.user_usage_summary);
        toast.success("Stats loaded successfully");
      } else {
        throw new Error("Invalid data format");
      }
    } catch (err) {
      console.error("Fetch error details:", err);
      setError(err.message);
      toast.error(err.message);
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

  // Filter stats based on search term
  const filteredStats = useMemo(() => {
    if (!searchTerm) return stats;
    return stats.filter(stat => 
      (stat.username && stat.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (stat.email && stat.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (stat.user_id && stat.user_id.toString().includes(searchTerm))
    );
  }, [searchTerm, stats]);

  // Sort stats
  const sortedStats = useMemo(() => {
    let sortableItems = [...filteredStats];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] == null && b[sortConfig.key] == null) return 0;
        if (a[sortConfig.key] == null) return sortConfig.direction === "ascending" ? 1 : -1;
        if (b[sortConfig.key] == null) return sortConfig.direction === "ascending" ? -1 : 1;
        
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
  }, [filteredStats, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedStats.length / statsPerPage);
  const currentStats = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * statsPerPage;
    const lastPageIndex = firstPageIndex + statsPerPage;
    return sortedStats.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, sortedStats, statsPerPage]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Render sort indicator
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? 
      <ChevronUp className="inline ml-1 h-4 w-4" /> : 
      <ChevronDown className="inline ml-1 h-4 w-4" />;
  };

  // Format null values for display
  const formatValue = (value) => {
    if (value == null) return "-";
    return value;
  };

  return (
    <div className="p-4">
      <Helmet>
        <title>User Statistics | BMI Copilot</title>
      </Helmet>

      <div className="max-w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h1 className="text-xl font-semibold text-gray-800">User Statistics</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <button
              onClick={fetchStats}
              disabled={loading}
              className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Refreshing...
                </>
              ) : (
                "Refresh"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: "user_id", label: "ID" },
                    { key: "username", label: "Username" },
                    { key: "email", label: "Email" },
                    { key: "date_joined", label: "Joined" },
                    { key: "last_login", label: "Last Login" },
                    { key: "total_logins", label: "Logins" },
                    { key: "number_of_jds", label: "JDs" },
                    { key: "number_of_cvs", label: "CVs" },
                    { key: "number_of_analyses", label: "Analyses" },
                    { key: "date_of_last_usage", label: "Last Active" }
                  ].map(({ key, label }) => (
                    <th 
                      key={key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort(key)}
                    >
                      <div className="flex items-center">
                        {label}
                        {renderSortIcon(key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStats.length > 0 ? (
                  currentStats.map((stat) => (
                    <tr key={stat.user_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-[80px] truncate">
                        {stat.user_id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[120px] truncate">
                        {stat.username}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[180px] truncate">
                        {stat.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[100px] truncate">
                        {formatValue(stat.date_joined)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[100px] truncate">
                        {formatValue(stat.last_login)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {stat.total_logins}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {stat.number_of_jds}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {stat.number_of_cvs}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {stat.number_of_analyses}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[100px] truncate">
                        {formatValue(stat.date_of_last_usage)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-4 py-6 text-center text-sm text-gray-500">
                      {loading ? "Loading statistics..." : "No matching records found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-xs text-gray-600">
                Showing <span className="font-medium">{(currentPage - 1) * statsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * statsPerPage, sortedStats.length)}
                </span>{' '}
                of <span className="font-medium">{sortedStats.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
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
                      className={`px-2.5 py-1 text-xs rounded min-w-[32px] ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
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

export default UserStatsTable;