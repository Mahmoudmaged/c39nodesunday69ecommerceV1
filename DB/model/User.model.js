import { Schema, Types, model } from "mongoose";


const userSchema = new Schema({

    firstName: String,
    lastName: String,
    userName: {
        type: String,
        required: [true, 'userName is required'],
        min: [2, 'minimum length 2 char'],
        max: [20, 'max length 2 char'],
        lowercase: true

    },
    email: {
        type: String,
        unique: [true, 'email must be unique value'],
        required: [true, 'userName is required'],
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'password is required'],
    },
    phone: {
        type: String,
    },
    address: String,
    status: {
        type: String,
        default: 'offline',
        enum: ['offline', 'online', 'blocked']
    },
    image: Object,
    DOB: String,
    role: {
        type: String,
        default: 'User',
        enum: ['User', 'Admin']
    },

    confirmEmail: {
        type: Boolean,
        default: false,
    },
    forgetCode: {
        type: Number,
        default: null
    },
    changePasswordTime: Date,
    wishlist: [{ type: Types.ObjectId, ref: 'Product' }]


}, {
    timestamps: true
})


const userModel = model('User', userSchema)
export default userModel