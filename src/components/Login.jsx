import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import { apiPath } from '../path/apiPath';
// import backgroundImage from "bg.jpg";

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    rollNumber: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [savePassword, setSavePassword] = useState(false);
  const [signupMessage, setSignupMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role_id');
    
    if (storedToken && storedRole) {
      setTimeout(() => {
        if (!window.location.pathname.includes("dashboard")) {
          redirectToDashboard(storedRole);
        }
      }, 100);
    }
  }, []);
  
  
  // Load saved credentials from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');

    if (savedEmail && savedPassword) {
      setFormData({
        ...formData,
        email: savedEmail,
        password: savedPassword
      });
      setSavePassword(true);
    }
  }, []);

  // Redirect function
  const redirectToDashboard = (role) => {
    const roleString = role.toString();
    const currentPath = window.location.pathname;
  
    const roleRoutes = {
      "1": "/admin-dashboard",
      "2": "/staff-dashboard",
      "3": "/student-dashboard"
    };
  
    const newRoute = roleRoutes[roleString] || "/";
    console.log("Route: ",newRoute)
    // Prevent re-navigating if already on the correct page
    if (currentPath !== newRoute) {
      navigate(newRoute);
    }
  };
  

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email or Roll Number is required';
    else if (formData.email.includes('@') && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 4) newErrors.password = 'At least 4 characters required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${apiPath}/api/auth/login`, {
        email: formData.email || formData.rollNumber, // Use email or roll number
        password: formData.password
      });

      console.log("Response from server:", response.data);

      // Check if user's registration is pending
      if (response.data.status === 'pending') {
        setSignupMessage('Your account is pending admin approval. Please wait for confirmation.');
        setMessageType('warning');
        setLoading(false);
        return;
      }

      const { token, role_id } = response.data;
      if (!token) {
        throw new Error("No token received");
      }

      localStorage.setItem('token', token);
      console.log("token: ", token);
      localStorage.setItem('role_id', role_id.toString());

      if (savePassword) {
        localStorage.setItem('savedEmail', formData.email);
        localStorage.setItem('savedPassword', formData.password);
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
      }

      // Redirect user based on role
      console.log("Redirecting to dashboard with role:", role_id);
      redirectToDashboard(role_id);


    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'An error occurred during login. Please try again.' });

    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiPath}/api/auth/signup`, {
        name,
        email,
        password,
        role
      });

      setSignupMessage(response.data.message);
      setMessageType('success');
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setRole('');
      setSelectedSchool('');
      setSelectedDepartment('');
      setSpecialization('');
    } catch (error) {
      console.error('Error signing up:', error);
      setSignupMessage(error.response?.data?.message || 'Error during signup');
      setMessageType('error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>

          {/* Email or Roll Number Input */}
          <div className="mb-4">
            <input
              type="text"
              name="email"
              placeholder="Enter your email or roll number"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password}</span>}
          </div>

          {/* Save Password Option */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="savePassword"
              checked={savePassword}
              onChange={() => setSavePassword(!savePassword)}
              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="savePassword" className="text-sm text-gray-700">Save Password</label>
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
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Signup Link */}
          <div className="text-center text-sm text-gray-600 mt-4">
            Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Signup</Link>
          </div>

          {/* Signup Message */}
          {signupMessage && (
            <div className={`mt-4 p-4 rounded ${
              messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {signupMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
