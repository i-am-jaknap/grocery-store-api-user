const PickHandler=require('../lib/pick_handler');
const Order = require('../model/order');
const User=require('../model/user');
const uuid=require('uuid');
const order = require('../model/order');
const Product = require('../model/product');

// exports.create= async (req,res,next)=>{
//     const data=req.body;
//     data.order_id=uuid.v4();

//     try{
       
//         //making sure that user exists
//         if(!await User.findOne({email:data.user})){
//             return res.status(400).json({'message':"Invalid user email."});
//         }

//         //add the order to the user's order list
//         await User.updateOne({email:data.user},{$push:{orders:data}});
//         const orderModel=new Order(data);

//         try{
//             await orderModel.save();
//             return res.sendStatus(201);

//         }catch(err){
//             console.log(err);
//             return res.status(400).json({message:err.message})
//         }
//     }catch(err){
//         next(err);
//     }
// }


//order cancel

exports.create= async (req,res,next)=>{
    const data=req.body;  //product_id,user,quantity
    const order_id=uuid.v4();

    //destucturing the payload
    const product_id=data.product_id;
    const user=data.user;
    const quantity=Number(data.quantity);

    if(!product_id || !user || !quantity){
        return res.sendStatus(400);
    }

    try{
       
        //making sure that user exists
        if(!await User.findOne({email:data.user})){
            return res.status(400).json({'message':"Invalid user email."});
        }


        //finding the product from the product document
        const product=await Product.findOne({product_id:product_id});    

        //making sure that protuct is not null
        if(!product){
            return res.sendStatus(400);
         }
        
        //checking stock availability
        if(product.stock < quantity){
            return res.status(307).json({'message':"Out of Stock"});
        };
               
        //making the order data
        const product_image=product.images[0] || '';
        const orderData={
                        order_id:order_id,
                        product_id:product.product_id,
                        product:product.name,
                        rate:product.rate,
                        quantity:quantity,
                        status:'pending',
                        image:product_image,
                        description:product.description,
                        user:user
                    }

        try{
            //add the order to the user's order list
            await User.updateOne({email:user},{$push:{orders:orderData}});
            const orderModel=new Order(orderData);

            //decreasing the stock
            await Product.updateOne({product_id:product_id},{$inc:{stock:-quantity}});

            //saving the stock in stock model
            await orderModel.save();

            return res.sendStatus(201);

        }catch(err){
            console.log(err);
            return res.status(400).json({message:err.message})
        }
    }catch(err){
        next(err);
    }
}

exports.update=async(req,res)=>{
    try{
        const orders=await Order.findOneAndUpdate({order_id:req.params.orderId},{$set:{status:'Cancel'}});
        await User.findOneAndUpdate({email:orders.user},{$set:{"orders.$[order].status":"Cancel"}},
        {arrayFilters:[{'order.order_id':req.params.orderId}]});

        res.sendStatus(204);
        
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
