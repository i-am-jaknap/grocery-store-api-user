const jwt = require('jsonwebtoken');

module.exports= (req,res,next)=>{
    try{
        const token=req.headers.authorization.split(' ')[1];
        const decodedToken=jwt.verify(token, process.env.SECRET_KEY);
        const email=decodedToken.email;
        if(req.body.email && req.body.email !== email ){
            throw 'Invalid token.';
        }else{
           return  next();
        }
    }catch(err){
        console.log(err);
        res.status(401).json({
            erorr:new Error('Invalid authorization token.').message
        });
    }
}