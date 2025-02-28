const mongoose= require("mongoose");
const connect=mongoose.connect("mongodb://localhost:27017/New_label");


connect.then(()=>{
    console.log("Connected to database successfully");
})
.catch(()=>{
    console.log("Error connecting to database");
});
// create schema
const LoginSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    Mobile_number:{
        type:String,
        required:false,
    },
    Email:{
        type:String,
        required:false,
    },
    password:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:false,
    },
    codeAttempts: { 
        type: Number, 
        default: 0 
    },
    isCodeLocked: { 
        type: Boolean, 
        default: false 
    },

});

// collection


const collection=new mongoose.model("codes",LoginSchema);

module.exports=collection;