const {Router}=require('express');
const {signup,signin,fetch,updateProfilePic}=require('../controller/user.controller');
const auth = require('../middleware/auth');
const multipart_upload= require('../middleware/multipart_upload')
const { GOOGLE_CLOUD_PRIVATE_KEY ,GOOGLE_CLOUD_BUCKET_NAME,GOOGLE_CLOUD_CLIENT_EMAIL,GOOGLE_CLOUD_PROJECT_ID} = require('../config/vars');




//configuring multipart upload middleware
const multipartMiddleware=multipart_upload({ STORAGE:'google-cloud',GC_PRIVATE_KEY:GOOGLE_CLOUD_PRIVATE_KEY,
            GC_CLIENT_EMAIL:GOOGLE_CLOUD_CLIENT_EMAIL,
            GC_BUCKET_NAME:GOOGLE_CLOUD_BUCKET_NAME,GC_PROJECT_ID:GOOGLE_CLOUD_PROJECT_ID,
            FOLDER_NAME:'users'
        });
    


const router=Router();

router.get('/profile/:value',auth,fetch);
router.post('/signin',signin);
router.post('/signup',signup);
router.put('/update-profile-pic/:email',multipartMiddleware,auth,updateProfilePic);


router.use((err,req,res,next)=>{
    res.status(500).json({errno:err.errno,message:err.message});
})


module.exports=router;