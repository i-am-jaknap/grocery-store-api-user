const busboy=require('busboy');
const path=require('path');
const fs=require('fs');
const {v4}  =require('uuid')
const {Storage}=require('@google-cloud/storage');


//global configuration object
let config={}; 

//upload on google cloud storage
 async function getGoogleCloudFileReference(GC_PROJECT_ID,GC_PRIVATE_KEY, GC_CLIENT_EMAIL , GC_BUCKET_NAME,FOLDER_NAME,FILE_NAME){
   //storage ,file and bucket variable
    let storage,bucket,file;

    //creating an instance of google cloud storage 
    storage= new Storage({projectId:GC_PROJECT_ID,credentials:{
        client_email:GC_CLIENT_EMAIL,
        private_key:GC_PRIVATE_KEY
    }});

    //getting hold of storage bucket
    bucket=storage.bucket(GC_BUCKET_NAME);
        
    //checking if folder is given  
    if(FOLDER_NAME){
        file=bucket.file(`${FOLDER_NAME}/${FILE_NAME}`).createWriteStream();
    }

    //if folder doesn't exists then just create file
    else{
        file=bucket.file(FILE_NAME).createWriteStream();
    }

    //returning the obtained file reference in the form of write stream
    return file;
}



//upload the file in local storage
//PATH is the folder in which file to be created and file_name is the actual file name to be created
//returns an write stream of the created file 
 async function getLocalFileReference(PATH,FILE_NAME){
    let file;

    //checking if the folder already exists
    if(fs.existsSync(PATH)){
        file=fs.createWriteStream(path.join(PATH,FILE_NAME));

    //if doesn't exist then 
    }else{        
        try{
            //create a folder in the current path
            fs.mkdirSync('uploads');
            console.log('Creating uploads directory.....');
        }catch(err){
            //show the error if already exists
            console.log(err.message)
        }finally{
            //now create the stream based on the path nad file name
            file= fs.createWriteStream(path.join(__dirname,'uploads',FILE_NAME));
        }
        //handling the error event of the stream
        file.on('error',(err)=>{
            console.log(err.message)
            throw err;
        })
    }

    // returning the stream
    return file;
}



//exporting this function which in turn returns the middleware
module.exports=function onRequest(cnf){
    config=cnf;
    return mw;
}

//now creating the middleware method
function mw(req,res,next){
   
    //global error object
    let error=undefined;
    //creating the formdata variable to collect the fields including the file names
    const formdata={};

    //creating the instance of the busboy based on the headers of the request
    const bb=busboy({headers:req.headers});

    //creating the global stream reference 
    let streamRef;


   bb.on('file', async (name,file,info)=>{


        //getting the file name if it exists in the config 
        //or else generating a uniue uuid as a file name and setting the extension name
        let fileName=config.FILENAME || v4() + '.' + info.filename.split('.').pop();

        console.log('uploading',fileName);


        //creating the fileURL  based on the type of storage preference
        let fileURL;


        if(config.STORAGE==='google-cloud'){
            //generting the url for google cloud
            fileURL=config.FOLDER_NAME ?
                    `https://storage.googleapis.com/${config.GC_BUCKET_NAME}/${config.FOLDER_NAME}/${fileName}`
                 : `https://storage.googleapis.com/${config.GC_BUCKET_NAME}/${fileName}`;

            //getting the new stream reference based on the file name from google cloud
            streamRef=  await getGoogleCloudFileReference(config.GC_PROJECT_ID, config.GC_PRIVATE_KEY, config.GC_CLIENT_EMAIL, config.GC_BUCKET_NAME, config.FOLDER_NAME,fileName);
         
            // handling error
             streamRef.on('error',err=>{
                    // res.status(500).json({message:err.message});
                    return next(err);
            });

            

        }else if (config.STORAGE === 'local' ){

            //genereating the url for local storage 
            fileURL=fs.existsSync(config.PATH) 
            ? `${config.PATH || ''}/${fileName}` 
            :`./uploads/${fileName}`;

            //getting the new stream reference based on the file name from local storage
            streamRef= await getLocalFileReference(config.PATH,fileName);

            //handling error
            streamRef.on('error',err=>{
                // res.json({message:err.message})
                return next(err);
            })

            streamRef.on('finish',()=>{
                console.log("uploaded")
            })

        }    

       
        
        //uploading the file to intended location
        file.pipe(streamRef);
        
       
        //setting the form data value 
        //which to be passed further
        if(formdata[name]){
            if(Array.isArray(formdata[name]))
                formdata[name]=[...formdata[name],fileURL]
            else
                formdata[name]=Array(formdata[name],fileURL);
        }
        else {
            formdata[name]=fileURL;
        }
    })


    //getting the normal fields
    bb.on('field',(name,value,info)=>{

        //checking if field already available if so then make it an array
        if(formdata[name]){
            if(Array.isArray(formdata[name]))
                formdata[name]=[...formdata[name],value]
            else
                formdata[name]=Array(formdata[name],value);
        }
        else {
            formdata[name]=value;
        }
    })

    //handling the error events
    bb.on('error',(err)=>{
            //if error send the error as response
            // res.status(500).json({message:err.message});
            return next(err);       
        
    })

    //handling the close event of the busboy 
    bb.on('close',()=>{

        //at the end resetting the body of the request 
        req.body=JSON.stringify(formdata);

        //resetting the content type of the request to application/json
        req.headers['content-type']='application/json';

       //let the request go further ahead
       return  next();
        
    })


    //piping the request to the busboy instance 
    req.pipe(bb);
    
}
