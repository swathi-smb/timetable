import React from "react";

function ContactUs() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 w-full max-w-lg text-center">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
          Contact Us
        </h1>

        <p className="text-gray-700 text-sm md:text-base lg:text-lg mb-6">
          Have questions or need assistance? Reach out to us using the details below.
        </p>

        <div className="text-gray-800 text-sm md:text-base lg:text-lg space-y-6">
          <p>
            📍 <strong>Institute Address:</strong>  
            <br /> Central University of Karnataka,  
            <br /> Kadaganchi, Aland Road,  
            <br /> Kalaburagi, Karnataka, India - 585367.
          </p>

          <p>
            🌐 <strong>Website:</strong>  
            <br />
            <a 
              href="https://www.cuk.ac.in" 
              className="text-blue-600 hover:underline" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              www.cuk.ac.in
            </a>
          </p>

          <p>
            📧 <strong>Email:</strong>  
            <br />
            <a 
              href="mailto:contact@cuk.ac.in" 
              className="text-blue-600 hover:underline"
            >
              contact@cuk.ac.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
