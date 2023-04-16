import mongoose, { Schema, Types, model } from "mongoose";


const couponSchema = new Schema({
    name: { type: String, required: true, unique: true, lowercase: true },
    amount: { type: Number, required: true, default: 1 },
    image: { type: Object },
    usedBy: [{ type: Types.ObjectId, ref: 'User' }],
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    expire: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
})


const couponModel = mongoose.models.Coupon || model('Coupon', couponSchema)
export default couponModel