import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, XMarkIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../../contexts/NotificationContext';
import { format } from 'date-fns';

const AdminNotification = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    clearAllNotifications 
  } = useNotification();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <span className="text-xl">🛍️</span>;
      case 'reservation':
        return <span className="text-xl">📅</span>;
      case 'cancel':
        return <span className="text-xl">❌</span>;
      default:
        return <span className="text-xl">📢</span>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-dark-slate transition-colors rounded-full hover:bg-dark-slate/10 border border-transparent hover:border-dark-slate/10"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 transform translate-x-1 -translate-y-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-dark-slate items-center justify-center border-2 border-[#05070A]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-pearl border border-dark-slate/10 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all animate-fade-in ring-1 ring-black/5">
          <div className="p-4 border-b border-dark-slate/10 flex items-center justify-between bg-dark-slate/5">
            <h3 className="text-sm font-bold text-dark-slate uppercase tracking-wider">Notifications</h3>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                 <button 
                  onClick={markAllAsRead}
                  className="text-xs text-warm-gold hover:text-yellow-400 transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckIcon className="w-3 h-3" /> All Read
                </button>
                <button 
                  onClick={clearAllNotifications}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  title="Clear all"
                >
                  <TrashIcon className="w-3 h-3" /> Clear
                </button>
              </div>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                <BellIcon className="w-12 h-12 opacity-20 mb-2" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 hover:bg-dark-slate/5 transition-colors cursor-pointer group relative ${!notification.read ? 'bg-warm-gold/5' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm font-bold ${!notification.read ? 'text-dark-slate' : 'text-gray-400'}`}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                            {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className={`text-xs ${!notification.read ? 'text-gray-600' : 'text-gray-400'} line-clamp-2`}>
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notification.id);
                      }}
                      className="absolute top-2 right-2 p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded bg-pearl/80 backdrop-blur-sm"
                      title="Dismiss"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                    
                    {!notification.read && (
                      <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-warm-gold shadow-[0_0_8px_rgba(212,175,55,0.5)]"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
             <div className="p-2 bg-dark-slate/5 border-t border-dark-slate/10 text-center">
                <p className="text-[10px] text-gray-400">Showing last 50 notifications</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotification;
