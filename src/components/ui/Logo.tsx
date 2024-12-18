import React from 'react';

interface LogoProps {
  className?: string;
  // Si necesitas más props, agrégalas aquí
}

export const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12" }) => {
  return (
    <img
      src="/src/assets/images/logo/verdulogo.webp"
      alt="Verduleros Online Logo"
      className={`${className} object-contain`}
    />
  );
};
