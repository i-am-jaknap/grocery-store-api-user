const {Router}=require('express');
const {signup,signin,fetch}=require('../controller/user.controller');
const auth = require('../middleware/auth');

const router=Router();

router.get('/profile/:value',auth,fetch);
router.post('/signin',signin);
router.post('/signup',signup);

router.use((err,req,res,next)=>{
    res.status(500).json({errno:err.errno,message:err.message});
})


module.exports=router;