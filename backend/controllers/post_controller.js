import sharp from "sharp";
import { Post } from "../models/post_model.js";
import { User } from "../models/user_model.js";
import {Comment} from "../models/comment_model.js"
export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const source = req.file;
        const author = req.id;

        if (!source) {
            return res.status(400).json({ message: "Source Required" });
        }

        const optimizedImageBuffer = await sharp(source.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;

        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: author
        });

        const user = await User.findById(author);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: "-password" });

        return res.status(201).json({
            message: "Post has been Uploaded",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: { path: 'author', select: 'username profilePicture' }
            });

        return res.status(200).json({ posts, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};


export const getUsersPost = async (req,res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({authorId}).sort({createdAt: -1}).populate({
            path:'author',
            select:'username, profilePicture'
        }).populate({
            path:'comments',
            sort:{createdAt:-1},
            populate: {
                path: 'author',
                select:'username, profilePicture'
            }
        })
    } catch (error) {
        console.log(error)
    }
}
export const likePost = async (req,res) => {
    try {
        const likedBy = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({
            message: "Post not found",
            success: false
        })

        //Liked Logic
        await post.updateOne({$addToSet:{likes:likedBy}});
        await post.save();

        //implement socketio for real time implementation


        return res.status(200).json({message:"Post liked", success:true});
    } catch (error) {
        console.log(error)
    }
}
export const disLikePost = async (req,res) => {
    try {
        const likedBy = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({
            message: "Post not found",
            success: false
        })

        //Liked Logic
        await post.updateOne({$pull:{likes:likedBy}});
        await post.save();

        return res.status(200).json({message:"Post disliked", success:true});
    } catch (error) {
        console.log(error)
    }
}

export const addComment = async (req,res) => {
    try {
        const postId = req.params.id;
        const commentator = req.id;

        const {text} = req.body;
        const post = await Post.findById(postId);
        
        if(!text) return res.status(400).json({message: "text is required", success: false});

        const comment = await Comment.create({
            text,
            author: commentator,
            post:postId,
        })
        .populate({
            path: 'author',
            select:"username, profilePicture"
        });

        post.comments.push(comment._id);
        await post.save();

        //implementation of socketio


        return res.status(201).json({
            message:"Comment added",
            comment,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getPostsComments = async (req,res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({post: postId}).populate('author','username, profilePicture');

        if(!comments)   return res.status(404).json({message: 'No comments found for this post', success:false});

        return res.status(200).json({success:true, comments});
    } catch (error) {
        console.log(error)
    }
}

export const deletePost = async(req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = Post.findById(postId);
        if(!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            })
        }
        if(post.author.toString() !== authorId) {
            return res.status(404).json({
                Message: "Unauthorized Access",
                success: false
            })
        }

        await Post.findByIdAndDelete(postId);
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString()!== postId);

        await user.save();

        //delete associated comments
        await Comment.deleteMany({posts: postId});

        return res.status(200).json({
            message: "Post deleted",
            success : true
        })
    } catch (error) {
        console.log(error)
    }
}
export const bookmarkPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);

        if(!post)   return res.status(404).json({message :'Post not found', success:false});
        
        const user = await user.findById(authorId);
        if(user.bookmarks.includes(post._id)) {
            //alreadybookmarked -> remove the bookmark
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();

            return res.status(200).json({
                message: "Post removed from bookmarks",
                success: true,
                type: 'unsaved'
            })
        }
        else {
            //bookmark the post
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();

            return res.status(200).json({
                message: "Post added to bookmarks",
                success: true,
                type: 'saved'
            })
        }
    } catch (error) {
        console.log(error)
    }
}