import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { adminAPI, IMAGE_BASE_URL } from '../../services/api'
import { 
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ArrowPathIcon,
  ClockIcon,
  FireIcon,
  BoltIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts'
import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const { data: dashboardData, isLoading, isFetching, isError, refetch, dataUpdatedAt } = useQuery(
    'admin-dashboard',
    () => adminAPI.getDashboard({ period: '15d' }).then(res => res.data),
    {
      refetchInterval: 20000, // Adjusted to 20s to prevent session lockouts and reduce server load
      refetchOnWindowFocus: true,

      refetchOnMount: true,
      staleTime: 5000, // Data is fresh for 5s
      cacheTime: 300000, // Keep in cache for 5m
      retry: 3, // Retry failed requests 3 times
      retryDelay: 1000 // Wait 1s between retries
    }
  )

  const lastUpdatedLabel = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—'

  // Only show full-screen error if we don't have any data at all
  if (isError && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-panel p-8 rounded-2xl border border-red-500/30">
          <p className="text-lg font-bold text-red-500">Unable to load dashboard data.</p>
          <p className="text-sm text-gray-400 mt-2">Please check your connection.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin"></div>
      </div>
    )
  }

  const calculateGrowth = (total, added) => {
    if (!total || !added) return 0
    const previous = total - added
    if (previous <= 0) return 100
    return ((added / previous) * 100)
  }

  const revenueGrowth = calculateGrowth(dashboardData?.overview?.totalRevenue, dashboardData?.overview?.revenueInPeriod)
  const ordersGrowth = calculateGrowth(dashboardData?.overview?.totalOrders, dashboardData?.overview?.ordersInPeriod)
  const customersGrowth = calculateGrowth(dashboardData?.overview?.activeUsers, dashboardData?.overview?.newActiveCustomers)
  const menuItemsGrowth = dashboardData?.overview?.newMenuItems || 0

  const stats = [
    {
      name: 'Total Revenue',
      value: `₹${dashboardData?.overview?.totalRevenue?.toFixed(2) || 0}`,
      change: `+${revenueGrowth.toFixed(1)}%`,
      changeType: revenueGrowth > 0 ? 'positive' : 'neutral',
      icon: CurrencyDollarIcon
    },
    {
      name: 'Total Orders',
      value: dashboardData?.overview?.totalOrders || 0,
      change: `+${ordersGrowth.toFixed(1)}%`,
      changeType: ordersGrowth > 0 ? 'positive' : 'neutral',
      icon: ClipboardDocumentListIcon
    },
    {
      name: 'Active Customers',
      value: dashboardData?.overview?.activeUsers || 0,
      change: `+${customersGrowth.toFixed(1)}%`,
      changeType: customersGrowth > 0 ? 'positive' : 'neutral',
      icon: UsersIcon
    },
    {
      name: 'Menu Items',
      value: dashboardData?.overview?.totalMenuItems || 0,
      change: `+${menuItemsGrowth}`,
      changeType: menuItemsGrowth > 0 ? 'positive' : 'neutral',
      icon: ChartBarIcon
    }
  ]

  const liveMetrics = [
    {
      name: 'Active Orders Now',
      value: dashboardData?.overview?.activeOrdersNow || 0,
      color: 'bg-red-500/10 text-red-400 border border-red-500/20',
      icon: FireIcon
    },
    {
      name: 'Preparing',
      value: dashboardData?.overview?.preparingOrders || 0,
      color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      icon: BoltIcon
    },
    {
      name: 'Ready for Pickup',
      value: dashboardData?.overview?.readyOrders || 0,
      color: 'bg-green-500/10 text-green-400 border border-green-500/20',
      icon: ClockIcon
    },
    {
      name: 'Low Stock Items',
      value: dashboardData?.overview?.lowStockItems || 0,
      color: dashboardData?.overview?.lowStockItems > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20',
      icon: ArchiveBoxIcon
    }
  ]

  const realTimeStats = [
    {
      name: "Today's Revenue",
      value: `₹${(dashboardData?.overview?.todayRevenue || 0).toFixed(2)}`,
      change: dashboardData?.overview?.todayOrders || 0,
      changeLabel: 'orders today',
      icon: CurrencyDollarIcon,
      color: 'text-organic-green'
    },
    {
      name: 'Last Hour',
      value: dashboardData?.overview?.lastHourOrders || 0,
      change: `₹${(dashboardData?.overview?.lastHourRevenue || 0).toFixed(2)}`,
      changeLabel: 'revenue',
      icon: ClockIcon,
      color: 'text-blue-400'
    }
  ]

  const orderStatusColors = {
    'pending': '#f59e0b',
    'confirmed': '#3b82f6',
    'preparing': '#8b5cf6',
    'ready': '#10b981',
    'served': '#059669',
    'cancelled': '#ef4444'
  }

  // Custom Chart Theme
  const chartTheme = {
    textColor: '#9ca3af',
    gridColor: 'rgba(0,0,0,0.1)',
    tooltipBg: '#0B0F14',
    tooltipBorder: 'rgba(0,0,0,0.1)'
  }

  const handleExportExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // 1. Overview Sheet
      const overviewData = stats.map(s => ({ Metric: s.name, Value: s.value, Growth: s.change }));
      const wsOverview = XLSX.utils.json_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(workbook, wsOverview, "Overview");

      // 2. Live Activity Sheet
      if (dashboardData?.liveActivity?.length > 0) {
        const activityData = dashboardData.liveActivity.map((a, i) => ({
          'No.': i + 1,
          'Order #': a.orderNumber,
          'Customer': a.customer?.name || 'Guest',
          'Total': `₹${a.total.toFixed(2)}`,
          'Status': a.status,
          'Type': a.orderType,
          'Date': new Date(a.createdAt).toLocaleString()
        }));
        const wsActivity = XLSX.utils.json_to_sheet(activityData);
        XLSX.utils.book_append_sheet(workbook, wsActivity, "Recent Orders");
      }

      // 3. Top Menu Sheet
      if (dashboardData?.topMenuItems?.length > 0) {
        const topMenuData = dashboardData.topMenuItems.map((m, i) => ({
          'No.': i + 1,
          'Name': m.name,
          'Category': m.category,
          'Price': `₹${m.price}`,
          'Rating': m.ratings?.average?.toFixed(1) || 0,
          'Sales Count': m.ratings?.count || 0
        }));
        const wsTopMenu = XLSX.utils.json_to_sheet(topMenuData);
        XLSX.utils.book_append_sheet(workbook, wsTopMenu, "Top Items");
      }

      XLSX.writeFile(workbook, `Dashboard_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Dashboard Excel report generated');
    } catch (error) {
      console.error('Excel export error:', error);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(180, 160, 100);
      doc.text("GARDEN GRAINS - DASHBOARD SUMMARY", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

      // Stats Table
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Business Overview", 14, 40);
      
      const statsRows = stats.map(s => [s.name, s.value, s.change]);
      autoTable(doc, {
        head: [['Metric', 'Value', 'Growth']],
        body: statsRows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [180, 160, 100] }
      });

      // Recent Orders Table
      if (dashboardData?.liveActivity?.length > 0) {
        doc.text("Recent Activity (Last 30m)", 14, doc.lastAutoTable.finalY + 15);
        const orderRows = dashboardData.liveActivity.map((a, i) => [
          i + 1,
          `#${a.orderNumber}`,
          a.customer?.name || 'Guest',
          `Rs.${a.total.toFixed(2)}`,
          a.status
        ]);
        autoTable(doc, {
          head: [['No.', 'Order #', 'Customer', 'Total', 'Status']],
          body: orderRows,
          startY: doc.lastAutoTable.finalY + 20,
          theme: 'striped'
        });
      }

      doc.save(`Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Dashboard PDF report generated');
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  return (
    <div className="min-h-screen relative pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up">
          <div>
            <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
              <span className="text-xl">📊</span>
              <span className="text-sm font-medium text-warm-gold uppercase tracking-wider">Admin Dashboard</span>
            </div>
            <h1 className="text-4xl font-bold text-dark-slate mb-2 font-heading">Dashboard</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                Live System
              </span>
              <span>Last updated: <span className="text-dark-slate">{lastUpdatedLabel}</span></span>
              <span className="font-mono text-warm-gold">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Export System */}
            <div className="flex bg-dark-slate/5 rounded-xl border border-dark-slate/10 p-1">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-3 py-2 text-[10px] font-black text-dark-slate hover:bg-dark-slate/10 rounded-lg transition-all"
                title="Export Dashboard as Excel"
              >
                <DocumentArrowDownIcon className="w-4 h-4 text-green-400" />
                <span>EXCEL</span>
              </button>
              <div className="w-px bg-dark-slate/10 my-1" />
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-3 py-2 text-[10px] font-black text-dark-slate hover:bg-dark-slate/10 rounded-lg transition-all"
                title="Export Dashboard as PDF"
              >
                <DocumentArrowDownIcon className="w-4 h-4 text-red-400" />
                <span>PDF</span>
              </button>
            </div>

            <button
              onClick={() => refetch()}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-dark-slate border border-dark-slate/10 hover:border-warm-gold/50 rounded-lg bg-dark-slate/5 hover:bg-dark-slate/10 transition-all shadow-lg shadow-black/20"
              disabled={isFetching}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isFetching ? 'animate-spin text-warm-gold' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Real-Time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {realTimeStats.map((stat, index) => (
            <div key={index} className="glass-panel p-6 rounded-2xl border border-dark-slate/10 relative overflow-hidden group">
               <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 transition-all duration-500 group-hover:opacity-30 ${index === 0 ? 'bg-organic-green' : 'bg-blue-500'}`}></div>
              <div className="flex items-center relative z-10">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-dark-slate/5 border border-dark-slate/10`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat.name}</p>
                  <p className="text-2xl font-bold text-dark-slate font-heading">{stat.value}</p>
                  <p className={`text-sm ${stat.color} font-bold flex items-center`}>
                    <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                    {stat.change} {stat.changeLabel}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Ops Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {liveMetrics.map((metric) => (
            <div key={metric.name} className={`glass-panel p-6 rounded-2xl flex items-center justify-between ${metric.color}`}>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{metric.name}</p>
                <p className="text-3xl font-black font-heading">{metric.value}</p>
              </div>
              {metric.icon && (
                <div className="flex-shrink-0 bg-dark-slate/10 p-2 rounded-lg backdrop-blur-sm">
                  <metric.icon className="h-6 w-6 opacity-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {stats.map((stat, index) => (
            <div key={index} className="glass-panel p-6 rounded-2xl border border-dark-slate/10 hover:border-warm-gold/30 transition-all duration-300 group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-pearl rounded-xl flex items-center justify-center shadow-lg border border-dark-slate/10 group-hover:border-warm-gold/30 transition-colors">
                    <stat.icon className="h-6 w-6 text-warm-gold" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.name}</p>
                  <p className="text-xl font-bold text-dark-slate font-heading mt-0.5">{stat.value}</p>
                  <p className={`text-xs font-bold mt-1 ${
                    stat.changeType === 'positive' ? 'text-organic-green' : 
                    stat.changeType === 'negative' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {stat.change} from last week
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {/* Revenue Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10">
            <div className="flex flex-col mb-6">
              <h3 className="text-lg font-bold text-dark-slate font-heading">Revenue Trend</h3>
              <p className="text-xs text-gray-400 mt-1">Daily gross revenue for the selected period</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData?.charts?.revenueByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
                  <XAxis 
                    dataKey="_id" 
                    stroke={chartTheme.textColor} 
                    tick={{fill: chartTheme.textColor, fontSize: 11}} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis stroke={chartTheme.textColor} tick={{fill: chartTheme.textColor, fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, borderRadius: '12px', color: '#fff' }}
                     itemStyle={{ color: '#D4AF37' }}
                     formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#D4AF37" 
                    strokeWidth={3}
                    dot={{ fill: '#D4AF37', r: 4, strokeWidth: 2, stroke: '#000' }}
                    activeDot={{ r: 6, fill: '#D4AF37', stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10">
            <div className="flex flex-col mb-6">
              <h3 className="text-lg font-bold text-dark-slate font-heading">Order Status Distribution</h3>
              <p className="text-xs text-gray-400 mt-1">Breakdown of orders by their current fulfillment state (Last 15 Days)</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData?.charts?.orderStatusDistribution || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                    label={({ _id, percent }) => `${_id?.charAt(0).toUpperCase() + _id?.slice(1)} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(dashboardData?.charts?.orderStatusDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={orderStatusColors[entry._id] || '#8884d8'} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', color: '#fff' }}
                     itemStyle={{ color: '#fff', textTransform: 'capitalize' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#9ca3af', textTransform: 'capitalize', fontSize: '12px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10 mb-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-dark-slate font-heading">Live Activity Feed</h3>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Real-time
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-dark-slate/5 px-2 py-1 rounded border border-dark-slate/5">
              Last 30m
            </span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
            {dashboardData?.liveActivity && dashboardData.liveActivity.length > 0 ? (
              dashboardData.liveActivity.map((activity, index) => (
                <div key={activity._id} className="flex items-center justify-between p-3 bg-dark-slate/5 rounded-xl border border-dark-slate/5 hover:bg-dark-slate/10 hover:border-dark-slate/10 transition-colors group">
                  <div className="flex items-center space-x-4 flex-1">
                    <span className="text-[10px] font-mono text-gray-600 group-hover:text-warm-gold">{index + 1}.</span>
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                        style={{ 
                          backgroundColor: orderStatusColors[activity.status] || '#6b7280',
                          boxShadow: `0 0 10px ${orderStatusColors[activity.status] || '#6b7280'}`
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-dark-slate">#{activity.orderNumber}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                            activity.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                            activity.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            activity.status === 'preparing' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            activity.status === 'ready' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}>
                            {activity.status}
                          </span>
                          <span className="text-xs text-gray-400 capitalize ml-auto md:ml-0 bg-black/20 px-1.5 py-0.5 rounded">{activity.orderType}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex justify-between md:justify-start md:gap-4">
                          <span>{activity.customer?.name || 'Guest'}</span>
                          <span className="text-warm-gold font-bold">₹{activity.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                   <div className="w-12 h-12 bg-dark-slate/5 rounded-full flex items-center justify-center mb-3">
                      <ClockIcon className="w-6 h-6 text-gray-600" />
                   </div>
                  <p>No recent activity</p>
                  <p className="text-xs mt-1 text-gray-600">New orders will appear here automatically</p>
                </div>
              )}
          </div>
        </div>

        {/* Top Menu Items & Recent Feedbacks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          {/* Top Menu Items */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10">
            <h3 className="text-lg font-bold text-dark-slate mb-6 font-heading">Top Menu Items</h3>
            <div className="space-y-4">
              {dashboardData?.topMenuItems && dashboardData.topMenuItems.length > 0 ? (
                dashboardData.topMenuItems.map((item, index) => (
                  <div key={item._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-slate/5 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-warm-gold/20 rounded-full flex items-center justify-center border border-warm-gold/30">
                        <span className="text-sm font-bold text-warm-gold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-bold text-dark-slate text-sm">{item.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{item.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-dark-slate text-sm">₹{item.price}</div>
                      <div className="text-xs text-gray-400 flex items-center justify-end">
                        <span className="text-yellow-500 mr-1">⭐</span> 
                        {item.ratings?.average?.toFixed(1) || 0} <span className="text-gray-600 ml-1">({item.ratings?.count || 0})</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No menu items data available</p>
              )}
            </div>
          </div>

          {/* Recent Feedbacks */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-dark-slate font-heading">Recent Customer Feedbacks</h3>
                <Link to="/admin/panel" className="text-xs text-warm-gold hover:underline">View All</Link>
             </div>
             <div className="space-y-4">
                {dashboardData?.recentFeedbacks && dashboardData.recentFeedbacks.length > 0 ? (
                   dashboardData.recentFeedbacks.map((feedback) => (
                      <div key={feedback._id} className="p-4 bg-dark-slate/5 rounded-xl border border-dark-slate/5 hover:border-warm-gold/20 transition-all group">
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                               <div className="w-6 h-6 rounded-full bg-warm-gold/20 flex items-center justify-center text-[10px] text-warm-gold font-bold">
                                  {feedback.user?.name?.charAt(0) || 'U'}
                               </div>
                               <span className="text-xs font-bold text-dark-slate">{feedback.user?.name || 'Anonymous'}</span>
                            </div>
                            <div className="flex">
                               {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`text-[10px] ${i < feedback.rating ? 'text-warm-gold' : 'text-gray-600'}`}>★</span>
                               ))}
                            </div>
                         </div>
                         <p className="text-xs text-gray-400 italic line-clamp-2">"{feedback.comment || 'No comment provided'}"</p>
                         <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-gray-600 font-mono">
                               {new Date(feedback.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] bg-dark-slate/10 px-2 py-0.5 rounded text-gray-400 capitalize">
                               {feedback.type}
                            </span>
                         </div>
                      </div>
                   ))
                ) : (
                   <div className="text-center py-12 text-gray-400">
                      <p>No feedbacks received yet</p>
                   </div>
                )}
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard
