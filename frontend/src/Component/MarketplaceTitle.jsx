import React from 'react'

const MarketplaceTitle = ({text1, text2}) => {
  return (
    <div className='inline-flex gap-2 items-center mb-3'>
        <p className='text-amber-800 font-bold text-3xl md:text-4xl'>
            {text1}
            <span className='text-amber-900 ml-2'>{text2}</span>
        </p>
        <div className='w-8 sm:w-12 h-[2px] bg-gradient-to-r from-[#D08860] to-[#B3714E]'></div>
    </div>
  )
}

export default MarketplaceTitle