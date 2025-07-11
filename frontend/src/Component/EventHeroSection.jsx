// IntroSection.js
import React from 'react';

const HeroSection = ({ title, subtitle, backgroundImage, buttonText, buttonLink }) => {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        {/* Optional background effect */}
      </div>
      <div
        className="relative w-full h-150 bg-cover bg-center mt-14 rounded-lg"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="mx-auto max-w-2xl pt-50">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-balance text-white sm:text-7xl">
              {title}
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-white sm:text-xl/8">
              {subtitle}
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <a
                href={buttonLink || "#"}
                className="block rounded-lg px-3 py-2.5 text-base font-semibold text-amber-950 bg-amber-50 hover:text-white transition-colors duration-200 hover:bg-[#D08860]"
              >
                {buttonText || 'Get started'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
