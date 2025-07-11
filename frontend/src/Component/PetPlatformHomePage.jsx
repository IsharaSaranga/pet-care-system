'use client';

import React, { useState } from 'react';
import { 
  PawPrint, 
  ShoppingCart, 
  Calendar, 
  HeartHandshake, 
  Dog, 
  Cat, 
  Stethoscope, 
  BookOpen,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import images
import heroBg from "../assets/Home01.jpeg";
import adoptionImage from "../assets/Homepage p1.jpeg";
import appointmentImage from "../assets/Adoption3.jpeg";
import storeImage from "../assets/Homepage p2.jpeg";
import eventsImage from '../assets/Adoption.jpeg';

const PetPlatformHomePage = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const guideSteps = [
    {
      title: "Welcome to PawPlatform!",
      description: "Your complete pet companion solution. Let's walk through what we offer to make your pet's life better.",
      icon: <PawPrint className="w-16 h-16 text-[#D08860]" />,
      color: "bg-gradient-to-br from-[#FFF3E0]/80 to-[#F5EFEA]/80 backdrop-blur-md",
    },
    {
      title: "Find Your Perfect Match",
      description: "Our adoption service helps connect you with pets that match your lifestyle and preferences.",
      icon: <Dog className="w-16 h-16 text-[#D08860]" />,
      color: "bg-gradient-to-br from-[#FFF3E0]/80 to-[#F5EFEA]/80 backdrop-blur-md",
    },
    {
      title: "Health & Wellness",
      description: "Book appointments with veterinarians and keep track of your pet's health records.",
      icon: <Stethoscope className="w-16 h-16 text-[#5A9367]" />,
      color: "bg-gradient-to-br from-[#E6F3E5]/80 to-[#F5EFEA]/80 backdrop-blur-md",
    },
    {
      title: "Shop Premium Products",
      description: "Discover high-quality food, toys, and accessories tailored to your pet's needs.",
      icon: <ShoppingCart className="w-16 h-16 text-[#6A8CAF]" />,
      color: "bg-gradient-to-br from-[#E6F1F9]/80 to-[#F5EFEA]/80 backdrop-blur-md",
    },
    {
      title: "Join Our Community",
      description: "Participate in events, workshops, and meetups with fellow pet lovers.",
      icon: <Calendar className="w-16 h-16 text-[#9C7BBC]" />,
      color: "bg-gradient-to-br from-[#F2EAF9]/80 to-[#F5EFEA]/80 backdrop-blur-md",
    }
  ];

  const openGuide = () => {
    setShowGuide(true);
    setCurrentStep(0);
    document.body.classList.add('overflow-hidden');
  };

  const closeGuide = () => {
    setShowGuide(false);
    document.body.classList.remove('overflow-hidden');
  };

  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeGuide();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const services = [
    { 
      icon: <Dog className="w-16 h-16 text-[#D08860]" />, 
      title: 'Pet Adoption', 
      description: 'Find your perfect companion',
      bgColor: 'bg-gradient-to-br from-[#FFF3E0]/80 to-[#F5EFEA]/80 backdrop-blur-md',
      textColor: 'text-[#D08860]',
      path: '/adoption'
    },
    { 
      icon: <Stethoscope className="w-16 h-16 text-[#5A9367]" />, 
      title: 'Pet Care', 
      description: 'Professional veterinary services',
      bgColor: 'bg-gradient-to-br from-[#E6F3E5]/80 to-[#F5EFEA]/80 backdrop-blur-md',
      textColor: 'text-[#5A9367]',
      path: '/appointment'
    },
    { 
      icon: <ShoppingCart className="w-16 h-16 text-[#6A8CAF]" />, 
      title: 'Pet Store', 
      description: 'Quality products for pets',
      bgColor: 'bg-gradient-to-br from-[#E6F1F9]/80 to-[#F5EFEA]/80 backdrop-blur-md',
      textColor: 'text-[#6A8CAF]',
      path: '/collection'
    },
    { 
      icon: <Calendar className="w-16 h-16 text-[#9C7BBC]" />, 
      title: 'Events', 
      description: 'Community and workshops',
      bgColor: 'bg-gradient-to-br from-[#F2EAF9]/80 to-[#F5EFEA]/80 backdrop-blur-md',
      textColor: 'text-[#9C7BBC]',
      path: '/events'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] via-[#F8E9D8] to-[#F5EFEA] text-gray-800 font-sans">
      {/* Hero Section with Parallax Background */}
      <div 
        className="relative h-screen bg-cover bg-center flex items-center justify-center bg-fixed"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(245, 239, 234, 0.2)',
        }}
      >
        <div className="text-center max-w-5xl px-6 animate-slideIn">
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#FFF5E7] mb-6 tracking-tight leading-tight drop-shadow-2xl">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] via-[#E6A77C] to-[#B3704D]">Complete Pet Companion</span> Platform
          </h1>
          <p className="text-xl md:text-2xl text-[#FFF5E7] mb-12 max-w-3xl mx-auto font-medium leading-relaxed opacity-90">
            Adopt, Care, Shop, and Connect - Everything Your Furry Friend Needs in One Place
          </p>
          <div className="flex justify-center space-x-6">
            <button 
              className="bg-gradient-to-r from-[#D08860] via-[#E6A77C] to-[#B3704D] text-white text-lg px-10 py-4 rounded-2xl hover:shadow-neumorphic transition-all duration-300 flex items-center gap-2 transform hover:scale-105 hover:-rotate-1"
              onClick={openGuide}
            >
              <PawPrint className="w-6 h-6 animate-pulse" /> Start Your Journey
            </button>
            <button 
              className="border-2 border-[#D08860] text-[#D08860] text-lg px-10 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-[#D08860] hover:via-[#E6A77C] hover:to-[#B3704D] hover:text-white transition-all duration-300 flex items-center gap-2 transform hover:scale-105 hover:rotate-1"
            >
              <HeartHandshake className="w-6 h-6 animate-pulse" /> Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Onboarding Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-zoomIn border border-white/20">
            {/* Close button */}
            <button 
              onClick={closeGuide}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            
            {/* Progress indicators */}
            <div className="flex justify-center gap-2 pt-6">
              {guideSteps.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-2 rounded-full transition-all duration-500 ${currentStep === index ? 'w-10 bg-gradient-to-r from-[#D08860] via-[#E6A77C] to-[#B3704D]' : 'w-3 bg-white/30'}`}
                />
              ))}
            </div>
            
            {/* Content area */}
            <div className="p-12 pt-8">
              <div className={`flex justify-center mb-8 p-6 rounded-full w-32 h-32 mx-auto ${guideSteps[currentStep].color} shadow-neumorphic`}>
                {guideSteps[currentStep].icon}
              </div>
              
              <h2 className="text-3xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] via-[#E6A77C] to-[#B3704D]">
                {guideSteps[currentStep].title}
              </h2>
              
              <p className="text-lg text-white/90 text-center mb-12">
                {guideSteps[currentStep].description}
              </p>
              
              {/* Navigation buttons */}
              <div className="flex justify-between items-center">
                <button 
                  onClick={prevStep}
                  className={`flex items-center text-[#D08860] hover:text-[#B3704D] transition-colors ${currentStep === 0 ? 'invisible' : ''}`}
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                
                <button 
                  onClick={nextStep}
                  className="bg-gradient-to-r from-[#D08860] via-[#E6A77C] to-[#B3704D] text-white text-lg px-8 py-3 rounded-2xl hover:shadow-neumorphic transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
                >
                  {currentStep === guideSteps.length - 1 ? 'Get Started' : 'Next'}
                  <ChevronRight className="w-5 h-5 animate-pulse" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Section with Glassmorphic Cards */}
      <div className="py-24 px-6 bg-gradient-to-br from-[#FFF5E6] via-[#F8E9D8] to-[#F5EFEA]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              onClick={() => navigate(service.path)}
              className={`${service.bgColor} p-8 rounded-3xl shadow-neumorphic hover:shadow-neumorphic-hover transform hover:scale-105 hover:-rotate-1 transition-all duration-500 text-center group cursor-pointer animate-slideUp delay-${index * 100}`}
            >
              <div className="mb-6 flex justify-center">
                {service.icon}
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${service.textColor}`}>{service.title}</h3>
              <p className="text-gray-600 text-base">{service.description}</p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className={`${service.textColor} font-medium`}>Click to explore →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adoption Management Section */}
      <div className="grid md:grid-cols-2 items-center gap-10 p-16 bg-gradient-to-br from-[#FFF5E6] via-[#F8E9D8] to-[#F5EFEA] bg-fixed">
        <div className="order-2 md:order-1 space-y-8 px-6 animate-slideIn">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#3A4F41] mb-4">
            Streamlined <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] via-[#E6A77C] to-[#B3704D]">Adoption</span> Management
          </h2>
          <p className="text-lg md:text-xl text-[#5A6F5C] mb-6 leading-relaxed">
            Our advanced adoption platform connects potential pet parents with their perfect companion. 
            We provide comprehensive profiles, behavioral insights, and personalized matching algorithms 
            to ensure successful, long-lasting pet adoptions.
          </p>
          <ul className="space-y-4 text-[#3A4F41] text-lg">
            <li className="flex items-center">
              <PawPrint className="mr-4 text-[#D08860] w-6 h-6 animate-pulse" />
              Detailed Pet Profiles
            </li>
            <li className="flex items-center">
              <Dog className="mr-4 text-[#D08860] w-6 h-6 animate-pulse" />
              Behavioral Assessments
            </li>
            <li className="flex items-center">
              <HeartHandshake className="mr-4 text-[#D08860] w-6 h-6 animate-pulse" />
              Compatibility Matching
            </li>
          </ul>
          <button 
            onClick={() => navigate('/adoption')}
            className="bg-gradient-to-r from-[#D08860] via-[#E6A77C] to-[#B3704D] text-white text-lg px-10 py-4 rounded-2xl hover:shadow-neumorphic transition-all duration-300 transform hover:scale-105 hover:-rotate-1"
          >
            Explore Adoptions
          </button>
        </div>
        <div className="order-1 md:order-2">
          <img 
            src={adoptionImage} 
            alt="Pet Adoption" 
            className="w-full h-[600px] object-cover rounded-3xl shadow-neumorphic transform hover:scale-105 transition-all duration-500 animate-slideIn"
          />
        </div>
      </div>

      {/* Appointment Management Section */}
      <div className="grid md:grid-cols-2 items-center gap-10 p-16 bg-gradient-to-br from-[#FFF5E6] via-[#F8E9D8] to-[#F5EFEA] bg-fixed">
        <div>
          <img 
            src={appointmentImage} 
            alt="Veterinary Appointments" 
            className="w-full h-[600px] object-cover rounded-3xl shadow-neumorphic transform hover:scale-105 transition-all duration-500 animate-slideIn"
          />
        </div>
        <div className="space-y-8 px-6 animate-slideIn">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#3A4F41] mb-4">
            Effortless <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5A9367] via-[#6BAF79] to-[#47795A]">Appointment</span> Scheduling
          </h2>
          <p className="text-lg md:text-xl text-[#5A6F5C] mb-6 leading-relaxed">
            Our intelligent appointment system makes veterinary care simple and convenient. 
            Book consultations, track medical histories, and receive personalized reminders 
            for your pet's health needs.
          </p>
          <ul className="space-y-4 text-[#3A4F41] text-lg">
            <li className="flex items-center">
              <Stethoscope className="mr-4 text-[#5A9367] w-6 h-6 animate-pulse" />
              Online Booking
            </li>
            <li className="flex items-center">
              <Calendar className="mr-4 text-[#5A9367] w-6 h-6 animate-pulse" />
              Flexible Time Slots
            </li>
            <li className="flex items-center">
              <BookOpen className="mr-4 text-[#5A9367] w-6 h-6 animate-pulse" />
              Medical Record Tracking
            </li>
          </ul>
          <button 
            onClick={() => navigate('/appointment')}
            className="bg-gradient-to-r from-[#5A9367] via-[#6BAF79] to-[#47795A] text-white text-lg px-10 py-4 rounded-2xl hover:shadow-neumorphic transition-all duration-300 transform hover:scale-105 hover:-rotate-1"
          >
            Schedule Consultation
          </button>
        </div>
      </div>

      {/* Store Management Section */}
      <div className="grid md:grid-cols-2 items-center gap-10 p-16 bg-gradient-to-br from-[#FFF5E6] via-[#F8E9D8] to-[#F5EFEA] bg-fixed">
        <div className="order-2 md:order-1 space-y-8 px-6 animate-slideIn">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#3A4F41] mb-4">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A8CAF] via-[#7B9CC3] to-[#5A7A9F]">Pet Store</span> Management
          </h2>
          <p className="text-lg md:text-xl text-[#5A6F5C] mb-6 leading-relaxed">
            Our comprehensive pet store platform offers curated, high-quality products 
            tailored to your pet's specific needs. From nutrition to accessories, we provide 
            everything with convenience and personalization.
          </p>
          <ul className="space-y-4 text-[#3A4F41] text-lg">
            <li className="flex items-center">
              <ShoppingCart className="mr-4 text-[#6A8CAF] w-6 h-6 animate-pulse" />
              Personalized Recommendations
            </li>
            <li className="flex items-center">
              <Cat className="mr-4 text-[#6A8CAF] w-6 h-6 animate-pulse" />
              Multi-Species Product Range
            </li>
            <li className="flex items-center">
              <HeartHandshake className="mr-4 text-[#6A8CAF] w-6 h-6 animate-pulse" />
              Quality Guaranteed Products
            </li>
          </ul>
          <button 
            onClick={() => navigate('/collection')}
            className="bg-gradient-to-r from-[#6A8CAF] via-[#7B9CC3] to-[#5A7A9F] text-white text-lg px-10 py-4 rounded-2xl hover:shadow-neumorphic transition-all duration-300 transform hover:scale-105 hover:-rotate-1"
          >
            Visit Store
          </button>
        </div>
        <div className="order-1 md:order-2">
          <img 
            src={storeImage} 
            alt="Pet Store" 
            className="w-full h-[600px] object-cover rounded-3xl shadow-neumorphic transform hover:scale-105 transition-all duration-500 animate-slideIn"
          />
        </div>
      </div>

      {/* Event Management Section */}
      <div className="grid md:grid-cols-2 items-center gap-10 p-16 bg-gradient-to-br from-[#FFF5E6] via-[#F8E9D8] to-[#F5EFEA] bg-fixed">
        <div>
          <img 
            src={eventsImage} 
            alt="Pet Events" 
            className="w-full h-[600px] object-cover rounded-3xl shadow-neumorphic transform hover:scale-105 transition-all duration-500 animate-slideIn"
          />
        </div>
        <div className="space-y-8 px-6 animate-slideIn">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#3A4F41] mb-4">
            Dynamic <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9C7BBC] via-[#AE8ED2] to-[#8A6BA2]">Event</span> Management
          </h2>
          <p className="text-lg md:text-xl text-[#5A6F5C] mb-6 leading-relaxed">
            Connect with the pet community through our sophisticated event management platform. 
            Discover workshops, seminars, adoption fairs, and social gatherings designed to 
            educate and bring pet lovers together.
          </p>
          <ul className="space-y-4 text-[#3A4F41] text-lg">
            <li className="flex items-center">
              <Calendar className="mr-4 text-[#9C7BBC] w-6 h-6 animate-pulse" />
              Diverse Event Categories
            </li>
            <li className="flex items-center">
              <Dog className="mr-4 text-[#9C7BBC] w-6 h-6 animate-pulse" />
              Community Building
            </li>
            <li className="flex items-center">
              <HeartHandshake className="mr-4 text-[#9C7BBC] w-6 h-6 animate-pulse" />
              Educational Opportunities
            </li>
          </ul>
          <button 
            onClick={() => navigate('/events')}
            className="bg-gradient-to-r from-[#9C7BBC] via-[#AE8ED2] to-[#8A6BA2] text-white text-lg px-10 py-4 rounded-2xl hover:shadow-neumorphic transition-all duration-300 transform hover:scale-105 hover:-rotate-1"
          >
            Explore Events
          </button>
        </div>
      </div>

      {/* Add CSS for animations and neumorphism */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }
        .animate-zoomIn {
          animation: zoomIn 0.4s ease-out forwards;
        }
        .shadow-neumorphic {
          box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7);
        }
        .shadow-neumorphic-hover {
          box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.9);
        }
        .font-sans {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        /* Delays for service cards */
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}</style>
    </div>
  );
};

export default PetPlatformHomePage;