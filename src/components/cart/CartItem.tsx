import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, Edit3 } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types/cart';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatters';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CartItemProps {
  item: CartItemType;
  showSpecialInstructions?: boolean;
  className?: string;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  showSpecialInstructions = true,
  className = '',
}) => {
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [instructions, setInstructions] = useState(item.specialInstructions || '');
  const { changeQuantity, updateInstructions, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    changeQuantity(item.dish.id, newQuantity);
  };

  const handleInstructionsSave = () => {
    updateInstructions(item.dish.id, instructions);
    setIsEditingInstructions(false);
  };

  const handleInstructionsCancel = () => {
    setInstructions(item.specialInstructions || '');
    setIsEditingInstructions(false);
  };

  const handleRemove = () => {
    removeFromCart(item.dish.id);
  };

  return (
    <motion.div
      className={`bg-white border border-secondary-200 rounded-lg p-4 hover:shadow-medium transition-shadow duration-200 ${className}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start space-x-3">
        {/* Image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={item.dish.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIiIHk9IjIiIHdpZHRoPSIyOTYiIGhlaWdodD0iMTk2IiBzdHJva2U9IiNEMUQ1REIiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8dGV4dCB4PSIxNTAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo='}
            alt={item.dish.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIiIHk9IjIiIHdpZHRoPSIyOTYiIGhlaWdodD0iMTk2IiBzdHJva2U9IiNEMUQ1REIiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8dGV4dCB4PSIxNTAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name and Price */}
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-medium text-secondary-900 truncate">
              {item.dish.name}
            </h4>
            <span className="price-text text-sm ml-2">
              {formatPrice(item.dish.price)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-secondary-600 mb-2 line-clamp-2">
            {item.dish.description}
          </p>

          {/* Special Instructions */}
          {showSpecialInstructions && (
            <div className="mb-3">
              {isEditingInstructions ? (
                <div className="space-y-2">
                  <Input
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Add special instructions..."
                    size="sm"
                    className="text-xs"
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleInstructionsSave}
                      className="text-xs px-2 py-1"
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleInstructionsCancel}
                      className="text-xs px-2 py-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {item.specialInstructions ? (
                      <p className="text-xs text-secondary-600 bg-secondary-50 px-2 py-1 rounded">
                        <span className="font-medium">Note:</span> {item.specialInstructions}
                      </p>
                    ) : (
                      <p className="text-xs text-secondary-400 italic">
                        No special instructions
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingInstructions(true)}
                    className="ml-2 p-1"
                    leftIcon={<Edit3 className="w-3 h-3" />}
                  />
                </div>
              )}
            </div>
          )}

          {/* Quantity Controls and Total */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                leftIcon={<Minus className="w-3 h-3" />}
                className="p-1"
              />
              <span className="w-8 text-center font-medium text-sm">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                leftIcon={<Plus className="w-3 h-3" />}
                className="p-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="price-text text-sm">
                {formatPrice(item.dish.price * item.quantity)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="p-1 text-error-600 hover:text-error-700 hover:bg-error-50"
                leftIcon={<Trash2 className="w-3 h-3" />}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
