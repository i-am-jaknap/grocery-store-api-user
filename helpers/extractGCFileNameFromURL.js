module.exports = function getFileName(filename){
    filenameArray=filename.split('/');
    for(let i=0;i<4;i++){
        filenameArray.shift();
    }
   return filenameArray.join('/');
}