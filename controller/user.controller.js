const {Router}=require('express');
const User=require('../model/user');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');


const router=Router();

exports.signup= async(req,res)=>{

    const user=req.body;

    try{

        //check if email is already registered
        const oldUser=await User.findOne({email:user.email});
        if(oldUser){
            return res.status(409).json({message:'User already exist. Please login.'})
        }

        //if not then create a new user with the given data
        const newUser=new User({... user})
        await newUser.save();
        console.log('login');
        return res.sendStatus(201);

    }catch(err){
        let errors={};
        console.log(err.message);
        for(let e in err.errors){
            errors[e]=err.errors[e].message;
        }
       return  res.status(400).json(errors);
    }   
}

exports.signin=async (req,res)=>{

    if(!(req.body.email && req.body.password)){
        return res.status(401).json({message:"Email and password are required."});
    }

    //
    const user=await User.findOne({email:req.body.email});

    if(!user){
        return res.status(401).json({message:"Email or password is wrong."});
    }

    //check if user's status
    if(!user.status){
        return res.status(401).json({message:"User is not active."});
    }

    //check if password matches
    if(!await bcrypt.compare(req.body.password, user.password)){
        return res.status(401).json({message:"Email or password is wrong."});
    }

    //creating a new jwt token
   const token= jwt.sign(
        { user_id:user._id,email:user.email},
        process.env.SECRET_KEY,
        {
            expiresIn:'30d',
        });

    res.status(201).json({token})
}

exports.fetch=async (req,res)=>{
    const email=req.params.value;
    try{
        const user= await User.findOne({email:email},{orders:0,cart:0}).select({createdAt:0,updatedAt:0});
        if(user){
          return res.status(200).json(user);
        }

        return res.status(404).json({message:"Invalid email"});

    }catch(err){
        return res.status(500).json({message:'Something went wrong.'})
    }
}