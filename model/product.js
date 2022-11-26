const mongoose = require('mongoose');
const Schema= mongoose.Schema;

const productSchema= new Schema({
    name:{
        type:String,
        required:[true,'Product name is required.']
    },
    price:{
        type:Schema.Types.Number,
        required:[true,'Price is required.']
    },
    quantity:{
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
    images:Schema.Types.Array || String,

},{versionKey:false});

const Product=mongoose.model('Product',productSchema);


module.exports=Product;