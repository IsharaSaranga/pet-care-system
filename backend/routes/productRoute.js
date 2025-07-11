import express from 'express'
import {listProducts, addProduct, removeProduct, singleProduct, updateProductQuantity} from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import auth from '../middleware/auth.js';

const productRouter = express.Router()

// Configure multer for multiple file uploads
const uploadFields = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]);

productRouter.post('/add', auth, uploadFields, addProduct);
productRouter.post('/remove', auth, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts);
productRouter.post('/update-quantity', auth, updateProductQuantity);

export default productRouter

