import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import { RESTAURANT_CONFIG } from '../../lib/config';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Contact Info',
      items: [
        { icon: <Phone className="w-4 h-4" />, text: RESTAURANT_CONFIG.phone },
        { icon: <Mail className="w-4 h-4" />, text: 'info@bellavista.com' },
        { icon: <MapPin className="w-4 h-4" />, text: RESTAURANT_CONFIG.address },
      ],
    },
    {
      title: 'Opening Hours',
      items: [
        { icon: <Clock className="w-4 h-4" />, text: 'Mon - Sun: 7:00 AM - 11:00 PM' },
        { icon: <Clock className="w-4 h-4" />, text: 'Breakfast: 7:00 AM - 11:00 AM' },
        { icon: <Clock className="w-4 h-4" />, text: 'Lunch: 11:00 AM - 4:00 PM' },
        { icon: <Clock className="w-4 h-4" />, text: 'Dinner: 4:00 PM - 11:00 PM' },
      ],
    },
    {
      title: 'Quick Links',
      items: [
        { text: 'Menu', href: '#menu' },
        { text: 'About Us', href: '#about' },
        { text: 'Contact', href: '#contact' },
        { text: 'Privacy Policy', href: '#privacy' },
        { text: 'Terms of Service', href: '#terms' },
      ],
    },
    {
      title: 'Follow Us',
      items: [
        { icon: <Facebook className="w-4 h-4" />, text: 'Facebook', href: '#' },
        { icon: <Instagram className="w-4 h-4" />, text: 'Instagram', href: '#' },
        { icon: <Twitter className="w-4 h-4" />, text: 'Twitter', href: '#' },
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

        {/* Delivery Info */}
        <motion.div
          className="py-6 border-t border-secondary-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary-400" />
                <span className="text-sm">
                  Delivery within <span className="font-semibold text-primary-400">3km radius</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary-400" />
                <span className="text-sm">
                  Estimated delivery: <span className="font-semibold text-primary-400">30 minutes</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-400">Minimum order:</span>
              <span className="text-lg font-bold text-primary-400">
                {RESTAURANT_CONFIG.minimumOrderAmount}
              </span>
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
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div>
                <p className="text-sm font-semibold">{RESTAURANT_CONFIG.name}</p>
                <p className="text-xs text-secondary-400">Premium Dining Experience</p>
              </div>
            </div>
            
            <p className="text-sm text-secondary-400">
              © {currentYear} {RESTAURANT_CONFIG.name}. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
