const {Router}= require('express');
const cartController=require('../controller/cart.controller');
const auth = require('../middleware/auth');


const router=Router();

router.use(auth);

router.get("/",cartController.fetch);
router.get("/:value",cartController.fetch);
router.post("/",cartController.create);
router.delete('/:value',cartController.delete);

router.use((err,req,res,next)=>{
    res.status(500).json({errno:err.errno,message:err.message});
});



module.exports=router;