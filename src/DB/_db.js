import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

export const dbconnect = async ()=>{
    await mongoose.connect(`${process.env.MONGO_URI}${process.env.DB_NAME}?retryWrites=true&w=majority`)
}

