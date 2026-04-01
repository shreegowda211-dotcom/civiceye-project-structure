import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const officerSchema = new mongoose.Schema({
    officerId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        set: (v) => (typeof v === 'string' ? v.trim().toUpperCase() : v),
        validate: {
            validator: (v) => /^OFF-\d{4}$/.test(v),
            message: (props) => `${props.value} is not a valid officerId. Expected format: OFF-XXXX (example: OFF-1023).`,
        },
        description: "Unique officer identifier in format OFF-XXXX"
    },
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
    },
    isActive: {
        type: Boolean,
        default: true,
        description: "Officer active status for admin controls"
    }
}, {timestamps: true}); 

// Explicit unique index for officerId (MongoDB uniqueness enforcement)
officerSchema.index({ officerId: 1 }, { unique: true });


// Hash password before saving
officerSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
officerSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const officer = mongoose.model("officer", officerSchema);
export default officer;
    