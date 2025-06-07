import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiPath } from '../path/apiPath';

function ManageStudent() {
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [availableSemesters, setAvailableSemesters] = useState([]);
  
  const [newStudent, setNewStudent] = useState({
    name: '',
    roll_number: '',
    semester: ''
  });

  // Get token from sessionStorage
  const getAuthToken = () => {
    return sessionStorage.getItem('token');
  };

  // Configure axios defaults
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, []);

  // Fetch departments when school is selected
  useEffect(() => {
    if (selectedSchool) {
      fetchDepartments();
    }
  }, [selectedSchool]);

  // Fetch courses when department is selected
  useEffect(() => {
    if (selectedDepartment) {
      fetchCourses();
    }
  }, [selectedDepartment]);

  // Update available semesters when course is selected
  useEffect(() => {
    const fetchAvailableSemesters = async () => {
      if (selectedCourse) {
        try {
          const response = await axios.get(`${apiPath}/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses/${selectedCourse}/classes`, {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`
            }
          });
          
          console.log('Classes response:', response.data);
          
          // Check if response.data is an array or has a classes property
          const classesData = Array.isArray(response.data) ? response.data : 
                            response.data.classes ? response.data.classes : [];
          
          // Get unique semesters from classes
          const semesters = [...new Set(classesData.map(cls => cls.semester))].sort((a, b) => a - b);
          console.log('Available semesters:', semesters);
          setAvailableSemesters(semesters);
        } catch (error) {
          console.error('Error fetching available semesters:', error);
          setAvailableSemesters([]);
        }
      } else {
        setAvailableSemesters([]);
      }
    };

    if (selectedCourse) {
      fetchAvailableSemesters();
    }
  }, [selectedCourse, selectedSchool, selectedDepartment]);

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/schools`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      setSchools(response.data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/schools/${selectedSchool}/departments`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async () => {
    if (!selectedSchool || !selectedDepartment || !selectedCourse) {
      alert('Please select school, department and course first');
      return;
    }

    try {
      const response = await axios.get(`${apiPath}/api/student`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        },
        params: {
          school_id: selectedSchool,
          department_id: selectedDepartment,
          course_id: selectedCourse
        }
      });
      console.log('Students data:', response.data);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert(error.response?.data?.message || 'Failed to fetch students');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiPath}/api/student`, 
        {
          ...newStudent,
          school_id: selectedSchool,
          department_id: selectedDepartment,
          course_id: selectedCourse
        },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`
          }
        }
      );
      
      // Clear form and refresh students
      setNewStudent({
        name: '',
        roll_number: '',
        semester: ''
      });
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      // Show error message to user
      alert(error.response?.data?.message || 'Failed to add student');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      await axios.delete(`${apiPath}/api/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert(error.response?.data?.message || 'Failed to delete student');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Students</h2>
      
      {/* Student Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* School Selection */}
            <select 
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select School</option>
              {schools.map(school => (
                <option key={school.school_id} value={school.school_id}>
                  {school.school_name}
                </option>
              ))}
            </select>

            {/* Department Selection */}
            <select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={!selectedSchool}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.department_id} value={dept.department_id}>
                  {dept.department_name}
                </option>
              ))}
            </select>

            {/* Course Selection */}
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={!selectedDepartment}
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>

            {/* Semester */}
            <select
              value={newStudent.semester}
              onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={!selectedCourse}
            >
              <option value="">Select Semester</option>
              {availableSemesters.map(num => (
                <option key={num} value={num}>Semester {num}</option>
              ))}
            </select>

            {/* Student Name */}
            <input
              type="text"
              placeholder="Student Name"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              className="w-full p-2 border rounded"
            />

            {/* Roll Number */}
            <input
              type="text"
              placeholder="Roll Number"
              value={newStudent.roll_number}
              onChange={(e) => setNewStudent({ ...newStudent, roll_number: e.target.value })}
              className="w-full p-2 border rounded"
            />

            
          </div>

          <button 
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={!selectedSchool || !selectedDepartment || !selectedCourse}
          >
            Add Student
          </button>
        </form>
      </div>

      {/* Student List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col space-y-4 mb-4">
          <h3 className="text-lg font-semibold">Student List</h3>
          <button 
            onClick={fetchStudents}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={!selectedSchool || !selectedDepartment || !selectedCourse}
          >
            Load Students
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Roll Number</th>
                <th className="px-4 py-2">Semester</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.student_id} className="border-t">
                  <td className="px-4 py-2">{student.student_name}</td>
                  <td className="px-4 py-2">{student.roll_number}</td>
                  <td className="px-4 py-2">Semester {student.semester}</td>
                  <td className="px-4 py-2">
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteStudent(student.student_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManageStudent;