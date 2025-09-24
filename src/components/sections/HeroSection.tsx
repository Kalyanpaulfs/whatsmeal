import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ChefHat, ArrowRight, Sparkles, Star, Award } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import HeroImage1 from '../../assets/hero_1.png';
import HeroImage2 from '../../assets/hero_2.png';
import HeroImage3 from '../../assets/hero_3.png';

interface HeroSectionProps {
  onExploreMenu?: () => void;
  onViewSpecials?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  onExploreMenu = () => console.log('Explore Menu clicked'),
  onViewSpecials = () => console.log('View Specials clicked')
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { status, deliveryAvailable } = useRestaurantStore();
  
  const heroImages = [HeroImage1, HeroImage2, HeroImage3];
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Rotate background images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Calculate top padding based on status banner visibility
  const hasStatusBanner = status !== 'open' || !deliveryAvailable;
  const topPadding = hasStatusBanner ? 'pt-28 sm:pt-32 md:pt-36' : 'pt-16 sm:pt-18 md:pt-20';

  return (
    <section className={`relative min-h-screen text-white flex items-center justify-center overflow-hidden ${topPadding}`}>
      {/* Rotating Hero Background Images */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100 hero-bg-transition' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        ))}
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Subtle gradient overlay for enhanced visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-orange-900/20"></div>
      </div>

      {/* Enhanced Floating Elements with Better Mobile Performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orb - hidden on mobile for performance */}
        <div className="hidden sm:block absolute top-1/4 left-4 sm:left-10 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        
        {/* Medium floating orb */}
        <div className="absolute top-1/3 right-4 sm:right-20 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full blur-xl sm:blur-2xl" 
             style={{ animation: 'float 8s ease-in-out infinite' }}></div>
        
        {/* Small floating orb */}
        <div className="absolute bottom-1/4 left-1/4 w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-lg sm:blur-xl"
             style={{ animation: 'float 6s ease-in-out infinite reverse' }}></div>

        {/* Subtle sparkle effects */}
        <div className="absolute top-1/2 right-1/4 w-2 sm:w-3 h-2 sm:h-3 bg-white/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 right-1/3 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-purple-400/40 rounded-full animate-pulse"></div>
        <div className="absolute top-1/5 left-1/3 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-yellow-400/50 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 max-w-7xl text-center relative z-10">
        {/* Mobile-Optimized Premium Badge */}
        <div className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full text-purple-100 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-white/20 hover:bg-white/15 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1.5 sm:mr-2 text-yellow-400" />
          <span className="hidden sm:inline">Premium Dining Experience</span>
          <span className="sm:hidden">Premium</span>
        </div>

        {/* Mobile-First Responsive Heading */}
        <h1 className={`text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight px-2 transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          Welcome to{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Bella Vista
            </span>
            <div className={`absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-purple-400 to-orange-400 rounded-full transition-all duration-1000 delay-1000 ${
              isVisible ? 'scale-x-100 opacity-80' : 'scale-x-0 opacity-0'
            }`}></div>
          </span>
        </h1>

        {/* Mobile-Optimized Subtitle */}
        <p className={`text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed font-light px-4 transition-all duration-700 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          Authentic flavors meet exceptional service in every dish we create
        </p>

        {/* Mobile-First Feature Cards Grid */}
        <div className={`flex flex-row sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto mb-6 sm:mb-8 md:mb-12 px-2 transition-all duration-700 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Delivery Card - Mobile Optimized */}
          <div className="group flex flex-col items-center space-y-2 sm:space-y-3 p-2 sm:p-4 md:p-6 hover:scale-105 transition-all duration-300 flex-1">
            <div className="flex items-center justify-center w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xs sm:text-base md:text-lg mb-1 sm:mb-2">3km Delivery</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Free delivery zone</p>
            </div>
          </div>

          {/* Time Card - Mobile Optimized */}
          <div className="group flex flex-col items-center space-y-2 sm:space-y-3 p-2 sm:p-4 md:p-6 hover:scale-105 transition-all duration-300 flex-1">
            <div className="flex items-center justify-center w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xs sm:text-base md:text-lg mb-1 sm:mb-2">30 Min Delivery</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Fast & reliable</p>
            </div>
          </div>

          {/* Quality Card - Mobile Optimized */}
          <div className="group flex flex-col items-center space-y-2 sm:space-y-3 p-2 sm:p-4 md:p-6 hover:scale-105 transition-all duration-300 flex-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-center w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300">
              <ChefHat className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xs sm:text-base md:text-lg mb-1 sm:mb-2">Fresh & Premium</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Quality ingredients</p>
            </div>
          </div>
        </div>

        {/* Enhanced Trust Indicators - Mobile First */}
        <div className={`flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12 px-4 transition-all duration-700 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center space-x-1 text-yellow-400 text-xs sm:text-sm">
            <Star className="w-3 sm:w-4 h-3 sm:h-4 fill-current" />
            <Star className="w-3 sm:w-4 h-3 sm:h-4 fill-current" />
            <Star className="w-3 sm:w-4 h-3 sm:h-4 fill-current" />
            <Star className="w-3 sm:w-4 h-3 sm:h-4 fill-current" />
            <Star className="w-3 sm:w-4 h-3 sm:h-4 fill-current" />
            <span className="ml-1 text-white font-medium">4.9/5</span>
          </div>
          <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-300">
            <Award className="w-3 sm:w-4 h-3 sm:h-4 text-purple-400" />
            <span>Award Winning</span>
          </div>
          <div className="text-xs sm:text-sm text-gray-300">
            <span className="font-semibold text-white">1000+</span> Happy Customers
          </div>
        </div>

        {/* Mobile-Optimized Call to Action Buttons */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 transition-all duration-700 delay-800 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <button
            onClick={onExploreMenu}
            className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="flex items-center justify-center relative z-10">
              Explore Menu
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={onViewSpecials}
            className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-purple-400/50 text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-purple-400/10 hover:border-purple-400 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
          >
            <span className="flex items-center justify-center">
              View Specials
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:rotate-12 transition-transform duration-300" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile-Optimized Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <svg
          className="w-full h-12 sm:h-16 md:h-20 text-white/10"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,8.19,156.4,25.66C197.41,88.9,239.41,111.24,300,120c60.59,8.76,122.41,3.1,184.8-9.42C446.81,97.8,488.81,88.9,530,88.9c41.19,0,83.19,8.9,124.2,21.68C695.41,123.34,737.41,120,780,120s84.59-3.34,125.8-9.42C946.81,97.8,988.81,88.9,1030,88.9c41.19,0,83.19,8.9,124.2,21.68C1195.41,123.34,1237.41,120,1280,120V0Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        
        @keyframes fadeInScale {
          0% { 
            opacity: 0; 
            transform: scale(1.05); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        .hero-bg-transition {
          animation: fadeInScale 1s ease-in-out;
        }
        
        @media (max-width: 475px) {
          .xs\\:text-4xl {
            font-size: 2.25rem;
            line-height: 2.5rem;
          }
        }
        
        /* Optimize for mobile performance */
        @media (max-width: 768px) {
          .hero-bg-transition {
            animation-duration: 0.8s;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;