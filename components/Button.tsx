
import React from 'react';

interface ButtonProps {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled, children, variant = 'primary' }) => {
  
  const baseClasses = "w-full flex justify-center items-center px-6 py-3.5 text-sm font-bold tracking-wide rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";
  
  const variants = {
    primary: "text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-purple-500/25 ring-1 ring-white/10",
    secondary: "text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600",
    danger: "text-white bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 border border-red-800/50"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

export default Button;
