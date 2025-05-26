import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ChevronDown, LogOut, Settings, UserCircle, Home, ScanLine, FileText, FolderOpen } from 'lucide-react';

const Navbar = ({ setIsAuthenticated }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/70 backdrop-blur-sm border-b border-white/20 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              AutoPayslip
            </h2>
          </div>

          {/* Navigation Links - Now aligned to the right */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-white/50 hover:text-blue-600 transition-all duration-300 font-medium"
              >
                <Home className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/Upload"
                className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-white/50 hover:text-blue-600 transition-all duration-300 font-medium"
              >
                <ScanLine className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Scan DTR</span>
              </Link>
              
              <Link
                to="/Reports"
                className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-white/50 hover:text-blue-600 transition-all duration-300 font-medium"
              >
                <FileText className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Print Payslip</span>
              </Link>
              
              <Link
                to="/records"
                className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-white/50 hover:text-blue-600 transition-all duration-300 font-medium"
              >
                <FolderOpen className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Records</span>
              </Link>
            </div>

            {/* Profile Dropdown */}
            <div className="relative profile-dropdown">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-white/50 transition-all duration-300 font-medium"
              >
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span>Profile</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  <Link
                    to="/Profile"
                    className="group flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/50 hover:text-blue-600 transition-all duration-200"
                  >
                    <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <UserCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">Payroll Profile</span>
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="group flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/50 hover:text-blue-600 transition-all duration-200"
                  >
                    <div className="h-8 w-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </Link>
                  
                  <hr className="my-2 border-gray-200/50" />
                  
                  <button
                    onClick={handleLogout}
                    className="group flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50/50 hover:text-red-600 transition-all duration-200 w-full text-left"
                  >
                    <div className="h-8 w-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <LogOut className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="p-2 rounded-lg text-gray-700 hover:bg-white/50 transition-colors duration-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;