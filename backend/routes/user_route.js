import express from "express";
import { editProfile, followOrUnfollow, getProfile, getSuggestedUsers, login, logout, signup } from "../controllers/user_controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

//Initializing Router from express
const router = express.Router();


//ROUTES
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/:id/profile').get(isAuthenticated,getProfile);
router.route('/profile/edit').post(isAuthenticated, upload.single('profilePicture'),editProfile);
router.route('/suggested').get(isAuthenticated, getSuggestedUsers);
router.route('/connections/:id').post(isAuthenticated, followOrUnfollow);

export default router;