//product model
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({ // Fixed typo: Scheema -> Schema
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    quantity: { type: Number, required: true, default: 0 },
    bestseller: { type: Boolean },
    date: { type: Number, required: true },
});

const productModel = mongoose.models.Product || mongoose.model("Product", productSchema); // Capitalized for convention

export default productModel;