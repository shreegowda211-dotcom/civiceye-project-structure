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
    // #1 Extract data from request body
    const { name, email, password, confirmPassword } = req.body;

     // #2 Trim values
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim().toLowerCase(); 

     // #3 Check required fields
    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    } 

     // #4 Validate email format
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }  

     // #5 Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match!",
      });
    } 

     // #6 Validate password strength
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long, include 1 uppercase letter, 1 number, and 1 special character (@$!%*?&).",
      });
    } 

    // #7 Check if officer already exists
    const existingOfficer = await officer.findOne({
      email: trimmedEmail,
    });

    if (existingOfficer) {
      return res.status(400).json({
        success: false,
        message: "Officer already exists!",
      });
    }

    // #8 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // #9 Create new officer
    await officer.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role: "Officer",
    });

    // #10 Success response
    return res.status(201).json({
      success: true,
      message: "Officer registered successfully!",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

