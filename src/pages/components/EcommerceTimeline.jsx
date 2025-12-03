import React, { useState, useEffect } from 'react';

const EcommerceTimeline = () => {
  const [visibleItems, setVisibleItems] = useState([]);

  const timelineEvents = [
    {
      year: '2018-2020',
      color: 'bg-[#57ba40]',
      position: 'left',
      text: 'Began supplying homemade Healthmix powders and Idli & Dosa batter to Neighborhoods'
    },
    {
      year: '2021-2022',
      color: 'bg-green-100',
      position: 'right',
      text: 'Expanded with Grandma Styles spice Powders and Healthy nutrient rich products inspired by demand from families and working proffessionals'
    },
    {
      year: '2023-2024',
      color: 'bg-[#57ba40]',
      position: 'left',
      text: 'Launched Traditional rice and millet based flours, kozhukattai flours, and puttu flours to bring forgotten grains back into everyday diets'
    },
    {
      year: '2025',
      color: 'bg-green-100',
      position: 'right',
      text: 'Expanded into nutritious Malts,porridges, and laddus designed for kids, adults and elders'
    },
  
  ];

  useEffect(() => {
    timelineEvents.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => [...prev, index]);
      }, index * 150);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white py-8 md:py-12 px-4">
        
      <div className="max-w-6xl mx-auto">
        {/* Timeline Container */}
        <div className="relative py-8">
          {/* Center Line - Hidden on mobile */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500"></div>

          

          {/* Timeline Events */}
          <div className="space-y-6 md:space-y-12">
            {timelineEvents.map((event, index) => (
              <div
                key={index}
                className={`relative transition-all duration-700 ${
                  visibleItems.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                {/* Desktop & Tablet Layout */}
                <div className="hidden md:flex items-center justify-center">
                  {event.position === 'left' ? (
                    <>
                      {/* Left side content */}
                      <div className="w-5/12 pr-8 flex justify-end">
                        <div
                          className={`${event.color} ${event.textColor || 'text-gray-800'} p-4 md:p-5 rounded-lg shadow-lg max-w-xs transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                        >
                          <p className="text-sm leading-relaxed">{event.text}</p>
                        </div>
                      </div>
                      
                      {/* Year Badge */}
                      <div className={`${event.color} px-4 py-2 rounded-full shadow-md z-10 font-bold text-sm border-4 border-white flex-shrink-0`}>
                        {event.year}
                      </div>
                      
                      {/* Right side spacer */}
                      <div className="w-5/12"></div>
                    </>
                  ) : (
                    <>
                      {/* Left side spacer */}
                      <div className="w-5/12"></div>
                      
                      {/* Year Badge */}
                      <div className={`${event.color} px-4 py-2 rounded-full shadow-md z-10 font-bold text-sm border-4 border-white flex-shrink-0`}>
                        {event.year}
                      </div>
                      
                      {/* Right side content */}
                      <div className="w-5/12 pl-8 flex justify-start">
                        <div
                          className={`${event.color} ${event.textColor || 'text-gray-800'} p-4 md:p-5 rounded-lg shadow-lg max-w-xs transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                        >
                          <p className="text-sm leading-relaxed">{event.text}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden flex items-start gap-3">
                  {/* Year Badge */}
                  <div className={`${event.color} px-3 py-1 rounded-full shadow-md font-bold text-xs border-2 border-white flex-shrink-0 mt-1`}>
                    {event.year}
                  </div>
                  
                  {/* Content Box */}
                  <div
                    className={`${event.color} ${event.textColor || 'text-gray-800'} p-3 rounded-lg shadow-lg flex-1 transform transition-all duration-300`}
                  >
                    <p className="text-xs leading-relaxed">{event.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 767px) {
          .space-y-6 > * + * {
            margin-top: 1rem;
          }
        }
        
        @media (min-width: 768px) and (max-width: 1023px) {
          .max-w-xs {
            max-width: 16rem;
          }
        }
        
        @media (min-width: 1024px) {
          .max-w-xs {
            max-width: 20rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EcommerceTimeline;