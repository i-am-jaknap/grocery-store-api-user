const PickHandler=require('../lib/pick_handler');
const Product = require('../model/product')
const getDeleter=require('../lib/file_deleter');

const  { GOOGLE_CLOUD_PRIVATE_KEY ,GOOGLE_CLOUD_BUCKET_NAME,
    GOOGLE_CLOUD_CLIENT_EMAIL,GOOGLE_CLOUD_PROJECT_ID} = require('../config/vars');


const gcDeleter=getDeleter({ GC_PRIVATE_KEY:GOOGLE_CLOUD_PRIVATE_KEY,
    GC_CLIENT_EMAIL:GOOGLE_CLOUD_CLIENT_EMAIL,
    GC_BUCKET_NAME:GOOGLE_CLOUD_BUCKET_NAME,GC_PROJECT_ID:GOOGLE_CLOUD_PROJECT_ID
});


exports.fetch = async (req,res)=>{

    if(req.params.value){

        const pickHandler= new PickHandler(req.params.value);
        pickHandler
        .add('id',fetchById)
        .last('name',fetchByName);
        
        if(req.query.with){
            try{
                const data= await pickHandler.exec(req.query.with);
                res.json(data);
            }catch(err){
                res.json({'message':err.message});
            }
            return;
        }
        try{
            const data= await pickHandler.exec('id');
            res.json(data);
        }catch(err){
            res.json({'message':err.message});
        }
    }else{
        try{
            const products=await fetchAll({start:req.query.start, perPage:req.query.perPage});
            res.json(products);
        }catch(err){
            res.status(500).json(err);
        }
    }
    
}

exports.create= async (req,res,next)=>{
    const data=JSON.parse(req.body);

    try{
        const productModel=new Product(data);
        try{
            const savedDoc= await productModel.save();
            res.json(savedDoc);
        }catch(err){

            try{
                gcDeleter(data.images);
            }catch(err){
                console.log(err)
            }

            res.status(400).json({message:err.message})
        }
    }catch(err){
        next(err);
    }


}

exports.update=  async (req,res)=>{
    const pickHandler= new PickHandler({req:req, param:req.params.value});
    pickHandler
    .add('id',updateById)
    .last('name',updateByName);

    if(req.query.with){
        try{
           const data=await pickHandler.exec(req.query.with);
           res.json(data);
        }catch(err){
            res.status(400).json(err)
        }
    }
    try{
        const data=await pickHandler.exec('id');
        res.json(data);
     }catch(err){
         res.status(400).json(err);
     }
}

exports.delete= async (req,res)=>{
    const pickHandler= new PickHandler({req:req, param:req.params.value});

    pickHandler
    .add('id',deleteById)
    .last('name',deleteByName);

    if(req.query.with){

        try{
            await pickHandler.exec(req.query.with);
            res.json({'Message':`Product with id ${req.params.value} deleted successfully.`});
        }catch(err){
            res.json(err);
        } 
        return;  
    }

    try{
        await pickHandler.exec('id');
        res.json({'Message':`Product with id ${req.params.value} deleted successfully.`});
    }catch(err){
        res.json(err);
    }   
}

//#region  update 
    async function updateById(){
        const data=JSON.parse(this.parameters.req.body)
        if(data.images){
            try{
                const product=await Product.findById(this.parameters.param);
                if(product)
                    await gcDeleter(product.images);
                else
                    throw {message:'No product found with given id.'}
               
            }catch(err){
                console.log(err);
                throw err;
            }
        };

        return Product.findByIdAndUpdate({_id:this.parameters.param},data,{new:true,runValidators:true});
    }

    function updateByName(){
        return this.parameters;
    }
    
//#endregion


//#region  fetch

    function fetchById(){
        return   Product.find({_id:this.parameters})
    }

    function fetchByName(){
        return   Product.find({name:new RegExp(this.parameters,'i')});
    }


const fetchAll= async (options)=>{
    try{

        let perPage=parseInt( options.perPage || 0) || 10;
        let start=parseInt( options.start || 0) || 1;
        
        //if per page and start page is less than or equal to 0
        start=start <=0 ? 1 : start;
        perPage <= 0 ? 10 : perPage;


       return Product.find().limit(perPage).skip(start);       
    }catch(err){
        console.log(err);
       throw err;
    }
}

//#endregion


//#region  delete

    async function deleteById(){
            try{
                const product=await Product.findById(this.parameters.param);

                if(product.images){
                    await gcDeleter(product.images);
                }
           
           }catch(err){
                console.log(err);
                throw err;
            }
            return Product.deleteOne({_id:this.parameters.param});
        }

    

    function deleteByName(){
        return this.parameters;
    }
//#endregion

