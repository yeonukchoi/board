const jwt = require('jsonwebtoken');
const SECRET_KEY = 'chio';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    //토큰이 없는 경우
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: '인증 토큰이 없습니다.'});
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = { userId: decoded.userId};//req.user에 사용자 정보 저장
        next();
    }
    catch (err) {
        console.log(err);
        res.status(401).json({error: '유효하지 않은 토큰입니다.'});
    }
}

module.exports = authMiddleware;