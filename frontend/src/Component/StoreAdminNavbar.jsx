import React from 'react';
import { assets } from '../assets/assets';
import { PawPrint } from 'lucide-react';

const StoreAdminNavbar = ({ setToken }) => {
  return (
    <div className="flex items-center py-4 px-[4%] justify-between bg-gradient-to-r from-[#80533b] to-[#D08860] shadow-md">
      <div className="flex items-center">
        <PawPrint className="mr-3 text-white" size={40} />
        <img className="w-[max(8%,60px)]" src={assets.logo} alt="" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white tracking-wider">Fluffy Care</h1>
        <h2 className="text-lg font-semibold text-white/80 mt-1 tracking-wide">Admin Panel</h2>
      </div>
      
      <button
        onClick={() => setToken('')}
        className="bg-white text-[#80533b] px-5 py-2 rounded-full shadow-lg hover:scale-105 transition-transform font-medium"
      >
        Logout
      </button>
    </div>
  );
};

export default StoreAdminNavbar;