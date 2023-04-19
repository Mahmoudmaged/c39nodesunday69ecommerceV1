import * as orderController from './controller/order.js'
import { auth } from '../../middleware/auth.js'
import { Router } from "express";
import { endpoint } from './order.endPoint.js';
import express from 'express'
const router = Router()



// router.get('/success',
//     orderController.successOrder)
// router.get('/cancel',
//     orderController.successOrder)
router.post('/',
    auth(endpoint.create),
    orderController.createOrder)


router.patch('/:orderId',
    auth(endpoint.cancel),
    orderController.cancelOder)

router.patch('/:orderId/delivered',
    auth(endpoint.delivered),
    orderController.deliveredOrder)



router.post('/webhook', express.raw({ type: 'application/json' }), orderController.webhook);

export default router