const {Router}=require('express');
const productController=require('../controller/product.controller')
const router=Router();
const multipart_upload= require('../middleware/multipart_upload')
const { GOOGLE_CLOUD_PRIVATE_KEY ,GOOGLE_CLOUD_BUCKET_NAME,GOOGLE_CLOUD_CLIENT_EMAIL,GOOGLE_CLOUD_PROJECT_ID} = require('../config/vars');
const auth=require('../middleware/auth');

//configuring multipart upload middleware
const multipartMiddleware=multipart_upload({ STORAGE:'google-cloud',GC_PRIVATE_KEY:GOOGLE_CLOUD_PRIVATE_KEY,
            GC_CLIENT_EMAIL:GOOGLE_CLOUD_CLIENT_EMAIL,
            GC_BUCKET_NAME:GOOGLE_CLOUD_BUCKET_NAME,GC_PROJECT_ID:GOOGLE_CLOUD_PROJECT_ID,
            FOLDER_NAME:'products'
        });



router.get('/',auth,productController.fetch);

router.get('/:value',productController.fetch);

router.post('/',  multipartMiddleware ,  productController.create);

router.put('/:value', multipartMiddleware ,productController.update);

router.delete('/:value',productController.delete)

router.use((err,req,res,next)=>{
    res.status(500).json({errno:err.errno,message:err.message});
})

module.exports=router;