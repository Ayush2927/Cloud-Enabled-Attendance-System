import mongoose from "mongoose"

const connectDB=async()=>{
   try {
     const conn = await mongoose.connect(process.env.MONGO_URI);
     console.log("Mongo DB connected");
     
     try {
       await conn.connection.db.collection('attendances').dropIndex('user_1_date_1');
       console.log("Dropped problematic index user_1_date_1");
     } catch (idxError) {
       // Ignore if index doesn't exist
       console.log("Index user_1_date_1 might not exist or already dropped");
     }
 
   } catch (error) {
    console.log(error);
    process.exit(1);
    
   }

   
}

export {connectDB}