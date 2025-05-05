const exrpress = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'chio';


const router = exrpress.Router();

//회원가입
router.post('/register', async (req, res) => {
    const {userNickname, userName, password} = req.body;

    try {
        //중복 확인
        const existingUser = await User.findOne({userName});
        if(existingUser) {
            return res.status(400).json({ error: '이미 사용중인 아이디입니다.'});
        }
        //비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await User.create({userNickname, userName, password: hashedPassword});
        res.status(201).json({message: '회원가입 성공'});
    }
    catch (err) {
        console.log(err);
        res.status(500).json({error: '서버 에러'});
    }
});
//로그인
router.post('/login', async (req, res) => {
    const {userName, password} = req.body;

    try {
        const user = await User.findOne({userName});
        if(!user){
            return res.status(400).json({error: '존재하지 않는 아이디입니다.'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.'}); 
        }

        //jwt발급
        const token = jwt.sign({userId: user._id}, SECRET_KEY, {expiresIn: '5h'});
        res.json({ message: '로그인 성공', token});
    }
    catch (err) {
        console.log(err);
        res.status(500).json({error: '서버 에러'});
    }
});

module.exports = router;