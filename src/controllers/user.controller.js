import { User } from "../models/user.model.js"
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { AsyncHandler } from "../utils/AsyncHandler.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"


const createToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()

        user.accessToken = accessToken
        await user.save({ validateBeforeSave: false })

        return { accessToken }
    } catch (error) {
        console.log(error);
        throw new ApiError(400, "Something went wrong while generating AccessToken")
    }
}


const userRegister = AsyncHandler(async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body

        if (!(fullName, username, password, confirmPassword, gender)) {
            throw new ApiError(404, "All fields are required")
        }

        const existingUser = await User.findOne({ username }).select("-password")
        if (existingUser) {
            throw new ApiError(500, "Username is already registered")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path
        if (!avatarLocalPath) throw new ApiError(401, "Avatar is required!")

        const avatar = await uploadOnCloudinary(avatarLocalPath)

        if (!avatar) throw new ApiError(500, "Error occured during uploading avatar")

        const user = await User.create({
            fullName,
            username: username.toLowerCase(),
            password,
            avatar: avatar?.url,
            confirmPassword,
            gender
        })
        const createdUser = await User.findById(user._id).select("-password")
        if (!createdUser) throw new ApiError(500, "Something went wrong while registering user")
        return res
            .status(200)
            .json(
                new ApiResponse(200, createdUser, "User registred successfully")
            )
    } catch (error) {
        throw error
    }
})

const userLogin = AsyncHandler(async (req, res) => {
    try {

        var { username, password } = req.body
        if (!(username || password)) {
            throw new ApiError(404, "All fields are required")
        }
        username = username.toLowerCase()

        const user = await User.findOne({ username })
        if (!user) throw new ApiError(404, "user doesn't exists")

        const isPasswordCorrect = await user.isPasswordCorrect(password)
        if (!isPasswordCorrect) throw new ApiError(401, "Invalid Credentials")

        const { accessToken } = await createToken(user._id)


        const loggedInUser = await User.findById(user._id).select("-password -accessToken")

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(200, { loggedInUser }, "user loggedIn successfully")
            )



    } catch (error) {
        throw new ApiError(500, error.message)
    }

})

const userLogout = AsyncHandler(async (req, res) => {
    try {
        await User.findOneAndUpdate(req.user._id, {
            $unset: {
                accessToken: 1
            }
        }, { new: true }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .json(
                new ApiResponse(200, {}, "User logged out successfully!")
            )
    } catch (error) {
        throw new ApiError(500, error.message || "Some Error occured during logouting the user")
    }

})

const changeUserPassword = AsyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body
        if (!(oldPassword || newPassword)) throw new ApiError(401, "All fields are required!")

        const user = await User.findById(req.user._id)
        const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

        if (!isPasswordCorrect) throw new ApiError(401, "incorect old password")

        user.password = newPassword
        await user.save({ validateBeforeSave: false })
        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Password changed successfully!")
            )
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})

const updateAvatar = AsyncHandler(async (req, res) => {
    try {
        const fileLocalPath = req.files?.avatar[0].path

        if (!fileLocalPath) throw new ApiError(404, "Avatar is required")

        const newAvatar = await uploadOnCloudinary(fileLocalPath)

        if (!newAvatar.url) throw new ApiError(500, "Error occured during updating avatar")

        await User.findByIdAndUpdate(req.user._id, {
            $set: {
                avatar: newAvatar?.url
            },

        }, { new: true }).select("-password")

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Avatar updated successfully")
            )
    } catch (error) {
        throw new ApiError(500, error.message)
    }


})

const getUserForSidebar = AsyncHandler(async (req, res) => {

    try {
        const loggedInUser = req.user._id

        const allusers = await User.find({
            _id: { $ne: loggedInUser }
        }).select("-password")

        if (!allusers) {
            throw new ApiError(500, "Something went wrong")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, allusers )
            )
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error")
    }
})


export {
    userRegister,
    userLogin,
    userLogout,
    changeUserPassword,
    updateAvatar,
    getUserForSidebar
}