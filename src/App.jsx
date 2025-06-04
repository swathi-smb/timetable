import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Footer from "./components/Footer";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import AboutUs from "./components/AboutUs";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ContactUs from "./components/ContactUs";
import AdminDashboard from "./components/AdminDashboard";
import ManageClasses from "./components/ManageClasses"; 
import StaffDashboard from "./components/StaffDashboard";
import StudentDashboard from "./components/StudentDashboard";
import ManageTimetable from "./components/ManageTimetable";
import ManageStudent from "./components/ManageStudent";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("decoded",decoded)
        setUser({
          id: decoded.userId, // Keep the user ID if needed
          role: decoded.roleId ? decoded.roleId.toString() : null, // Ensure it's a string
        });
        console.log("user: ",user)
      } catch (error) {
        console.error("Token decoding error:", error);
        alert("Invalid token. Please log in again."); // Provide feedback to the user
        localStorage.removeItem("token"); // Remove invalid token
        localStorage.removeItem("token");
      }
    }
  }, []);

  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          {/* Pages with Header, Navbar, Footer */}
          <Route path="/" element={<><Header /><Navbar /><HeroSection /><Footer /></>} />
          <Route path="/about-us" element={<><Header /><Navbar /><AboutUs /><Footer /></>} />
          <Route path="/privacy-policy" element={<><Header /><Navbar /><PrivacyPolicy /><Footer /></>} />
          <Route path="/terms-of-service" element={<><Header /><Navbar /><TermsOfService /><Footer /></>} />
          <Route path="/contact-us" element={<><Header /><Navbar /><ContactUs /><Footer /></>}/>

          {/* Full-Page Views */}
          <Route path="/manage-classes" element={<ManageClasses />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route 
            path="/admin-dashboard" 
            element={
                 <AdminDashboard />     
            } 
          />
          <Route 
            path="/staff-dashboard" 
            element={
              <StaffDashboard/>
            } 
          />
          <Route 
            path="/student-dashboard" 
            element={
              <StudentDashboard />
            } 
          />
          <Route 
            path="/manage-timetable" 
            element={
              <ManageTimetable />
            } 
          />
          <Route 
            path="/manage-student" 
            element={
              <ManageStudent />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
