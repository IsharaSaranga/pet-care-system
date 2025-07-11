import React from 'react'
import { assets } from '../assets/assets'
import { PlusCircle, ShoppingBag, Package, FileText } from 'lucide-react'

const StoreAdminSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'add', label: 'Add Products', icon: <PlusCircle className="h-5 w-5" /> },
    { id: 'list', label: 'Product List', icon: <ShoppingBag className="h-5 w-5" /> },
    { id: 'orders', label: 'Manage Orders', icon: <Package className="h-5 w-5" /> },
    { id: 'reports', label: 'Sales Reports', icon: <FileText className="h-5 w-5" /> },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-[#80533b] to-[#D08860] shadow-2xl min-h-screen">
      <div className="p-6 border-b border-white/20 flex items-center">
        <img className="w-8 h-8 mr-3" src={assets.logo} alt="" />
        <h1 className="text-2xl font-bold text-white">Store Admin</h1>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex items-center p-3 rounded-lg cursor-pointer 
                ${activeTab === item.id 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/90 hover:bg-[#D08860]/20'}
                transition-all duration-300
              `}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default StoreAdminSidebar