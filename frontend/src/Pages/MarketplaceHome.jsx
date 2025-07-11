import React from 'react'
import LatestCollections from '../Component/LatestCollections'
import Hero from '../Component/Hero'
import BestSeller from '../Component/BestSeller'
import OurPolicy from '../Component/OurPolicy'
import NewsletterBox from '../Component/NewsLetterBox'

const MarketplaceHome = () => {
  return (
    <div>
        <Hero/>
        <LatestCollections/>
        <BestSeller/>
        <OurPolicy/>
        <NewsletterBox/>
    </div>
  )
}

export default MarketplaceHome