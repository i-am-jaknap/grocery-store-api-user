module.exports=class PickHandler
{
    constructor(parameters){
        this.parameters=parameters;
        this.functions=new Map();
    }

    add(name,value){
        this.functions.set(name,value.bind(this));
        return this;
    }

    last(name,value){
        this.functions.set(name,value.bind(this));
    }

    exec(name){
        if( this.functions.get(name)){
            if(this.parameters){
                return this.functions.get(name).call(this.parameters);
            }
            throw new Error("Please provide some parameters.");
        };
        throw new Error('Invalid handler name.')
    }
}