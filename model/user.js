const mongoose =require('mongoose');
const bcrypt=require('bcrypt')
const Product=require('./product')


const Schema = mongoose.Schema;



const userSchema=new Schema({
    firstname:{
        type:String,
        require:[true,'First name is required.'],
        lowercase:true,
        trim:true,
    },
    lastname:{
        type:String,
        require:[true,'Last name is required.'],
        lowercase:true,
        trim:true,
    },
    email:{
        type:Schema.Types.String,
        require:[true,'Email is required.'],
        unique:true,
        lowercase:true,
        match:[/.+\@.+\..+/, 'Invalid email.'],
        trim:true,
    },
    password:{
        type:String,
        minLength:[8,'Password should be at least 8 letters long.'],
        maxLength:[30,'Password should be at most 30 letters long'],
        required:[true,'Password is required.'],
    },
    profile_pic:{
        type:String,
        default:'',
    },
    status:{
        type:Boolean,
        default:true,
    },
    
    address:{
        type:String,
    },
    orders:{
        type:[ new Schema
                ({  order_id:String,

                    products:[new Schema({
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
                            required:[true,"Product rate is required."],
                        },
            
                        quantity:{
                            type:Number,
                            required:[true,"Quantity is required."],
                        },
            
                        image:{
                            type:String,
                        },
                    },{versionKey:false})],
                    status:String, 

                },
                {versionKey:false,timestamps:true})
            ],

    },
    cart:{
        type:[
                new Schema
                ({  cart_item_id:String,
                    product_id:String,
                    product:String,
                    rate:Number,
                    quantity:Number,
                    image:String,
                },
                {versionKey:false,timestamps:true})
            
        ],
    }

},{versionKey:false,timestamps:true});

userSchema.pre('save',  function(next){

    if(!this.isModified('password')){
        return next();
    } 
    const user = this;

    bcrypt.genSalt(10, async function(err, salt){
        if (err){ return next(err) }

        try{
            const hash= await bcrypt.hash(user.password, salt);
            user.password = hash;
            return  next();
        }catch(err){
            return next(err)
        }
    })
})

module.exports=mongoose.model('User',userSchema);