const express = require('express');
const Post = require('../models/post');
const authMiddleware = require('../middleware/authmiddleware');
const optionalAuth = require('../middleware/optionalAuth');
const router = express.Router();

//글 목록 보기
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1});// 최신순 정렬
        res.json(posts);
    }
    catch (err) {
        res.status(500).json({message: '서버 에러'});
    }
});

//글 쓰기
router.post('/', optionalAuth, async (req, res) => {
    const {title, content} = req.body;
    const userId = req.user ? req.user.userId : null;

    if(!title || !content) {
        return res.status(400).json({error: '제목과 내용을 모두 입력해주세요.'});
    } 

    try {
        const newPost = await Post.create({
            userId,
            title,
            content,
        });
        res.status(201).json(newPost);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({error: '서버 에러'});
    }
});

//글 수정 
router.put('/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    const {title, content} = req.body;

    if(!title || !content) {
        return res.status(400).json({ error: '제목과 내용 모두 입력해주세요.'});
    }

    try {
        const updatePost = await Post.findById(id);

        if(!updatePost) {
            return res.status(404).json({ error: '게시글을 찾을 수 없습니다.'});
        }
        
        //작성자 확인
        if(updatePost.userId.toString() !== req.user.userId){
            return res.status(403).json({error: '작성자만 수정할 수 있습니다.'});
        }

        updatePost.title = title;
        updatePost.content = content;
        await updatePost.save();

        res.json(updatePost);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: '서버 에러'});
    }
});

//글 삭제
router.delete('/:id', authMiddleware, async (req, res) => {
     const {id} = req.params;

    try {
        const deletePost = await Post.findById(id);

        if(!deletePost) {
            return res.status(404).json({ error: '게시글이 존재하지 않습니다.'});
        }

        if(deletePost.userId.toString() !== req.user.userId) {
            return res.status(403).json({error: '작성자만 삭제할 수 있습니다.'});
        }

        await deletePost.deleteOne();
        res.json({ message: '게시글을 삭제 했습니다.'});
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: '서버 에러'});
    }
});

//유저자신이 쓴 글 목록 보기
router.get('/myposts', authMiddleware, async (req, res) => {
    const {userId} = req.user;

    try{
        const myPosts = await Post.find({ userId }).sort({createdAt: -1});
        res.json(myPosts)
    }
    catch(err){
        res.status(500).json({ error: '서버에러'});
    }
});

module.exports = router;