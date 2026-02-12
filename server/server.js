import express from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";


dotenv.config();
connectDB();

const app=express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.get("/",(req,res)=>{
    res.send("API is running");
})

//error handler middleware

app.use((err,req,res,next)=>{
    const statusCode=err.statusCode || 500;

    res.status(statusCode)
    .json({
        success:false,
        message:err.message || "Internal server error",
        errors:err.errors || []
    })
});

app.listen(5000,()=>{
    console.log("server running on PORT:", process.env.PORT || 5000)
})
