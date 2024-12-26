import React from 'react';
import { motion } from 'framer-motion';
import { LoginForm } from '../../components/auth/LoginForm';
import { Logo } from '../../components/ui/Logo';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.1 
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const Login: React.FC = () => {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
    >
      <motion.div 
        variants={itemVariants}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <motion.div 
          className="flex justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Logo className="w-20 h-20" />
        </motion.div>
        <motion.h2 
          variants={itemVariants}
          className="mt-6 text-center text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent"
        >
          Iniciar Sesión
        </motion.h2>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-green-100"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          <LoginForm />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};