import React from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter, 
  MessageCircle, 
  Truck, 
  CreditCard, 
  Shield,
  Star,
  Utensils
} from 'lucide-react';
import { RESTAURANT_CONFIG, APP_CONFIG, DELIVERY_CONFIG } from '../../lib/config';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Contact & Order',
      items: [
        { icon: <Phone className="w-4 h-4" />, text: RESTAURANT_CONFIG.phone },
        { icon: <MessageCircle className="w-4 h-4" />, text: 'WhatsApp Order', href: `https://wa.me/${RESTAURANT_CONFIG.whatsappNumber}?text=Hi! I want to place an order.` },
        { icon: <Mail className="w-4 h-4" />, text: APP_CONFIG.supportEmail },
        { icon: <MapPin className="w-4 h-4" />, text: RESTAURANT_CONFIG.location.city },
      ],
    },
    {
      title: 'Operating Hours',
      items: [
        { icon: <Clock className="w-4 h-4" />, text: 'Mon - Sun: 7:00 AM - 11:00 PM' },
        { icon: <Utensils className="w-4 h-4" />, text: 'Breakfast: 7:00 AM - 11:00 AM' },
        { icon: <Utensils className="w-4 h-4" />, text: 'Lunch: 11:00 AM - 4:00 PM' },
        { icon: <Utensils className="w-4 h-4" />, text: 'Dinner: 4:00 PM - 11:00 PM' },
      ],
    },
    {
      title: 'Order Information',
      items: [
        { icon: <Truck className="w-4 h-4" />, text: `Delivery: ${DELIVERY_CONFIG.estimatedDeliveryTime} min` },
        { icon: <MapPin className="w-4 h-4" />, text: `Within ${DELIVERY_CONFIG.maxDeliveryRadius}km radius` },
        { icon: <CreditCard className="w-4 h-4" />, text: `Min Order: ₹${RESTAURANT_CONFIG.minimumOrderAmount}` },
        { icon: <Shield className="w-4 h-4" />, text: 'Secure Payments' },
      ],
    },
    {
      title: 'Connect With Us',
      items: [
        { icon: <Facebook className="w-4 h-4" />, text: 'Facebook', href: 'https://facebook.com/bellavista' },
        { icon: <Instagram className="w-4 h-4" />, text: 'Instagram', href: 'https://instagram.com/bellavista' },
        { icon: <Twitter className="w-4 h-4" />, text: 'Twitter', href: 'https://twitter.com/bellavista' },
        { icon: <Star className="w-4 h-4" />, text: 'Rate Us', href: '#' },
      ],
    },
  ] as const;

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title || `footer-section-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-4 font-display">{section.title}</h3>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <motion.li
                    key={`${section.title || 'section'}-item-${itemIndex}`}
                    className="flex items-center space-x-2 text-secondary-300 hover:text-white transition-colors"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {'icon' in item && item.icon}
                    {'href' in item && item.href ? (
                      <a href={item.href} className="hover:underline">
                        {item.text}
                      </a>
                    ) : (
                      <span>{item.text}</span>
                    )}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Order Features */}
        <motion.div
          className="py-8 border-t border-secondary-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Delivery Info */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Fast Delivery</h4>
                <p className="text-sm text-secondary-300">
                  Within {DELIVERY_CONFIG.maxDeliveryRadius}km • {DELIVERY_CONFIG.estimatedDeliveryTime} min
                </p>
              </div>
            </div>

            {/* WhatsApp Ordering */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">WhatsApp Order</h4>
                <p className="text-sm text-secondary-300">
                  Quick & Easy • Instant Confirmation
                </p>
              </div>
            </div>

            {/* Payment Security */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Secure Payment</h4>
                <p className="text-sm text-secondary-300">
                  Safe & Encrypted • Multiple Options
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="py-6 border-t border-secondary-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">{RESTAURANT_CONFIG.name}</p>
                <p className="text-xs text-secondary-400">Fresh • Fast • Delicious</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <div className="flex items-center space-x-4 text-xs text-secondary-400">
                <span>Minimum Order: ₹{RESTAURANT_CONFIG.minimumOrderAmount}</span>
                <span>•</span>
                <span>Delivery Fee: ₹{RESTAURANT_CONFIG.deliveryFee}</span>
              </div>
              <p className="text-sm text-secondary-400">
                © {currentYear} {RESTAURANT_CONFIG.name}. All rights reserved.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
