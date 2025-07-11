'use client';

import { useState } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { name: 'Home', path: '/admin/redirect/event_manager/dashboard' },
  { name: 'Create Event', path: '/admin/redirect/event_manager/create' },
  { name: 'Events', path: '/admin/redirect/event_manager/events' },
  { name: 'Analytics', path: '/admin/redirect/event_manager/analytics' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear admin-specific keys
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // Redirect to staff login page
    navigate('/stafflogin');
  };

  return (
    <>
      {/* Sidebar for Desktop */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:bg-gradient-to-br lg:from-[#FFF5E6] lg:to-[#F5EFEA] lg:shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-amber-100">
            <img
              alt="Logo"
              src="/logo.jpg"
              className="h-12 w-auto transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={classNames(
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white'
                    : 'text-gray-900 hover:bg-gradient-to-r hover:from-[#D08860] hover:to-[#B3704D] hover:text-white',
                  'block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Bottom Section: Logout */}
          <div className="p-4 border-t border-amber-100">
            <div className="space-y-4">
              {/* Logout Button */}
              <Link
                to="#"
                onClick={handleLogout}
                className="w-full bg-amber-50 text-amber-800 px-4 py-3 rounded-xl text-base font-medium hover:bg-amber-100 transition-all duration-300 block shadow-sm hover:shadow-md transform hover:scale-105"
              >
                Log Out
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Disclosure as="div" className="lg:hidden">
        {({ open }) => (
          <>
            {/* Mobile Menu Button */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] shadow-lg">
              <img
                alt="Logo"
                src="/logo.jpg"
                className="h-12 w-auto transition-transform duration-300 hover:scale-105"
              />
              <DisclosureButton className="p-3 rounded-xl bg-amber-50 text-amber-800 hover:bg-gradient-to-r hover:from-[#D08860] hover:to-[#B3704D] hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md">
                {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </DisclosureButton>
            </div>

            {/* Mobile Menu Panel */}
            <DisclosurePanel className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] shadow-lg">
              <div className="px-4 py-6 space-y-3">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={classNames(
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white'
                        : 'text-gray-900 hover:bg-gradient-to-r hover:from-[#D08860] hover:to-[#B3704D] hover:text-white',
                      'block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="p-4 border-t border-amber-100">
                <div className="space-y-4">
                  {/* Logout Button */}
                  <Link
                    to="#"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-amber-50 text-amber-800 px-4 py-3 rounded-xl text-base font-medium hover:bg-amber-100 transition-all duration-300 block shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    Log Out
                  </Link>
                </div>
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </>
  );
}