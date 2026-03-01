import express from 'express';
import cors from 'cors';
import connectToDB from './db.js';
import citizenRouter from './router/citizenRouter.js';

const app = express();
app.use(express.json())
app.use(cors())
connectToDB();

app.use("/api", citizenRouter);

// app.use("/uploads", express.static("uploads")) //access uploaded file in frontend 

const PORT = 7000;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})
