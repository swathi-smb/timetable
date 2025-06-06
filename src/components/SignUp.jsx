import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from './Navbar';
import { apiPath } from "../path/apiPath";
// import backgroundImage from "bg.jpg";

function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '2', // Default to staff role
    school: '',
    department: '',
    course: '',
    roleNumber: ''
  });

  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();  // Handle email input and auto-fetch staff details
  const handleEmailChange = async (e) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, email }));
    setErrors(prev => ({ ...prev, email: '', school: '', department: '' }));
    setMessage({ text: '', type: '' });

    // Basic email format validation
    if (!(/\S+@\S+\.\S+/.test(email))) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      return;
    }

    // For staff registration, fetch staff details
    if (formData.role === '2') {
      try {
        const response = await axios.get(`${apiPath}/api/staff-profile/details/${email}`);
        const staffData = response.data;

        setFormData(prev => ({
          ...prev,
          school: staffData.school.toString(),
          department: staffData.department.toString(),
        }));

        // Set schools and departments arrays with the fetched data for display
        setSchools([{
          school_id: staffData.school,
          school_name: staffData.schoolName
        }]);

        setDepartments([{
          department_id: staffData.department,
          department_name: staffData.departmentName
        }]);

        setMessage({
          text: `Staff details found!y Registration will be reviewed by an administrator.`,
          type: 'success'
        });
      } catch (error) {
        if (error.response?.status === 404) {
          setErrors(prev => ({
            ...prev,
            email: 'No staff record found with this email. Please contact your administrator.',
            school: 'Staff record not found',
            department: 'Staff record not found'
          }));
        } else {
          console.error('Error fetching staff details:', error);
          setErrors(prev => ({
            ...prev,
            email: 'Error verifying staff email. Please try again.'
          }));
        }
      }
    }
  };

  // Add new function to handle roll number change for students
  const handleRollNumberChange = async (e) => {
    const rollNumber = e.target.value;
    setFormData(prev => ({ ...prev, roleNumber: rollNumber }));
    setErrors(prev => ({ ...prev, roleNumber: '', school: '', department: '', course: '' }));
    setMessage({ text: '', type: '' });

    if (!rollNumber.trim()) return;

    try {
      console.log('Fetching student details for roll number:', rollNumber);
      const response = await axios.get(`${apiPath}/api/student/roll/${rollNumber}`);
      const studentData = response.data;

      console.log('Student data received:', studentData);

      // Set form data with school, department, and course IDs
      setFormData(prev => ({
        ...prev,
        school: studentData.school_id.toString(),
        department: studentData.department_id.toString(),
        course: studentData.course_id.toString()
      }));

      // Set schools array with the fetched data for display
      setSchools([{
        school_id: studentData.school_id,
        school_name: studentData.school_name
      }]);

      // Set departments array with the fetched data for display
      setDepartments([{
        department_id: studentData.department_id,
        department_name: studentData.department_name
      }]);

      // Set courses array with the fetched data for display
      setCourses([{
        course_id: studentData.course_id,
        course_name: studentData.course_name
      }]);

      setMessage({
        text: `Student details found! Registration will be reviewed by an administrator.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error fetching student details:', error);
      if (error.response?.status === 404) {
        setErrors(prev => ({
          ...prev,
          roleNumber: 'No student record found with this roll number. Please contact your administrator.',
          school: 'Student record not found',
          department: 'Student record not found',
          course: 'Student record not found'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          roleNumber: 'Error verifying roll number. Please try again.'
        }));
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation only for staff
    if (formData.role === "2") {
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    }

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 4) newErrors.password = "Password must be at least 6 characters long";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.role) newErrors.role = "Role selection is required";

    // For staff role, validate that school and department are populated
    if (formData.role === "2") {
      if (!formData.school) newErrors.school = "Staff email not found or invalid. Please use your official email.";
      if (!formData.department) newErrors.department = "Staff email not found or invalid. Please use your official email.";
    }

    // For student role, validate role number
    if (formData.role === "3") {
      if (!formData.roleNumber?.trim()) {
        newErrors.roleNumber = "Roll Number is required";
      }
      if (!formData.school) newErrors.school = "Student record not found. Please enter a valid roll number.";
      if (!formData.department) newErrors.department = "Student record not found. Please enter a valid roll number.";
    }

    // Validate role number format for students
    if (formData.role === "3" && formData.roleNumber?.trim()) {
      const roleNumberPattern = /^[A-Za-z0-9-]+$/;
      if (!roleNumberPattern.test(formData.roleNumber)) {
        newErrors.roleNumber = "Invalid format. Only letters, numbers, and hyphens are allowed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Default school and department IDs if not provided
      const defaultSchoolId = 1;  // Set this to your default school ID
      const defaultDeptId = 1;    // Set this to your default department ID
      const requestData = {
        name: formData.role === "2" ? formData.email.split('@')[0] : formData.roleNumber, // Use roll number as name for students
        email: formData.role === "2" ? formData.email : null, // Only include email for staff
        password: formData.password,
        role: formData.role,
        school_id: formData.school ? parseInt(formData.school, 10) : defaultSchoolId,
        department_id: formData.department ? parseInt(formData.department, 10) : defaultDeptId,
        role_number: formData.role === "3" ? formData.roleNumber : null // Only include role_number for students
      };

      // If this is a staff registration, validate that school and department were found
      if (formData.role === "2" && (!formData.school || !formData.department)) {
        setErrors({
          general: "Staff record not found. Please use your official email address or contact administrator."
        });
        return;
      }

      console.log("Request data:", requestData);
      const response = await axios.post(`${apiPath}/api/auth/signup`, requestData);

      console.log("Signup response:", response.data);
      setMessage({
        text: 'Registration request submitted successfully. Please wait for admin approval.',
        type: 'success'
      });

      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        roleNumber: '',
        school: '',
        department: '',
        course: ''
      });
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      setMessage({
        text: error.response?.data?.message || "Registration failed. Please try again.",
        type: 'error'
      });
      setErrors({
        general: error.response?.data?.message || "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div 
        className="flex-1 flex items-center justify-center bg-cover bg-center p-4 md:p-8"
        style={{ backgroundImage: `url('/bg.jpg')` }}
      >
        <form 
          onSubmit={handleSubmit} 
          className="bg-white/90 rounded-lg shadow-lg p-6 md:p-8 w-full max-w-sm md:max-w-md mx-4"
        >
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign Up</h1>

          {/* Name Input */}
          <div className="mb-4">
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleEmailChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
          </div>

          {/* Roll Number Input */}
          <div className="mb-4">
            <input
              type="text"
              name="rollNumber"
              placeholder="Enter your roll number"
              value={formData.roleNumber}
              onChange={handleRollNumberChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.roleNumber ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            {errors.roleNumber && <span className="text-red-500 text-sm mt-1">{errors.roleNumber}</span>}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password}</span>}
          </div>

          {/* Confirm Password Input */}
          <div className="mb-4">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            {errors.confirmPassword && <span className="text-red-500 text-sm mt-1">{errors.confirmPassword}</span>}
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="text-red-500 text-sm mb-4 text-center">{errors.general}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600 mt-4">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
