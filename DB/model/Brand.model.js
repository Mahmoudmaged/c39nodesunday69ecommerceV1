import mongoose, { Schema, Types, model } from "mongoose";


const brandSchema = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    image: { type: Object, required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
})

const brandModel = mongoose.models.Brand || model('Brand', brandSchema)
export default brandModel