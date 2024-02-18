import { Router } from "express";
import {
    changeUserPassword,
    updateAvatar,
    userLogin,
    userLogout,
    userRegister
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/login').post(userLogin)
router.route('/register').post(upload.fields(
    [{
        name: 'avatar',
        maxCount: 1
    }]
), userRegister)

//Secured Routes
router.route('/changepassword').post(verifyJWT, changeUserPassword)
router.route('/logout').post(verifyJWT, userLogout)
router.route('/updateavatar').post(verifyJWT, updateAvatar)

export default router