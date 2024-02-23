import { User } from "../models/user.model.js"
import { Message } from "../models/message.model.js"
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { AsyncHandler } from "../utils/AsyncHandler.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { Conversation } from "../models/conversation.model.js"



const sendMessage = AsyncHandler(async (req, res) => {

    try {

        const { message } = req.body
        const receiverId = req.params.id
        const senderId = req.user._id

        let conversation = await Conversation.findOne(
            { participants: { $all: [senderId, receiverId] } }
        )

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            })
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        })

        if (!newMessage) throw new ApiError(500, "Message not sent, Please try again...")

        conversation.messages.push(newMessage)
        await conversation.save()

        return res
            .status(200)
            .json(
                new ApiResponse(200, { newMessage }, "Message sent successfully")
            )

    } catch (error) {
        console.log("Error in message controller :: ", error.message);
        throw new ApiError(500, "Internal server error")
    }

})

const getMessage = AsyncHandler(async (req, res) => {

    try {
        const userToChatId = req.params.id
        const senderId = req.user._id

        const conversation = await Conversation.findOne({
            participants: { $all: [userToChatId, senderId] }
        }).populate("messages")

        if (!conversation) throw new ApiError(404, "No chats found..")

        const message = conversation.messages

        return res
            .status(200)
            .json(
                new ApiResponse(200, message, "converesation found successfully..")
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong fetching messages")
    }

})


export {
    sendMessage,
    getMessage
}