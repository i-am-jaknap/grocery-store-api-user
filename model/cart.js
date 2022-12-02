const mongoose=require('mongoose');
const Schema=require('mongoose').Schema;

const cartSchema=new Schema({
    cart_item_id:{
        type:String,
        unique:true,
    },
    product_id:{
        type:String,
        required:[true,"Product id is required."]
    },
 
    product:{
        type:String,
        required:[true,"Product name is required."]
    },

    rate:{
        type:Number,
        required:[true,"Product price is required."],
    },

    quantity:{
        type:Number,
        required:[true,"Quantity is required."]
    },
    
    image:{
        type:String,
    },

    user:{
        type:Schema.Types.String,
        require:[true,'Email is required.'],
        lowercase:true,
        match:[/.+\@.+\..+/, 'Invalid email.'],
        trim:true,
    },

},{versionKey:false,timestamps:true});

module.exports= mongoose.model('Cart',cartSchema);