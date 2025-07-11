'use client';
import { Link } from 'react-router-dom';
// Import icons from a popular icon library
import { FaFacebook, FaTwitter, FaInstagram, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#D08860] text-white py-12  relative">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Explore (User and General Links) */}
          <div className="transition-all duration-300 hover:translate-y-[-5px]">
            <h3 className="text-lg font-bold text-amber-950 mb-4 pb-2 border-b border-amber-800">Explore</h3>
            <ul className="space-y-3">
              <li><Link to="/aboutus" className="hover:text-amber-950 transition-colors duration-200 flex items-center">
                <span className="mr-1">›</span> About Us
              </Link></li>
              <li><Link to="/events" className="hover:text-amber-950 transition-colors duration-200 flex items-center">
                <span className="mr-1">›</span> Browse Events
              </Link></li>
              <li><Link to="/blog" className="hover:text-amber-950 transition-colors duration-200 flex items-center">
                <span className="mr-1">›</span> Blog
              </Link></li>
              <li><Link to="/faqs" className="hover:text-amber-950 transition-colors duration-200 flex items-center">
                <span className="mr-1">›</span> FAQs
              </Link></li>
            </ul>
          </div>
          
          {/* Pet Owner / User Links */}
          <div className="transition-all duration-300 hover:translate-y-[-5px]">
            <h3 className="text-lg font-bold text-amber-950 mb-4 pb-2 border-b border-amber-800">For Pet Owners</h3>
            <ul className="space-y-3">
              <li><Link to="/adoption" className="hover:text-amber-950 transition-colors duration-200 flex items-center">
                <span className="mr-1">›</span> Pet Adoption
              </Link></li>
              <li><Link to="/marketplace" className="hover:text-amber-950 transition-colors duration-200 flex items-center">
                <span className="mr-1">›</span> Marketplace
              </Link></li>
              <li><Link to="/profile" className="hover:text-amber-950 transition-colors duration-200 flex items-center">
                <span className="mr-1">›</span> Profile
              </Link></li>
              <li><Link to="/notifications" className="hover:text-amber-950 transition-colors duration-200 flex items-center">
                <span className="mr-1">›</span> Notifications
              </Link></li>
              <li><Link to="/appointment" className="hover:text-amber-950 transition-colors duration-200 flex items-center">
                <span className="mr-1">›</span> Book Vet Appointment
              </Link></li>
            </ul>
          </div>
          
          {/* Help and Legal (Support and policy-related links) */}
          <div className="transition-all duration-300 hover:translate-y-[-5px]">
            <h3 className="text-lg font-bold text-amber-950 mb-4 pb-2 border-b border-amber-800">Help & Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/support" className="hover:text-amber-950 transition-colors duration-200 flex items-center">
                <span className="mr-1">›</span> Support
              </Link></li>
              <li><Link to="/contactus" className="hover:text-amber-950 transition-colors duration-200 flex items-center">
                <span className="mr-1">›</span> Contact Us
              </Link></li>
              <li><Link to="/privacy-policy" className="hover:text-amber-950 transition-colors duration-200 flex items-center">
                <span className="mr-1">›</span> Privacy Policy
              </Link></li>
              <li><Link to="/terms-of-service" className="hover:text-amber-950 transition-colors duration-200 flex items-center">
                <span className="mr-1">›</span> Terms of Service
              </Link></li>
            </ul>
          </div>
          
          {/* Social Media with Icons */}
          <div className="transition-all duration-300 hover:translate-y-[-5px]">
            <h3 className="text-lg font-bold text-amber-950 mb-4 pb-2 border-b border-amber-800">Connect With Us</h3>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-6">
                <a href="https://facebook.com/petcaresystem" target="_blank" rel="noopener noreferrer" 
                   className="text-white hover:text-amber-950 transition-all duration-300 hover:scale-110">
                  <FaFacebook size={24} />
                </a>
                <a href="https://twitter.com/petcaresystem" target="_blank" rel="noopener noreferrer"
                   className="text-white hover:text-amber-950 transition-all duration-300 hover:scale-110">
                  <FaTwitter size={24} />
                </a>
                <a href="https://instagram.com/petcaresystem" target="_blank" rel="noopener noreferrer"
                   className="text-white hover:text-amber-950 transition-all duration-300 hover:scale-110">
                  <FaInstagram size={24} />
                </a>
                <a href="mailto:contact@petcaresystem.com"
                   className="text-white hover:text-amber-950 transition-all duration-300 hover:scale-110">
                  <FaEnvelope size={24} />
                </a>
              </div>
              
              {/* Newsletter Signup */}
              <div className="mt-4">
                <p className="text-sm mb-2">Join our newsletter:</p>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="px-3 py-2 text-sm text-gray-800 rounded-l focus:outline-none w-full"
                  />
                  <button className="bg-amber-950 hover:bg-amber-900 px-3 py-2 rounded-r text-white transition-colors duration-200">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <hr className="border-amber-800/40 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-amber-950 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Pet Care System. All rights reserved.
          </p>
          <div className="flex space-x-4 text-sm text-amber-950">
            <Link to="/sitemap" className="hover:text-white transition-colors duration-200">Sitemap</Link>
            <span>|</span>
            <Link to="/accessibility" className="hover:text-white transition-colors duration-200">Accessibility</Link>
            <span>|</span>
            <Link to="/cookies" className="hover:text-white transition-colors duration-200">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}