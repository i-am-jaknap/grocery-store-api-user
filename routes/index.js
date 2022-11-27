const {Router}=require('express');
const productRouter=require('./product.router');
const userRouter=require('./user.router');
const orderRouter=require('./order.router')
const cartRouter=require('./cart.router')


const router=Router();


router.get('/',(req,res)=>{
    res.send('Hello world');
})

router.use('/',userRouter);
router.use('/product',productRouter);
router.use('/order',orderRouter);
router.use('/cart',cartRouter);


module.exports=router;



