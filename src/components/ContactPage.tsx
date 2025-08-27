
import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin } from 'lucide-react';

const ContactPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.2 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <motion.div 
        className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 
          className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center"
          variants={itemVariants}
        >
          Contact Us
        </motion.h2>
        
        <div className="space-y-6">
          <motion.div 
            className="flex items-center justify-center space-x-3 text-black-700 dark:text-black-300"
            variants={itemVariants}
          >
            <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>+917735537655 - Self drive</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center justify-center space-x-3 text-black-700 dark:text-black-300"
            variants={itemVariants}
          >
            <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span>+918050922920 - Tyre care and mechanic work</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center justify-center space-x-3 text-black-700 dark:text-black-300"
            variants={itemVariants}
          >
            <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>+918123540767 - Others</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center justify-center space-x-3"
            variants={itemVariants}
          >
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <a 
              href="https://maps.app.goo.gl/auGNQh4kqViej7Hr5?g_st=aw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Click here for Location
            </a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export { ContactPage };
