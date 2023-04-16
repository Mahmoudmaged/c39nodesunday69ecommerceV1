import mongoose, { Schema, Types, model } from "mongoose";


const categorySchema = new Schema({
    name: {
        type: String, 
        required: true, 
        lowercase: true,
        unique: true
    },
    slug: { type: String, required: true },
    image: { type: Object, required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
})

categorySchema.virtual('subcategory', {
    ref: 'Subcategory',
    localField: "_id",
    foreignField: "categoryId"
})
const categoryModel = mongoose.models.Category || model('Category', categorySchema)
export default categoryModel