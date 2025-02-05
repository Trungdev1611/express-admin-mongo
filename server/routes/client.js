import express from 'express'
import { getProducts } from '../controllers/client.js'
const clientRoutes = express.Router()

clientRoutes.get(`/products`, getProducts)

export default clientRoutes