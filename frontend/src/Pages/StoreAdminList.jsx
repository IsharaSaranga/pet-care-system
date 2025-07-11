import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShoppingBag, Search, Trash2, Plus, Package, AlertTriangle } from 'lucide-react';

const backendUrl = 'http://localhost:5000';
const currency = '$ ';

const StoreAdminList = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockInputs, setStockInputs] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching product list:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id, productName) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}"?`)) {
      return;
    }
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Remove product error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to remove product');
    }
  };

  const handleStockInput = (id, value) => {
    setStockInputs(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const increaseQuantity = async (id, currentQuantity) => {
    if (loading) return;
    const quantityToAdd = Number(stockInputs[id]) || 1;
    
    if (quantityToAdd <= 0) {
      toast.error('Please enter a positive number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/update-quantity`,
        { 
          id, 
          quantity: currentQuantity + quantityToAdd 
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        toast.success('Quantity increased successfully');
        setStockInputs(prev => ({ ...prev, [id]: '' })); // Clear input after success
        await fetchList();
      } else {
        toast.error(response.data.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error("Increase quantity error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to increase quantity');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from products
  const categories = ['All', ...new Set(list.map(product => product.category))];

  // Filter products by search term and category
  const filteredProducts = list.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group products by low stock status
  const lowStockProducts = filteredProducts.filter(product => product.quantity <= 5);
  const normalStockProducts = filteredProducts.filter(product => product.quantity > 5);

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 flex items-center">
          <ShoppingBag className="mr-3 text-gray-600" /> Product Management
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-64">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Low Stock Alert Section */}
        {lowStockProducts.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-red-700">Low Stock Products</h3>
            </div>
            <p className="text-red-600 mb-2 text-sm">
              The following products are running low on inventory (5 or fewer units remaining)
            </p>
          </div>
        )}

        {/* Product List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D08860]"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-3 px-4 text-left">Image</th>
                  <th className="py-3 px-4 text-left">Product</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Price</th>
                  <th className="py-3 px-4 text-left">Stock</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                  <th className="py-3 px-4 text-center">Add Stock</th>
                </tr>
              </thead>
              <tbody>
                {/* Low Stock Products First */}
                {lowStockProducts.map((product, index) => (
                  <tr 
                    key={`low-${product._id}`} 
                    className="border-b border-gray-200 hover:bg-red-50 bg-red-50/30"
                  >
                    <ProductRow 
                      product={product} 
                      stockInputs={stockInputs} 
                      handleStockInput={handleStockInput}
                      increaseQuantity={increaseQuantity}
                      removeProduct={removeProduct}
                      loading={loading}
                      isLowStock={true}
                    />
                  </tr>
                ))}
                
                {/* Normal Stock Products */}
                {normalStockProducts.map((product, index) => (
                  <tr 
                    key={`normal-${product._id}`} 
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <ProductRow 
                      product={product} 
                      stockInputs={stockInputs} 
                      handleStockInput={handleStockInput}
                      increaseQuantity={increaseQuantity}
                      removeProduct={removeProduct}
                      loading={loading}
                      isLowStock={false}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Product Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-xl font-bold text-gray-800">{list.length}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 flex items-center">
            <div className="rounded-full bg-red-100 p-3 mr-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-xl font-bold text-gray-800">{lowStockProducts.length}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <ShoppingBag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Stock</p>
              <p className="text-xl font-bold text-gray-800">{normalStockProducts.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extracted ProductRow component
const ProductRow = ({ 
  product, 
  stockInputs, 
  handleStockInput, 
  increaseQuantity, 
  removeProduct, 
  loading,
  isLowStock 
}) => {
  return (
    <>
      <td className="py-3 px-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {product.image && product.image[0] ? (
            <img 
              src={product.image[0]} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <Package className="text-gray-400" size={24} />
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <p className="font-medium text-gray-800">{product.name}</p>
        <p className="text-xs text-gray-500 mt-1">
          {product.sizes && product.sizes.length > 0 ? 
            `Sizes: ${product.sizes.join(', ')}` : 
            'No size variations'
          }
        </p>
      </td>
      <td className="py-3 px-4">
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
          {product.category}
        </span>
        <br />
        <span className="text-xs text-gray-500 mt-1">
          {product.subCategory}
        </span>
      </td>
      <td className="py-3 px-4 font-medium">
        {currency}{product.price}
      </td>
      <td className="py-3 px-4">
        <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
          {product.quantity}
        </span>
        {isLowStock && (
          <p className="text-xs text-red-500 mt-1">Low stock</p>
        )}
      </td>
      <td className="py-3 px-4 text-center">
        <button
          onClick={() => removeProduct(product._id, product.name)}
          className="inline-flex items-center justify-center p-2 rounded-full text-red-500 hover:bg-red-100 focus:outline-none transition-colors"
          title="Remove Product"
        >
          <Trash2 size={18} />
        </button>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-center gap-2">
          <input
            type="number"
            min="1"
            value={stockInputs[product._id] || ''}
            onChange={(e) => handleStockInput(product._id, e.target.value)}
            className="w-16 h-9 px-2 py-1 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
            placeholder="Qty"
          />
          <button
            onClick={() => increaseQuantity(product._id, product.quantity)}
            disabled={loading}
            className={`inline-flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
              loading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#D08860] hover:bg-[#80533b] text-white'
            }`}
            title="Add Stock"
          >
            <Plus size={16} className="mr-1" />
            Add
          </button>
        </div>
      </td>
    </>
  );
};

export default StoreAdminList;