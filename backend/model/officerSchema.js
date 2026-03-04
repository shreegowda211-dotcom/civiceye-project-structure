import mongoose from 'mongoose';

const officerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,     
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["Citizen", "Officer", "Admin"],
        required: true,
        default: "Officer"
    }
}, {timestamps: true}); 

const officer =  mongoose.model("officer", officerSchema);
export default officer;
    