// Dashboard.js
import React from "react";
import Header from "../Component/EventHeader";
import Footer from "../Component/EventFooter";
import EventHostingSection from "../Component/EventHostingSection";
import AttendeeSection from "../Component/EventAttendeeSection";
import HeroSection from "../Component/EventHeroSection"; // Import the new IntroSection component

const Dashboard = () => {
  return (
    <div className=" min-h-screen">
      {/* Use the reusable IntroSection component */}
      <HeroSection
        title="Transform Your Ideas into Reality"
        subtitle="Empowering event organizers to connect, engage, and create memories that last"
        backgroundImage="/back.jpeg"
        buttonText="Get started"
        buttonLink="#"
      />

      <EventHostingSection />
      <AttendeeSection />
      <Footer />
    </div>
  );
};

export default Dashboard;
