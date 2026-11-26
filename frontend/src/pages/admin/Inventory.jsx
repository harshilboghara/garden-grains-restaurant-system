import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  AdjustmentsVerticalIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'logs'
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Raw Materials',
    quantity: 0,
    unit: 'pieces',
    minStockLevel: 5,
    costPrice: 0,
    expiryDate: '',
    description: '',
    supplier: {
      name: '',
      contact: '',
      email: ''
    }
  });

  const categories = ['Raw Materials', 'Beverages', 'Cleaning Supplies', 'Packaging', 'Kitchen Equipment', 'Other'];
  const units = ['kg', 'grams', 'liters', 'ml', 'pieces', 'boxes', 'packets'];

  useEffect(() => {
    if (activeTab === 'items') {
      fetchInventory();
    } else {
      fetchLogs();
    }
  }, [categoryFilter, statusFilter, activeTab]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await inventoryAPI.getInventory({
        category: categoryFilter,
        status: statusFilter,
        search: search
      });
      setItems(res.data);
    } catch (error) {
      console.error('Fetch inventory error:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await inventoryAPI.getLogs();
      setLogs(res.data);
    } catch (error) {
      console.error('Fetch logs error:', error);
      toast.error('Failed to load inventory logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    try {
      const data = items.map((item, index) => ({
        'No.': index + 1,
        'Item Name': item.name,
        'SKU': item.sku || 'N/A',
        'Category': item.category,
        'Current Stock': item.quantity,
        'Unit': item.unit,
        'Cost Price': `₹${item.costPrice}`,
        'Status': item.status,
        'Expiry Date': item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A',
        'Supplier': item.supplier?.name || 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
      XLSX.writeFile(workbook, `Inventory_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel file generated');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Excel Export failed');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add Title
      doc.setFontSize(20);
      doc.setTextColor(180, 160, 100); // Warm Gold color
      doc.text("GARDEN GRAINS - INVENTORY REPORT", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

      const tableColumn = ["No.", "Name", "SKU", "Category", "Qty", "Unit", "Price", "Status"];
      const tableRows = items.map((item, index) => [
        index + 1,
        item.name,
        item.sku || 'N/A',
        item.category,
        item.quantity,
        item.unit,
        `Rs.${item.costPrice}`,
        item.status
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [180, 160, 100], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      doc.save(`Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF report generated');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('PDF Export failed');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await inventoryAPI.updateItem(editingItem._id, formData);
        toast.success('Item updated successfully');
      } else {
        await inventoryAPI.addItem(formData);
        toast.success('Item added successfully');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      resetForm();
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.updateStock(editingItem._id, {
        adjustment: Number(stockAdjustment),
        reason: adjustmentReason
      });
      toast.success('Stock updated successfully');
      setIsStockModalOpen(false);
      setEditingItem(null);
      setStockAdjustment(0);
      setAdjustmentReason('');
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleDelete = async () => {
    try {
      await inventoryAPI.deleteItem(itemToDelete._id);
      toast.success('Item deleted successfully');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchInventory();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: 'Raw Materials',
      quantity: 0,
      unit: 'pieces',
      minStockLevel: 5,
      costPrice: 0,
      expiryDate: '',
      description: '',
      supplier: {
        name: '',
        contact: '',
        email: ''
      }
    });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku || '',
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minStockLevel: item.minStockLevel,
      costPrice: item.costPrice,
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      description: item.description || '',
      supplier: item.supplier || { name: '', contact: '', email: '' }
    });
    setIsModalOpen(true);
  };

  const openStockModal = (item) => {
    setEditingItem(item);
    setStockAdjustment(0);
    setAdjustmentReason('');
    setIsStockModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Low Stock': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Out of Stock': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-pearl/60 backdrop-blur-xl p-8 rounded-[2rem] border border-dark-slate/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black text-dark-slate tracking-tight mb-2">Inventory <span className="text-warm-gold">Management</span></h1>
          <p className="text-gray-400 font-medium">Track your supplies, stock levels, and restock alerts.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Export Options */}
          <div className="flex bg-dark-slate/5 rounded-2xl border border-dark-slate/10 p-1">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-3 text-xs font-black text-dark-slate hover:bg-dark-slate/10 rounded-xl transition-all"
              title="Export as Excel"
            >
              <DocumentArrowDownIcon className="w-5 h-5 text-green-400" />
              <span>EXCEL</span>
            </button>
            <div className="w-px bg-dark-slate/10 my-2" />
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-3 text-xs font-black text-dark-slate hover:bg-dark-slate/10 rounded-xl transition-all"
              title="Export as PDF"
            >
              <DocumentArrowDownIcon className="w-5 h-5 text-red-400" />
              <span>PDF</span>
            </button>
          </div>

          <button
            onClick={() => {
              resetForm();
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-warm-gold text-black rounded-2xl font-black hover:bg-warm-gold/90 transition-all duration-300 shadow-lg shadow-warm-gold/20 active:scale-95 group"
          >
            <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            <span>ADD NEW ITEM</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-pearl/40 backdrop-blur-md rounded-2xl border border-dark-slate/5 w-fit">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'items' ? 'bg-warm-gold text-black shadow-lg shadow-warm-gold/10' : 'text-gray-400 hover:text-dark-slate'}`}
        >
          <div className="flex items-center gap-2">
            <ArchiveBoxIcon className="w-5 h-5" />
            <span>Current Stock</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'logs' ? 'bg-warm-gold text-black shadow-lg shadow-warm-gold/10' : 'text-gray-400 hover:text-dark-slate'}`}
        >
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            <span>History Logs</span>
          </div>
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Items', value: items.length, icon: ArchiveBoxIcon, color: 'warm-gold' },
          { label: 'Low Stock Items', value: items.filter(i => i.status === 'Low Stock').length, icon: ExclamationTriangleIcon, color: 'amber-400' },
          { label: 'Out of Stock', value: items.filter(i => i.status === 'Out of Stock').length, icon: ArchiveBoxIcon, color: 'red-400' },
          { label: 'Total Value', value: `₹${items.reduce((acc, current) => acc + (current.costPrice * current.quantity), 0).toLocaleString()}`, icon: CheckCircleIcon, color: 'green-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-pearl/40 backdrop-blur-md p-6 rounded-3xl border border-dark-slate/5 flex items-center gap-5">
            <div className={`p-4 rounded-2xl bg-${stat.color === 'warm-gold' ? 'amber-400' : stat.color}/10 border border-${stat.color === 'warm-gold' ? 'amber-400' : stat.color}/20`}>
              <stat.icon className={`w-8 h-8 ${stat.color === 'warm-gold' ? 'text-warm-gold' : `text-${stat.color}`}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-dark-slate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {activeTab === 'items' ? (
        <>
          {/* Filters & Search */}
          <div className="bg-pearl/40 backdrop-blur-md p-6 rounded-3xl border border-dark-slate/5 flex flex-col lg:flex-row gap-6">
            <form onSubmit={handleSearch} className="flex-1 relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-warm-gold transition-colors" />
              <input
                type="text"
                placeholder="Search by item name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 pl-12 pr-4 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50 transition-all"
              />
            </form>
            
            <div className="flex gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 px-6 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 px-6 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              <button 
                onClick={() => { setActiveTab('items'); fetchInventory(); }}
                className="p-4 bg-dark-slate/5 hover:bg-dark-slate/10 border border-dark-slate/10 rounded-2xl text-gray-400 hover:text-dark-slate transition-all"
              >
                <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin text-warm-gold' : ''}`} />
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-pearl/40 backdrop-blur-md rounded-3xl border border-dark-slate/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-dark-slate/5 border-b border-dark-slate/5">
                    <th className="px-6 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">No.</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Item Details</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Stock Level</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-8 py-12 text-center text-gray-400 font-bold">
                        {loading ? 'Crunching inventory data...' : 'No inventory items found.'}
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item._id} className="hover:bg-dark-slate/5 transition-colors group">
                        <td className="px-6 py-6 font-bold text-gray-400">{index + 1}</td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="font-black text-dark-slate text-lg">{item.name}</p>
                            {item.sku && <p className="text-[10px] text-warm-gold font-bold uppercase">SKU: {item.sku}</p>}
                            <p className="text-xs text-gray-400 font-medium">Supplier: {item.supplier?.name || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-4 py-2 rounded-full bg-dark-slate/5 border border-dark-slate/10 text-xs font-bold text-gray-400">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <span className={`text-xl font-black ${item.status === 'Low Stock' ? 'text-amber-400' : item.status === 'Out of Stock' ? 'text-red-400' : 'text-dark-slate'}`}>
                              {item.quantity}
                            </span>
                            <span className="text-sm text-gray-400 font-bold">{item.unit}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">Min: {item.minStockLevel} {item.unit}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-black text-dark-slate">₹{item.costPrice.toFixed(2)}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">per {item.unit}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openStockModal(item)}
                              title="Quick Stock Adjustment"
                              className="p-3 bg-warm-gold/10 hover:bg-warm-gold text-warm-gold hover:text-black rounded-xl border border-warm-gold/20 transition-all"
                            >
                              <AdjustmentsVerticalIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-3 bg-dark-slate/5 hover:bg-white border border-dark-slate/10 text-dark-slate hover:text-black rounded-xl transition-all"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setItemToDelete(item);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-3 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-500 hover:text-dark-slate rounded-xl transition-all"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Logs Table */
        <div className="bg-pearl/40 backdrop-blur-md rounded-3xl border border-dark-slate/5 overflow-hidden shadow-2xl animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-slate/5 border-b border-dark-slate/5">
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Time</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Item</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Change</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">User / Ref</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center text-gray-400 font-bold">
                      {loading ? 'Fetching history...' : 'No logs found.'}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-dark-slate/5 transition-colors">
                      <td className="px-8 py-6 text-xs text-gray-400 font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-dark-slate">{log.inventoryItem?.name}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          log.action === 'In' ? 'bg-green-500/10 text-green-400' :
                          log.action === 'Out' ? 'bg-red-500/10 text-red-400' :
                          log.action === 'Consumption' ? 'bg-blue-500/10 text-blue-400' :
                          log.action === 'Return' ? 'bg-green-500/10 text-green-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className={`font-black ${log.action === 'In' || log.action === 'Return' ? 'text-green-400' : 'text-red-400'}`}>
                          {log.action === 'In' || log.action === 'Return' ? '+' : '-'}{log.quantityChanged}
                        </p>
                        <p className="text-[10px] text-gray-400 italic">Balance: {log.newQuantity}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs text-dark-slate font-medium">{log.user?.name || 'System'}</p>
                        <p className="text-[10px] text-gray-400 lowercase">{log.referenceType}</p>
                      </td>
                      <td className="px-8 py-6 italic text-xs text-gray-400">
                        {log.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-pearl border border-dark-slate/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-10 py-8 border-b border-dark-slate/5 bg-gradient-to-r from-warm-gold/10 to-transparent flex justify-between items-center">
              <h2 className="text-3xl font-black text-dark-slate uppercase tracking-tight">
                {editingItem ? 'Edit Item' : 'New Inventory Item'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-dark-slate transition-colors p-2">
                <PlusIcon className="w-8 h-8 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Item Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 px-6 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 tracking-widest uppercase">SKU / Code</label>
                  <input
                    type="text"
                    placeholder="INV-XXXX"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 px-6 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 px-6 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50 appearance-none"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 px-6 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Initial Quantity</label>
                  <input
                    required
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                    className="w-full bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 px-6 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 px-6 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50 appearance-none"
                  >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Min Stock Level</label>
                  <input
                    required
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({...formData, minStockLevel: Number(e.target.value)})}
                    className="w-full bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 px-6 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Cost Price (₹)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})}
                    className="w-full bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 px-6 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50"
                  />
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-dark-slate/5">
                <h3 className="text-sm font-black text-warm-gold uppercase tracking-[0.2em]">Supplier Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Name</label>
                    <input
                      type="text"
                      value={formData.supplier.name}
                      onChange={(e) => setFormData({...formData, supplier: {...formData.supplier, name: e.target.value}})}
                      className="w-full bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 px-6 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Contact</label>
                    <input
                      type="text"
                      value={formData.supplier.contact}
                      onChange={(e) => setFormData({...formData, supplier: {...formData.supplier, contact: e.target.value}})}
                      className="w-full bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 px-6 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-dark-slate/5 hover:bg-dark-slate/10 border border-dark-slate/10 rounded-2xl text-dark-slate font-black transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-4 bg-warm-gold text-black rounded-2xl font-black hover:bg-warm-gold/90 transition-all uppercase tracking-widest shadow-lg shadow-warm-gold/20"
                >
                  {editingItem ? 'UPDATE ITEM' : 'ADD ITEM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-pearl border border-dark-slate/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-10 py-8 border-b border-dark-slate/5 bg-gradient-to-r from-warm-gold/10 to-transparent flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-dark-slate uppercase tracking-tight">Stock Adjustment</h2>
                <p className="text-sm text-gray-400 mt-1">{editingItem?.name}</p>
              </div>
              <button onClick={() => setIsStockModalOpen(false)} className="text-gray-400 hover:text-dark-slate transition-colors p-2">
                <PlusIcon className="w-8 h-8 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleStockUpdate} className="p-10 space-y-8">
               <div className="flex items-center justify-center gap-8 py-4">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current</p>
                    <p className="text-3xl font-black text-dark-slate">{editingItem?.quantity}</p>
                  </div>
                  <div className="h-12 w-px bg-dark-slate/10" />
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">After</p>
                    <p className={`text-3xl font-black ${Number(editingItem?.quantity) + Number(stockAdjustment) < 0 ? 'text-red-500' : 'text-warm-gold'}`}>
                      {Number(editingItem?.quantity) + Number(stockAdjustment)}
                    </p>
                  </div>
               </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 tracking-widest uppercase block text-center">Adjustment Amount (+/-)</label>
                <div className="flex items-center gap-4">
                   <button 
                    type="button" 
                    onClick={() => setStockAdjustment(prev => prev - 1)}
                    className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-2xl font-black hover:bg-red-500 hover:text-dark-slate transition-all"
                   >
                     -
                   </button>
                   <input
                    required
                    type="number"
                    value={stockAdjustment}
                    onChange={(e) => setStockAdjustment(Number(e.target.value))}
                    className="flex-1 bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 text-center text-3xl font-black text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50"
                  />
                  <button 
                    type="button" 
                    onClick={() => setStockAdjustment(prev => prev + 1)}
                    className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-2xl font-black hover:bg-green-500 hover:text-dark-slate transition-all"
                   >
                     +
                   </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 tracking-widest uppercase mb-2 block">Reason for adjustment</label>
                <input
                  type="text"
                  placeholder="e.g. Damaged during delivery"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full bg-dark-slate/5 border border-dark-slate/10 rounded-2xl py-4 px-6 text-dark-slate focus:outline-none focus:ring-2 focus:ring-warm-gold/50"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="flex-1 py-4 bg-dark-slate/5 hover:bg-dark-slate/10 border border-dark-slate/10 rounded-2xl text-dark-slate font-black transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Number(editingItem?.quantity) + Number(stockAdjustment) < 0}
                  className="flex-2 py-4 bg-warm-gold text-black rounded-2xl font-black hover:bg-warm-gold/90 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-warm-gold/20"
                >
                  CONFIRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText="DELETE ITEM"
        confirmButtonClass="bg-red-500 hover:bg-red-600 text-dark-slate"
      />
    </div>
  );
};

export default Inventory;
