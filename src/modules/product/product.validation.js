import joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

export const createProduct = joi.object({
    name: joi.string().min(2).max(50).required(),
    description: joi.string().min(2).max(15000),
    price: joi.number().positive().min(1).required(),
    discount: joi.number().positive().min(1),
    stock: joi.number().integer().positive().min(1).required(),
    colors: joi.array(),
    size: joi.array(),

    file: joi.object({
        mainImage: joi.array().items(generalFields.file).length(1).required(),
        subImages: joi.array().items(generalFields.file).max(5),

    }).required(),

    categoryId: generalFields.id,
    subcategoryId: generalFields.id,
    brandId: generalFields.id



}).required()

export const updateProduct = joi.object({
    productId: generalFields.id,
    name: joi.string().min(2).max(50),
    description: joi.string().min(2).max(15000),
    price: joi.number().positive().min(1),
    discount: joi.number().positive().min(1),
    stock: joi.number().integer().positive().min(1),
    colors: joi.array(),
    size: joi.array(),

    file: joi.object({
        mainImage: joi.array().items(generalFields.file).max(1),
        subImages: joi.array().items(generalFields.file).max(5),

    }),

    categoryId: generalFields.optionalId,
    subcategoryId: generalFields.optionalId,
    brandId: generalFields.optionalId



}).required()


export const wishlist = joi.object({
    productId: generalFields.id,
}).required()



