const httpCors=require('cors');
const bodyParsers=require('body-parser');

const cors=httpCors();
const jsonBodyParser=bodyParsers.json();
const urlParser=bodyParsers.urlencoded({extended:true});


module.exports=()=>{
    return [
        cors,
        urlParser,
        jsonBodyParser
    ];
}