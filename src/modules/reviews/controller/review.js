import orderModel from "../../../../DB/model/Order.model.js";
import reviewModel from "../../../../DB/model/Review.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";

export const createReview = asyncHandler(async (req, res, next) => {
    const { productId } = req.params
    const { rating, comment } = req.body
    const order = await orderModel.findOne({
        userId: req.user._id,
        status: 'delivered',
        "products.productId": productId
    })
    if (!order) {
        return next(new Error(`Cannot review product before receive it`, { cause: 400 }))
    }

    if (await reviewModel.findOne({ productId, orderId: order._id, createdBy: req.user._id })) {
        return next(new Error(`Already reviewed  by you`, { cause: 400 }))
    }
    await reviewModel.create({ createdBy: req.user._id, productId, orderId: order._id, rating, comment })
    return res.status(201).json({ message: "Done" })
})


export const updateReview = asyncHandler(async (req, res, next) => {
    const { productId, reviewId } = req.params
    if (!await reviewModel.findOneAndUpdate({ _id: reviewId, productId, createdBy: req.user._id }, req.body)) {
        return next(new Error(`In-valid review Id`, { cause: 400 }))
    }
    return res.status(200).json({ message: "Done" })
})