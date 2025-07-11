'use client';

import { Link } from 'react-router-dom';
import { HeartHandshake, PawPrint, Users, ShieldCheck, Calendar, ShoppingBag, Ticket, MapPin, Star } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="bg-[#FFF5E7] min-h-screen">
      {/* Hero Section with Gradient Overlay */}
      <div className="relative bg-gradient-to-b from-[#3A4F41] to-[#2A3A30] pt-32 pb-20 px-6 sm:px-12 lg:pt-40 lg:pb-28 lg:px-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span className="block">Your Pet's Journey</span>
            <span className="block text-[#D08860]">Begins in Kandy</span>
          </h1>
          <p className="mt-6 text-xl text-[#F5EFEA] max-w-3xl mx-auto">
            Creating meaningful connections between pets and loving families in Sri Lanka since 2015.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link 
              to="/adoption" 
              className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-[#3A4F41] bg-[#D08860] hover:bg-[#B3714E] transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              <PawPrint className="mr-2 h-5 w-5" />
              Meet Our Pets
            </Link>
            <Link 
              to="/appointment" 
              className="flex items-center px-6 py-3 border-2 border-[#D08860] text-base font-medium rounded-full text-white hover:bg-[#D08860] hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-24 px-6 sm:px-12 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-[#3A4F41] sm:text-4xl">
              Our Complete Pet Services
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-[#5A6F5C] lg:mx-auto">
              A one-stop destination for all your pet needs in Kandy, Sri Lanka.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <PawPrint className="h-12 w-12 text-[#D08860]" />,
                  title: "Pet Adoption",
                  description: "Find your perfect companion from our carefully selected pets available for adoption."
                },
                {
                  icon: <Calendar className="h-12 w-12 text-[#5A9367]" />,
                  title: "Vet Appointments",
                  description: "Book online appointments with our experienced veterinary team."
                },
                {
                  icon: <ShoppingBag className="h-12 w-12 text-[#6A8CAF]" />,
                  title: "Pet Store",
                  description: "Quality food, toys, and accessories for all your pet needs."
                },
                {
                  icon: <Ticket className="h-12 w-12 text-[#9C7BBC]" />,
                  title: "Pet Events",
                  description: "Register for pet meetups, training sessions, and community gatherings."
                },
                {
                  icon: <ShieldCheck className="h-12 w-12 text-[#D27D7D]" />,
                  title: "Pet Care Services",
                  description: "Professional grooming, boarding, and daycare services."
                },
                {
                  icon: <HeartHandshake className="h-12 w-12 text-[#D9A566]" />,
                  title: "Community Support",
                  description: "Educational resources and support for pet parents."
                }
              ].map((service, index) => (
                <div key={index} className="bg-[#FDFAF5] p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#FFF5E7] mb-6">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#3A4F41]">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-base text-[#5A6F5C]">
                    {service.description}
                  </p>
                
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    
      {/* Team Section */}
      <div className="py-24 px-6 sm:px-12 lg:px-24 bg-[#FFF5E7]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#3A4F41] sm:text-4xl text-center">
            Our Dedicated Team
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-[#5A6F5C] lg:mx-auto text-center">
            Meet the passionate professionals behind our Kandy pet sanctuary.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                name: "Dr. Ishara Perera",
                role: "Lead Veterinarian",
                bio: "With 12 years of experience, Dr. Perera ensures all pets receive exceptional medical care.",
                image: "/vet1.jpg"
              },
              {
                name: "Tharaka Fernando",
                role: "Adoption Specialist",
                bio: "NihTharakal has matched over 300 pets with loving families across Sri Lanka.",
                image: "/train.jpg"
              },
              {
                name: "Dasun Bandara",
                role: "Pet Behaviorist",
                bio: "Dasun's training methods help pets adjust seamlessly to their new families.",
                image: "/trainer1.jpg"
              },
              {
                name: "Tharindu Rajapakse",
                role: "Store Manager",
                bio: "Tharindu curates our pet store with the finest selection of products for every pet.",
                image: "/adop.jpg"
              },
              {
                name: "Sasi Karunarathna",
                role: "Events Coordinator",
                bio: "Sasi organizes engaging pet community events throughout Sri Lanka.",
                image: "/eventsasi.jpg"
              }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 overflow-hidden">
                  <img 
                    className="w-full h-full object-cover" 
                    src={member.image} 
                    alt={member.name}
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/default-profile.jpg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[#3A4F41]">{member.name}</h3>
                  <p className="text-sm text-[#D08860] font-medium">{member.role}</p>
                  <p className="mt-2 text-sm text-[#5A6F5C] line-clamp-3">{member.bio}</p>
                  <button className="mt-3 text-sm text-[#3A4F41] font-medium hover:text-[#D08860]">
                    Read more
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

     

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#3A4F41] to-[#2A3A30] py-16 px-6 sm:px-12 lg:px-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute transform -rotate-45 -left-1/4 -top-1/4 h-full w-full bg-[#D08860]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Begin Your Pet Journey?
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-[#F5EFEA] lg:mx-auto">
            Whether you're looking to adopt, book an appointment, shop for pet supplies, or join our events - we're here for you in Kandy.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link 
              to="/appointment" 
              className="px-6 py-3 border border-transparent text-base font-medium rounded-full text-[#3A4F41] bg-[#D08860] hover:bg-[#B3714E] transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              Book Appointment
            </Link>
            <Link 
              to="/" 
              className="px-6 py-3 border-2 border-[#D08860] text-base font-medium rounded-full text-white hover:bg-[#D08860] hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Visit Our Store
            </Link>
            <Link 
              to="/adoption" 
              className="px-6 py-3 border-2 border-white text-base font-medium rounded-full text-white hover:bg-white hover:text-[#3A4F41] transition-all duration-300 transform hover:scale-105"
            >
              Adoption Availability
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}