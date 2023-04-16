import mongoose, { Schema, Types, model } from "mongoose";


const orderSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    address: String,
    phone: [String],
    products: [
        {
            productId: { type: Types.ObjectId, ref: 'Product', required: true },
            name: { type: String, required: true },
            quantity: { type: Number, default: 1 },
            unitPrice: { type: Number, default: 1 },
            finalPrice: { type: Number, default: 1 },
        }
    ],
    couponId: { type: Types.ObjectId, ref: 'Coupon' },
    note: String,
    reason: String,
    finalPrice: { type: Number, default: 1 },

    status: {
        type: String,
        default: "placed",
        enum: ['waitPayment', 'placed', 'rejected', 'onWay', 'delivered' , 'canceled']
    },
    paymentType: {
        type: String,
        default: "cash",
        enum: ['cash', 'card']
    },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
})

const orderModel = mongoose.models.Order || model('Order', orderSchema)
export default orderModel