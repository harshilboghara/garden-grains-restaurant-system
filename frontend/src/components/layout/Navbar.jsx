import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useScrollLock } from "../../hooks/useScrollLock";
import BrandLogo from "../common/BrandLogo";
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon, // ✅ replaced MenuIcon
  XMarkIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useScrollLock(isMenuOpen);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsProfileOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "Menu", path: "/menu", icon: ClipboardDocumentListIcon },
    { name: "Reservations", path: "/reservations", icon: CalendarDaysIcon },
    { name: "About", path: "/about", icon: HomeIcon },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/admin" },
    { name: "Admin Panel", path: "/admin/panel" },
    { name: "Menu Management", path: "/admin/menu" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Reservations", path: "/admin/reservations" },
    { name: "Discounts", path: "/admin/discounts" },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 bg-deep-black/10 backdrop-blur-md border-b border-white/10 ${isMenuOpen ? 'bg-deep-black' : ''}`}> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group z-[70] relative">
            <BrandLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative group px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.path ? "text-warm-gold" : "text-gray-300 hover:text-white"
                }`}
              >
                <span>{link.name}</span>
                <span className={`absolute left-0 bottom-0 h-0.5 bg-warm-gold transition-all duration-300 ${
                  location.pathname === link.path ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-300 hover:text-warm-gold transition-colors group"
            >
              <ShoppingCartIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-organic-green text-xs font-bold text-deep-black animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-warm-gold transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-warm-gold/20 flex items-center justify-center border border-warm-gold/50 overflow-hidden relative">
                    {user?.avatar && (
                      <img
                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${user.avatar}`} 
                        alt={user.name}
                        className="w-full h-full object-cover absolute inset-0 z-10"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <UserIcon className="w-5 h-5 text-warm-gold" />
                  </div>
                  <span className="hidden sm:block font-medium">{user?.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-deep-black border border-white/10 rounded-xl py-2 overflow-hidden animate-fade-in origin-top-right shadow-2xl ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 border-b border-white/10 mb-1">
                      <p className="text-sm text-gray-400">Signed in as</p>
                      <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-warm-gold transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-warm-gold transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Your Orders
                    </Link>

                    {user?.role === "admin" && (
                      <>
                        <div className="my-1 border-t border-white/10" />
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Admin</div>
                        {adminLinks.map((link) => (
                          <Link
                            key={link.name}
                            to={link.path}
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-warm-gold transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            {link.name}
                          </Link>
                        ))}
                      </>
                    )}

                    <div className="my-1 border-t border-white/10" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link to="/register" className="btn-primary py-2 px-6 text-sm shadow-neon">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Visible on Small Screens */}
          <div className="flex items-center space-x-4 md:hidden">
             {/* Cart Button Mobile */}
             <button
              onClick={toggleCart}
              className="relative p-2 text-gray-300 hover:text-warm-gold transition-colors"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-organic-green text-xs font-bold text-deep-black animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-300 hover:text-white transition-colors z-[70] relative"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-8 h-8 text-white" />
              ) : (
                <Bars3Icon className="w-8 h-8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown (New Design) */}
      {isMenuOpen && (
        <>
          {/* Backdrop for clicking outside */}
          <div 
            className="fixed inset-0 top-20 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Floating List Container */}
          <div 
            className="absolute top-20 left-0 w-full bg-[#0B0F14] border-b border-white/10 shadow-2xl z-50 animate-slide-up origin-top flex flex-col max-h-[calc(100vh-80px)] overflow-y-auto"
          >
            {/* User Profile Summary (Top) */}
            {isAuthenticated && (
              <div className="px-6 py-5 bg-white/5 border-b border-white/5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-warm-gold to-yellow-600 flex items-center justify-center text-deep-black font-bold shadow-neon-gold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{user.name}</p>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                </div>
              </div>
            )}

            {/* Navigation List */}
            <div className="p-4 grid gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center p-4 rounded-xl transition-all duration-200 border ${
                    location.pathname === link.path
                      ? "bg-warm-gold/10 border-warm-gold/30 text-warm-gold"
                      : "bg-transparent border-transparent text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className={`p-2 rounded-lg mr-4 ${
                    location.pathname === link.path ? "bg-warm-gold/20" : "bg-white/5"
                  }`}>
                    <link.icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-lg">{link.name}</span>
                </Link>
              ))}
            </div>

            {/* User Actions & Admin Controls */}
            {isAuthenticated && (
              <div className="p-4 pt-0 space-y-3">
                <div className="h-px bg-white/10 my-2" />
                
                {/* User Links Grid */}
                <div className="grid grid-cols-2 gap-3">
                   <Link 
                     to="/profile" 
                     onClick={() => setIsMenuOpen(false)} 
                     className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-warm-gold/30 transition-all text-gray-300 hover:text-white"
                   >
                      <UserCircleIcon className="w-5 h-5" />
                      <span>Profile</span>
                   </Link>
                   <Link 
                     to="/orders" 
                     onClick={() => setIsMenuOpen(false)} 
                     className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-warm-gold/30 transition-all text-gray-300 hover:text-white"
                   >
                      <ShoppingBagIcon className="w-5 h-5" />
                      <span>Orders</span>
                   </Link>
                </div>

                {/* Admin Section */}
                {user?.role === "admin" && (
                  <div className="space-y-2 pt-2 border-t border-white/10 mt-2">
                     <p className="px-4 text-xs font-bold text-warm-gold uppercase tracking-wider">Admin Controls</p>
                     <div className="grid gap-1">
                       {adminLinks.map((link) => (
                         <Link 
                           key={link.name}
                           to={link.path} 
                           onClick={() => setIsMenuOpen(false)}
                           className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all ml-2"
                         >
                            <span className="font-medium">{link.name}</span>
                            <span className="text-gray-600 text-sm">→</span>
                         </Link>
                       ))}
                     </div>
                  </div>
                )}

                {/* Logout */}
                <button 
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                  className="w-full p-4 mt-2 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all font-bold border border-transparent hover:border-red-500/20"
                >
                   <ArrowRightOnRectangleIcon className="w-5 h-5" />
                   Sign Out
                </button>
              </div>
            )}

            {/* Guest Actions */}
            {!isAuthenticated && (
              <div className="p-6 bg-white/5 border-t border-white/5 space-y-3 mt-auto">
                <Link
                  to="/login"
                  className="block w-full py-3 text-center text-white border border-white/20 rounded-xl hover:bg-white/5 transition-colors font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="block w-full py-3 text-center bg-warm-gold text-deep-black rounded-xl hover:bg-yellow-500 transition-colors font-bold shadow-neon-gold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
