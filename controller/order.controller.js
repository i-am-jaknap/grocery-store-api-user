const PickHandler=require('../lib/pick_handler');
const Order = require('../model/order');
const User=require('../model/user');
const uuid=require('uuid');
const Product = require('../model/product');
const { findOneAndUpdate } = require('../model/order');


exports.create= async (req,res,next)=>{
    const user_email=req.body.user;  //user
    const order_id=uuid.v4();

    
    //if user is not send by the user
    if(!user_email ){
        return res.status(400).json({message:"Invalid email"});
    }

    try{
       const cart= await User.findOne({email:user_email}).select({cart:1,_id:0})

        if(cart  === null){
            return res.status(400).json({message:"Invalid user."});
        }


       // making sure that cart is not null and its length is more than 0
       if( cart.cart.length){
            let total=0;
            for(let cart_item of cart.cart){
                total+= cart_item.quantity*cart_item.rate
            }
            
            const order={
                order_id:order_id,
                products:cart.cart,
                status:'pending',
                user:user_email,
            };
    
            //adding the order created above
            const user=await User.findOneAndUpdate({email:user_email},{$push:{orders:order}})

            //addding the order to the separate order collection
            const newOrder=new Order({
                products:cart.cart,
                order_id:order_id,
                status:"pending",
                user:user_email
            });
            newOrder.save();
            

            ///now clear the cart
            await User.updateOne({email:user_email},{$pull:{cart:{$exists:true}}});

            return res.status(200).json({message:"Order created"});
        }

        return res.status(200).json({message:"Cart is emptly."});

    }catch(err){
        next(err);
    }
}

exports.update=async(req,res)=>{
    try{
        const orders=await Order.findOneAndUpdate({order_id:req.params.orderId},{$set:{status:'Cancel'}});
        await User.findOneAndUpdate({email:orders.user},{$set:{"orders.$[order].status":"Cancel"}},
        {arrayFilters:[{'order.order_id':req.params.orderId}]});

        res.send(200).json({message:"Order cancelled."});
        
    }catch(err){
        res.status(400).json({"message":"Invalid order."});
    }
}

exports.fetch=async(req,res,next)=>{
    //using email or order id 
    let using=req.query.using || '' ;
    using=using.toLowerCase();
    
    //either order id or email address
    const value=req.params.value;


    //finding and sending the order based on order id
    if( (using==='' && value) || (using ==="order_id" && value)){
        try{
            const order= await Order.findOne({order_id:value})
                                    .sort({createdAt:-1,updatedAt:-1})
                                    .select({createdAt:0,updatedAt:0,_id:0});;
            //check if any order found
            if(order){
                return res.status(200).json(order);  
            }

            return res.status(404).json({message:"invalid order id."});  
             
        }catch(err){
            next(err);
        }
        
    // finding and sending the order of particular user
    }else if(using === 'email' && value){

        try{
            const orders=await User.findOne({email:value},{"orders._id":0,_id:0,"orders.createdAt":0,"orders.updatedAt":0})
                                    .sort({createdAt:-1,updatedAt:-1})
                                    .select({createdAt:0,updatedAt:0});

            if(orders){
                return res.status(200).json(orders.orders);
            }

            return res.status(404).json({message:'invalid user.'})
        }catch(err){
            return next(err);
        }   
               
    }
  

}
