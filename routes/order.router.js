const  orderController  = require('../controller/order.controller');
const {Router}= require('express');
const auth = require('../middleware/auth');


const router=Router();

router.use(auth);

router.get('/:value',orderController.fetch);
router.post('/',orderController.create);
router.put('/:orderId',orderController.update);

router.use((err,req,res,next)=>{
    res.status(500).json({errno:err.errno,message:err.message});
})

module.exports=router;

