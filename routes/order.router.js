const  orderController  = require('../controller/order.controller');
const {Router}= require('express');


const router=Router();

router.get('/',orderController.fetch);
router.get('/:value',orderController.fetch);
router.post('/',orderController.create);
router.put('/:orderId',orderController.update);
router.delete('/:orderId',orderController.delete);

router.use((err,req,res,next)=>{
    res.status(500).json({errno:err.errno,message:err.message});
})

module.exports=router;

