import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Package, 
  Search, 
  ShoppingBag, 
  Clock, 
  TruckIcon, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Filter,
  Calendar,
  DollarSign,
  User,
  ChevronDown
} from 'lucide-react';

const backendUrl = 'http://localhost:5000';
const currency = '$ ';

const StoreAdminOrders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/order/all`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Sort orders by date (newest first)
        const sortedOrders = response.data.orders.sort((a, b) => {
          return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
        });
        
        setOrders(sortedOrders);
        
        // Extract unique categories from products
        const uniqueCategories = [...new Set(sortedOrders.flatMap(order => 
          order.products.map(product => product.name)
        ))];
        setCategories(['all', ...uniqueCategories]);
        setError(null);
      } else {
        setError(response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setStatusUpdateLoading(true);
      const response = await axios.put(
        `${backendUrl}/api/order/status/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Order status updated successfully');
        fetchOrders(); // Refresh orders after update
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setError('No authentication token found');
      setLoading(false);
    }
  }, [token]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getOrderDateForFiltering = (dateString) => {
    return new Date(dateString);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Payment Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Out for Delivery':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-[#D08860]/10 text-[#D08860] border-[#D08860]/20';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Delivered':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'Payment Confirmed':
        return <ShoppingBag className="w-4 h-4" />;
      case 'Processing':
        return <RefreshCw className="w-4 h-4" />;
      case 'Shipped':
        return <TruckIcon className="w-4 h-4" />;
      case 'Out for Delivery':
        return <TruckIcon className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Filter orders based on category, search query, and date
  const filteredOrders = orders
    .filter(order => {
      // Category filter
      if (selectedCategory !== 'all') {
        return order.products.some(product => product.name === selectedCategory);
      }
      return true;
    })
    .filter(order => {
      // Search query filter
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      
      // Search by order ID
      if (order._id.toLowerCase().includes(query)) return true;
      
      // Search by customer name or email
      if (order.userId?.name?.toLowerCase().includes(query) || 
          order.userId?.email?.toLowerCase().includes(query)) return true;
      
      // Search by product names
      if (order.products.some(product => 
        product.name.toLowerCase().includes(query))) return true;
      
      return false;
    })
    .filter(order => {
      // Date filter
      if (dateFilter === 'all') return true;
      
      const orderDate = getOrderDateForFiltering(order.date || order.createdAt);
      const now = new Date();
      
      if (dateFilter === 'today') {
        return orderDate.toDateString() === now.toDateString();
      }
      
      if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return orderDate >= weekAgo;
      }
      
      if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return orderDate >= monthAgo;
      }
      
      return true;
    });

  const toggleOrderExpansion = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  // Calculate order stats
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0).toFixed(2);
  const pendingOrders = orders.filter(order => order.status === 'Pending' || order.status === 'Processing').length;
  const shippedOrders = orders.filter(order => order.status === 'Shipped' || order.status === 'Out for Delivery').length;
  const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#D08860] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <p className="text-red-500 text-lg text-center mb-6">{error}</p>
          <button 
            onClick={fetchOrders}
            className="w-full px-4 py-2 bg-gradient-to-r from-[#80533b] to-[#D08860] text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 flex items-center">
          <Package className="mr-3 text-[#D08860]" /> Order Management
        </h2>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-white text-[#D08860] rounded-lg border border-[#D08860] hover:bg-[#D08860]/5 transition flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </button>
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
          <div className="rounded-full bg-[#D08860]/20 p-3 mr-4">
            <DollarSign className="h-6 w-6 text-[#D08860]" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800">{currency}{totalRevenue}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-800">{pendingOrders}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Delivered</p>
            <p className="text-2xl font-bold text-gray-800">{deliveredOrders}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders by ID, customer, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Filter className="w-4 h-4 mr-1 text-[#D08860]" /> Filter by Product:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Products' : category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-[#D08860]" /> Filter by Date:
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No orders match your search criteria</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setDateFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Order ID</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Customer</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Items</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Amount</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr 
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${expandedOrder === order._id ? 'bg-gray-50' : ''}`}
                      onClick={() => toggleOrderExpansion(order._id)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedOrder === order._id ? 'rotate-180' : ''}`} />
                          <span className="font-medium text-gray-800">#{order._id.slice(-6)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#D08860]/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-[#D08860]" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{order.userId?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-600">{order.userId?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="max-w-xs">
                          {order.products && order.products.slice(0, 2).map((product, index) => (
                            <div key={index} className="flex items-center mb-1 gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-[#D08860]"></span>
                              <span className="text-gray-800">{product.name}</span>
                              <span className="text-sm text-gray-600 ml-auto">
                                {product.quantity} x {currency}{product.price}
                              </span>
                            </div>
                          ))}
                          {order.products && order.products.length > 2 && (
                            <div className="text-sm text-[#D08860]">+ {order.products.length - 2} more items</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-800">{currency}{order.totalPrice}</span>
                      </td>
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <select
                            value={order.status || 'Pending'}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            disabled={statusUpdateLoading}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(order.status)} focus:outline-none focus:ring-2 focus:ring-[#D08860] appearance-none bg-white pl-8 pr-10 ${statusUpdateLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ backgroundPosition: 'left 0.5rem center, right 0.5rem center' }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Payment Confirmed">Payment Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <div className="absolute pointer-events-none" style={{ marginTop: '-28px', marginLeft: '8px' }}>
                            {getStatusIcon(order.status || 'Pending')}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600">{formatDate(order.date || order.createdAt)}</span>
                      </td>
                    </tr>
                    
                    {/* Expanded Order Details */}
                    {expandedOrder === order._id && (
                      <tr>
                        <td colSpan="6" className="py-4 px-4 bg-gray-50 border-b border-gray-200">
                          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                  <User className="w-5 h-5 mr-2 text-[#D08860]" /> Customer Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="font-medium">Name:</span> {order.userId?.name || 'N/A'}</p>
                                  <p><span className="font-medium">Email:</span> {order.userId?.email || 'N/A'}</p>
                                  <p><span className="font-medium">Phone:</span> {order.userId?.phone || 'N/A'}</p>
                                  <p><span className="font-medium">Address:</span> {order.shippingAddress || 'N/A'}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                  <Package className="w-5 h-5 mr-2 text-[#D08860]" /> Order Summary
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="font-medium">Order Date:</span> {formatDate(order.date || order.createdAt)}</p>
                                  <p><span className="font-medium">Status:</span> <span className={`px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>{order.status || 'Pending'}</span></p>
                                  <p><span className="font-medium">Payment Method:</span> {order.paymentMethod || 'N/A'}</p>
                                  <p><span className="font-medium">Total Amount:</span> <span className="font-bold">{currency}{order.totalPrice}</span></p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-6">
                              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <ShoppingBag className="w-5 h-5 mr-2 text-[#D08860]" /> Order Items
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full">
                                  <thead>
                                    <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      <th className="py-2 px-3 rounded-tl-lg">Product</th>
                                      <th className="py-2 px-3">Quantity</th>
                                      <th className="py-2 px-3">Unit Price</th>
                                      <th className="py-2 px-3 rounded-tr-lg">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.products && order.products.map((product, index) => (
                                      <tr key={index} className="border-b border-gray-200">
                                        <td className="py-3 px-3">{product.name}</td>
                                        <td className="py-3 px-3">{product.quantity}</td>
                                        <td className="py-3 px-3">{currency}{product.price}</td>
                                        <td className="py-3 px-3 font-medium">{currency}{(product.quantity * product.price).toFixed(2)}</td>
                                      </tr>
                                    ))}
                                    <tr className="bg-gray-50">
                                      <td colSpan="3" className="py-3 px-3 text-right font-medium">Total:</td>
                                      <td className="py-3 px-3 font-bold">{currency}{order.totalPrice}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Showing results count */}
        {filteredOrders.length > 0 && (
          <div className="mt-4 text-right text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreAdminOrders;