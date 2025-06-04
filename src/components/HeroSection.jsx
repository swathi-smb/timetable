import React from "react";
// import backgroundImage from "bg.jpg";

function HeroSection() {
  return (
    <section 
      className="relative w-full h-[70vh] md:h-[50vh] lg:h-[60vh] flex items-center justify-center px-4 bg-cover bg-center"
style={{ backgroundImage: `url('/bg.jpg')` }}
    >
      {/* Content */}
      <div className="relative max-w-3xl text-center px-4 md:px-6 py-6 md:py-8 bg-white/20 backdrop-blur-md rounded-lg shadow-md">
        <h1 className="text-xl z-10 md:text-2xl lg:text-3xl  font-bold text-black mb-3">
          "Automated Timetable Generator"
        </h1>
        <p className="text-sm md:text-md lg:text-lg text-black">
          An effective tool for educational institutions.
        </p>
      </div>
    </section>
  );
}

export default HeroSection;
