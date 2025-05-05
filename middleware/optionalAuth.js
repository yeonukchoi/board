const jwt = require('jsonwebtoken');
const SECRET_KEY = 'chio';

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(authHeader && authHeader.startsWith('Bearer ')){
        const token = authHeader.split(' ')[1];

        try{    
            const decoded = jwt.verify(token, SECRET_KEY);
            req.user = {userId: decoded.userId};
        }
        catch(err){
            req.user = null;
        }
    }
    else {
        req.user = null //토큰이 없는 경우 req.user을 null로 설정
    }
    next();
};

module.exports = optionalAuth;