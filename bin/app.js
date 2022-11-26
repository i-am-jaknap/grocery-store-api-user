const express=require('express');
const middlewares=require('../middleware/index');
const {port}=require('../config/vars');
const routes=require("../routes/index");




const app=express();


   
app.use(middlewares());
app.use(routes);

module.exports=startServer=()=>new Promise((resolve,reject)=>{
    app.listen(port,()=>{
        console.log(`Server is started on port ${port}.`);
        resolve();
    }).on('error',(err)=>{
        reject(err);
    })
})

   