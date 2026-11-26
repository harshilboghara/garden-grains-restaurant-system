import { useState } from "react";
import { useQuery } from "react-query";
import { ordersAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useScrollLock } from "../hooks/useScrollLock";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  StarIcon,
  PrinterIcon,
  XMarkIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  CheckIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import RatingModal from "../components/orders/RatingModal";
import toast from "react-hot-toast";

const Orders = () => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  useScrollLock(isDetailsModalOpen || isCancelModalOpen);

  const handleReviewSubmit = async (reviewData) => {
    try {
      await ordersAPI.addFeedback(
        ratingOrder._id,
        reviewData.rating,
        reviewData.comment,
      );
      toast.success("Thank you for your feedback!");
      setReviewModalOpen(false);
      setRatingOrder(null);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    }
  };

  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useQuery(
    ["user-orders", selectedStatus],
    () => ordersAPI.getOrders({ status: selectedStatus }),
    { enabled: !!user }
  );

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    const orderId = orderToCancel._id;
    const orderNumber = orderToCancel.orderNumber;
    
    setIsCancelModalOpen(false);
    setOrderToCancel(null);
    
    try {
      await ordersAPI.updateOrderStatus(orderId, "cancelled", "Cancelled by customer");
      toast.success(`Order #${orderNumber} cancelled successfully`);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "confirmed": return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      case "preparing": return <ClockIcon className="w-5 h-5 text-purple-500" />;
      case "ready": return <CheckCircleIcon className="w-5 h-5 text-organic-green" />;
      case "served": return <CheckCircleIcon className="w-5 h-5 text-organic-green" />;
      case "cancelled": return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "confirmed": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "preparing": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "ready": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "served": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "cancelled": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Order Placed";
      case "confirmed": return "Confirmed";
      case "preparing": return "Preparing";
      case "ready": return "Ready for Pickup";
      case "served": return "Served";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  const handlePrintBill = (order) => {
    const printWindow = window.open("", "_blank");
    
    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Garden Grains - Order #${order.orderNumber}</title>
          <style>
             @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
             
             @media print { 
               @page { size: A4; margin: 10mm; } 
               body { background: white !important; -webkit-print-color-adjust: exact; }
               .no-print { display: none; }
               .receipt-wrap { box-shadow: none !important; border: none !important; margin: 0 !important; width: 100% !important; padding: 0 !important; }
             }

             body { 
               font-family: 'Inter', sans-serif; 
               color: #2c3e50; 
               line-height: 1.5; 
               padding: 40px; 
               background: #fdfcf0; 
               margin: 0;
             }

             .receipt-wrap { 
               max-width: 850px; 
               margin: 0 auto; 
               background: white; 
               padding: 60px; 
               border-radius: 8px; 
               box-shadow: 0 40px 100px -20px rgba(0,0,0,0.1);
               border: 1px solid rgba(27, 58, 42, 0.1);
               position: relative;
             }

             /* Brand Accents */
             .receipt-wrap::before {
               content: '';
               position: absolute;
               top: 0; left: 0; right: 0;
               height: 8px;
               background: #1b3a2a;
             }

             .header { 
               display: flex; 
               justify-content: space-between; 
               align-items: flex-end; 
               margin-bottom: 60px;
               padding-bottom: 30px;
               border-bottom: 1px solid #eee;
             }

             .brand h1 { 
               margin: 0; 
               font-family: 'Playfair Display', serif; 
               font-size: 48px; 
               font-weight: 700; 
               color: #1b3a2a; 
               font-style: italic;
               letter-spacing: -0.03em;
             }
             .brand p { 
               margin: 5px 0 0; 
               font-size: 10px; 
               text-transform: uppercase; 
               letter-spacing: 0.5em; 
               color: #c5a059; 
               font-weight: 800;
             }

             .invoice-title { text-align: right; }
             .invoice-title h2 { 
               margin: 0; 
               font-size: 12px; 
               font-weight: 900; 
               text-transform: uppercase; 
               letter-spacing: 0.4em; 
               color: #999; 
             }
             .ref-number { 
               font-size: 24px; 
               font-family: 'Playfair Display', serif; 
               font-weight: 700; 
               color: #1b3a2a;
               margin-top: 5px;
             }

             .meta-grid { 
               display: grid; 
               grid-template-columns: repeat(2, 1fr); 
               gap: 50px; 
               margin-bottom: 50px; 
             }

             .meta-box h3 { 
               font-size: 10px; 
               text-transform: uppercase; 
               letter-spacing: 0.25em; 
               color: #1b3a2a; 
               margin-bottom: 15px;
               opacity: 0.6;
             }
             .meta-box p { 
               margin: 2px 0; 
               font-size: 15px; 
               color: #333; 
             }
             .meta-box strong { color: #000; font-weight: 600; }

             table { 
               width: 100%; 
               border-collapse: collapse; 
               margin: 40px 0; 
             }
             th { 
               text-align: left; 
               padding: 20px 10px; 
               background: #f9fbf9;
               border-top: 2px solid #1b3a2a;
               border-bottom: 1px solid #eee;
               font-size: 11px; 
               font-weight: 800; 
               text-transform: uppercase; 
               letter-spacing: 0.2em; 
               color: #1b3a2a;
             }
             td { 
               padding: 30px 10px; 
               border-bottom: 1px solid #f2f2f2; 
               font-size: 14px;
               vertical-align: top;
             }

             .item-col .name { font-weight: 700; color: #1b3a2a; font-size: 16px; display: block; margin-bottom: 8px; }
             .item-col .extras { font-size: 12px; color: #777; font-style: italic; display: block; }
             .mono { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500; }

             .billing-section { 
               display: flex; 
               justify-content: flex-end; 
               margin-top: 30px;
             }
             .billing-table { width: 340px; }
             .bill-item { 
               display: flex; 
               justify-content: space-between; 
               padding: 14px 0; 
               font-size: 14px; 
               color: #444;
               border-bottom: 1px solid #f9f9f9;
             }
             .bill-item.grand { 
               border-top: 2px solid #1b3a2a; 
               border-bottom: none;
               margin-top: 20px; 
               padding-top: 25px; 
               font-size: 32px; 
               font-family: 'Playfair Display', serif;
               font-weight: 700; 
               color: #1b3a2a; 
             }
             .promo-text { color: #c5a059; font-weight: 700; }

             .luxury-seal {
               position: absolute;
               bottom: 250px;
               left: 80px;
               width: 140px;
               height: 140px;
               border: 2px dashed #c5a059;
               border-radius: 50%;
               display: flex;
               align-items: center;
               justify-content: center;
               transform: rotate(-15deg);
               opacity: 0.3;
               pointer-events: none;
             }
             .seal-inner {
               text-align: center;
               color: #c5a059;
               font-weight: 900;
               font-size: 15px;
               text-transform: uppercase;
               letter-spacing: 0.1em;
               line-height: 1.2;
             }

             .footer { 
               margin-top: 100px; 
               padding-top: 50px; 
               border-top: 1px solid #eee;
               display: flex;
               justify-content: space-between;
               align-items: flex-end;
             }
             .footer-brand h4 { 
               margin: 0; 
               font-family: 'Playfair Display', serif; 
               font-size: 24px; 
               font-style: italic;
               color: #1b3a2a;
             }
             .footer-brand p { margin: 8px 0 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.15em; }
             
             .signature-wing { 
               text-align: right; 
               position: relative;
               width: 250px;
             }
             .official-stamp {
               position: absolute;
               right: -20px;
               top: -60px;
               width: 110px;
               height: 110px;
               border: 5px double #1b3a2a;
               border-radius: 50%;
               display: flex;
               flex-direction: column;
               align-items: center;
               justify-content: center;
               transform: rotate(-12deg);
               opacity: 0.85;
               background: rgba(251, 252, 240, 0.9);
               z-index: 5;
             }
             .stamp-label { font-size: 8px; font-weight: 900; text-transform: uppercase; color: #1b3a2a; }
             .stamp-brand { font-family: 'Playfair Display', serif; font-size: 12px; font-style: italic; color: #1b3a2a; margin: 3px 0; }

             .sig-line { width: 100%; height: 2px; background: #1b3a2a; margin-bottom: 12px; }
             .signature-wing p { font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: #999; margin: 0; }
          </style>
        </head>
        <body>
          <div class="receipt-wrap">
            <div class="luxury-seal">
              <div class="seal-inner">Officially<br>Verified</div>
            </div>
            
            <div class="header">
              <div class="brand">
                <h1>Garden Grains</h1>
                <p>Curated Organic Dining</p>
              </div>
              <div class="invoice-title">
                <h2>Patron Order Receipt</h2>
                <div class="ref-number">#${order.orderNumber}</div>
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-box">
                <h3>Patron</h3>
                <p><strong>${user?.name || "Distinguished Guest"}</strong></p>
                <p>${user?.email || ""}</p>
                <p>${order.deliveryAddress || "Signature In-House Table Service"}</p>
              </div>
              <div class="meta-box" style="text-align: right">
                <h3>Receipt Details</h3>
                <p>Date: <strong>${new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></p>
                <p>Method: <strong>${order.paymentMethod?.toLowerCase() === 'cash' ? 'CASH' : 'ONLINE'}</strong></p>
                <p>Order ID: <strong>GG-${order._id.toString().slice(-8).toUpperCase()}</strong></p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 60%">Culinary Selection</th>
                  <th style="text-align: center">Quantity</th>
                  <th style="text-align: right">Price</th>
                  <th style="text-align: right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${(order.items || []).map(item => `
                  <tr>
                    <td>
                      <div class="item-col">
                        <span class="name">${item.menuItem?.name || 'Artisanal Preparation'}</span>
                        ${item.customization?.map(c => `<span class="extras">• ${c.selectedChoices.map(ch => ch.name).join(", ")}</span>`).join("") || ""}
                      </div>
                    </td>
                    <td style="text-align: center">${item.quantity}</td>
                    <td style="text-align: right" class="mono">₹${item.price?.toFixed(2)}</td>
                    <td style="text-align: right" class="mono">₹${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <div class="billing-section">
              <div class="billing-table">
                <div class="bill-item">
                  <span>Selection Subtotal</span>
                  <span class="mono">₹${(order.subtotal || (order.total / 1.18)).toFixed(2)}</span>
                </div>
                ${order.discount ? `
                  <div class="bill-item promo-text">
                    <span>Promotional Credit</span>
                    <span class="mono">-₹${order.discount.toFixed(2)}</span>
                  </div>
                ` : ''}
                <div class="bill-item" style="color: #999; font-size: 12px;">
                  <span>Service & Tax (18%)</span>
                  <span class="mono">₹${(order.tax || (order.total - (order.total / 1.18))).toFixed(2)}</span>
                </div>
                <div class="bill-item grand">
                  <span>Total Amount</span>
                  <span class="mono">₹${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <div class="footer-brand">
                <h4>Garden Grains</h4>
                <p>Pure. Organic. Signature.</p>
              </div>
              <div class="signature-wing">
                <div class="official-stamp">
                  <div class="stamp-label">Authorized</div>
                  <div class="stamp-brand">Garden Grains</div>
                  <div class="stamp-label">Restaurant</div>
                </div>
                <div class="sig-line"></div>
                <p>Authorized Signatory</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen relative">
        <div className="w-16 h-16 border-4 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pt-24 pb-12">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-10 text-center animate-slide-up">
           <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
            <span className="text-xl">📦</span>
            <span className="text-sm font-medium text-warm-gold uppercase tracking-wider">Order Tracking</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-dark-slate mb-2 font-heading">My Orders</h1>
          <p className="text-gray-400">Track current orders and view history</p>
        </div>

        {/* Filter */}
        <div className="mb-8 flex justify-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-panel p-1 rounded-xl flex items-center space-x-2 border border-dark-slate/10">
             <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-dark-slate px-4 py-2 focus:outline-none cursor-pointer"
             >
                <option value="" className="bg-pearl text-dark-slate">All Orders</option>
                <option value="pending" className="bg-pearl text-dark-slate">Pending</option>
                <option value="preparing" className="bg-pearl text-dark-slate">Preparing</option>
                <option value="ready" className="bg-pearl text-dark-slate">Ready</option>
                <option value="served" className="bg-pearl text-dark-slate">Served</option>
                <option value="cancelled" className="bg-pearl text-dark-slate">Cancelled</option>
             </select>
          </div>
        </div>

        {/* Orders List */}
        {ordersData?.data?.orders?.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
             <div className="w-24 h-24 bg-dark-slate/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-dark-slate/10">
               <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
             </div>
             <h3 className="text-2xl font-bold text-dark-slate mb-2 font-heading">No orders found</h3>
             <p className="text-gray-400 mb-8">Looks like you haven't placed any orders yet.</p>
             <a href="/menu" className="btn-primary">Browse Menu</a>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {ordersData?.data?.orders?.map((order) => (
              <div
                key={order._id}
                className="glass-panel border border-dark-slate/10 rounded-2xl overflow-hidden hover:border-warm-gold/30 transition-all duration-300 group"
              >
                {/* Order Header */}
                <div className="px-6 py-5 border-b border-dark-slate/10 bg-dark-slate/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-pearl rounded-xl flex items-center justify-center border border-dark-slate/10">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                           <h3 className="text-lg font-bold text-dark-slate font-heading">Order #{order.orderNumber}</h3>
                           <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(order.status)} uppercase tracking-wider`}>
                              {getStatusText(order.status)}
                           </span>
                        </div>
                        <div className="text-xs text-gray-400">
                           {new Date(order.createdAt).toLocaleDateString("en-IN", {
                             year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                           })}
                        </div>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                       <div className="text-2xl font-bold text-warm-gold font-heading">₹{order.total.toFixed(2)}</div>
                       <div className="text-sm text-gray-400">{order.items.length} items</div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="px-6 py-4 bg-black/20 border-b border-dark-slate/5 overflow-x-auto">
                   <div className="flex items-center min-w-[300px] justify-between text-xs">
                      {['pending', 'confirmed', 'preparing', 'ready', 'served'].map((status, index) => {
                         const currentIdx = ['pending', 'confirmed', 'preparing', 'ready', 'served'].indexOf(order.status);
                         const isActive = currentIdx >= index;
                         const isCurrent = order.status === status;
                         
                         return (
                            <div key={status} className="flex-1 flex flex-col items-center relative z-10">
                               <div className={`w-3 h-3 rounded-full mb-2 ${isActive ? 'bg-warm-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'bg-gray-700'} transition-all`}></div>
                               <span className={`capitalize ${isActive ? 'text-dark-slate' : 'text-gray-600'}`}>{status}</span>
                               {index < 4 && (
                                  <div className={`absolute top-1.5 left-1/2 w-full h-0.5 -z-10 ${currentIdx > index ? 'bg-warm-gold/50' : 'bg-gray-800'}`}></div>
                               )}
                            </div>
                         )
                      })}
                   </div>
                </div>

                {/* Items Preview */}
                <div className="px-6 py-4">
                   <div className="flex -space-x-2 overflow-hidden py-2">
                      {order.items.slice(0, 5).map((item, i) => (
                         <img 
                           key={i} 
                           src={item.menuItem?.images?.[0]?.url || "https://placehold.co/60x60"} 
                           className="inline-block h-10 w-10 sticky-0 rounded-full ring-2 ring-deep-black object-cover bg-gray-800"
                           alt=""
                         />
                      ))}
                      {order.items.length > 5 && (
                         <div className="h-10 w-10 rounded-full bg-gray-800 ring-2 ring-deep-black flex items-center justify-center text-xs text-dark-slate font-bold">
                            +{order.items.length - 5}
                         </div>
                      )}
                   </div>
                </div>

                {/* Order Footer */}
                <div className="px-6 py-4 border-t border-dark-slate/10 bg-dark-slate/5 flex flex-wrap gap-3 justify-between items-center">
                   <div className="text-sm text-gray-400">
                      {order.orderType === 'dine-in' ? '🍽️ Dine-in' : '🛍️ Takeaway'}
                   </div>
                   
                   <div className="flex gap-3">
                      <button
                        onClick={() => handlePrintBill(order)}
                        className="px-3 py-1.5 rounded-lg border border-dark-slate/20 text-gray-600 text-sm hover:bg-dark-slate/10 hover:text-dark-slate transition-colors flex items-center"
                      >
                         <PrinterIcon className="w-4 h-4 mr-1" /> Bill
                      </button>
                      <button 
                        onClick={() => { setSelectedOrderDetail(order); setIsDetailsModalOpen(true); }}
                        className="px-3 py-1.5 rounded-lg bg-dark-slate/10 hover:bg-dark-slate/20 text-dark-slate text-sm transition-colors border border-dark-slate/10 flex items-center"
                      >
                         <EyeIcon className="w-4 h-4 mr-1" /> Details
                      </button>
                      
                      {order.status === "pending" && (
                         <button
                            onClick={() => { setOrderToCancel(order); setIsCancelModalOpen(true); }}
                            className="px-3 py-1 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors"
                         >
                            Cancel
                         </button>
                      )}
                      
                      {order.status === "served" && (
                         <button
                            onClick={() => { setRatingOrder(order); setReviewModalOpen(true); }}
                            className="px-3 py-1.5 rounded-lg bg-warm-gold/10 hover:bg-warm-gold/20 text-warm-gold border border-warm-gold/30 text-sm flex items-center transition-colors"
                         >
                            <StarSolidIcon className="w-4 h-4 mr-1" /> {order.feedback ? "Update Rating" : "Rate"}
                         </button>
                      )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RatingModal
        isOpen={reviewModalOpen}
        onClose={() => { setReviewModalOpen(false); setRatingOrder(null); }}
        onSubmit={handleReviewSubmit}
        menuItem={{ name: `Order #${ratingOrder?.orderNumber}` }}
      />
      
      {/* Details Modal */}
      {isDetailsModalOpen && selectedOrderDetail && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pearl/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl bg-pearl border border-dark-slate/10 rounded-2xl overflow-hidden glass-panel flex flex-col max-h-[90vh]">
               {/* Modal Header */}
               <div className="px-6 py-4 border-b border-dark-slate/10 flex justify-between items-center bg-dark-slate/5">
                  <div>
                     <h3 className="text-xl font-bold text-dark-slate font-heading">Order Summary</h3>
                     <p className="text-sm text-gray-400">#{selectedOrderDetail.orderNumber}</p>
                  </div>
                  <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-dark-slate p-2 hover:bg-dark-slate/10 rounded-full transition-colors">
                     <XMarkIcon className="w-6 h-6" />
                  </button>
               </div>
               
                {/* Modal Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 bg-black/40">
                   {/* Status & Type Banner */}
                   <div className="flex flex-wrap gap-4 items-center justify-between p-4 rounded-2xl bg-dark-slate/5 border border-dark-slate/10">
                      <div className="flex items-center space-x-3">
                         <div className={`p-2 rounded-xl bg-pearl border border-dark-slate/10 ${getStatusColor(selectedOrderDetail.status).split(' ')[1]}`}>
                            {getStatusIcon(selectedOrderDetail.status)}
                         </div>
                         <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Current Status</p>
                            <p className={`font-bold text-sm ${getStatusColor(selectedOrderDetail.status).split(' ')[1]}`}>{getStatusText(selectedOrderDetail.status)}</p>
                         </div>
                      </div>
                      <div className="h-8 w-px bg-dark-slate/10 hidden md:block"></div>
                      <div className="flex items-center space-x-3">
                         <div className="p-2 rounded-xl bg-pearl border border-dark-slate/10 text-warm-gold">
                            <ShoppingBagIcon className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Order Type</p>
                            <p className="font-bold text-sm text-dark-slate capitalize">{selectedOrderDetail.orderType}</p>
                         </div>
                      </div>
                   </div>
                   
                   {/* Items List */}
                   <div>
                      <div className="flex justify-between items-center mb-4 px-1">
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Ordered Items</h4>
                         <span className="text-[10px] text-warm-gold bg-warm-gold/10 px-2 py-0.5 rounded-full border border-warm-gold/20 font-bold uppercase">{selectedOrderDetail.items.length} Items</span>
                      </div>
                      <div className="space-y-3">
                         {selectedOrderDetail.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3.5 rounded-2xl bg-dark-slate/5 hover:bg-dark-slate/10 border border-dark-slate/5 transition-all group">
                               <div className="flex items-center space-x-4">
                                  <div className="relative">
                                     <img src={item.menuItem?.images?.[0]?.url || "https://placehold.co/60x60"} className="w-14 h-14 rounded-xl object-cover border border-dark-slate/10 group-hover:border-warm-gold/50 transition-colors" alt="" />
                                     <span className="absolute -top-1.5 -right-1.5 bg-warm-gold text-deep-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-deep-black">
                                       {item.quantity}
                                     </span>
                                  </div>
                                  <div>
                                     <div className="font-bold text-dark-slate text-base group-hover:text-warm-gold transition-colors">{item.menuItem?.name}</div>
                                     <div className="text-xs text-gray-400 font-mono">₹{item.price?.toFixed(2)} / unit</div>
                                     {item.customization?.length > 0 && (
                                        <div className="flex gap-1.5 flex-wrap mt-2">
                                           {item.customization.map((c, i) => (
                                              <span key={i} className="text-[9px] px-2 py-0.5 rounded-lg bg-pearl/60 text-gray-400 border border-dark-slate/5">
                                                 {c.selectedChoices.map(ch => ch.name).join(', ')}
                                              </span>
                                           ))}
                                        </div>
                                     )}
                                  </div>
                               </div>
                               <div className="text-right">
                                  <div className="font-mono font-bold text-dark-slate">₹{(item.quantity * item.price).toFixed(2)}</div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                   
                   {/* Billing Summary */}
                   <div className="bg-pearl rounded-2xl p-6 border border-dark-slate/10 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-warm-gold/50 to-transparent"></div>
                      <div className="space-y-3">
                         <div className="flex justify-between text-sm text-gray-400">
                            <span>Subtotal</span>
                            <span className="font-mono text-dark-slate">₹{(selectedOrderDetail.subtotal || (selectedOrderDetail.total / 1.18)).toFixed(2)}</span>
                         </div>
                         
                         {selectedOrderDetail.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-400">
                               <span className="flex items-center">
                                  <TagIcon className="w-3 h-3 mr-1.5" />
                                  Discount Applied
                               </span>
                               <span className="font-mono">-₹{selectedOrderDetail.discount.toFixed(2)}</span>
                            </div>
                         )}
                         
                         <div className="flex justify-between text-sm text-gray-400">
                            <span>Tax & Service (18% GST)</span>
                            <span className="font-mono text-dark-slate">₹{(selectedOrderDetail.tax || (selectedOrderDetail.total - (selectedOrderDetail.total / 1.18))).toFixed(2)}</span>
                         </div>
                         
                         <div className="h-px bg-dark-slate/10 my-4 border-t border-dashed border-dark-slate/20"></div>
                         
                         <div className="flex justify-between items-center bg-dark-slate/5 -mx-6 -mb-6 p-6 mt-4">
                            <div>
                               <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total Payable</p>
                               <p className="text-2xl font-bold text-dark-slate font-heading">Amount Paid</p>
                            </div>
                            <div className="text-right">
                               <div className="text-3xl font-bold text-warm-gold font-mono tracking-tighter shadow-soft-gold-text">
                                  ₹{selectedOrderDetail.total.toFixed(2)}
                               </div>
                               <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Transaction Successful</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
               
               <div className="p-4 border-t border-dark-slate/10 bg-dark-slate/5 flex justify-end">
                  <button 
                     onClick={() => setIsDetailsModalOpen(false)}
                     className="px-6 py-2 rounded-xl bg-dark-slate/10 hover:bg-dark-slate/20 text-dark-slate font-bold transition-colors"
                  >
                     Close
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Cancel Modal */}
      {isCancelModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pearl/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-dark-slate/10 text-center">
               <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <XCircleIcon className="w-6 h-6 text-red-500" />
               </div>
               <h3 className="text-xl font-bold text-dark-slate mb-2">Cancel Order?</h3>
               <p className="text-gray-400 mb-6 text-sm">
                  Are you sure you want to cancel <span className="text-dark-slate font-bold">#{orderToCancel?.orderNumber}</span>? This action cannot be undone.
               </p>
               <div className="flex gap-3 justify-center">
                  <button 
                     onClick={() => setIsCancelModalOpen(false)}
                     className="px-4 py-2 rounded-lg bg-dark-slate/10 hover:bg-dark-slate/20 text-dark-slate transition-colors"
                  >
                     Keep Order
                  </button>
                  <button 
                     onClick={handleCancelOrder}
                     className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-dark-slate font-bold transition-colors shadow-lg shadow-red-500/20"
                  >
                     Yes, Cancel
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Orders;
