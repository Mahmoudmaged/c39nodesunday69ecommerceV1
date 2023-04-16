import * as productController from './controller/product.js'
import { auth } from '../../middleware/auth.js '
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { Router } from "express";
import { endPoint } from './product.endPoint.js';
import { validation } from '../../middleware/validation.js';
import * as validators from './product.validation.js'
import reviewRouter from '../reviews/reviews.router.js'
const router = Router()


router.use("/:productId/review", reviewRouter)

router.get("/" , productController.productList)
router.patch('/wishlist/:productId',
    auth(endPoint.wishlist),
    validation(validators.wishlist),
    productController.wishlist)

router.patch('/wishlist/:productId/remove',
    auth(endPoint.wishlist),
    validation(validators.wishlist),
    productController.removeFromWishlist)

router.post('/',
    auth(endPoint.createProduct),
    fileUpload(fileValidation.image).fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },
    ]),
    validation(validators.createProduct),
    productController.createProduct)


router.put('/:productId',
    auth(endPoint.updateProduct),
    fileUpload(fileValidation.image).fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },
    ]),
    validation(validators.updateProduct),
    productController.updateProduct)




export default router