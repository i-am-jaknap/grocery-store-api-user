const {Storage}=require('@google-cloud/storage');


//global configuration object
let config={};

module.exports=function setupDelete(cnf){
   config=cnf;
   return getDelete;
}


function getDelete(FILES){
  return deleteFile(FILES);
}

function deleteFile(FILES){

      if(FILES){
         console.log(FILES);

         let storage,bucket; 

         storage= new Storage({projectId: config.GC_PROJECT_ID,credentials:{
            client_email:config.GC_CLIENT_EMAIL,
            private_key:config.GC_PRIVATE_KEY, 
      }});
      bucket=storage.bucket(config.GC_BUCKET_NAME);
   
      if(Array.isArray(FILES)){
         const promises=[];

         return new Promise((resolve,reject)=>{

            setInterval(()=>{
               for(let file of FILES){
                  promises.push(bucket.file(getGCFilenameFromURL(file)).delete());
               }
         
               Promise.all(promises)
                  .then(data=>{
                     resolve( {'status':200,'message':'File deleted successfully.'});
                  }).
                  catch(err=>{
                     reject({'Error':{'code':err.code,'message':err.message}});
                  });
               },10000);
         });
         
   
      }else{
         return  new Promise((resolve,reject)=>{

            setInterval(()=>{
               const deleteFile=bucket.file(getGCFilenameFromURL(FILES)).delete();

               deleteFile.then(data=>{
                  resolve({code:200,message:'File deleted successfully.'});
               })
      
               deleteFile.catch(err=>{
                  reject({'Error':{'code':err.code,'message':err.message}});
               });
            },10000);
         
         })     
      }  
      } else{
         return new Promise((reject,resolve));
      }
   
}
         
 


function getGCFilenameFromURL(filename){
   filenameArray=filename.split('/');
   for(let i=0;i<4;i++){
       filenameArray.shift();
   }
  return filenameArray.join('/');
}