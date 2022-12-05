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



exports.connectDB = async () => {
    try {
      const conn = await mongoose.connect(mongo.uri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }

//Connect to the database before listening
// connectDB().then(() => {
//     app.listen(PORT, () => {
//         console.log("listening for requests");
//     })
// })

// mongoose.connect(mongo.uri)
//     .then(()=>{
//         console.log('MongoDB connected successfully.',mongo.uri);
//     }).catch(err=>{
//         console.log('Error connecting the database.\n',err.message)
//     })

// exports.connect=()=>{
//     return mongoose.connection;
// }

