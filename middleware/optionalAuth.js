const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';

const optionalAuth = (req, res, next) => {
    const authHeader = req.header.authorization;

    if(authHeader && authHeader.startWith('Bearer ')){
        const token = authHeader.split(' ')[1];

        try{    
            const decoded = jwt.verify(token, SECRET_KEY);
            req.user = {userId: decoded.userId};
        }
        catch(err){

        }
    }
    next();
};

module.exports = optionalAuth;