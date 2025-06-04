import { useEffect, useState } from "react";
import axios from "axios";

const ManageStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [newStaff, setNewStaff] = useState({ staff_name: "", specialization: "" });
  const [editingStaff, setEditingStaff] = useState(null);

  useEffect(() => {
    fetchSchools();
    // fetchStaff();
  }, []);

  // Get authentication token
  const token = localStorage.getItem("token");

  // Fetch Schools
  const fetchSchools = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/staff/schools", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSchools(res.data);
    } catch (error) {
      console.error("Error fetching schools", error);
    }
  };

  // Fetch Departments
  const fetchDepartments = async (school_id) => {
    try {
      console.log("School Id:", school_id);
      console.log("token", token)
      const res = await axios.get(`http://localhost:5000/api/staff/departments/${school_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDepartments(res.data);
    } catch (error) {
      console.error("Error fetching departments", error);
    }
  };

  // Fetch Staff (with optional school_id and department_id)
  const fetchStaff = async (schoolId, departmentId) => {
    try {
      console.log("Fetching staff details:");
      let url = "http://localhost:5000/api/staff";

      // Add query parameters if school and department are selected
      if (schoolId && departmentId) {
        url += `?school_id=${schoolId}&department_id=${departmentId}`;
      }

      // Log the final URL for debugging
      console.log("Request URL:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStaffList(response.data);
      console.log("Filtered Staff Data:", response.data);
    } catch (error) {
      console.error("Error fetching staff", error);
    }

  };

  // Add Staff
  const handleAddStaff = async () => {
    if (!newStaff.staff_name || !newStaff.specialization || !selectedSchool || !selectedDepartment) {
      alert("All fields are required!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/staff",
        {          staff_name: newStaff.staff_name,
          specialization: newStaff.specialization,
          email_id: newStaff.email_id, // Use provided email
          school_id: parseInt(selectedSchool, 10),
          department_id: parseInt(selectedDepartment, 10),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewStaff({ staff_name: "", specialization: "" });
      fetchStaff(selectedSchool,selectedDepartment);
    } catch (error) {
      console.error("Error adding staff", error);
    }
  };

  // Edit Staff
  const handleEditStaff = async () => {
    if (!editingStaff.staff_name || !editingStaff.specialization || !selectedSchool || !selectedDepartment) {
      alert("All fields are required!");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/staff/${editingStaff.staff_id}`,
        {          staff_name: editingStaff.staff_name,
          specialization: editingStaff.specialization,
          email_id: editingStaff.email_id, // Use provided email
          school_id: selectedSchool,
          department_id: selectedDepartment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      console.error("Error updating staff", error);
    }
  };

  // Delete Staff
  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/staff/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Staff deleted successfully!");
      fetchStaff();
    } catch (error) {
      console.error("Error deleting staff", error);
      alert("Failed to delete staff. Please try again.");
    }
    fetchStaff(selectedSchool, selectedDepartment);

  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">Manage Staff</h2>

      {/* Select School & Department */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          onChange={(e) => {
            setSelectedSchool(e.target.value);
            fetchDepartments(e.target.value);
          }}
          className="p-2 border rounded w-full sm:w-1/2"
        >
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.school_id} value={s.school_id}>
              {s.school_name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="p-2 border rounded w-full sm:w-1/2"
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.department_id} value={d.department_id}>
              {d.department_name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Staff */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Staff Name"
          className="p-2 border rounded w-full sm:w-1/2"
          value={newStaff.staff_name || ""}
          onChange={(e) => setNewStaff({ ...newStaff, staff_name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Specialization"
          className="p-2 border rounded w-full sm:w-1/2"
          value={newStaff.specialization || ""}
          onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })}
        />

        <input
          type="text"
          placeholder="email_id"
          className="p-2 border rounded w-full sm:w-1/2"
          value={newStaff.email_id || ""}
          onChange={(e) => setNewStaff({ ...newStaff, email_id: e.target.value })}
        />

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto"
          onClick={handleAddStaff}
        >
          Add
        </button>
      </div>

      <div className="flex justify-center mb-4">
        <button
          disabled={!selectedSchool || !selectedDepartment}
          className={`px-6 py-2 ${!selectedSchool || !selectedDepartment ? 'bg-gray-400' : 'bg-green-600'} text-white rounded hover:bg-green-700`}
          onClick={() => fetchStaff(selectedSchool, selectedDepartment)}
        >
          Load Staff Details
        </button>

      </div>

      {/* Staff Table */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Specialization</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">School</th>
              <th className="p-2 text-left">Department</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => (
              <tr key={staff.staff_id} className="border-t">
                <td className="p-2">{staff.name}</td>
                <td className="p-2">{staff.specialization}</td>
                <td className="p-2">{staff.email_id}</td>
                <td className="p-2">{staff.school_name}</td>
                <td className="p-2">{staff.department_name}</td>
                <td className="p-2 text-center">
                  <div className="flex justify-center space-x-4">
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleDeleteStaff(staff.staff_id)}
                    >
                      Delete
                    </button>
                    {/* Future: Edit button */}
                    {/* <button className="text-blue-500 hover:underline" onClick={() => handleEditStaff(staff.staff_id)}>Edit</button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

};

export default ManageStaff;
