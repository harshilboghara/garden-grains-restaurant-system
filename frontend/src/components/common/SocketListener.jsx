import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  BellIcon, 
  XMarkIcon, 
  ShoppingBagIcon, 
  XCircleIcon,
  UserIcon,
  CurrencyRupeeIcon,
  TagIcon,
  CalendarDaysIcon,
  UsersIcon 
} from '@heroicons/react/24/outline';

const SocketListener = () => {
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const audioRef = useRef(null);
  const cancelAudioRef = useRef(null);

  useEffect(() => {
    const initAudio = (path, ref) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = 1.0;
      
      audio.addEventListener('error', (e) => {
        console.error(`Error loading audio file "${path}":`, e);
      });
      
      audio.addEventListener('canplaythrough', () => {
        console.log(`Audio file "${path}" is ready to play.`);
      });
      
      ref.current = audio;
    };

    initAudio('/notification.mp3', audioRef);
    initAudio('/cancel.mp3', cancelAudioRef);

    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (cancelAudioRef.current) cancelAudioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socketServerUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketServerUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      if (user.role === 'admin') {
        socket.emit('join_admin_room');
      }
    });

    const playNotificationSound = (type = 'new') => {
      const audio = type === 'new' ? audioRef.current : cancelAudioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(err => console.warn(`${type} Sound failed:`, err.message));
      }
    };

    const handleNewOrder = (data) => {
      if (user.role !== 'admin') return;
      const toastId = `new-order-${data.orderNumber}`;
      if (toast.isActive(toastId)) return;

      toast.info(
        ({ closeToast }) => (
          <div className="flex items-start gap-4 p-1">
            <div className="flex-shrink-0 relative">
              <div className="w-12 h-12 bg-warm-gold/20 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)] border border-warm-gold/30">
                <ShoppingBagIcon className="w-7 h-7 text-warm-gold" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warm-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-warm-gold border-2 border-deep-black"></span>
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-base font-bold text-dark-slate leading-none mb-1 font-heading">
                  New Order Incoming
                </p>
                <button 
                  onClick={closeToast}
                  className="text-gray-400 hover:text-dark-slate transition-colors p-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] font-black text-deep-black uppercase tracking-widest mb-2 px-2 py-0.5 bg-warm-gold rounded inline-block">
                #{data.orderNumber}
              </p>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-gray-400">
                  <UserIcon className="w-3.5 h-3.5 opacity-60" />
                  <span className="text-sm font-medium truncate text-gray-600">{data.customerName || 'Guest Customer'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <CurrencyRupeeIcon className="w-3.5 h-3.5 opacity-60" />
                  <span className="text-sm font-black text-warm-gold">₹{(data.total || 0).toFixed(2)} Total</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-dark-slate/10 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                  <TagIcon className="w-3 h-3" />
                  {data.orderType || 'Standard'}
                </span>
                <span className="text-[10px] font-bold text-warm-gold animate-pulse">
                  Action Required →
                </span>
              </div>
            </div>
          </div>
        ),
        {
          toastId,
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          className: "!rounded-2xl !bg-pearl/95 !backdrop-blur-md !shadow-2xl !border !border-warm-gold/20",
          progressClassName: "!bg-warm-gold",
          bodyClassName: "!p-4",
          closeButton: false // Hide default close button as we added a custom one
        }
      );

      // Add to notification center
      addNotification({
        type: 'order',
        title: 'New Order Received',
        message: `#${data.orderNumber} - ${data.customerName || 'Guest'}`,
        data: data,
        link: '/admin/orders'
      });

      playNotificationSound('new');
    };

    const handleCancelOrder = (data) => {
      if (user.role !== 'admin') return;
      const toastId = `cancel-order-${data.orderNumber}`;
      if (toast.isActive(toastId)) return;

      toast.error(
        ({ closeToast }) => (
          <div className="flex items-start gap-4 p-1">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)] border border-red-500/30">
                <XCircleIcon className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-base font-bold text-red-500 leading-none mb-1 font-heading">
                  Order Cancelled
                </p>
                <button 
                  onClick={closeToast}
                  className="text-gray-400 hover:text-dark-slate transition-colors p-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] font-black text-dark-slate uppercase tracking-widest mb-2 px-2 py-0.5 bg-red-500/80 rounded inline-block">
                #{data.orderNumber}
              </p>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-gray-400">
                  <UserIcon className="w-3.5 h-3.5 opacity-60" />
                  <span className="text-sm font-medium truncate text-gray-600">{data.customerName}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-dark-slate/10 italic text-[11px] text-red-400 font-medium">
                This order preparation should be stopped immediately.
              </div>
            </div>
          </div>
        ),
        {
          toastId,
          position: "top-right",
          autoClose: 10000,
          className: "!rounded-2xl !bg-pearl/95 !backdrop-blur-md !shadow-2xl !border !border-red-500/20",
          progressClassName: "!bg-red-600",
          bodyClassName: "!p-4",
          closeButton: false
        }
      );

      // Add to notification center
      addNotification({
        type: 'cancel',
        title: 'Order Cancelled',
        message: `Order #${data.orderNumber} was cancelled`,
        data: data,
        link: '/admin/orders'
      });

      playNotificationSound('cancel');
    };

    const handleNewReservation = (data) => {
      if (user.role !== 'admin') return;
      const toastId = `new-res-${data.confirmationCode}`;
      if (toast.isActive(toastId)) return;

      toast.info(
        ({ closeToast }) => (
          <div className="flex items-start gap-4 p-1">
            <div className="flex-shrink-0 relative">
              <div className="w-12 h-12 bg-warm-gold/20 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)] border border-warm-gold/30">
                <CalendarDaysIcon className="w-7 h-7 text-warm-gold" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warm-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-warm-gold border-2 border-deep-black"></span>
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-base font-bold text-dark-slate leading-none mb-1 font-heading">
                  New Table Booking
                </p>
                <button 
                  onClick={closeToast}
                  className="text-gray-400 hover:text-dark-slate transition-colors p-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] font-black text-deep-black uppercase tracking-widest mb-2 px-2 py-0.5 bg-warm-gold rounded inline-block">
                Ref: {data.confirmationCode}
              </p>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-gray-400">
                  <UserIcon className="w-3.5 h-3.5 opacity-60" />
                  <span className="text-sm font-medium truncate text-gray-600">{data.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <UsersIcon className="w-3.5 h-3.5 opacity-60" />
                  <span className="text-sm font-medium text-gray-600">{data.partySize} Guests • {data.time}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-dark-slate/10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  {data.date}
                </span>
                <span className="text-[10px] font-bold text-warm-gold animate-pulse">
                  View Schedule →
                </span>
              </div>
            </div>
          </div>
        ),
        {
          toastId,
          position: "top-right",
          autoClose: 10000,
          className: "!rounded-2xl !bg-pearl/95 !backdrop-blur-md !shadow-2xl !border !border-warm-gold/20",
          progressClassName: "!bg-warm-gold",
          bodyClassName: "!p-4",
          closeButton: false
        }
      );



      // Add to notification center
      addNotification({
        type: 'reservation',
        title: 'New Reservation',
        message: `${data.customerName} - ${data.partySize} Guests`,
        data: data,
        link: '/admin/reservations'
      });

      // We can use the same new order sound or a different one
      playNotificationSound('new');
    };

    socket.on('new_order', handleNewOrder);
    socket.on('check_new_order_global', handleNewOrder);
    socket.on('order_cancelled', handleCancelOrder);
    socket.on('order_cancelled_global', handleCancelOrder);
    socket.on('new_reservation', handleNewReservation);

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user]);

  return <ToastContainer limit={3} newestOnTop pauseOnFocusLoss={false} />;
};

export default SocketListener;
