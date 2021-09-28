const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult } = require('express-validator/check');


const Post = require('../../models/Posts');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route POST api/posts
//@desc Create Post
//@access private
router.post('/', 
[
    auth,
    [
        check('text', 'Text is Required').not().isEmpty()
    ]
 ], 
 async (req, res) => {
     const errors = validationResult(req);
     if(!errors.isEmpty())
     {
         return res.status(400).json({ errors : errors.array() });
     }
     try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();

        res.json(post);
         
     } catch (err) {
         console.error(err.message);
         res.status(500).send('Server Error');
     }
});


//@route GET api/posts
//@desc Get Post
//@access private
router.get('/', auth, async (req, res) =>{
    try {
        const posts = await Post.find().sort({ date: -1});
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});


//@route GET api/posts/:id
//@desc Get Post by ID
//@access private
router.get('/:id', auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post)
        {
            res.status(404).json({ msg: 'Post not Found!'});
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId')
        {
            res.status(404).json({ msg: 'Post not Found!'});
        }
        res.status(500).send('Server Error');
    }

});



//@route DELETE api/posts/:id
//@desc Get Post by ID
//@access private
router.delete('/:id', auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);

        //check user 
        if(post.user.toString() !== req.user.id)
        {
            return res.status(401).json({ msg: 'User not authorized'});
        }
        if(!post)
        {
            res.status(404).json({ msg: 'Post not Found!'});
        }
        await post.remove();
        res.json({msg : 'Post removed'});
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId')
        {
            res.status(404).json({ msg: 'Post not Found!'});
        }
        res.status(500).send('Server Error');
    }

});


module.exports = router;