import officer from "../model/officerSchema.js";
import bcrypt from "bcrypt";

 // 📧 Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

 // 🔑 Password validation regex
// Must contain:
// - Minimum 8 characters
// - At least 1 uppercase letter
// - At least 1 number
// - At least 1 special character
const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; 


// ===============================
// 📝 Officer Register Controller
// ===============================

export const officerRegister = async (req, res) => {
  try {
    console.log("\n📝 OFFICER REGISTRATION STARTED");
    const { name, email, password, confirmPassword, department } = req.body;
    console.log("✅ Received body:", { name, email, department, hasPassword: !!password });

    // Trim values
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim().toLowerCase();
    console.log("✅ Trimmed values:", { trimmedName, trimmedEmail });

    // Check required fields
    if (!trimmedName || !trimmedEmail || !password || !confirmPassword || !department) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "All fields including department are required",
      });
    }

    // Validate department
    const validDepartments = ["Road Damage", "Garbage", "Streetlight", "Water Leakage", "Other"];
    console.log("✅ Validating department:", department);
    console.log("   Valid departments:", validDepartments);
    console.log("   Is valid:", validDepartments.includes(department));
    
    if (!validDepartments.includes(department)) {
      console.log("❌ Invalid department provided");
      return res.status(400).json({
        success: false,
        message: "Invalid department. Choose from: " + validDepartments.join(", "),
      });
    }
    console.log("✅ Department validation passed");

    // Validate email format
    console.log("✅ Validating email format");
    if (!emailRegex.test(trimmedEmail)) {
      console.log("❌ Invalid email format");
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }
    console.log("✅ Email validation passed");

    // Check password match
    console.log("✅ Checking if passwords match");
    if (password !== confirmPassword) {
      console.log("❌ Passwords do not match");
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match!",
      });
    }
    console.log("✅ Password match validation passed");

    // Validate password strength
    console.log("✅ Validating password strength");
    if (!passwordRegex.test(password)) {
      console.log("❌ Password does not meet strength requirements");
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long, include 1 uppercase letter, 1 number, and 1 special character (@$!%*?&).",
      });
    }
    console.log("✅ Password strength validation passed");

    // Check if officer already exists
    console.log("✅ Checking if officer already exists with email:", trimmedEmail);
    const existingOfficer = await officer.findOne({
      email: trimmedEmail,
    });

    if (existingOfficer) {
      console.log("❌ Officer already exists with this email");
      return res.status(400).json({
        success: false,
        message: "Officer already exists!",
      });
    }
    console.log("✅ No existing officer with this email");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed successfully");

    // Create new officer with department
    console.log("📝 About to create officer with:", {
      name: trimmedName,
      email: trimmedEmail,
      department: department,
      role: "Officer"
    });
    
    const newOfficer = await officer.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role: "Officer",
      department: department
    });
    
    console.log("✅ Officer created successfully:", newOfficer._id);

    // Success response
    console.log("\n✅ OFFICER REGISTRATION COMPLETED SUCCESSFULLY\n");
    return res.status(201).json({
      success: true,
      message: "Officer registered successfully!",
    });

  } catch (error) {
    console.error("\n❌ OFFICER REGISTRATION ERROR");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error name:", error.name);
    console.error("Full error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      console.log("⚠️ Duplicate key error - email already exists");
      return res.status(400).json({
        success: false,
        message: "Email already registered!",
      });
    }

    // Handle MongoDB validation error
    if (error.name === "ValidationError") {
      console.log("⚠️ Validation error from Mongoose");
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation error: " + messages.join(", "),
      });
    }

    console.log("⚠️ Generic server error");
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

