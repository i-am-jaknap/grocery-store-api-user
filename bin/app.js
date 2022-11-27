const express=require('express');
const middlewares=require('../middleware/index');
const {port}=require('../config/vars');
const routes=require("../routes/index");
const morgan= require('morgan');



const app=express();


//adding the morgan logger
app.use(morgan('short'));

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

   