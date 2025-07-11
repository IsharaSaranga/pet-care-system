import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import MarketplaceTitle from '../Component/MarketplaceTitle';
import ProductItem from '../Component/ProductItem';
import SearchBar from '../Component/SearchBar';
import { FaPaw, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Collection = () => {
  const { products, search, showSearch, currency } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relavant');
  const navigate = useNavigate();

  const toggleCategory = (e) => {
    if(category.includes(e.target.value)){
      setCategory(prev=>prev.filter(item=>item!==e.target.value));
    } else {
      setCategory(prev=>[...prev,e.target.value]);
    }
  }

  const toggleSubCategory = (e) => {
    if(subCategory.includes(e.target.value)){
      setSubCategory(prev=>prev.filter(item=>item!==e.target.value));
    } else {
      setSubCategory(prev=>[...prev,e.target.value]);
    }
  }

  const applyFilter = () => {
    let productsCopy = products.slice();

    if(showSearch && search){
      productsCopy = productsCopy.filter(item=>item.name.toLowerCase().includes(search.toLowerCase()))
    }

    if(category.length>0){
      productsCopy = productsCopy.filter(item=>category.includes(item.category));
    }
    if(subCategory.length>0){
      productsCopy = productsCopy.filter(item=>subCategory.includes(item.subCategory));
    }

    setFilterProducts(productsCopy);
  }

    const sortProducts = () => {
      let fpCopy = filterProducts.slice();

      switch(sortType){
        case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>a.price-b.price));
        break;
        case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>b.price-a.price));
        break;
        default:
          applyFilter();
          break;
    }
  }

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  useEffect(()=>{
    applyFilter();
  },[category,subCategory,search,showSearch,products]);

  useEffect(()=>{
    sortProducts();
  },[sortType]);

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-amber-100 rounded-2xl p-6 md:p-10 mb-8 shadow-md mt-32">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-amber-900">Pet Products Collection</h1>
          <p className="text-center text-amber-800 mb-6 max-w-2xl mx-auto">
            Discover our wide range of pet products. From food to accessories, find everything your furry friend needs.
          </p>

          <SearchBar/>
        </div>

        <div className="flex flex-wrap justify-between items-center mb-8">
          <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
            <button className="px-4 py-2 rounded-full shadow-md flex items-center bg-[#D08860] text-white hover:bg-[#B3714E] transition-all duration-300">
              <FaPaw className="mr-2" /> All Products
            </button>
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className="px-4 py-2 rounded-full shadow-md flex items-center bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all duration-300"
            >
              <FaFilter className="mr-2" /> Filter
            </button>
          </div>

          <select 
            onChange={(e)=>setSortType(e.target.value)} 
            className="border border-amber-200 text-sm px-4 py-2 rounded-full bg-white text-amber-900 focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent transition-all duration-200"
          >
            <option value='relavant'>Sort by: Relevant</option>
            <option value='low-high'>Sort by: Low to High</option>
            <option value='high-low'>Sort by: High to Low</option>
          </select>
        </div>

        {/* Filter Section */}
        {showFilter && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Filter */}
              <div className="border border-amber-200 rounded-xl p-4">
                <p className="mb-3 text-sm font-semibold text-amber-800">CATEGORIES</p>
                <div className="flex flex-col gap-3 text-sm text-amber-700">
                  <label className="flex items-center gap-2 hover:text-amber-900 cursor-pointer transition-colors duration-200">
                    <input className="w-4 h-4 text-[#D08860] rounded border-amber-300 focus:ring-[#D08860]" type="checkbox" value="Dog" onChange={toggleCategory} /> 
                    DOG
                  </label>
                  <label className="flex items-center gap-2 hover:text-amber-900 cursor-pointer transition-colors duration-200">
                    <input className="w-4 h-4 text-[#D08860] rounded border-amber-300 focus:ring-[#D08860]" type="checkbox" value="Cat" onChange={toggleCategory} /> 
                    CAT
                  </label>
                  <label className="flex items-center gap-2 hover:text-amber-900 cursor-pointer transition-colors duration-200">
                    <input className="w-4 h-4 text-[#D08860] rounded border-amber-300 focus:ring-[#D08860]" type="checkbox" value="Other" onChange={toggleCategory}/> 
                    OTHER
                  </label>
                </div>
        </div>

              {/* Type Filter */}
              <div className="border border-amber-200 rounded-xl p-4">
                <p className="mb-3 text-sm font-semibold text-amber-800">TYPE</p>
                <div className="flex flex-col gap-3 text-sm text-amber-700">
                  <label className="flex items-center gap-2 hover:text-amber-900 cursor-pointer transition-colors duration-200">
                    <input className="w-4 h-4 text-[#D08860] rounded border-amber-300 focus:ring-[#D08860]" type="checkbox" value="Food" onChange={toggleSubCategory}/> 
                    FOOD
                  </label>
                  <label className="flex items-center gap-2 hover:text-amber-900 cursor-pointer transition-colors duration-200">
                    <input className="w-4 h-4 text-[#D08860] rounded border-amber-300 focus:ring-[#D08860]" type="checkbox" value="Vitamin" onChange={toggleSubCategory}/> 
                    VITAMIN
                  </label>
                  <label className="flex items-center gap-2 hover:text-amber-900 cursor-pointer transition-colors duration-200">
                    <input className="w-4 h-4 text-[#D08860] rounded border-amber-300 focus:ring-[#D08860]" type="checkbox" value="Medicine" onChange={toggleSubCategory} /> 
                    MEDICINE
                  </label>
                  <label className="flex items-center gap-2 hover:text-amber-900 cursor-pointer transition-colors duration-200">
                    <input className="w-4 h-4 text-[#D08860] rounded border-amber-300 focus:ring-[#D08860]" type="checkbox" value="Other" onChange={toggleSubCategory} /> 
                    OTHER ACCESSORIES
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filterProducts.map((item) => (
            <div key={item._id} className="product-card bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="overflow-hidden rounded-lg">
                <img 
                  className="w-full h-48 object-cover hover:scale-110 transition ease-in-out duration-300" 
                  src={item.image[0]} 
                  alt={item.name}
                />
              </div>
              <div className="mt-3 space-y-2">
                <h3 className="text-lg font-semibold text-amber-900 line-clamp-2">{item.name}</h3>
                <p className="text-xl font-bold text-[#D08860]">{currency}{item.price}</p>
              </div>
              <button
                onClick={() => handleViewProduct(item._id)}
                className="mt-4 w-full bg-[#D08860] text-white px-4 py-2 rounded-full hover:bg-[#B3714E] transition-all duration-200"
              >
                View Product
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;