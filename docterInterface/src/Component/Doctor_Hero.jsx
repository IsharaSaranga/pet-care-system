import { useState, useEffect } from 'react';
import image1 from '../assets/image1.jpeg';
import image2 from '../assets/image2.jpeg';
import image3 from '../assets/image3.jpeg';

import i1 from '../assets/i1.jpg';
import i2 from '../assets/i2.jpg';
import i3 from '../assets/i3.jpg';
import i4 from '../assets/i4.jpg';
import i5 from '../assets/i5.jpg';
import i6 from '../assets/i6.jpg';
import i7 from '../assets/i7.jpg';
import i8 from '../assets/i8.jpg';
import i9 from '../assets/i9.jpg';

export default function ProfessionalHeroPart() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [i1, i2, i3, i4, i5, i6, i7, i8, i9];

  // Animation effect when component mounts
  useEffect(() => {
    // Animate elements with fade-in-up class
    const animatedElements = document.querySelectorAll('.fade-in-up');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => observer.observe(el));

    // Auto-rotate images every 5 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    
    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
      clearInterval(interval);
    };
  }, []);

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="bg-gradient-to-br from-[#FFF5E6] via-[#FCF0E4] to-[#F5EFEA]">
      {/* Hero Image Carousel */}
      <div className="relative h-[40vh] min-h-[300px] max-h-[500px] w-full overflow-hidden">
        {heroImages.map((image, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentImageIndex === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-amber-950 bg-opacity-40"></div>
            <img 
              src={image} 
              alt={`Professional Service ${index + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="text-amber-50 px-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Professional Pet Care Portal</h1>
                <p className="text-lg md:text-xl">Manage your practice with ease</p>
              </div>
            </div>
          </div>
        ))}

        {/* Image Navigation Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleImageChange(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentImageIndex === index 
                  ? 'bg-amber-50 scale-125' 
                  : 'bg-amber-50 bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8 py-12">
        <h2 className="text-center text-base/7 font-semibold text-amber-950 fade-in-up">Professional Dashboard</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-amber-950 sm:text-5xl fade-in-up" style={{animationDelay: '0.2s'}}>
          Manage Your Professional Services
        </p>
        <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
          <div className="relative lg:row-span-2 fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-[2rem] hover:shadow-lg transition-shadow duration-300"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
              <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-amber-950 max-lg:text-center">
                  Manage Appointments
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-amber-950 max-lg:text-center">
                  Control your schedule by creating available time slots for pet consultations, treatments, and grooming sessions.
                </p>
              </div>
              <div className="relative min-h-[30rem] w-full grow max-lg:mx-auto max-lg:max-w-sm hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute inset-x-10 top-10 bottom-0 overflow-hidden rounded-t-[12cqw] bg-gray-900 shadow-2xl">
                  <img
                    className="size-full object-cover object-top"
                    src={image1}
                    alt="Schedule Management"
                  />
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-amber-200/50 lg:rounded-l-[2rem]"></div>
          </div>

          <div className="relative max-lg:row-start-1 fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem] hover:shadow-lg transition-shadow duration-300"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-amber-950 max-lg:text-center">Client Bookings</p>
                <p className="mt-2 max-w-lg text-sm/6 text-amber-950 max-lg:text-center">
                  View all upcoming client bookings and pet information to prepare for each session.
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center px-8 max-lg:pt-10 max-lg:pb-12 sm:px-10 lg:pb-2 hover:scale-105 transition-transform duration-500">
                <img
                  className="w-full max-lg:max-w-xs"
                  src={image3}
                  alt="Client Bookings"
                />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-amber-200/50 max-lg:rounded-t-[2rem]"></div>
          </div>

          <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2 fade-in-up" style={{animationDelay: '0.5s'}}>
            <div className="absolute inset-px rounded-lg bg-white hover:shadow-lg transition-shadow duration-300"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-amber-950 max-lg:text-center">Service Reminders</p>
                <p className="mt-2 max-w-lg text-sm/6 text-amber-950 max-lg:text-center">
                  Get timely notifications for upcoming appointments and follow-ups with your pet clients.
                </p>
              </div>
              <div className="flex flex-1 items-center max-lg:py-6 lg:pb-2 hover:scale-105 transition-transform duration-500">
                <img
                  className="h-[min(152px,40cqw)] object-cover"
                  src="https://tailwindcss.com/plus-assets/img/component-images/bento-03-security.png"
                  alt="Service Reminders"
                />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-amber-200/50"></div>
          </div>

          <div className="relative lg:row-span-2 fade-in-up" style={{animationDelay: '0.6s'}}>
            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-r-[2rem] hover:shadow-lg transition-shadow duration-300"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
              <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-amber-950 max-lg:text-center">
                  Pet Client Records
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-amber-950 max-lg:text-center">
                  Access complete pet profiles, treatment history, and care notes to deliver personalized professional service.
                </p>
              </div>
              <div className="relative min-h-[30rem] w-full grow hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute top-10 right-0 bottom-0 left-10 overflow-hidden rounded-tl-xl bg-gray-900 shadow-2xl">
                  <img 
                    src={image2} 
                    alt="Pet Client Records" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-amber-200/50 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        .fade-in-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .fade-in-up.animate {
          opacity: 1;
          transform: translateY(0);
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}