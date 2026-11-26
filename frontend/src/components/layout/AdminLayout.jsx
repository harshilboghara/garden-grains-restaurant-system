import { useState } from 'react';
import { Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNotification from '../admin/AdminNotification';
import { useAuth } from '../../contexts/AuthContext';
import BrandLogo from '../common/BrandLogo';
import { IMAGE_BASE_URL } from '../../services/api';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-[#05070A] text-dark-slate overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className={`hidden lg:block shrink-0 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-72' : 'w-0'}`}>
        <AdminSidebar isCollapsed={!isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Sidebar - Mobile */}
      <div className={`fixed inset-y-0 left-0 z-[101] lg:hidden transition-transform duration-300 ease-in-out transform ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <AdminSidebar onMobileClose={() => setIsMobileMenuOpen(false)} isCollapsed={false} />
        
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 text-dark-slate/50 hover:text-dark-slate lg:hidden"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen h-screen overflow-hidden bg-[#05070A]">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-pearl border-b border-dark-slate/5 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="p-2 -ml-2 text-gray-400 hover:text-dark-slate transition-colors"
            >
              <Bars3Icon className="w-7 h-7" />
            </button>
            <span className="font-bold text-sm tracking-widest text-warm-gold uppercase">Admin</span>
          </div>
          
          <div className="flex items-center gap-4">
             <AdminNotification />
             <div className="w-8 h-8 rounded-full bg-warm-gold/10 border border-warm-gold/20 flex items-center justify-center text-[10px] text-warm-gold font-bold">
               {user?.name?.charAt(0) || 'A'}
             </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-pearl/95 backdrop-blur-md border-b border-dark-slate/5 z-40 sticky top-0">
           <div className="flex items-center gap-6">
              {/* Sidebar Toggle */}
              <button
                onClick={toggleSidebar}
                className="p-2.5 text-gray-400 hover:text-warm-gold bg-dark-slate/5 hover:bg-dark-slate/10 border border-dark-slate/10 rounded-xl transition-all group"
                title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
              >
                 {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>

              {/* Brand Logo in Navbar */}
              <div className="flex items-center gap-4 pl-2">
                <BrandLogo />
                <div className="h-8 w-px bg-dark-slate/10 mx-2" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Admin Control Center</span>
              </div>
           </div>

           <div className="flex items-center gap-8">
              <AdminNotification />
              
              <div className="flex items-center gap-6 pl-8 border-l border-dark-slate/10">
                 {/* Logout Button */}
                 <button
                   onClick={handleLogout}
                   className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-black uppercase tracking-wider"
                 >
                   <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                   <span>Sign Out</span>
                 </button>

                 {/* User Info */}
                 <div className="flex items-center gap-4 bg-dark-slate/5 border border-dark-slate/5 p-2 pr-6 rounded-2xl group transition-all hover:border-warm-gold/20">
                    <div className="w-10 h-10 rounded-full bg-warm-gold/10 border border-warm-gold/20 flex items-center justify-center text-sm text-warm-gold font-bold shadow-[0_0_15px_rgba(212,175,55,0.1)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] overflow-hidden">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar.startsWith('http') ? user.avatar : `${IMAGE_BASE_URL}/${user.avatar}`} 
                          alt={user.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        user?.name?.charAt(0).toUpperCase() || 'A'
                      )}
                    </div>
                    <div className="text-left">
                       <p className="text-sm font-black text-dark-slate group-hover:text-warm-gold transition-colors">{user?.name || 'Admin User'}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{user?.email || 'Administrator'}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Content with its own scrollbar */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative px-4 md:px-8 py-6 md:py-8">
          {/* Background Highlight */}
          <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-warm-gold/5 blur-[120px] -z-10 pointer-events-none" />
          <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-organic-green/5 blur-[120px] -z-10 pointer-events-none" />
          
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

