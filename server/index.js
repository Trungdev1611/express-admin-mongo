import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import clientRoutes from './routes/client.js'
import generalRoutes from './routes/general.js'
import managementRoutes from './routes/management.js'
import salesRoutes from './routes/sale.js'
import helmet from 'helmet'
import cors from 'cors'
import mongoose from 'mongoose'

//database import data
import UserModel from './models/User.js'
import {dataUser} from './data/index.js'

//Configuration
dotenv.config()
const app = express() //init app
app.use(express.json())
app.use(helmet()) //improve security
app.use(helmet.crossOriginResourcePolicy({polocy: "cross-origin"}))
app.use(morgan("common")) //make log request
app.use(bodyParser.urlencoded({extended: false}))  //in the above version, we don't need to use body parser because this library was integrated in express
app.use(cors());


//Routes
app.use("/client", clientRoutes)    
app.use("/general", generalRoutes)
app.use("/management", managementRoutes)
app.use("/sales", salesRoutes)

//Mongo setup
const PORT = process.env.PORT || 9000
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`✅ App running on port: ${PORT} and connect database success`));
    
    //just run once time
    // UserModel.insertMany(dataUser)
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));