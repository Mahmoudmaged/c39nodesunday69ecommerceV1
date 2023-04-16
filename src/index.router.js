
import authRouter from './modules/auth/auth.router.js'
import branRouter from './modules/brand/brand.router.js'
import cartRouter from './modules/cart/cart.router.js'
import categoryRouter from './modules/category/category.router.js'
import couponRouter from './modules/coupon/coupon.router.js'
import orderRouter from './modules/order/order.router.js'
import productRouter from './modules/product/product.router.js'
import reviewsRouter from './modules/reviews/reviews.router.js'
import subcategoryRouter from './modules/subcategory/subcategory.router.js'
import userRouter from './modules/user/user.router.js'
import connectDB from '../DB/connection.js'
import { globalErrorHandling } from './utils/errorHandling.js'
import morgan from 'morgan'
import cors from 'cors'

const initApp = (app, express) => {

    // var whitelist = ['http://localhost:4200/', 'https://linkitqa.netlify.app/#/']
    // var corsOptions = {
    //     origin: function (origin, callback) {
    //         if (whitelist.indexOf(origin) !== -1) {
    //             callback(null, true)
    //         } else {
    //             callback(new Error('Not allowed by CORS'))
    //         }
    //     }
    // }
    // app.use(cors(corsOptions))


    // app.use(async (req, res, next) => {

    //     // if (!['http://127.0.0.1:5500'].includes(req.header('origin'))) {
    //     //     return res.json({ message: "In-valid origin" })
    //     // }
    //     // await res.header('Access-Control-Allow-Origin', ['http://127.0.0.1:5500', 'http://localhost:4200/']);
      
    //     await res.header('Access-Control-Allow-Origin', '*');
    //     await res.header('Access-Control-Allow-Headers', '*')
    //     await res.header("Access-Control-Allow-Private-Network", 'true')
    //     await res.header('Access-Control-Allow-Methods', '*')
    //     console.log("Origin Work");
    //     next();
    // });
    //convert Buffer Data
    app.use(cors())
   
    if (process.env.MOOD == "DEVs") {
        app.use(morgan('dev'))
    } else {
        app.use(morgan('common'))
    }
    app.use(express.json({}))
    //Setup API Routing 
    app.use(`/auth`, authRouter)
    app.use(`/user`, userRouter)
    app.use(`/product`, productRouter)
    app.use(`/category`, categoryRouter)
    app.use(`/subcategory`, subcategoryRouter)
    app.use(`/reviews`, reviewsRouter)
    app.use(`/coupon`, couponRouter)
    app.use(`/cart`, cartRouter)
    app.use(`/order`, orderRouter)
    app.use(`/brand`, branRouter)

    app.all('*', (req, res, next) => {
        res.send("In-valid Routing Plz check url  or  method")
    })
    app.use(globalErrorHandling)

    connectDB()

}



export default initApp