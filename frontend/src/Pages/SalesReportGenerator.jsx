import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FileText, 
  Download, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  PackageCheck,
  Tag,
  BarChart4,
  Users,
  Clock
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const backendUrl = 'http://localhost:5000';
const currency = '$ ';

const SalesReportGenerator = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], // Last month
    end: new Date().toISOString().split('T')[0] // Today
  });
  const [reportPeriod, setReportPeriod] = useState('custom'); // 'today', 'week', 'month', 'year', 'custom'
  
  // Summary statistics
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    statusBreakdown: {},
    dailySales: [],
  });

  // Fetch data on component mount
  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setError('No authentication token found');
      setLoading(false);
    }
  }, [token]);

  // Update date range when report period changes
  useEffect(() => {
    const now = new Date();
    let startDate = new Date();
    
    switch (reportPeriod) {
      case 'today':
        startDate = new Date();
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        // Don't update the date range for custom selection
        return;
      default:
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
    }
    
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    });
  }, [reportPeriod]);

  // Calculate statistics when orders or date range changes
  useEffect(() => {
    calculateStats();
  }, [orders, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders
      const ordersResponse = await axios.get(`${backendUrl}/api/order/all`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!ordersResponse.data.success) {
        throw new Error(ordersResponse.data.message || "Failed to fetch orders");
      }

      setOrders(ordersResponse.data.orders || []);

      // Fetch products
      const productsResponse = await axios.get(`${backendUrl}/api/product/list`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!productsResponse.data.success) {
        throw new Error(productsResponse.data.message || "Failed to fetch products");
      }

      setProducts(productsResponse.data.products || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    try {
      // Filter orders by date range
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59); // Set to end of day
      
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.date || order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
      
      // Calculate total revenue and order count
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
      const totalOrders = filteredOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Status breakdown
      const statusBreakdown = filteredOrders.reduce((acc, order) => {
        const status = order.status || 'Pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      // Product sales analysis
      const productAnalysis = filteredOrders.flatMap(order => 
        order.products.map(product => ({
          name: product.name,
          quantity: product.quantity,
          revenue: product.price * product.quantity
        }))
      ).reduce((acc, item) => {
        if (!acc[item.name]) {
          acc[item.name] = { quantity: 0, revenue: 0 };
        }
        acc[item.name].quantity += item.quantity;
        acc[item.name].revenue += item.revenue;
        return acc;
      }, {});
      
      // Convert to array and sort by revenue (descending)
      const topProducts = Object.entries(productAnalysis)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      // Daily sales for chart
      const salesByDay = filteredOrders.reduce((acc, order) => {
        const date = new Date(order.date || order.createdAt);
        const dateString = date.toISOString().split('T')[0];
        
        if (!acc[dateString]) {
          acc[dateString] = { revenue: 0, orders: 0 };
        }
        
        acc[dateString].revenue += Number(order.totalPrice || 0);
        acc[dateString].orders += 1;
        
        return acc;
      }, {});
      
      // Convert to array and sort by date
      const dailySales = Object.entries(salesByDay)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setStats({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topProducts,
        statusBreakdown,
        dailySales,
      });
      
    } catch (error) {
      console.error('Error calculating stats:', error);
      toast.error('Error processing sales data');
    }
  };

  const formatCurrency = (value) => {
    return `${currency}${Number(value).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const generatePDF = async () => {
    try {
      setReportLoading(true);
      toast.info("Generating sales report PDF...");
      
      // Create PDF document
      const doc = new jsPDF();
      
      // Add title and date info
      doc.setFontSize(20);
      doc.setTextColor(128, 83, 59); // #80533b
      doc.text("Fluffy Care - Sales Report", 14, 20);
      
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(`Report Period: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`, 14, 30);
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 37);
      
      // Sales Summary Section
      doc.setFontSize(16);
      doc.setTextColor(208, 136, 96); // #D08860
      doc.text("Sales Summary", 14, 48);
      
      // Summary Table
      autoTable(doc, {
        startY: 52,
        head: [['Metric', 'Value']],
        body: [
          ['Total Revenue', formatCurrency(stats.totalRevenue)],
          ['Total Orders', stats.totalOrders.toString()],
          ['Average Order Value', formatCurrency(stats.averageOrderValue)],
          ...Object.entries(stats.statusBreakdown).map(([status, count]) => [`${status} Orders`, count.toString()])
        ],
        theme: 'striped',
        headStyles: { fillColor: [208, 136, 96], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });
      
      // Top Products Table
      const productsStartY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(16);
      doc.setTextColor(208, 136, 96);
      doc.text("Top Selling Products", 14, productsStartY);
      
      autoTable(doc, {
        startY: productsStartY + 5,
        head: [['Product', 'Units Sold', 'Revenue']],
        body: stats.topProducts.map(product => [
          product.name,
          product.quantity.toString(),
          formatCurrency(product.revenue)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [208, 136, 96], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });
      
      // Filter orders by date range for report
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      
      const reportOrders = orders.filter(order => {
        const orderDate = new Date(order.date || order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
      
      // Recent Orders (last 10)
      const recentOrders = [...reportOrders]
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        .slice(0, 10);
      
      const ordersStartY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(16);
      doc.setTextColor(208, 136, 96);
      doc.text("Recent Orders", 14, ordersStartY);
      
      autoTable(doc, {
        startY: ordersStartY + 5,
        head: [['Order ID', 'Date', 'Customer', 'Status', 'Total']],
        body: recentOrders.map(order => [
          order._id.slice(-6),
          formatDate(order.date || order.createdAt),
          order.userId?.name || 'N/A',
          order.status || 'Pending',
          formatCurrency(order.totalPrice)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [208, 136, 96], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });
      
      // Daily Sales Data (if enough data points)
      if (stats.dailySales.length > 1) {
        const dailyStartY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(16);
        doc.setTextColor(208, 136, 96);
        doc.text("Daily Sales Breakdown", 14, dailyStartY);
        
        autoTable(doc, {
          startY: dailyStartY + 5,
          head: [['Date', 'Revenue', 'Orders']],
          body: stats.dailySales.map(day => [
            formatDate(day.date),
            formatCurrency(day.revenue),
            day.orders.toString()
          ]),
          theme: 'striped',
          headStyles: { fillColor: [208, 136, 96], textColor: [255, 255, 255] },
          styles: { fontSize: 10 }
        });
      }
      
      // Save PDF
      doc.save(`Fluffy-Care-Sales-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Sales report PDF generated successfully!");
    } catch (error) {
      console.error("Error generating sales report PDF:", error);
      toast.error(error.message || "Failed to generate sales report PDF");
    } finally {
      setReportLoading(false);
    }
  };

  // Reload the data
  const handleRefresh = () => {
    fetchData();
    toast.info("Refreshing data...");
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D08860]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
          <div className="text-center text-red-500 mb-4">
            <p className="text-lg font-medium">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="mx-auto block bg-gradient-to-r from-[#80533b] to-[#D08860] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <FileText className="mr-3 text-[#D08860]" size={32} />
            Sales Report
          </h2>
          
          <button
            onClick={handleRefresh}
            className="bg-white text-[#D08860] px-4 py-2 rounded-lg border border-[#D08860] hover:bg-[#D08860]/5 transition flex items-center"
          >
            <Clock className="w-4 h-4 mr-2" /> Refresh Data
          </button>
        </div>

        {/* Report Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Generate Report</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Period</label>
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last 12 Months</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {reportPeriod === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
                  />
                </div>
              </>
            )}
            
            <div className="col-span-1 md:col-span-1 flex items-end">
              <button
                onClick={generatePDF}
                disabled={reportLoading}
                className={`w-full px-4 py-2 rounded-lg flex items-center justify-center transition-all ${
                  reportLoading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-[#80533b] to-[#D08860] text-white hover:shadow-md'
                }`}
              >
                {reportLoading ? (
                  <>
                    <div className="mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
            <div className="rounded-full bg-[#D08860]/20 p-3 mr-4">
              <DollarSign className="h-6 w-6 text-[#D08860]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <BarChart4 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Order</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.averageOrderValue)}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Unique Customers</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Set(orders.filter(order => order.userId?._id).map(order => order.userId._id)).size}
              </p>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <PackageCheck className="mr-2 text-[#D08860]" size={20} />
              Order Status
            </h3>
            
            <div className="space-y-4">
              {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} mr-3`}></div>
                    <span className="text-gray-700">{status}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-900 font-medium">{count}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      ({((count / stats.totalOrders) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Tag className="mr-2 text-[#D08860]" size={20} />
              Top Products
            </h3>
            
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#D08860]/10 flex items-center justify-center text-xs font-bold text-[#D08860] mr-3">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 truncate max-w-[180px]">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 font-medium">{formatCurrency(product.revenue)}</div>
                    <div className="text-gray-500 text-sm">{product.quantity} units</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ShoppingBag className="mr-2 text-[#D08860]" size={20} />
            Recent Orders
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-3 px-4 text-left">Order ID</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter(order => {
                    const orderDate = new Date(order.date || order.createdAt);
                    const startDate = new Date(dateRange.start);
                    const endDate = new Date(dateRange.end);
                    endDate.setHours(23, 59, 59);
                    return orderDate >= startDate && orderDate <= endDate;
                  })
                  .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
                  .slice(0, 10)
                  .map(order => (
                    <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">#{order._id.slice(-6)}</td>
                      <td className="py-3 px-4">{formatDate(order.date || order.createdAt)}</td>
                      <td className="py-3 px-4">{order.userId?.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || 'Pending')}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{formatCurrency(order.totalPrice)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get status colors
const getStatusColor = (status) => {
  switch(status) {
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'Payment Confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'Processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'Shipped':
      return 'bg-purple-100 text-purple-800';
    case 'Out for Delivery':
      return 'bg-indigo-100 text-indigo-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-[#D08860]/10 text-[#D08860]';
  }
};

export default SalesReportGenerator; 