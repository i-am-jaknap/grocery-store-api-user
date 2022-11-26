const PickHandler=require('../lib/pick_handler');
const Order = require('../model/order');
const User=require('../model/user');
const uuid=require('uuid');
const order = require('../model/order');

exports.create= async (req,res,next)=>{
    const data=req.body;
    data.order_id=uuid.v4();

    try{
       
        //making shure that user exists
        if(!await User.findOne({email:data.user})){
            return res.status(400).json({'message':"Invalid user email."});
        }

        //add the order to the user's order list
        await User.updateOne({email:data.user},{$push:{orders:data}});
        const orderModel=new Order(data);

        try{
            const savedDoc= await orderModel.save();
            res.status(201).json(savedDoc);

        }catch(err){
            console.log(err);
            res.status(400).json({message:err.message})
        }
    }catch(err){
        next(err);
    }
}

exports.update=async(req,res)=>{
    try{
        const orders=await Order.findOneAndUpdate({order_id:req.params.orderId},{$set:{status:req.body.status}});
        await User.findOneAndUpdate({email:orders.user},{$set:{"orders.$[order].status":req.body.status}},
        {arrayFilters:[{'order.order_id':req.params.orderId}]});

        res.status(204).json({'message':'Order cancelled'});
        
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
            const order= await Order.findOne({order_id:value});
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
            const orders=await User.findOne({email:value},{"orders":1,_id:0});

            if(orders){
                return res.status(200).json(orders.orders);
            }

            return res.status(404).json({message:'invalid user.'})
        }catch(err){
            return next(err);
        }   
               
    }
    //otherwise return all the orders
    try{
        const orders=await Order.find();
        return res.status(200).json(orders);  
    }catch(err){
        return next(err);
    }


}

exports.delete=async(req,res)=>{
    try{
        const orderId=req.params.orderId;
        const deletedOrder= await Order.findOneAndDelete({order_id:orderId})
        console.log(deletedOrder);

        if(deletedOrder){
            const upadteResult= await User.updateOne({
                                                        email:deletedOrder.user
                                                     },
                                                    {$pull:
                                                        {orders:
                                                            {
                                                                order:deletedOrder.order_id
                                                            }
                                                        }
                                                    });

            if(upadteResult.modifiedCount>0){
                return res.status(200).json({'message':"Order deleted successfully."});
            }
        }      

        return res.status(404).json({'message':"Invalid order id."});

    }catch(err){
        return res.status(500).json({message:err.message})
    }
   
}
