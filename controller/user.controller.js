const {Router}=require('express');
const User=require('../model/user');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const getDeleter=require('../lib/file_deleter');



const  { GOOGLE_CLOUD_PRIVATE_KEY ,GOOGLE_CLOUD_BUCKET_NAME,
    GOOGLE_CLOUD_CLIENT_EMAIL,GOOGLE_CLOUD_PROJECT_ID} = require('../config/vars');


const gcDeleter=getDeleter({ GC_PRIVATE_KEY:GOOGLE_CLOUD_PRIVATE_KEY,
    GC_CLIENT_EMAIL:GOOGLE_CLOUD_CLIENT_EMAIL,
    GC_BUCKET_NAME:GOOGLE_CLOUD_BUCKET_NAME,GC_PROJECT_ID:GOOGLE_CLOUD_PROJECT_ID
});


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
        return res.status(201).json({message:"Signed up successfully."});

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

exports.updateProfilePic=async(req,res)=>{
    const data=JSON.parse(req.body);
    const email=req.params.email;
 
    try{
        //checking if email is provided by the user
        if(!email){
            return res.status(400).json({message:"Email is required."})
        }

        //checking if image is provided by user
        if(data.profile_pic){

           //checkig if user is valid
           const user=await User.findOne({email:email});
           if(!user){
            return res.status(404).json({message:"Invalid user email"});
           }
           console.log(user);

           const updateResult=await User.updateOne({email:email},{$set:{profile_pic:data.profile_pic}});

           if(updateResult.modifiedCount > 0){
                if(user.profile_pic){
                    gcDeleter(user.profile_pic)
                }
                return res.status(200).json({message:"Profile picture updated successfully."})
           }

            
        }else{
            return res.status(400).json({message:"Profile pic is required"});
        }
       
    }catch(e){
        console.log(e)
        return res.status(500).status({message:"Something went wrong."})
    }
}