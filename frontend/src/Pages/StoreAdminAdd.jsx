import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusCircle, Upload, Tag, Info, Package, Layers, Check, FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const backendUrl = 'http://localhost:5000';

const StoreAdminAdd = ({ token }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('Dog');
  const [subCategory, setSubCategory] = useState('Food');
  const [bestseller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], // Last month
    end: new Date().toISOString().split('T')[0] // Today
  });

  // Generate Sales Report as PDF
  const generateSalesReport = async () => {
    try {
      setGeneratingReport(true);
      toast.info("Generating sales report...");

      // Fetch orders data
      const response = await axios.get(`${backendUrl}/api/order/all`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch orders");
      }

      // Get orders and filter by date range if needed
      let allOrders = response.data.orders || [];
      
      // Filter by date range
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59); // Set to end of day
      
      const filteredOrders = allOrders.filter(order => {
        const orderDate = new Date(order.date || order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
      
      // Create PDF document
      const doc = new jsPDF();
      
      // Add title and date info
      doc.setFontSize(20);
      doc.setTextColor(128, 83, 59); // #80533b
      doc.text("Fluffy Care - Sales Report", 14, 20);
      
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(`Report Period: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`, 14, 30);
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 37);
      
      // Sales Summary Section
      doc.setFontSize(16);
      doc.setTextColor(208, 136, 96); // #D08860
      doc.text("Sales Summary", 14, 48);
      
      // Calculate summary data
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
      const totalOrders = filteredOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const statusCounts = filteredOrders.reduce((acc, order) => {
        const status = order.status || 'Pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      // Summary Table
      autoTable(doc, {
        startY: 52,
        head: [['Metric', 'Value']],
        body: [
          ['Total Revenue', `$ ${totalRevenue.toFixed(2)}`],
          ['Total Orders', totalOrders.toString()],
          ['Average Order Value', `$ ${averageOrderValue.toFixed(2)}`],
          ...Object.entries(statusCounts).map(([status, count]) => [`${status} Orders`, count.toString()])
        ],
        theme: 'striped',
        headStyles: { fillColor: [208, 136, 96], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });
      
      // Product Sales Analysis
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
      const productSalesList = Object.entries(productAnalysis)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue);
      
      // Products Table
      const productsStartY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(16);
      doc.setTextColor(208, 136, 96);
      doc.text("Top Selling Products", 14, productsStartY);
      
      autoTable(doc, {
        startY: productsStartY + 5,
        head: [['Product', 'Units Sold', 'Revenue']],
        body: productSalesList.slice(0, 10).map(product => [
          product.name,
          product.quantity.toString(),
          `$ ${product.revenue.toFixed(2)}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [208, 136, 96], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });
      
      // Recent Orders (last 10)
      const recentOrders = [...filteredOrders]
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
          new Date(order.date || order.createdAt).toLocaleDateString(),
          order.userId?.name || 'N/A',
          order.status || 'Pending',
          `$ ${order.totalPrice}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [208, 136, 96], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });
      
      // Save PDF
      doc.save(`Fluffy-Care-Sales-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Sales report generated successfully!");
    } catch (error) {
      console.error("Error generating sales report:", error);
      toast.error(error.message || "Failed to generate sales report");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleSizeToggle = (size) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name || !description || !price || !image1 || !quantity) {
      toast.error('Please fill in all required fields and upload at least one image');
      return;
    }

    const formData = new FormData();
    if (image1) formData.append('image1', image1);
    if (image2) formData.append('image2', image2);
    if (image3) formData.append('image3', image3);
    if (image4) formData.append('image4', image4);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('category', category);
    formData.append('subCategory', subCategory);
    formData.append('bestseller', bestseller.toString());
    formData.append('sizes', JSON.stringify(sizes));

    try {
      console.log("Adding product with token:", token);
      const response = await axios.post(`${backendUrl}/api/product/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("Add product response:", response.data);
      if (response.data.success) {
        toast.success('Product added successfully!');
        // Reset form
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);
        setName('');
        setDescription('');
        setPrice('');
        setQuantity('');
        setCategory('Dog');
        setSubCategory('Food');
        setBestSeller(false);
        setSizes([]);
      } else {
        toast.error(response.data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <PlusCircle className="mr-3 text-[#80533b]" size={28} />
          Add New Product
        </h2>
        
        {/* Sales Report Generator */}
        <div className="bg-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generateSalesReport}
              disabled={generatingReport}
              className={`w-full px-4 py-2 rounded-lg flex items-center justify-center transition-all ${
                generatingReport 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#80533b] to-[#D08860] text-white hover:shadow-md'
              }`}
            >
              {generatingReport ? (
                <>
                  <div className="mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Sales Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <form className="flex flex-col w-full items-start gap-6" onSubmit={handleSubmit}>
          <div className="w-full">
            <p className="mb-2 font-medium text-gray-700 flex items-center">
              <Upload className="mr-2 text-[#D08860]" size={18} />
              Product Images
              <span className="text-red-500 ml-1">*</span>
            </p>
            <div className="flex flex-wrap gap-4">
              <label htmlFor="image1" className="cursor-pointer">
                <div className="w-28 h-28 border-2 border-dashed border-[#D08860] rounded-lg flex items-center justify-center bg-[#D08860]/5 hover:bg-[#D08860]/10 transition-colors">
                  {image1 ? (
                    <img
                      className="w-full h-full object-cover rounded-lg"
                      src={URL.createObjectURL(image1)}
                      alt="Preview"
                    />
                  ) : (
                    <span className="text-[#D08860] font-bold text-xl">+</span>
                  )}
                </div>
                <p className="text-xs text-center mt-1 text-gray-500">Main Image*</p>
                <input
                  onChange={(e) => setImage1(e.target.files[0])}
                  type="file"
                  id="image1"
                  accept="image/*"
                  hidden
                  required
                />
              </label>
              <label htmlFor="image2" className="cursor-pointer">
                <div className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  {image2 ? (
                    <img
                      className="w-full h-full object-cover rounded-lg"
                      src={URL.createObjectURL(image2)}
                      alt="Preview"
                    />
                  ) : (
                    <span className="text-gray-400 font-bold text-xl">+</span>
                  )}
                </div>
                <p className="text-xs text-center mt-1 text-gray-500">Optional</p>
                <input
                  onChange={(e) => setImage2(e.target.files[0])}
                  type="file"
                  id="image2"
                  accept="image/*"
                  hidden
                />
              </label>
              <label htmlFor="image3" className="cursor-pointer">
                <div className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  {image3 ? (
                    <img
                      className="w-full h-full object-cover rounded-lg"
                      src={URL.createObjectURL(image3)}
                      alt="Preview"
                    />
                  ) : (
                    <span className="text-gray-400 font-bold text-xl">+</span>
                  )}
                </div>
                <p className="text-xs text-center mt-1 text-gray-500">Optional</p>
                <input
                  onChange={(e) => setImage3(e.target.files[0])}
                  type="file"
                  id="image3"
                  accept="image/*"
                  hidden
                />
              </label>
              <label htmlFor="image4" className="cursor-pointer">
                <div className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  {image4 ? (
                    <img
                      className="w-full h-full object-cover rounded-lg"
                      src={URL.createObjectURL(image4)}
                      alt="Preview"
                    />
                  ) : (
                    <span className="text-gray-400 font-bold text-xl">+</span>
                  )}
                </div>
                <p className="text-xs text-center mt-1 text-gray-500">Optional</p>
                <input
                  onChange={(e) => setImage4(e.target.files[0])}
                  type="file"
                  id="image4"
                  accept="image/*"
                  hidden
                />
              </label>
            </div>
          </div>

          <div className="w-full">
            <p className="mb-2 font-medium text-gray-700 flex items-center">
              <Tag className="mr-2 text-[#D08860]" size={18} />
              Product Name
              <span className="text-red-500 ml-1">*</span>
            </p>
            <input
              className="w-full max-w-[600px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent outline-none transition-all"
              type="text"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="w-full">
            <p className="mb-2 font-medium text-gray-700 flex items-center">
              <Info className="mr-2 text-[#D08860]" size={18} />
              Product Description
              <span className="text-red-500 ml-1">*</span>
            </p>
            <textarea
              className="w-full max-w-[600px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent outline-none transition-all min-h-[120px]"
              placeholder="Describe your product here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="mb-2 font-medium text-gray-700 flex items-center">
                <Package className="mr-2 text-[#D08860]" size={18} />
                Category & Subcategory
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent outline-none transition-all"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent outline-none transition-all"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                  >
                    <option value="Food">Food</option>
                    <option value="Vitamin">Vitamin</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Other">Other Accessories</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 font-medium text-gray-700 flex items-center">
                <Tag className="mr-2 text-[#D08860]" size={18} />
                Price & Quantity
                <span className="text-red-500 ml-1">*</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">$</span>
                    <input
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent outline-none transition-all"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent outline-none transition-all"
                    type="number"
                    placeholder="Quantity"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 font-medium text-gray-700 flex items-center">
              <Layers className="mr-2 text-[#D08860]" size={18} />
              Product Sizes (Optional)
            </p>
            <div className="flex flex-wrap gap-3">
              {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                <div 
                  key={size} 
                  onClick={() => handleSizeToggle(size)}
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-all
                    ${sizes.includes(size) 
                      ? 'bg-gradient-to-r from-[#80533b] to-[#D08860] text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center mt-2">
            <div 
              onClick={() => setBestSeller(!bestseller)}
              className={`
                w-6 h-6 mr-3 rounded flex items-center justify-center cursor-pointer
                ${bestseller 
                  ? 'bg-gradient-to-r from-[#80533b] to-[#D08860] text-white' 
                  : 'border-2 border-gray-300'}
              `}
            >
              {bestseller && <Check size={16} />}
            </div>
            <label 
              htmlFor="bestseller" 
              className="cursor-pointer text-gray-700"
              onClick={() => setBestSeller(!bestseller)}
            >
              Mark as Bestseller
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 bg-gradient-to-r from-[#80533b] to-[#D08860] text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all font-semibold"
          >
            <PlusCircle className="inline mr-2" size={18} />
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default StoreAdminAdd;