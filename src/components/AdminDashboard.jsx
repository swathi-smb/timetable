import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ManageStudent from "./ManageStudent";
import ManageClasses from "./ManageClasses";
import ManageSubjects from "./ManageSubjects";
import ManageStaff from "./ManageStaff";
import ManageTimetable from "./ManageTimetable";
import PendingUsersSection from './PendingUsersSection';
import { Menu, X } from 'lucide-react';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("pending-users"); // Set default tab to pending users
  const [sidebarOpen, setSidebarOpen] = useState(false); // state for mobile menu
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("token: ", localStorage.getItem("token"));
    localStorage.removeItem("token");
    navigate("/");
  };

  const tabs = [
    "dashboard",
    "Manage Classes",
    "Manage Student",
    "Manage Staff",
    "Manage Subjects",
    "Manage Timetable",
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen relative">

      {/* Mobile Menu Icon */}
      <div className="md:hidden flex justify-between items-center bg-[#0077b6] text-white p-4">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button onClick={() => setSidebarOpen(true)}>
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <aside className="bg-[#0077b6] text-white w-64 p-6 hidden md:flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
          <nav className="space-y-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`block w-full text-left px-4 py-2 rounded ${
                  activeTab === tab ? "bg-[#023e8a]" : "hover:bg-[#0096c7]"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="bg-[#c23760] hover:bg-red-700 text-white w-full text-left px-20 py-2 rounded mt-6"
        >
          Logout
        </button>
      </aside>

      {/* Sidebar for Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="bg-[#0077b6] text-white w-64 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <nav className="space-y-4">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setSidebarOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 rounded ${
                      activeTab === tab
                        ? "bg-[#023e8a]"
                        : "hover:bg-[#0096c7]"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
                  </button>
                ))}
              </nav>
            </div>
            <button
              onClick={() => {
                handleLogout();
                setSidebarOpen(false);
              }}
              className="bg-[#c23760] hover:bg-red-700 text-white w-full text-left px-4 py-2 rounded mt-6"
            >
              Logout
            </button>
          </div>
          {/* Backdrop */}
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100 overflow-auto">
        <h2 className="text-3xl font-semibold mb-4">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("-", " ")}
        </h2>
        <div className="p-4 bg-white shadow rounded-lg">
          {activeTab === "dashboard" && (
            <p>Welcome to the Admin Dashboard. Select an option from the sidebar.</p>
          )}
          {activeTab === "Manage Classes" && <ManageClasses />}
          {activeTab === "Manage Student" && <ManageStudent />}
          {activeTab === "Manage Staff" && <ManageStaff />}
          {activeTab === "Manage Subjects" && <ManageSubjects />}
          {activeTab === "Manage Timetable" && <ManageTimetable />}
          {activeTab === "pending-users" && <PendingUsersSection />}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
