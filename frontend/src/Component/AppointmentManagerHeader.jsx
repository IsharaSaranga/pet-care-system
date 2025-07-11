import { Link, useLocation } from 'react-router-dom';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import {
  BellIcon,
  ChevronDownIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ScissorsIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import image4 from '../assets/image4.jpg';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/redirect/appointment_manager/dashboard' },
  { name: 'Refund Request', path: '/admin/redirect/appointment_manager/refund-request' },
  { name: 'Reports', path: '/admin/redirect/appointment_manager/reports' },
  { name: 'View Active Professionals', path: '/admin/redirect/appointment_manager/professionals/active' },
];

const appointments = [
  { name: 'Vet Appointments', path: '/admin/redirect/appointment_manager/appointments/vet', icon: CalendarIcon },
  { name: 'Grooming Appointments', path: '/admin/redirect/appointment_manager/appointments/grooming', icon: ScissorsIcon },
  { name: 'Pet Training Appointments', path: '/admin/redirect/appointment_manager/appointments/training', icon: ClipboardDocumentCheckIcon },
  { name: 'Appointment History', path: '/admin/redirect/appointment_manager/appointments/history', icon: ClockIcon },
];

const professionalAvailability = [
  { name: 'Vet Availability', path: '/admin/redirect/appointment_manager/availability/vet', icon: CalendarIcon },
  { name: 'Groomer Availability', path: '/admin/redirect/appointment_manager/availability/groomer', icon: ScissorsIcon },
  { name: 'Pet Trainer Availability', path: '/admin/redirect/appointment_manager/availability/trainer', icon: ClipboardDocumentCheckIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function AppointmentManagerSidebar() {
  const location = useLocation();

  const handleLogout = () => {
    // Clear admin-specific keys
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/stafflogin';
  };

  return (
    <>
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:bg-white lg:shadow-md">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <img alt="Logo" src={image4} className="h-10 w-auto" />
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={classNames(
                  location.pathname === item.path
                    ? 'bg-amber-950 text-white'
                    : 'text-gray-900 hover:bg-amber-950 hover:text-white',
                  'block px-4 py-2 rounded-md text-sm font-medium transition'
                )}
              >
                {item.name}
              </Link>
            ))}

            <Disclosure as="div" className="space-y-1">
              {({ open }) => (
                <>
                  <DisclosureButton
                    className={classNames(
                      open ? 'bg-amber-950 text-white' : 'text-gray-900 hover:bg-amber-950 hover:text-white',
                      'flex w-full items-center px-4 py-2 rounded-md text-sm font-medium transition'
                    )}
                  >
                    Appointments
                    <ChevronDownIcon
                      className={classNames(open ? 'rotate-180' : '', 'ml-auto h-5 w-5 text-gray-400')}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="space-y-1 pl-4">
                    {appointments.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={classNames(
                          location.pathname === item.path
                            ? 'bg-amber-100 text-amber-900'
                            : 'text-gray-700 hover:bg-amber-100 hover:text-amber-900',
                          'flex items-center space-x-2 px-4 py-2 rounded-md text-sm transition'
                        )}
                      >
                        <item.icon className="h-5 w-5 text-gray-500" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>

            <Disclosure as="div" className="space-y-1">
              {({ open }) => (
                <>
                  <DisclosureButton
                    className={classNames(
                      open ? 'bg-amber-950 text-white' : 'text-gray-900 hover:bg-amber-950 hover:text-white',
                      'flex w-full items-center px-4 py-2 rounded-md text-sm font-medium transition'
                    )}
                  >
                    Professionals Availability
                    <ChevronDownIcon
                      className={classNames(open ? 'rotate-180' : '', 'ml-auto h-5 w-5 text-gray-400')}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="space-y-1 pl-4">
                    {professionalAvailability.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={classNames(
                          location.pathname === item.path
                            ? 'bg-amber-100 text-amber-900'
                            : 'text-gray-700 hover:bg-amber-100 hover:text-amber-900',
                          'flex items-center space-x-2 px-4 py-2 rounded-md text-sm transition'
                        )}
                      >
                        <item.icon className="h-5 w-5 text-gray-500" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="w-full bg-gray-100 text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
              >
                Logout
              </button>

              <div className="flex items-center justify-between">
                <button className="relative p-2 rounded-full bg-white text-gray-900 hover:text-white hover:bg-amber-950 focus:outline-none focus:ring-2 focus:ring-white">
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" />
                </button>

                <Menu as="div" className="relative">
                  <MenuButton className="flex rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-white">
                    <img
                      alt="Profile"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      className="h-8 w-8 rounded-full"
                    />
                  </MenuButton>
                  <MenuItems className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black/5 py-1">
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          to="#"
                          className={classNames(
                            active ? 'bg-amber-100 text-amber-900' : 'text-gray-900',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Your Profile
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          to="#"
                          className={classNames(
                            active ? 'bg-amber-100 text-amber-900' : 'text-gray-900',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Settings
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          to="#"
                          onClick={handleLogout}
                          className={classNames(
                            active ? 'bg-amber-100 text-amber-900' : 'text-gray-900',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Sign out
                        </Link>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Disclosure as="div" className="lg:hidden">
        {({ open }) => (
          <>
            <div className="flex items-center justify-between p-4 bg-white shadow-md">
              <img alt="Logo" src={image4} className="h-10 w-auto" />
              <DisclosureButton className="p-2 rounded-md bg-white text-gray-900 hover:bg-amber-950 hover:text-white focus:outline-none focus:ring-2 focus:ring-white">
                {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </DisclosureButton>
            </div>

            <DisclosurePanel className="bg-white shadow-md">
              <div className="px-4 py-6 space-y-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={classNames(
                      location.pathname === item.path
                        ? 'bg-amber-950 text-white'
                        : 'text-gray-900 hover:bg-amber-950 hover:text-white',
                      'block px-4 py-2 rounded-md text-sm font-medium transition'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}

                <Disclosure as="div" className="space-y-1">
                  {({ open: disclosureOpen }) => (
                    <>
                      <DisclosureButton
                        className={classNames(
                          disclosureOpen ? 'bg-amber-950 text-white' : 'text-gray-900 hover:bg-amber-950 hover:text-white',
                          'flex w-full items-center px-4 py-2 rounded-md text-sm font-medium transition'
                        )}
                      >
                        Appointments
                        <ChevronDownIcon
                          className={classNames(disclosureOpen ? 'rotate-180' : '', 'ml-auto h-5 w-5 text-gray-400')}
                        />
                      </DisclosureButton>
                      <DisclosurePanel className="space-y-1 pl-4">
                        {appointments.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            className={classNames(
                              location.pathname === item.path
                                ? 'bg-amber-100 text-amber-900'
                                : 'text-gray-700 hover:bg-amber-100 hover:text-amber-900',
                              'flex items-center space-x-2 px-4 py-2 rounded-md text-sm transition'
                            )}
                          >
                            <item.icon className="h-5 w-5 text-gray-500" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>

                <Disclosure as="div" className="space-y-1">
                  {({ open: disclosureOpen }) => (
                    <>
                      <DisclosureButton
                        className={classNames(
                          disclosureOpen ? 'bg-amber-950 text-white' : 'text-gray-900 hover:bg-amber-950 hover:text-white',
                          'flex w-full items-center px-4 py-2 rounded-md text-sm font-medium transition'
                        )}
                      >
                        Professionals Availability
                        <ChevronDownIcon
                          className={classNames(disclosureOpen ? 'rotate-180' : '', 'ml-auto h-5 w-5 text-gray-400')}
                        />
                      </DisclosureButton>
                      <DisclosurePanel className="space-y-1 pl-4">
                        {professionalAvailability.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            className={classNames(
                              location.pathname === item.path
                                ? 'bg-amber-100 text-amber-900'
                                : 'text-gray-700 hover:bg-amber-100 hover:text-amber-900',
                              'flex items-center space-x-2 px-4 py-2 rounded-md text-sm transition'
                            )}
                          >
                            <item.icon className="h-5 w-5 text-gray-500" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="space-y-4">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-gray-100 text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                  >
                    Logout
                  </button>

                  <div className="flex items-center justify-between">
                    <button className="relative p-2 rounded-full bg-white text-gray-900 hover:text-white hover:bg-amber-950 focus:outline-none focus:ring-2 focus:ring-white">
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" />
                    </button>
                    <Menu as="div" className="relative">
                      <MenuButton className="flex rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-white">
                        <img
                          alt="Profile"
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                          className="h-8 w-8 rounded-full"
                        />
                      </MenuButton>
                      <MenuItems className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black/5 py-1">
                        <MenuItem>
                          {({ active }) => (
                            <Link
                              to="#"
                              className={classNames(
                                active ? 'bg-amber-100 text-amber-900' : 'text-gray-900',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              Your Profile
                            </Link>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <Link
                              to="#"
                              className={classNames(
                                active ? 'bg-amber-100 text-amber-900' : 'text-gray-900',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              Settings
                            </Link>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <Link
                              to="#"
                              onClick={handleLogout}
                              className={classNames(
                                active ? 'bg-amber-100 text-amber-900' : 'text-gray-900',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              Sign out
                            </Link>
                          )}
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </div>
                </div>
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </>
  );
}