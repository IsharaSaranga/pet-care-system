'use client';
import { Link } from 'react-router-dom';

export default function DoctorFooter() {
  return (
    <footer className="bg-[#D08860] text-white py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Appointments */}
          <div>
            <h3 className="text-lg font-semibold text-amber-950 mb-3">Appointments</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/appointments/book" 
                  className="hover:text-amber-950 transition-colors duration-300"
                >
                  Book an Appointment
                </Link>
              </li>
              <li>
                <Link 
                  to="/appointments/manage" 
                  className="hover:text-amber-950 transition-colors duration-300"
                >
                  Manage Appointments
                </Link>
              </li>
              <li>
                <Link 
                  to="/appointments/history" 
                  className="hover:text-amber-950 transition-colors duration-300"
                >
                  Appointment History
                </Link>
              </li>
            </ul>
          </div>

          {/* Professional Availability */}
          <div>
            <h3 className="text-lg font-semibold text-amber-950 mb-3">Professional Availability</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/availability/vet" 
                  className="hover:text-amber-950 transition-colors duration-300"
                >
                  Vet Availability
                </Link>
              </li>
              <li>
                <Link 
                  to="/availability/groomer" 
                  className="hover:text-amber-950 transition-colors duration-300"
                >
                  Groomer Availability
                </Link>
              </li>
              <li>
                <Link 
                  to="/availability/trainer" 
                  className="hover:text-amber-950 transition-colors duration-300"
                >
                  Trainer Availability
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-amber-950 mb-3">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/faq" 
                  className="hover:text-amber-950 transition-colors duration-300"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="hover:text-amber-950 transition-colors duration-300"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="hover:text-amber-950 transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h3 className="text-lg font-semibold text-amber-950 mb-3">Stay Connected</h3>
            <div className="flex space-x-4">
              <Link 
                to="#" 
                className="hover:text-amber-950 transition-colors duration-300"
              >
                Facebook
              </Link>
              <Link 
                to="#" 
                className="hover:text-amber-950 transition-colors duration-300"
              >
                Twitter
              </Link>
              <Link 
                to="#" 
                className="hover:text-amber-950 transition-colors duration-300"
              >
                Instagram
              </Link>
            </div>
          </div>
        </div>

        <hr className="border-gray-900 my-6" />

        <p className="text-amber-950 text-center text-sm">
          © {new Date().getFullYear()} Appointment Management. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
