import React from "react";

function TermsOfService() {
  return (
    <section className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">
        Terms of Service
      </h1>

      <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">
        Welcome to <strong>CUK Timetable Generator Website</strong>. By using our platform, you agree to comply with the following terms.
      </p>

      {/* User Accounts & Responsibilities */}
      <h2 className="text-lg md:text-xl font-semibold mt-6 text-gray-900">1. User Accounts & Responsibilities</h2>
      <ul className="list-disc list-inside text-gray-600 text-sm md:text-base leading-relaxed">
        <li>You must provide accurate information when signing up.</li>
        <li>Your role (Admin, Staff, or Student) determines your access level.</li>
        <li>Do not share your login credentials or misuse the platform.</li>
      </ul>

      {/* Use of Services */}
      <h2 className="text-lg md:text-xl font-semibold mt-6 text-gray-900">2. Use of Services</h2>
      <ul className="list-disc list-inside text-gray-600 text-sm md:text-base leading-relaxed">
        <li>Admins and Staff can create and manage timetables.</li>
        <li>Students can only view and print timetables.</li>
        <li>Any unauthorized attempt to modify or disrupt the platform is prohibited.</li>
      </ul>

      {/* Limitation of Liability */}
      <h2 className="text-lg md:text-xl font-semibold mt-6 text-gray-900">3. Limitation of Liability</h2>
      <ul className="list-disc list-inside text-gray-600 text-sm md:text-base leading-relaxed">
        <li>We are not responsible for scheduling errors or technical failures.</li>
        <li>We do not guarantee uninterrupted access to the service.</li>
        <li>We are not liable for any loss resulting from your use of this service.</li>
      </ul>

      {/* Changes to Terms */}
      <h2 className="text-lg md:text-xl font-semibold mt-6 text-gray-900">4. Changes to Terms</h2>
      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
        We may update these Terms from time to time. Continued use of our service means you accept the changes.
      </p>

      {/* Contact Us */}
      <h2 className="text-lg md:text-xl font-semibold mt-6 text-gray-900">5. Contact Us</h2>
      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
        For any questions regarding these Terms, please visit our website at:
      </p>
      <p className="text-blue-600 font-medium mt-2 hover:underline">
        <a href="https://www.cuk.ac.in/" target="_blank" rel="noopener noreferrer">
          https://www.cuk.ac.in/
        </a>
      </p>
    </section>
  );
}

export default TermsOfService;
