'use client'
import React from 'react'
import { Heart, PawPrint, Shield } from 'lucide-react'
import Right_side from '../assets/Dog1.jpeg'

export default function HeroSection() {
  return (
    <div className="bg-gradient-to-br from-[#FFF5E6] via-[#FCF0E4] to-[#F5EFEA] min-h-screen flex items-center overflow-hidden relative pt-25 pb-15 mt-15">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#D08860]/10 rounded-full blur-3xl animate-pulse"/>
        <div className="absolute right-1/4 top-1/3 w-72 h-72 bg-[#B3704D]/10 rounded-full blur-2xl animate-pulse delay-700"/>
        <div className="absolute -right-20 -bottom-20 w-[500px] h-[500px] bg-[#D08860]/10 rounded-full blur-3xl animate-pulse delay-1000"/>
        <div className="absolute left-1/3 bottom-1/4 w-64 h-64 bg-[#B3704D]/10 rounded-full blur-2xl animate-pulse delay-500"/>
      </div>

      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D08860]/20 to-[#B3704D]/20 rounded-3xl transform rotate-6 scale-105 transition-transform duration-300 group-hover:rotate-4"/>
          <div className="rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(211,136,96,0.3)] relative">
            <img 
              src={Right_side}
              alt="Adorable pet waiting for adoption" 
              className="w-full h-150 object-top object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
          </div>
          <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg transform group-hover:scale-110 transition-all duration-300">
            <Heart className="text-[#D08860] w-10 h-10 animate-pulse" fill="#D08860" fillOpacity={0.3} />
          </div>
        </div>

        <div className="space-y-8 transform transition-all duration-300 hover:translate-x-2">
          <div className="overflow-hidden">
            <h1 className="text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Open Your{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D] animate-gradient">Heart</span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#D08860] to-[#B3704D] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"/>
              </span>
              <br />
              Open Your{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D] animate-gradient">Home</span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#D08860] to-[#B3704D] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"/>
              </span>
            </h1>
          
            <p className="text-xl text-gray-700 leading-relaxed font-medium">
              Every pet deserves a second chance. By choosing adoption, you're not just rescuing a furry friend—you're gaining a loyal companion who will fill your life with unconditional love and joy.
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              { icon: PawPrint, text: "Rescue a furry friend in need" },
              { icon: Shield, text: "Create a bond that lasts a lifetime" },
              { icon: Heart, text: "Make a difference, one paw at a time" }
            ].map((item, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-lg 
                         transform hover:translate-x-2 transition-all duration-300 group border border-transparent
                         hover:border-[#D08860]/20"
              >
                <div className="bg-gradient-to-br from-[#D08860]/10 to-[#B3704D]/10 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="text-[#D08860] w-7 h-7 flex-shrink-0" />
                </div>
                <span className="text-lg text-gray-800 font-medium">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}