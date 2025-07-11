'use client'

import React, { useState, useEffect } from "react";
import HeroSection1 from "../Component/HeroSection";
import Grid from "../Component/BentoGrid";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Search, ArrowDown, MapPin } from "lucide-react";
import axios from 'axios';

const AdoptionHomePage = () => {
  const navigate = useNavigate();
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/adoptablepets');
        setFeaturedPets(response.data.slice(0, 8));
      } catch (error) {
        console.error("Error fetching featured pets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPets();
  }, []);

  const handleAddPetClick = () => {
    const token = localStorage.getItem('petOwnerToken');
    if (token) {
      navigate('/pet-owner-dashboard');
    } else {
      navigate('/login', { state: { from: { pathname: '/pet-owner-dashboard' } } });
    }
  };

  return (
    <>
      <HeroSection1 />
      
      <div className="bg-gradient-to-br from-[#FFF5E6] to-[#FFF5E6] py-8 pt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleAddPetClick}
              className="bg-[#D08860] text-white px-6 py-3 rounded-xl hover:bg-[#80533b] transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus size={20} />
              Add Your Pet For Adoption
            </button>
            <button
              onClick={() => navigate('/info_adoptable_pet')}
              className="bg-[#D08860] text-white px-6 py-3 rounded-xl hover:bg-[#80533b] transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Search size={20} />
              Find Your Perfect Companion
            </button>
            <button
              onClick={() => navigate('/pet-register-dashboard')}
              className="bg-[#D08860] text-white px-6 py-3 rounded-xl hover:bg-[#80533b] transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <FileText size={20} />
              My Adoption Dashboard
            </button>
            <button
              onClick={() => navigate('/pet-lost-and-found')}
              className="bg-[#D08860] text-white px-6 py-3 rounded-xl hover:bg-[#80533b] transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <MapPin size={20} />
              Lost & Found Pets
            </button>
            <button
              onClick={() => document.getElementById('grid-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#D08860] text-white px-6 py-3 rounded-xl hover:bg-[#80533b] transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <ArrowDown size={20} />
              Learn More
            </button>
          </div>
        </div>
      </div>
      

      {/* Featured Pets Section */}
      <div className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] py-16 overflow-hidden">
        <div className=" mx-2 px-4 justify-center">
          <div className="text-center mb-12 relative">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">Pets</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet some of our wonderful pets waiting for their forever homes. Each one has a unique personality and story to share.
            </p>
            
            {/* See All Button - Moved to top right */}
            <button
              onClick={() => navigate('/info_adoptable_pet')}
              className="absolute top-0 right-0 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white px-6 py-2 rounded-xl 
                       hover:shadow-lg transform hover:scale-105 transition-all duration-300
                       flex items-center gap-2 group mt-20"
            >
              <span>See All Pets</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D08860]"></div>
            </div>
          ) : (
            <div className="relative">
              {/* Gradient overlays for smooth fade effect */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#FFF5E6] to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#FFF5E6] to-transparent z-10"></div>
              
              {/* Auto-scrolling container */}
              <div className="flex overflow-x-hidden">
                <div className="flex animate-scroll mt-10 mb-10">
                  {/* First set of pets */}
                  {featuredPets.map((pet) => (
                    <div
                      key={pet._id}
                      className="flex-none w-80 mx-4 bg-white/80 rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-xl"
                    >
                      <div className="relative pt-[125%]">
                        <img
                          src={pet.petImage ? `http://localhost:5000${pet.petImage}` : 'https://via.placeholder.com/300'}
                          alt={pet.petName}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-[#B3704D] mb-2">{pet.petName}</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {pet.petBreed} • {pet.petAge}  old • {pet.petGender}
                        </p>
                        <p className="text-gray-700 text-sm line-clamp-2 mb-4">{pet.petDescription}</p>
                        <button
                          onClick={() => {
                            const token = localStorage.getItem('petOwnerToken');
                            if (token) {
                              navigate('/adopt', { 
                                state: { 
                                  petName: pet.petName, 
                                  petImage: pet.petImage ? `http://localhost:5000${pet.petImage}` : 'https://via.placeholder.com/300',
                                  petType: pet.petSpecies
                                } 
                              });
                            } else {
                              navigate('/login', { 
                                state: { 
                                  from: { 
                                    pathname: '/adopt',
                                    state: {
                                      petName: pet.petName,
                                      petImage: pet.petImage ? `http://localhost:5000${pet.petImage}` : 'https://via.placeholder.com/300',
                                      petType: pet.petSpecies
                                    }
                                  } 
                                } 
                              });
                            }
                          }}
                          className="w-full bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white py-2 rounded-xl hover:shadow-lg transition-all duration-300"
                        >
                          Adopt Me
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Duplicate set for seamless scrolling */}
                  {featuredPets.map((pet) => (
                    <div
                      key={`${pet._id}-duplicate`}
                      className="flex-none w-80 mx-4 bg-white/80 rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-xl"
                    >
                      <div className="relative pt-[125%]">
                        <img
                          src={pet.petImage ? `http://localhost:5000${pet.petImage}` : 'https://via.placeholder.com/300'}
                          alt={pet.petName}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-[#B3704D] mb-2">{pet.petName}</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {pet.petBreed} • {pet.petAge} years old • {pet.petGender}
                        </p>
                        <p className="text-gray-700 text-sm line-clamp-2 mb-4">{pet.petDescription}</p>
                        <button
                          onClick={() => {
                            const token = localStorage.getItem('petOwnerToken');
                            if (token) {
                              navigate('/adopt', { 
                                state: { 
                                  petName: pet.petName, 
                                  petImage: pet.petImage ? `http://localhost:5000${pet.petImage}` : 'https://via.placeholder.com/300',
                                  petType: pet.petSpecies
                                } 
                              });
                            } else {
                              navigate('/login', { 
                                state: { 
                                  from: { 
                                    pathname: '/adopt',
                                    state: {
                                      petName: pet.petName,
                                      petImage: pet.petImage ? `http://localhost:5000${pet.petImage}` : 'https://via.placeholder.com/300',
                                      petType: pet.petSpecies
                                    }
                                  } 
                                } 
                              });
                            }
                          }}
                          className="w-full bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white py-2 rounded-xl hover:shadow-lg transition-all duration-300"
                        >
                          Adopt Me
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div id="grid-section">
        <Grid />
      </div>
    </>
  );
};

export default AdoptionHomePage;
