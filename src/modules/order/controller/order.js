import productModel from "../../../../DB/model/Product.model.js";
import couponModel from "../../../../DB/model/Coupon.model.js";
import orderModel from '../../../../DB/model/Order.model.js'
import cartModel from '../../../../DB/model/Cart.model.js'
import { asyncHandler } from "../../../utils/errorHandling.js";
import { clearAllCartItems, deleteSelectedItems } from "../../cart/controller/cart.js";
import { createInvoice } from "../../../utils/pdf.js";
import sendEmail from "../../../utils/email.js";

export const createOrder = asyncHandler(async (req, res, next) => {
    const { address, phone, couponName, note, paymentType } = req.body


    if (couponName) {
        const coupon = await couponModel.findOne({
            name: couponName.toLowerCase(),
            usedBy: { $nin: req.user._id },
            isDeleted: false
        })
        if (!coupon || (Date.now() > (coupon?.expire?.getTime()))) {
            return next(new Error("In-valid or expire coupon", { cause: 400 }))
        }
        req.body.coupon = coupon
    }

    if (!req.body.products) {
        console.log("hhh");
        const cart = await cartModel.findOne({ createdBy: req.user._id })
        if (!cart?.products.length) {
            return next(new Error("Empty cart", { cause: 400 }))
        }
        console.log(cart.products);
        req.body.products = cart.products
        req.body.isCart = true
    }

    let sumTotal = 0;
    let finalProductList = []
    let productIds = []

    for (let product of req.body.products) {
        const checkedProduct = await productModel.findOne({
            _id: product.productId,
            stock: { $gte: product.quantity },
            isDeleted: false
        })
        if (!checkedProduct) {
            return next(new Error(`Fail to this product name:${checkedProduct.name}`, { cause: 400 }))
        }
        productIds.push(product.productId)
        if (req.body.isCart) {
            product = product.toObject() // convert BSON to regular  js object  
        }
        product.name = checkedProduct.name
        product.unitPrice = checkedProduct.finalPrice;
        product.finalPrice = product.unitPrice * product.quantity
        finalProductList.push(product)

        sumTotal += product.finalPrice
    }

    const order = await orderModel.create({
        userId: req.user._id,
        products: finalProductList,
        address,
        phone,
        note,
        couponId: req.body.coupon?._id,
        finalPrice: Number.parseFloat(sumTotal - (sumTotal * ((req.body.coupon?.amount || 0) / 100))).toFixed(2),
        paymentType,
        status: paymentType ? 'waitPayment' : 'placed'
    })
    if (!order) {
        return next(new Error("Fail to place your order"))
    }

    for (const product of req.body.products) {
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: -parseInt(product.quantity) } })
    }

    if (couponName) {
        await couponModel.updateOne({ _id: req.body.coupon._id }, { $addToSet: { usedBy: req.user._id } })
    }
    if (!req.body.products) {
        await clearAllCartItems(productIds, req.user._id)
    } else {
        await deleteSelectedItems(productIds, req.user._id)

    }

    const invoice = {
        shipping: {
            name: req.user.userName,
            address: order.address,
            city: "Cairo",
            state: "Cairo",
            country: "Egypt",
            postal_code: 94111
        },
        items: order.products,
        subtotal: sumTotal,
        total: order.finalPrice,
        invoice_nr: order._id,
        date: order.createdAt
    };

    await createInvoice(invoice, 'invoice2.pdf')
    await sendEmail({
        to: req.user.email, subject: "invoice", attachments: [{
            // define custom content type for the attachment
            path: 'invoice2.pdf',
            contentType: 'application/pdf'
            
        }]
    })

    return res.status(201).json({ message: "Done", order })
})



export const cancelOder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { _id } = req.user;
    const { reason } = req.body
    console.log({ orderId, _id });
    const order = await orderModel.findOne({ _id: orderId, userId: req.user._id })
    if (!order) {
        return next(new Error("In-valid order", { cause: 404 }))
    }
    if (
        (order.status != 'placed' && order.paymentType == 'cash')
        || (order.status != 'waitPayment' && order.paymentType == 'card')
    ) {
        return next(new Error(`Cannot cancel your order  after
         it been chanced to ${order.status} by the system`, { cause: 404 }))
    }

    const cancelOrder = await orderModel.updateOne({ _id: orderId, userId: req.user._id }, { status: 'canceled', reason })

    if (!cancelOrder.matchedCount) {
        return next(new Error("Fail to cancel your order", { cause: 400 }))
    }


    for (const product of order.products) {
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: parseInt(product.quantity) } })
    }

    if (order.couponId) {
        await couponModel.updateOne({ _id: order.couponId }, { $pull: { usedBy: req.user._id } })
    }
    return res.status(200).json({ message: "Done" })

})



export const deliveredOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { _id } = req.user;

    const order = await orderModel.findOneAndUpdate(
        { _id: orderId, status: { $nin: ['rejected', 'delivered', 'canceled'] } },
        { status: 'delivered', updatedBy: _id }
    )
    console.log(order);
    if (!order) {
        return next(new Error("In-valid order", { cause: 404 }))
    }
    // if (['rejected', 'delivered', 'canceled'].includes(order.status)) {
    //     return next(new Error(`Cannot Delivered your order  after
    //      it been chanced to ${order.status}`, { cause: 400 }))
    // }
    // const order = await orderModel.updateOne({ _id: orderId }, { status: 'delivered', updatedBy: _id })

    return res.status(200).json({ message: "Done" })

})