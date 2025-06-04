import React from 'react';
import logo from '../assets/CUK-Logo.jpg';

function Header() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between py-1 px-4 md:px-6">
      {/* Logo - Stays on the Left */}
      <div className="flex-shrink-0">
        <img src={logo} alt="cuk-logo" className="w-20 md:w-28 lg:w-32" />
      </div>

      {/* University Name & Details - Centered */}
      <div className="flex-1 text-center">
        <p className="text-[10px] md:text-xs lg:text-2xl font-medium"> 
          ಕರ್ನಾಟಕ ಕೇಂದ್ರೀಯ ವಿಶ್ವವಿದ್ಯಾಲಯ | कर्नाटक केंद्रीय विश्‍वविद्यालय
        </p>
        <p className="text-base md:text-lg lg:text-4xl font-extrabold">
          Central University of Karnataka
        </p>
        <p className="text-[15px] md:text-xs font-medium">
          (Established by an Act of Parliament in 2009)
        </p>
      </div>
    </div>
  );
}

export default Header;
