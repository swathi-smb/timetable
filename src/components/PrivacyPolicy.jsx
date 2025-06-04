import React from "react";

function PrivacyPolicy() {
  return (
    <section className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">Privacy Policy</h1>
      <p className="text-gray-700 text-sm md:text-base mb-4">

        This Privacy Policy explains how we collect, use, and protect your personal information when you use our timetable generation platform.
      </p>

      <h2 className="text-lg md:text-xl font-semibold mt-6">1. Information We Collect</h2>
      <p className="text-gray-600 text-sm md:text-base">

        - <strong>Personal Information:</strong> We collect your name, email, and role (Admin, Staff, Student).<br />
        - <strong>Usage Data:</strong> We track logins, timetable interactions, and device details.<br />
        - <strong>Cookies:</strong> We use cookies to enhance your experience.
      </p>

      <h2 className="text-lg md:text-xl font-semibold mt-6">2. How We Use Your Information</h2>
      <p className="text-gray-600 text-sm md:text-base">

        - To provide and improve our timetable services.<br />
        - To manage user authentication and access levels.<br />
        - To analyze usage trends for platform improvements.
      </p>

      <h2 className="text-lg md:text-xl font-semibold mt-6">3. Data Sharing & Security</h2>
      <p className="text-gray-600 text-sm md:text-base">

        - We do not sell your personal data.<br />
        - Data is stored securely, but we cannot guarantee complete protection from cyber threats.<br />
        - Only authorized administrators have access to user data.
      </p>

      <h2 className="text-lg md:text-xl font-semibold mt-6">4. Your Rights</h2>
      <p className="text-gray-600 text-sm md:text-base">

        - You can request access, updates, or deletion of your personal data.<br />
        - You may disable cookies in your browser settings.
      </p>

      <h2 className="text-lg md:text-xl font-semibold mt-6">5. Contact Us</h2>
      <p className="text-gray-600 text-sm md:text-base">

        <p>If you have questions about this Privacy Policy, please contact us at </p>
        <a className="text-blue-600 font-medium mt-2 hover:underline" href="https://www.cuk.ac.in/" target="_blank" rel="noopener noreferrer">
          https://www.cuk.ac.in/
        </a>
      </p>
    </section>
  );
}

export default PrivacyPolicy;
