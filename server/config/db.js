import mongoose from "mongoose"

const connectDB=async()=>{
   try {
     const conn = await mongoose.connect(process.env.MONGO_URI);
     console.log("Mongo DB connected");
     
     try {
       // Drop all indexes except _id to clear any lingering unique constraints 
       // (Mongoose will automatically rebuild the correct ones defined in the schema)
       await conn.connection.db.collection('attendances').dropIndexes();
       console.log("Cleared old indexes from attendances collection");
     } catch (idxError) {
       console.log("Could not clear indexes - collection might not exist yet");
     }
 
   } catch (error) {
    console.log(error);
    process.exit(1);
    
   }

   
}

export {connectDB}