import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Heart, Clock, Leaf, Zap } from 'lucide-react';
import type { Dish } from '../../types/menu';
import { useCart } from '../../hooks/useCart';
import { useRestaurantStore } from '../../store/restaurantStore';
import { validateOrder } from '../../utils/orderValidation';
import { formatPrice, formatPreparationTime } from '../../utils/formatters';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface DishCardProps {
  dish: Dish;
  onAddToCart?: (dish: Dish, quantity: number) => void;
  showQuantitySelector?: boolean;
  className?: string;
}

const DishCard: React.FC<DishCardProps> = ({
  dish,
  onAddToCart,
  showQuantitySelector = true,
  className = '',
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const { getItemQuantity, addToCart, changeQuantity, orderType } = useCart();
  const { status, deliveryAvailable } = useRestaurantStore();
  
  const quantity = getItemQuantity(dish.id);
  const isInCart = quantity > 0;
  const orderStatus = validateOrder(orderType, status, deliveryAvailable);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(dish, 1);
    } else {
      addToCart(dish, 1);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    changeQuantity(dish.id, newQuantity);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      className={`card-hover ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        {/* Image */}
        <div className="relative h-48 overflow-hidden rounded-t-xl">
          <img
            src={dish.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIiIHk9IjIiIHdpZHRoPSIyOTYiIGhlaWdodD0iMTk2IiBzdHJva2U9IiNEMUQ1REIiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8dGV4dCB4PSIxNTAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo='}
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIiIHk9IjIiIHdpZHRoPSIyOTYiIGhlaWdodD0iMTk2IiBzdHJva2U9IiNEMUQ1REIiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8dGV4dCB4PSIxNTAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
            }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`}
            />
          </button>
          
          {/* Dietary Indicators */}
          <div className="absolute top-3 left-3 flex space-x-1">
            {dish.isVegetarian && (
              <Badge variant="success" size="sm" className="bg-green-500/90 text-white">
                <Leaf className="w-3 h-3 mr-1" />
                Veg
              </Badge>
            )}
            {dish.isVegan && (
              <Badge variant="success" size="sm" className="bg-green-600/90 text-white">
                Vegan
              </Badge>
            )}
            {dish.isSpicy && (
              <Badge variant="warning" size="sm" className="bg-orange-500/90 text-white">
                <Zap className="w-3 h-3 mr-1" />
                Spicy
              </Badge>
            )}
          </div>
          
          {/* Preparation Time */}
          <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
            <Clock className="w-3 h-3 text-white" />
            <span className="text-xs text-white">
              {formatPreparationTime(dish.preparationTime)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Name and Price */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-secondary-900 font-display line-clamp-1">
              {dish.name}
            </h3>
            <span className="price-text ml-2">
              {formatPrice(dish.price)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
            {dish.description}
          </p>

          {/* Ingredients */}
          <div className="mb-4">
            <p className="text-xs text-secondary-500 mb-1">Key ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {dish.ingredients?.slice(0, 3).map((ingredient, index) => (
                <span
                  key={`${dish.id || 'dish'}-ingredient-${index}-${ingredient || 'ingredient'}`}
                  className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full"
                >
                  {ingredient}
                </span>
              ))}
              {dish.ingredients && dish.ingredients.length > 3 && (
                <span className="text-xs text-secondary-400">
                  +{dish.ingredients!.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Allergens */}
          {dish.allergens && dish.allergens.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-warning-600 font-medium">
                Contains: {dish.allergens.join(', ')}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            {showQuantitySelector && isInCart ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  leftIcon={<Minus className="w-3 h-3" />}
                  disabled={!orderStatus.canOrder}
                />
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  leftIcon={<Plus className="w-3 h-3" />}
                  disabled={!orderStatus.canOrder}
                />
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                leftIcon={<Plus className="w-4 h-4" />}
                className="flex-1"
                disabled={!dish.isAvailable || !orderStatus.canOrder}
                title={!orderStatus.canOrder ? orderStatus.reason : undefined}
              >
                {!dish.isAvailable ? 'Not Available' : 
                 !orderStatus.canOrder ? 'Orders Closed' : 
                 'Add to Cart'}
              </Button>
            )}

            {/* Nutrition Info */}
            {dish.nutritionInfo && (
              <div className="text-xs text-secondary-500 text-right">
                <p>{dish.nutritionInfo.calories} cal</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DishCard;
