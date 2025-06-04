import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ManageStudent from "./ManageStudent";
import ManageClasses from "./ManageClasses";
import ManageSubjects from "./ManageSubjects";
import ManageStaff from "./ManageStaff";
import ManageTimetable from "./ManageTimetable";
import PendingUsersSection from './PendingUsersSection';
import { Menu, X } from 'lucide-react'; // for hamburger icons (install lucide-react if not)

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("pending-users");
  const [sidebarOpen, setSidebarOpen] = useState(false); // state for mobile menu
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const menuItems = [
    "dashboard",
    "Manage Classes",
    "Manage Student",
    "Manage Staff",
    "Manage Subjects",
    "Manage Timetable",
  ];

  return (
    <div className="flex h-screen">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#0077b6] text-white p-4 flex justify-between items-center z-50">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:static top-16 md:top-0 left-0 bg-[#0077b6] text-white w-64 p-6 h-full z-40 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <nav className="space-y-4 mt-4">
          {menuItems.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSidebarOpen(false); // close sidebar on mobile after click
              }}
              className={`block w-full text-left px-4 py-2 rounded ${activeTab === tab
                ? "bg-[#023e8a]"
                : "hover:bg-[#0096c7]"
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-[#c23760] hover:bg-red-700 text-white w-full text-left px-4 py-2 rounded mt-6"
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-gray-100 overflow-auto mt-16 md:mt-0">
        <h2 className="text-3xl font-semibold mb-4 capitalize">
          {activeTab}
        </h2>
        <div className="p-4 bg-white shadow rounded-lg">
          {activeTab === "dashboard" && <p>Welcome to the Admin Dashboard. Select an option from the sidebar.</p>}
          {activeTab === "Manage Classes" && <ManageClasses />}
          {activeTab === "Manage Student" && <ManageStudent />}
          {activeTab === "Manage Staff" && <ManageStaff />}
          {activeTab === "Manage Subjects" && <ManageSubjects />}
          {activeTab === "Manage Timetable" && <ManageTimetable />}
          {activeTab === 'pending-users' && <PendingUsersSection />}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
