import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { FaSearch } from 'react-icons/fa';

const SearchBar = () => {
    const { search, setSearch, showSearch } = useContext(ShopContext);

    return showSearch ? (
        <div className='text-center'> 
            <div className='relative max-w-md mx-auto'>
                <FaSearch className='absolute left-3 top-3.5 text-amber-600' />
                <input
                    type='text'
                    placeholder='Search by title or description...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='w-full py-3 pl-10 pr-4 rounded-full border border-amber-200 focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent bg-white shadow-sm hover:shadow-md transition-all duration-300'
                />
            </div>
        </div>
    ) : null;
};

export default SearchBar;
