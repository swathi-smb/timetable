import React from "react";
import { Link } from "react-router-dom";

function AboutUs() {
  return (
    <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16 text-center">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-blue-600">
        About Us
      </h1>

      <p className="text-gray-700 text-sm md:text-base lg:text-lg mb-6 max-w-2xl mx-auto">
        Welcome to the <strong>Central University of Karnataka's</strong> Timetable Generator! 
        Our goal is to **simplify and automate** the process of creating university schedules, 
        ensuring efficiency and convenience for students and staff.
      </p>

      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mt-6 text-gray-800">
        Why Choose Our Timetable Generator?
      </h2>
      <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm md:text-base lg:text-lg max-w-2xl mx-auto mt-4 text-left">
        <li>📅 Automatically generates **optimized** schedules.</li>
        <li>👩‍🏫 Ensures **teacher availability** without conflicts.</li>
        <li>🎓 Helps **students manage** their courses efficiently.</li>
        <li>📊 **User-friendly** interface for easy access and modifications.</li>
      </ul>

      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mt-6 text-gray-800">
        Our Mission
      </h2>
      <p className="text-gray-700 text-sm md:text-base lg:text-lg max-w-2xl mx-auto">
        We aim to provide a seamless scheduling system that minimizes workload 
        while maximizing productivity, ensuring a **hassle-free experience** for all users.
      </p>

      <p className="text-gray-600 mt-6 text-sm md:text-base">
        For any inquiries, feel free to{" "}
        <Link to="/contact-us" className="text-blue-600 hover:underline">
          Contact Us
        </Link>.
      </p>
    </section>
  );
}

export default AboutUs;
