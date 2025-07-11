'use client';

import { User2Icon, BarChart, Smartphone, Wrench, Activity } from "lucide-react";

export default function AttendeeSection() {
  return (
    <section className="bg-[#F5EFEA] py-16">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div className="flex justify-center bg-gradient-to-r from-orange-500 to-pink-400 rounded-3xl p-4">
            <img
              src="/eventback.jpg"
              alt="Event Hosting"
              className="w-full max-w-lg rounded-lg shadow-lg"
            />
          </div>

          {/* Right Side - Text Content */}
          <div>
            <h2 className="text-3xl font-extrabold text-amber-950">
              FIND YOUR PERFECT AUDIENCE
            </h2>
            <p className="mt-4 text-gray-700 mb-6">
            Reach the right people and make every event a success
            </p>

            <div className="space-y-6">
              {/* Feature 1 */}
              <div className="flex items-start space-x-4">
                <User2Icon className="size-8 text-gray-900" />
                <div>
                  <h3 className="text-lg font-bold text-amber-950">Attendee Discovery</h3>
                  <p className="text-gray-600">
                  The right people make the best events. Discover, connect, and grow your audience                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start space-x-4">
                <Activity className="size-8 text-gray-900" />
                <div>
                  <h3 className="text-lg font-bold text-amber-950">Ads</h3>
                  <p className="text-gray-600">
                  Promote your event, amplify your reach—get noticed with powerful ads                </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start space-x-4">
                <Wrench className="size-8 text-gray-900" />
                <div>
                  <h3 className="text-lg font-bold text-amber-950">Marketing Tools</h3>
                  <p className="text-gray-600">
                  Engage attendees and reach new ones with our suite of automated email and social marketing tools                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
