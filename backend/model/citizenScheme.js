import mongoose from 'mongoose';

const citizenSchema = new mongoose.Schema({
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
        default: "Citizen"
    }
}, {timestamps: true}); 

const citizen =  mongoose.model("citizen", citizenSchema);
export default citizen;
    