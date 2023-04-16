import userModel from '../../DB/model/User.model.js';
import { verifyToken } from '../utils/GenerateAndVerifyToken.js'
import { asyncHandler } from '../utils/errorHandling.js'


export const roles = {
    Admin: 'Admin',
    User: "User",
    HR: "HR"
}
export const auth = (accessRoles = []) => {
    return asyncHandler(async (req, res, next) => {

        const { authorization } = req.headers;
        if (!authorization?.startsWith(process.env.BEARER_KEY)) {
            return next(new Error("In-valid authorization bearer key", { cause: 400 }))
        }
        const token = authorization.split(process.env.BEARER_KEY)[1];
        if (!token) {
            return next(new Error("In-valid token ", { cause: 400 }))
        }
        const decoded = verifyToken({ token })
        if (!decoded?.id) {
            return next(new Error("In-valid token payload", { cause: 400 }))
        }

        const user = await userModel.findById(decoded.id).select('userName email role image status changePasswordTime')
        if (!user) {
            return next(new Error("Not register account", { cause: 401 }))
        }
        if (parseInt(user.changePasswordTime?.getTime() / 1000) > decoded.iat) {
            console.log({ changePasswordTime: parseInt(user.changePasswordTime.getTime() / 1000), token: decoded.iat });
            return next(new Error("Expired token ", { cause: 400 }))

        }
        if (user.status == "blocked") {
            return next(new Error("Blocked account", { cause: 400 }))
        }
        if (!accessRoles.includes(user.role)) {
            return next(new Error("Not authorized account ", { cause: 403 }))
        }
        req.user = user;

        return next()
    })
}


// export const authorized = (accessRoles = []) => {
//     return (req, res, next) => {
//         if (!accessRoles.includes(req.user.role)) {
//             return next(new Error("Not authorized account ", { cause: 403 }))
//         }
//         return next()
//     }
// }
