const {Router}=require('express');
const productController=require('../controller/product.controller')
const router=Router();

router.get('/',productController.fetch);

router.get('/:value',productController.fetch);


router.use((err,req,res,next)=>{
    res.status(500).json({errno:err.errno,message:err.message});
})

module.exports=router;