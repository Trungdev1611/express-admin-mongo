import express from 'express'
import { getUser } from '../controllers/general.js';

const generalRoutes = express.Router()

generalRoutes.get("/user/:id", getUser);
export default generalRoutes