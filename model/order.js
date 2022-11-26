const mongoose =require('mongoose');
const Schema= mongoose.Schema;

const orderSchema=new Schema({
    order_id:{
        type:String,
        unique:true,
        requred:true
    },
    product:{
        type:String,
        required:[true,"Product name is required."]
    },

    price:{
        type:Number,
        required:[true,"Product price is required."],
    },

    quantity:{
        type:Number,
        required:[true,"Quantity is required."],
    },

    status:{
        type:String,
        required:[true,"Order status is required."],
        lowercase:true,
    },

    image:{
        type:String,
    },

    description:{
        type:String,        
    },

    user:{
        type:Schema.Types.String,
        require:[true,'Email is required.'],
        lowercase:true,
        match:[/.+\@.+\..+/, 'Invalid email.'],
        trim:true,
    }

},{versionKey:false});

orderSchema.pre('save',function(next){
    // console.log('pre save',this);
    next();
})



module.exports=mongoose.model('Order',orderSchema);