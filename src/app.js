import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from "cookie-parser";




export const app = express()
app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cookieParser());


app.get('/',(req,res)=>{
    res.send("Welcome to the chat app")
})

// all neccessary routes
import userRoutes from './routes/user.routes.js'
import messageRoutes from './routes/message.routes.js'
app.use('/api/auth',userRoutes)
app.use('/api/message',messageRoutes)