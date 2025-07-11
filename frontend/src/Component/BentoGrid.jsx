import image1 from '../assets/BentoGridp2.jpeg'
import image2 from '../assets/BentoGridp3.jpeg'
import image3 from '../assets/BentoGridp4.jpeg'
import image4 from '../assets/BentoGridp1.jpeg'
import { PawPrint, Shield, Heart } from 'lucide-react'

export default function Grid() {
  return (
    <div className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] py-24 sm:py-32 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#B3704D]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#D08860]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-xl font-semibold text-[#B3704D] mb-3">Adopt Your Perfect Companion</h2>
          <h1 className="mx-auto mt-2 max-w-lg text-5xl font-extrabold text-gray-900 leading-tight">
            Your Journey to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">
              Pet Adoption
            </span>
          </h1>
        </div>

        <div className="mt-16 grid gap-6 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
          {[
            {
              icon: PawPrint,
              title: "Research & Preparation",
              description: "Learn about different pet types, your lifestyle compatibility, and prepare your home for a new furry friend.",
              image: image1
            },
            {
              icon: Shield,
              title: "Find Your Match",
              description: "Visit shelters, meet potential pets, and interact with animals to find the perfect companion for your family.",
              image: image2
            },
            {
              icon: Heart,
              title: "Application & Interview",
              description: "Complete adoption paperwork, undergo a shelter interview, and demonstrate your ability to provide a loving home.",
              image: image3
            },
            {
              icon: PawPrint,
              title: "Bringing Your Pet Home",
              description: "Finalize adoption, prepare your home, and start the exciting journey of bonding with your new family member.",
              image: image4
            }
          ].map((step, index) => (
            <div 
              key={index} 
              className={`relative group ${
                index === 0 ? 'lg:row-span-2' : 
                index === 3 ? 'lg:row-span-2' : 
                'max-lg:row-start-1'
              } ${
                index === 2 ? 'max-lg:row-start-3 lg:col-start-2 lg:row-start-2' : ''
              }`}
            >
              {/* Card background with gradient border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D08860]/20 to-[#B3704D]/20 p-[1px]">
                <div className="absolute inset-0 rounded-2xl bg-white/80 backdrop-blur-sm"></div>
              </div>

              {/* Card content */}
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div className="px-8 pt-8 pb-4 sm:px-10 sm:pt-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#B3704D]/10 rounded-xl">
                      <step.icon className="w-6 h-6 text-[#B3704D]" />
                    </div>
                    <p className="text-xl font-bold text-[#B3704D] max-lg:text-center">
                      {step.title}
                    </p>
                  </div>
                  <p className="mt-3 max-w-lg text-base text-gray-700 leading-relaxed max-lg:text-center">
                    {step.description}
                  </p>
                </div>

                {/* Image container with overlay */}
                <div className="relative w-full grow">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                  <div className="h-full overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}