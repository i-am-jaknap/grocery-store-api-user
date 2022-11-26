const mongoose=require('mongoose');
const Schema=require('mongoose').Schema;

const cartSchema=new Schema({
    cart_item_id:{
        type:String,
        unique:true,
    },
 
    product:{
        type:String,
        required:[true,"Product name is required."]
    },

    price:{
        type:Number,
        required:[true,"Product price is required."],
    },
    
    image:{
        type:String,
    },

    description:{
        type:String,   
        lowercase: true    
    },
    
    user:{
        type:Schema.Types.String,
        require:[true,'Email is required.'],
        lowercase:true,
        match:[/.+\@.+\..+/, 'Invalid email.'],
        trim:true,
    },

},{versionKey:false});

module.exports= mongoose.model('Cart',cartSchema);