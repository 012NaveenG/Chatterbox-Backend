import { User } from "../models/user.model.js"
import { Message } from "../models/message.model.js"
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { AsyncHandler } from "../utils/AsyncHandler.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"


const sendMessage = AsyncHandler(async (req, res) => {
    req.send("Message sent")

})


export {
    sendMessage
}