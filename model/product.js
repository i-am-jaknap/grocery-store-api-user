const mongoose = require('mongoose');
const Schema= mongoose.Schema;
const uuid=require('uuid');


const productSchema= new Schema({

    product_id:{
        type:String,
        unique:true
    },

    name:{
        type:String,
        required:[true,'Product name is required.']
    },
    rate:{
        type:Schema.Types.Number,
        required:[true,'Price is required.']
    },
    stock:{
        type:Schema.Types.Number,
        required:[true,'Quantity is required.']

    },
    unit:{
        type:Schema.Types.String,
        required:[true,'Unit of measurement is required.']

    },
    category:{
        type:Schema.Types.Array ,
        validate:{
            validator:function(value){
                return value.length >0;
         },
         message:'Product category is required.',
        } 
    },
    description:{
        type:String,
        required:[true,"Product description is required."],
        trim:true
    },

    images:Schema.Types.Array || String,

},{versionKey:false,timestamps:true});

const Product=mongoose.model('Product',productSchema);


module.exports=Product;