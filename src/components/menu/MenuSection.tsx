import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import type { MenuSection as MenuSectionType } from '../../types/menu';
import DishCard from './DishCard';

interface MenuSectionProps {
  section: MenuSectionType;
  onDishAdd?: (dish: any, quantity: number) => void;
  className?: string;
}

const MenuSection: React.FC<MenuSectionProps> = ({
  section,
  onDishAdd,
  className = '',
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  if (!section.dishes || section.dishes.length === 0) {
    return null;
  }

  return (
    <motion.section
      ref={sectionRef}
      id={section.category?.id || section.id}
      className={`py-12 ${className}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">{section.category?.icon || '🍽️'}</span>
            <h2 className="section-title mb-0">
              {section.category?.name || section.name}
            </h2>
          </div>
          {(section.category?.description || section.description) && (
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              {section.category?.description || section.description}
            </p>
          )}
          {section.category?.availableHours && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium">
              <span>Available:</span>
              <span>
                {section.category.availableHours.start} - {section.category.availableHours.end}
              </span>
            </div>
          )}
        </motion.div>

        {/* Dishes Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {section.dishes?.map((dish, index) => {
            const key = `menu-dish-${dish.id || `dish-${index}`}-${index}`;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <DishCard
                  dish={dish}
                  onAddToCart={onDishAdd}
                  showQuantitySelector={true}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {(!section.dishes || section.dishes.length === 0) && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-secondary-700 mb-2">
              No dishes available
            </h3>
            <p className="text-secondary-500">
              Check back later for new additions to this category.
            </p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default MenuSection;
