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
    transition: { 
      duration: 0.5 
    }
  }
};

export const Login: React.FC = () => {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-md w-full mx-auto p-8">
        <motion.div 
          className="text-center mb-8"
          variants={itemVariants}
        >
          <Logo className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido de nuevo
          </h2>
          <p className="text-gray-600">
            Ingresa a tu cuenta para continuar
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <LoginForm />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;