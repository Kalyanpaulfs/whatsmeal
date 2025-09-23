import React, { useState, useEffect } from 'react';
import { ChefHat, Coffee, Utensils, Moon, Salad, Beef, Wine, Cake } from 'lucide-react';
import Navbar from './Navbar';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  onCategoryClick?: (categoryId: string | null) => void;
  selectedCategory?: string | null;
  categories?: Array<{
    id: string;
    name: string;
    icon?: string;
    description?: string;
  }>;
}

const Header: React.FC<HeaderProps> = ({ onCategoryClick, selectedCategory, categories = [] }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryClick = (categoryId: string | null) => {
    onCategoryClick?.(categoryId);
    setIsMobileMenuOpen(false);
    
    // Scroll to dishes section after a short delay to allow state update
    setTimeout(() => {
      const dishesSection = document.querySelector('main');
      if (dishesSection) {
        dishesSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Map category icons
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'breakfast': Coffee,
      'lunch': Utensils,
      'dinner': Moon,
      'starters': Salad,
      'main-course': Beef,
      'beverages': Wine,
      'desserts': Cake,
      'chefs-special': ChefHat,
    };
    return iconMap[categoryId] || ChefHat;
  };

  const mappedCategories = categories.map(category => ({
    id: category.id,
    name: category.name,
    icon: getCategoryIcon(category.id),
    badge: category.id === 'chefs-special' ? 'Premium' : undefined
  }));

  return (
    <>
      <Navbar
        isScrolled={isScrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={handleMobileMenuToggle}
        onCategoryClick={handleCategoryClick}
        categories={mappedCategories}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onCategoryClick={handleCategoryClick}
        categories={mappedCategories}
        selectedCategory={selectedCategory}
      />
    </>
  );
};

export default Header;