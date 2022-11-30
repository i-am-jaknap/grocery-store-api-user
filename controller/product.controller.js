const PickHandler=require('../lib/pick_handler');
const Product = require('../model/product')


exports.fetch = async (req,res)=>{

    if(req.params.value){

        const pickHandler= new PickHandler(req.params.value);
        pickHandler
        .add('id',fetchById)
        .last('name',fetchByName);
        
        if(req.query.with){
            try{
                const data= await pickHandler.exec(req.query.with);

                if(data.length<=0){
                    return res.sendStatus(404);
                }
                res.json(data);
            }catch(err){
                res.status(400).json({'message':err.message});
            }
            return;
        }
        try{
            const data= await pickHandler.exec('id');
            if(data.length<=0){
                return res.sendStatus(404);
            }
            return res.json(data);
        }catch(err){
           return  res.json({'message':err.message});
        }
    }else{
        try{
            const products=await fetchAll({start:req.query.start, perPage:req.query.perPage});
            return res.json(products);
        }catch(err){
           return  res.status(500).json(err);
        }
    }
    
}


//#region  fetch

    function fetchById(){
        return   Product.find({product_id:this.parameters})
                        .sort({createdAt:-1,updatedAt:-1})
                        .select({createdAt:0,updatedAt:0,_id:0});
    }

    function fetchByName(){
        return   Product.find({name:new RegExp(this.parameters,'i')})
                         .sort({createdAt:-1,updatedAt:-1})
                         .select({createdAt:0,updatedAt:0,_id:0});
    }


const fetchAll= async (options)=>{
    try{

        let perPage=parseInt( options.perPage || 0) || 10;
        let start=parseInt( options.start || 0);
        
        //if per page and start page is less than or equal to 0
        start=start <=0 ? 1 : start;
        perPage <= 0 ? 10 : perPage;


       return Product.find()
                     .sort({createdAt:-1,updatedAt:-1})
                     .select({createdAt:0,updatedAt:0,_id:0})
                     .limit(perPage).skip(start); 

    }catch(err){
        console.log(err);
       throw err;
    }
}

//#endregion


