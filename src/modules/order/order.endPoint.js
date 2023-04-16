import { roles } from "../../middleware/auth.js";



export const endpoint = {

    cancel: [roles.User],
    create: [roles.User],
    delivered: [roles.Admin]
}