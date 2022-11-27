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


