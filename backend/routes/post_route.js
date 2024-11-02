import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { addComment, addNewPost, bookmarkPost, deletePost, disLikePost, getAllPost, getPostsComments, getUsersPost, likePost } from "../controllers/post_controller.js";


const router = express.Router();

router.route('/addpost').post(isAuthenticated, upload.single('image'),addNewPost)
router.route('/all').get(isAuthenticated, getAllPost);
router.route('/userpost/all').get(isAuthenticated, getUsersPost);
router.route('/like/:id').post(isAuthenticated, likePost);
router.route('/dislike/:id').post(isAuthenticated, disLikePost);
router.route('/comment/:id').post(isAuthenticated, addComment)
router.route('/getcomments/:id').get(isAuthenticated, getPostsComments)
router.route('/delete/:id').delete(isAuthenticated, deletePost)
router.route('/bookmark/:id').post(isAuthenticated, bookmarkPost)

export default router;