import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    setIsOpen(false); // Close menu on mobile after clicking
    navigate(path);
  };

  return (
    <nav className="bg-[#0077b6] w-full h-16 flex items-center justify-between px-6 text-white shadow-md">
      {/* Logo / Home Link */}
      <Link to="/" className="text-2xl font-bold hover:text-gray-300 transition">
        Home
      </Link>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden text-white text-3xl focus:outline-none" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex md:gap-6 text-lg font-semibold">
        <Link to="/about-us" className="hover:text-gray-300 transition">About Us</Link>
        <Link to="/contact-us" className="hover:text-gray-300 transition">Contact Us</Link>
        <Link to="/login" className="hover:text-gray-300 transition">Login</Link> 
        <Link to="/signup" className="hover:text-gray-300 transition">Sign Up</Link>
      </div>

      {/* Mobile Dropdown (Animated) */}
      <div className={`absolute top-52 left-0 w-full bg-[#0077b6] shadow-lg md:hidden transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-y-0 opacity-100 z-1" : "-translate-y-full opacity-0 pointer-events-none"
      }`}>
        <div className="flex flex-col items-center py-4 space-y-4">
          <button onClick={() => handleNavigation('/about-us')} className="text-lg hover:text-gray-300 transition">About Us</button>
          <button onClick={() => handleNavigation('/contact-us')} className="text-lg hover:text-gray-300 transition">Contact Us</button>
          <button onClick={() => handleNavigation('/login')} className="text-lg hover:text-gray-300 transition">Login</button>
          <button onClick={() => handleNavigation('/signup')} className="text-lg hover:text-gray-300 transition">Sign Up</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
