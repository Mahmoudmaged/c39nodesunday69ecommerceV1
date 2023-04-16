import mongoose, { Schema, Types, model } from "mongoose";


const cartSchema = new Schema({
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            productId: { type: Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, default: 1 }

        }
    ],
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
})

const cartModel = mongoose.models.Cart || model('Cart', cartSchema)
export default cartModel