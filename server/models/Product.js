import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: String, //if it is not specific required is true, it will be false
    price: Number,
    description: String,
    category: String,
    rating: Number,
    supply: Number
}, {timestamps: true}
)

const ProductModel = mongoose.model("Product", ProductSchema)  //mongo create table products that correspond with it

export default ProductModel