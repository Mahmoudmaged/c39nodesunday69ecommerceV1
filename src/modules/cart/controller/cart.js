import cartModel from "../../../../DB/model/Cart.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";



export const addToCart = asyncHandler(async (req, res, next) => {
    // prepare product
    const { productId, quantity } = req.body
    const product = await productModel.findById(productId)
    if (!product) {
        return next(new Error('In-valid product Id', { cause: 400 }))
    }

    if (quantity > product.stock || product.isDeleted) {
        await productModel.updateOne({ _id: productId }, { $addToSet: { wishUser: req.user._id } })
        return next(new Error('In-valid quantity ', { cause: 400 }))
    }


    //check cart exist
    const cart = await cartModel.findOne({ createdBy: req.user._id })
    if (!cart) {
        //create cart firstTime
        const newCart = await cartModel.create({
            createdBy: req.user._id,
            products: [{ productId, quantity }]
        })
        return res.status(201).json({ message: 'Done', cart: newCart })
    }
    // update cart item

    let matchProduct = false
    for (let i = 0; i < cart.products.length; i++) {
        if (cart.products[i].productId.toString() == productId) {
            cart.products[i].quantity = quantity
            matchProduct = true;
            break;
        }

    }
    // or push to cart
    if (!matchProduct) {
        cart.products.push({ productId, quantity })
    }
    await cart.save()
    return res.status(200).json({ message: 'Done', cart })

})


export async function clearAllCartItems(createdBy) {
    const cart = await cartModel.updateOne({ createdBy }, { products: [] })
    return cart
}
export const clearCart = asyncHandler(async (req, res, next) => {
    await clearAllCartItems(req.user._id)
    return res.status(200).json({ message: 'Done' })
})


export async function deleteSelectedItems(productIds, createdBy) {
    const cart = await cartModel.updateOne(
        { createdBy },
        {
            $pull: {
                products: {
                    productId: {
                        $in: productIds
                    }
                }
            }
        }
    )
    return cart
}

export const clearItemsFromCart = asyncHandler(async (req, res, next) => {
    const { productIds } = req.body
    const cart = await deleteSelectedItems(productIds, req.user._id)
    return res.status(200).json({ message: "Done" })
})

