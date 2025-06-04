import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[#1d1d1d] text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-lg md:text-lg">
              © {new Date().getFullYear()} Central University of Karnataka
            </p>
          </div>
          <div className="flex space-x-4">
            <Link 
              to="/privacy-policy" 
              className=" text-sm md:text-lg hover:text-gray-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms-of-service" 
              className="text-sm md:text-lg hover:text-gray-400 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
