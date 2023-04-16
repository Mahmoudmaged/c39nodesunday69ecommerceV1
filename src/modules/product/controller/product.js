import slugify from "slugify"
import subcategoryModel from '../../../../DB/model/Subcategory.model.js'
import productModel from '../../../../DB/model/Product.model.js'
import brandModel from '../../../../DB/model/Brand.model.js'
import cloudinary from '../../../utils/cloudinary.js'
import { asyncHandler } from '../../../utils/errorHandling.js'
import { nanoid } from "nanoid"
import userModel from "../../../../DB/model/User.model.js"
import { ApiFeatures } from "../../../utils/apiFeatures.js"


export const productList = asyncHandler(async (req, res, next) => {




    const apiObject = new ApiFeatures(productModel.find().populate([
        {
            path: 'review',
            match: { isDeleted: false }
        }
    ]), req.query).filter().search().select().sort()
    const products = await apiObject.mongooseQuery
    for (let i = 0; i < products.length; i++) {
        let calcRate = 0;
        for (let j = 0; j < products[i].review.length; j++) {
            calcRate += products[i].review[j].rating
        }
        const product = products[i].toObject()
        product.avgRating = calcRate / products[i].review.length
        products[i] = product
    }
    return res.status(200).json({ message: "Done", products })






})
export const createProduct = asyncHandler(async (req, res, next) => {

    const { name, categoryId, subcategoryId, brandId, price, discount } = req.body

    if (!await subcategoryModel.findOne({ _id: subcategoryId, categoryId })) {
        return next(new Error("In-valid subcategory Id", { cause: 400 }))
    }
    if (!await brandModel.findOne({ _id: brandId })) {
        return next(new Error("In-valid brand Id", { cause: 400 }))
    }

    req.body.slug = slugify(name, {
        replacement: '-',
        trim: true,
        lower: true
    })
    req.body.finalPrice = Number.parseFloat(price - (price * ((discount || 0) / 100))).toFixed(2);

    req.body.customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, { folder: `${process.env.APP_NAME}/product/${req.body.customId}` })
    req.body.mainImage = { secure_url, public_id }

    if (req.files?.subImages?.length) {
        req.body.subImages = []
        for (const image of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(image.path, { folder: `${process.env.APP_NAME}/product/${req.body.customId}/subImages` })
            req.body.subImages.push({ secure_url, public_id })
        }
    }
    req.body.createdBy = req.user._id
    const product = await productModel.create(req.body)
    return res.status(201).json({ message: "Done", product })

})

export const updateProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const { name, categoryId, subcategoryId, brandId, price, discount } = req.body

    const product = await productModel.findById(productId)
    if (!product) {
        return next(new Error("In-valid product Id", { cause: 400 }))
    }

    if (subcategoryId && categoryId) {
        if (!await subcategoryModel.findOne({ _id: subcategoryId, categoryId })) {
            return next(new Error("In-valid subcategory Id", { cause: 400 }))
        }
    }
    if (brandId) {
        if (!await brandModel.findOne({ _id: brandId })) {
            return next(new Error("In-valid brand Id", { cause: 400 }))
        }
    }

    if (name) {
        req.body.slug = slugify(name, {
            lower: true
        })
    }

    req.body.finalPrice = (price || discount) ? Number.parseFloat((price || product.price) - ((price || product.price) * ((discount || product.discount) / 100))).toFixed(2) : product.finalPrice;



    if (req.files?.mainImage?.length) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, { folder: `${process.env.APP_NAME}/product/${product.customId}` })
        await cloudinary.uploader.destroy(product.mainImage.public_id)
        req.body.mainImage = { secure_url, public_id }
    }
    if (req.files?.subImages?.length) {
        req.body.subImages = []
        for (const image of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(image.path, { folder: `${process.env.APP_NAME}/product/${product.customId}/subImages` })
            req.body.subImages.push({ secure_url, public_id })
        }
    }
    req.body.updatedBy = req.user._id
    await productModel.updateOne({ _id: productId }, req.body)
    return res.status(200).json({ message: "Done" })

})


export const wishlist = asyncHandler(async (req, res, next) => {

    const { productId } = req.params;
    if (!await productModel.findOne({ _id: productId, isDeleted: false })) {
        return next(new Error(`In-valid product`))
    }
    await userModel.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: productId } })
    return res.status(200).json({ message: "Done" })
})

export const removeFromWishlist = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    await userModel.updateOne({ _id: req.user._id }, { $pull: { wishlist: productId } })
    return res.status(200).json({ message: "Done" })
})