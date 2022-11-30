const jwt = require('jsonwebtoken');
const User = require('../model/user');


module.exports= async (req,res,next)=>{
    try{
        const token=req.headers.authorization.split(' ')[1];
        const decodedToken=jwt.verify(token, process.env.SECRET_KEY);
        const email=decodedToken.email;


        if(email){
            const user= await User.findOne({email:email},{status:1,_id:0});

            if(!user){
                return res.sendStatus(401);
            }

            //check if user is active or not
            //if active then send the request further
            if(user.status){
               return next();
            }

            // or else notify the user
           return res.status(403).json({
                erorr:new Error('User is not active.').message
            })
        }

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