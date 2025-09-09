// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem
} from "@heroui/react";
import { Menu, X, BookOpen, LogIn, UserPlus, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-md border-b border-gray-200/50 shadow-lg"></div>
      
      <Navbar className="relative bg-transparent">
        <NavbarBrand className="hover:scale-105 transition-transform duration-200">
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <BookOpen className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent group-hover:from-teal-500 group-hover:to-teal-600 transition-all duration-300">
                SkillBridge
              </span>
              <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Cầu nối tri thức
              </span>
            </div>
          </NavLink>
        </NavbarBrand>
        
        <NavbarContent className="hidden lg:flex gap-2" justify="center">
          <NavbarItem>
            <NavLink 
              to="/"
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 hover:scale-105 group ${
                isActive('/') ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              Trang chủ
              {isActive('/') && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-600 rounded-full"></div>
              )}
            </NavLink>
          </NavbarItem>
          <NavbarItem>
            <NavLink 
              to="/courses"
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 hover:scale-105 group ${
                isActive('/courses') ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              Khóa học
              {isActive('/courses') && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-600 rounded-full"></div>
              )}
            </NavLink>
          </NavbarItem>
          <NavbarItem>
            <NavLink 
              to="/about"
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 hover:scale-105 group ${
                isActive('/about') ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              Giới thiệu
              {isActive('/about') && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-600 rounded-full"></div>
              )}
            </NavLink>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end" className="gap-2">
          {/* Login Button */}
          <NavbarItem className="hidden sm:flex">
            <button 
              onClick={handleLoginClick}
              className="group relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 hover:text-teal-600 transition-all duration-300 hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <LogIn className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
              <span>Đăng nhập</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-teal-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </button>
          </NavbarItem>

          {/* Register Button */}
          <NavbarItem className="hidden sm:flex">
            <button 
              onClick={handleRegisterClick}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-teal-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <UserPlus className="relative h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="relative">Đăng ký</span>
              <Sparkles className="relative h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12" />
            </button>
          </NavbarItem>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110 group" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="relative">
              {isMenuOpen ? (
                <X className="h-5 w-5 text-gray-600 group-hover:text-teal-600 transition-colors duration-300" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600 group-hover:text-teal-600 transition-colors duration-300" />
              )}
            </div>
          </button>
        </NavbarContent>
      </Navbar>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="container mx-auto px-4 py-6 space-y-2">
            <NavLink
              to="/"
              className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 ${
                isActive('/') 
                  ? 'text-teal-600 bg-teal-50 border-l-4 border-teal-600' 
                  : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              🏠 Trang chủ
            </NavLink>
            <NavLink
              to="/courses"
              className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 ${
                isActive('/courses') 
                  ? 'text-teal-600 bg-teal-50 border-l-4 border-teal-600' 
                  : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              📚 Khóa học
            </NavLink>
            <NavLink
              to="/about"
              className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 ${
                isActive('/about') 
                  ? 'text-teal-600 bg-teal-50 border-l-4 border-teal-600' 
                  : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              ℹ️ Giới thiệu
            </NavLink>
            
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <NavLink 
                to="/login" 
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:scale-105 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                Đăng nhập
              </NavLink>
              <NavLink 
                to="/register" 
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-medium rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserPlus className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                <span>Đăng ký ngay</span>
                <Sparkles className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12 ml-auto" />
              </NavLink>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Header;
