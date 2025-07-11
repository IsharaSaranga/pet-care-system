//product controller
import Product from '../models/productModel.js';
import cloudinary from '../config/cloudinary.js';

// Function to add a product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestseller, quantity } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !subCategory || !sizes || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields. Please provide all required information.' 
      });
    }

    // Validate price is a positive number
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price must be a positive number' 
      });
    }

    // Validate quantity is a non-negative number
    const quantityNum = Number(quantity);
    if (isNaN(quantityNum) || quantityNum < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quantity must be a non-negative number' 
      });
    }

    // Debug: Log received body and files
    console.log('Received body:', req.body);
    console.log('Received files:', req.files);

    // Check if multer rejected files
    if (req.fileValidationError) {
      console.error('Multer validation error:', req.fileValidationError);
      return res.status(400).json({ 
        success: false, 
        message: `File validation error: ${req.fileValidationError.message}` 
      });
    }

    // Validate files
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files were uploaded' 
      });
    }

    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

    if (images.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one image is required' 
      });
    }

    // Upload images to Cloudinary
    let imagesUrl = [];
    try {
      // Log Cloudinary configuration (without sensitive data)
      console.log('Cloudinary config:', {
        cloud_name: cloudinary.config().cloud_name,
        api_key: cloudinary.config().api_key ? '***' : 'missing',
        api_secret: cloudinary.config().api_secret ? '***' : 'missing'
      });

      imagesUrl = await Promise.all(
        images.map(async (item, index) => {
          try {
            // Log file details
            console.log(`File ${index + 1} details:`, {
              mimetype: item.mimetype,
              size: item.size,
              originalname: item.originalname
            });

            // Convert buffer to base64 for Cloudinary upload
            const base64Image = `data:${item.mimetype};base64,${item.buffer.toString('base64')}`;
            const result = await cloudinary.uploader.upload(base64Image, {
              resource_type: 'image',
              folder: 'products',
              use_filename: true,
              unique_filename: true
            });
            console.log(`Cloudinary upload result for image ${index + 1}:`, result);
            return result.secure_url;
          } catch (uploadError) {
            console.error(`Cloudinary upload error for image ${index + 1}:`, {
              message: uploadError.message,
              error: uploadError.error,
              http_code: uploadError.http_code,
              name: uploadError.name,
              stack: uploadError.stack
            });
            throw new Error(`Failed to upload image ${index + 1}: ${uploadError.message}`);
          }
        })
      );
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({ 
        success: false, 
        message: `Failed to upload images to Cloudinary: ${uploadError.message}` 
      });
    }

    // Parse sizes array
    let parsedSizes;
    try {
      parsedSizes = JSON.parse(sizes);
      if (!Array.isArray(parsedSizes)) {
        throw new Error('Sizes must be an array');
      }
    } catch (parseError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid sizes format. Must be a valid JSON array' 
      });
    }

    const productData = {
      name,
      description,
      category,
      price: priceNum,
      subCategory,
      bestseller: bestseller === 'true',
      sizes: parsedSizes,
      quantity: quantityNum,
      image: imagesUrl,
      date: Date.now(),
    };

    console.log('Adding product:', productData);

    const product = new Product(productData);
    await product.save();

    return res.json({ 
      success: true, 
      message: 'Product Added Successfully',
      product 
    });
  } catch (error) {
    console.error('Add product error:', error.message, error.stack);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: `Validation error: ${error.message}` 
      });
    }

    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: 'A product with this name already exists' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while adding the product' 
    });
  }
};

// Function to list all products
const listProducts = async (req, res) => {
  try {
    // Add index hint and limit to improve query performance
    const products = await Product.find({})
      .lean()
      .hint({ _id: 1 }) // Use _id index
      .limit(100) // Limit results to prevent overwhelming response
      .exec();

    if (!products || products.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No products found' 
      });
    }

    return res.json({ 
      success: true, 
      products,
      count: products.length 
    });
  } catch (error) {
    console.error('List products error:', error.message, error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongooseError') {
      return res.status(503).json({ 
        success: false, 
        message: 'Database service temporarily unavailable. Please try again later.' 
      });
    }

    if (error.name === 'MongoError') {
      if (error.code === 11000) {
        return res.status(409).json({ 
          success: false, 
          message: 'Duplicate entry found' 
        });
      }
      return res.status(503).json({ 
        success: false, 
        message: 'Database error occurred' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching products' 
    });
  }
};

// Function to remove a product
const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid Product ID format' });
    }

    console.log('Attempting to remove product with ID:', id);
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    console.log('Product removed successfully:', product.name);
    return res.json({ success: true, message: 'Product Removed' });
  } catch (error) {
    console.error('Remove product error:', error.message, error.stack);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid Product ID' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Function to get single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, product });
  } catch (error) {
    console.error('Single product error:', error.message, error.stack);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Function to update product quantity
const updateProductQuantity = async (req, res) => {
    try {
        const { id, quantity } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        if (quantity === undefined || isNaN(quantity) || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Convert quantity to number and update
        const newQuantity = Number(quantity);
        product.quantity = newQuantity;
        await product.save();

        return res.json({
            success: true,
            message: 'Quantity updated successfully',
            product
        });
    } catch (error) {
        console.error('Update quantity error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating quantity: ' + error.message
        });
    }
};

export { listProducts, addProduct, removeProduct, singleProduct, updateProductQuantity };