const path=require('path');
require('dotenv').config();


module.exports={
    env:process.env.NODE_ENV,
    port:process.env.PORT,
    mongo:{
        uri: process.env.NODE_ENV === 'test' ? 
            process.env.MONGO_URI_TEST : process.env.MONGO_URI,
   },
   APPLICATION_ROOT:path.join(__dirname + '/..'),

   GOOGLE_CLOUD_PRIVATE_KEY:process.env.GOOGLE_CLOUD_PRIVATE_KEY || '',
   GOOGLE_CLOUD_PROJECT_ID:process.env.GOOGLE_CLOUD_PROJECT_ID || '',
   GOOGLE_CLOUD_CLIENT_EMAIL:process.env.GOOGLE_CLOUD_CLIENT_EMAIL || '',
   GOOGLE_CLOUD_BUCKET_NAME:process.env.GOOGLE_CLOUD_BUCKET_NAME || '',
}
