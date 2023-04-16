import { roles } from "../../middleware/auth.js";




export const endPoint = {
    wishlist:[roles.User],
    createProduct: [roles.Admin],
    updateProduct: [roles.Admin],

}