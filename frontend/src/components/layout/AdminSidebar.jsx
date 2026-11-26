import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { IMAGE_BASE_URL } from '../../services/api';
import BrandLogo from '../common/BrandLogo';
import {
  ChartBarIcon,
  QueueListIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  TagIcon,
  CalendarDaysIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  ArchiveBoxIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = ({ onMobileClose, isCollapsed, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };


  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: ChartBarIcon },
    { name: 'New Order (POS)', path: '/admin/orders/create', icon: PlusIcon },
    { name: 'Order Management', path: '/admin/orders', icon: ShoppingBagIcon },
    { name: 'Menu Editor', path: '/admin/menu', icon: Squares2X2Icon },
    { name: 'Reservations', path: '/admin/reservations', icon: CalendarDaysIcon },
    { name: 'Inventory', path: '/admin/inventory', icon: ArchiveBoxIcon },
    { name: 'Users', path: '/admin/users', icon: UserCircleIcon },
    { name: 'Feedback & Reviews', path: '/admin/feedback', icon: ChatBubbleLeftRightIcon },
    { name: 'Discount Codes', path: '/admin/discounts', icon: TagIcon },
    { name: 'Admin Control', path: '/admin/panel', icon: QueueListIcon },
  ];


  const handleLogout = () => {
    handleLinkClick();
    logout();
    navigate('/');
  };


  return (
    <div className={`transition-all duration-500 ease-in-out h-screen sticky top-0 flex flex-col bg-pearl border-r border-dark-slate/5 pt-4 pb-6 animate-fade-in shrink-0 overflow-hidden z-50 relative ${
      isCollapsed ? 'w-0 border-none px-0' : 'w-72'
    }`}>
      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 custom-scrollbar overflow-y-auto overflow-x-hidden mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-4 transition-all duration-300 group relative px-5 py-4 rounded-2xl ${
                isActive
                  ? 'bg-warm-gold/10 text-warm-gold border border-warm-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]'
                  : 'text-gray-400 hover:text-dark-slate hover:bg-dark-slate/5 border border-transparent'
              }`}
            >
              <item.icon className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'group-hover:scale-110 group-hover:text-dark-slate'}`} />
              
              <span className="font-bold text-sm tracking-wide transition-all duration-300 whitespace-nowrap">
                {item.name}
              </span>

              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-warm-gold shadow-[0_0_15px_#D4AF37]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
