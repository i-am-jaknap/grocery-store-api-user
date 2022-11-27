const mongoose=require('mongoose');
const {mongo}=require('./vars')


mongoose.connection.on('erorr',(err)=>{
    console.log('Error: mongodb connection error.');
})

mongoose.connection.on('disconnecting',()=>{
    console.log("Database is disconnecting.");
});

mongoose.connection.on('connecting',()=>{
    console.log("Connecting to the database.");
});


mongoose.connect(mongo.uri)
    .then(()=>{
        console.log('MongoDB connected successfully.',mongo.uri);
    }).catch(err=>{
        console.log('Error connecting the database.\n',err.message)
    })

exports.connect=()=>{
    return mongoose.connection;
}

