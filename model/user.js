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
    address:{
        type:String,
    },
    orders:{
        type:[{order_id:String,product:String, price:Number, quantity:Number, status:String, image:String, status:String, description:String}],

    },
    cart:{
        type:[{cart_item_id:String,product:String,price:Number,image:String,description:String}],
    }

},{versionKey:false});

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