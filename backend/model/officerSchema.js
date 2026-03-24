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
    },
    department: {
        type: String,
        enum: ["Road Damage", "Garbage", "Streetlight", "Water Leakage", "Other"],
        required: true,
        description: "Category of issues this officer handles"
    },
    complaintsAssigned: {
        type: Number,
        default: 0,
        description: "Total complaints assigned to this officer"
    },
    blocked: {
        type: Boolean,
        default: false,
        description: "Whether the officer is blocked by admin"
    }
}, {timestamps: true}); 

const officer =  mongoose.model("officer", officerSchema);
export default officer;
    