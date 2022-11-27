const Cart=require('../model/cart');
const User=require('../model/user');
const uuid=require('uuid');


//get the cart either the the cart of all the users or 
//the cart of particular user
exports.fetch=async(req,res,next)=>{
          
      //email address
      const email=req.params.value;

      //finding and sending the product of a cart  by using user email
    if( email ){
        try{
            const cart= await User.findOne({email:email},{_id:0,cart:1});

            //check if the user is valid or not
            if(cart){
                
                return res.status(200).json(cart.cart);  
            }

            return res.status(404).json({message:"invalid email."});  
             
        }catch(err){
          return   next(err);
        }
    }

    //otherwise fetch all the product from the cart
    try{
        const cart=await Cart.find();
        return res.status(200).json(cart);  
    }catch(err){
        return next(err);
    }


}

//add to the cart
exports.create=async(req,res,next)=>{
    const data=req.body;
    data.cart_item_id= uuid.v4();

    try{
          //making sure that user exists
        if(!await User.findOne({email:data.user})){
            return res.status(400).json({'message':"Invalid user email."});
        }

        //add the cart to the user's cart list
         await User.updateOne({email:data.user},{$push:{cart:data}});
         const cartModel=new Cart(data);


        try{
            const savedDoc= await cartModel.save();
            return res.status(201).json(savedDoc);

        }catch(err){
            console.log(err);
            return res.status(400).json({message:err.message})
        }


    }catch(err){
        return next(err);
    }
}

//remove from the cart
exports.delete=async(req,res,next)=>{
    try{
        const cartItemId=req.params.value;
        const deletedCartItem= await Cart.findOneAndDelete({cart_item_id:cartItemId});
        

        if(deletedCartItem){
            const upadteResult= await User.updateOne({
                                                        email:deletedCartItem.user
                                                     },
                                                    {$pull:
                                                        {cart:
                                                            {
                                                                cart_item_id:deletedCartItem.cart_item_id
                                                            }
                                                        }
                                                    });
                                                    


            if(upadteResult.modifiedCount>0){
                return res.status(200).json({'message':"Cart item deleted successfully."});
            }
        }      

        return res.status(404).json({'message':"Invalid cart item id."});

    }catch(err){
        console.log("error",err );

        return res.status(500).json({message:err.message})
    }
}