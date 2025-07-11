import { Ticket, BarChart, Smartphone } from "lucide-react";

export default function EventHostingSection() {
  return (
    <div className="bg-[#F5EFEA] py-16 px-6 lg:px-20 flex flex-col lg:flex-row items-center gap-10">
      {/* Left Content */}
      <div className="max-w-lg">
        <h2 className="text-3xl font-extrabold text-amber-950">
          EVENT HOSTING MADE EASY
        </h2>
        <p className="mt-4 text-gray-700">
          Easily create events for free on a platform that attendees love and trust.
        </p>
        <div className="mt-6 space-y-6">
          <div className="flex items-start gap-4">
            <Ticket className="size-8 text-gray-900" />
            <div>
              <h3 className="text-lg font-bold text-amber-950">Event Ticketing</h3>
              <p className="text-gray-600">
                Sell more tickets with customizable event pages and a seamless checkout 
                experience for attendees on a trusted platform.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <BarChart className="size-8 text-gray-900" />
            <div>
              <h3 className="text-lg font-bold text-amber-950">Reporting & Analytics</h3>
              <p className="text-gray-600">
                Learn more about your buyers and discover where sales are coming 
                from with real-time analytics.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Smartphone className="size-8 text-gray-900" />
            <div>
              <h3 className="text-lg font-bold text-amber-950">Organizer App</h3>
              <p className="text-gray-600">
                Check guests in, sell tickets at the door, and track data with our 
                easy-to-use Eventbrite Organizer App.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content - Mobile UI Mockup */}
      <div className="relative w-full max-w-s">
        <div className="bg-gradient-to-r from-orange-500 to-pink-400 rounded-3xl p-4">
          <img 
            src="/dog.jpg"
            alt="Mobile App UI" 
            className="rounded-2xl shadow-lg"
          />
        </div>
      </div>
      
    </div>
    
    
  );
}
