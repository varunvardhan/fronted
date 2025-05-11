// src/Pages/SuperAdmin.jsx
import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { removeUserData } from "../Helper/LocalStorageHelper";
import { LogOut, Menu, X } from "lucide-react";
import { Sidebar, SidebarItem, SidebarItemGroup } from "flowbite-react";
import { HiShoppingBag, HiChartBar } from "react-icons/hi";
import { FaBorderAll } from "react-icons/fa6";

export default function SuperAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    removeUserData();
    navigate("/");
  };

  const navigationItems = [
    { path: "admin-register", Icon: HiShoppingBag, label: "Register" },
    { path: "users", Icon: FaBorderAll, label: "Users" },
    { path: "user-stats", Icon: HiChartBar, label: "User Stats" },
  ];

  // Highlight active route
  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-semibold">BMI Copilot Beta</h1>
        <h2 className="hidden sm:block text-lg font-medium">Welcome to SuperAdmin</h2>
        {isMobile && (
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-white">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-white-900 text-white p-5 transition-transform duration-300 z-30 shadow-lg 
            ${isMobile ? (isMenuOpen ? "translate-x-0" : "-translate-x-full") : "relative translate-x-0"}`}
        >
          <Sidebar className="h-full">
            <SidebarItemGroup className="space-y-3">
              {navigationItems.map(({ path, Icon, label }) => (
                <SidebarItem 
                  key={path} 
                  as={Link} 
                  to={path} 
                  onClick={() => setIsMenuOpen(false)}
                  active={isActive(path)}
                >
                  <Icon className="mr-3" size={22} /> {label}
                </SidebarItem>
              ))}
              <SidebarItem className="text-red-500 hover:text-red-600" onClick={handleLogout}>
                <LogOut className="mr-3" size={22} /> Logout
              </SidebarItem>
            </SidebarItemGroup>
          </Sidebar>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-2 overflow-auto bg-white rounded-lg shadow-sm">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}