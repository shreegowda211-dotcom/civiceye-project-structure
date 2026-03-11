import citizen from "../model/citizenScheme.js";
import officer from "../model/officerSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CITIZEN_KEY, OFFICER_KEY, ADMIN_KEY, ADMIN_EMAIL, ADMIN_PASSWORD } from "../config.js";

// pre-hash default admin password for comparisons
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

export const citizenLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // #1 Trim and lowercase email
    const trimmedEmail = email?.trim().toLowerCase();

    // #2 Check required fields
    if (!trimmedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // #3 Find citizen by email
    const findCitizen = await citizen.findOne({ email: trimmedEmail });

    if (!findCitizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    // #4 Compare password
    const comparePassword = await bcrypt.compare(password, findCitizen.password);

    if (!comparePassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // #5 Generate JWT token with 1-day expiry
    const token = jwt.sign(
      {
        id: findCitizen._id,
        email: findCitizen.email,
        role: findCitizen.role,
      },
      CITIZEN_KEY,
      { expiresIn: "1d" }
    );

    // #6 Send success response with user metadata
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: findCitizen._id,
        email: findCitizen.email,
        name: findCitizen.name || findCitizen.email,
        role: findCitizen.role,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const getProfile = async (req, res) => {
    try {
        const citizenID = req.citizen.id;
        const findCitizen = await citizen.findById(citizenID).select("-password");
        if (!findCitizen) {
            return res.status(404).json({
                success: false,
                message: "Citizen not found!"
            });
        }
        res.status(200).json({
            success: true,
            message: "Citizen profile found!",
            data: findCitizen,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}

// ===============================
// 📝 Officer Login Controller
// ===============================

const OFFICER_DEFAULTS = {
  "road@example1.com": { department: "Road Damage", password: "Road@example1" },
  "garbage@example1.com": { department: "Garbage", password: "Garbage@example1" },
  "streetlight@example1.com": { department: "Streetlight", password: "Streetlight@example1" },
  "water@example1.com": { department: "Water Leakage", password: "Water@example1" },
  "other@example1.com": { department: "Other", password: "Other@example1" },
};

export const officerLogin = async (req, res) => {
  try {
    console.log("\n👮 OFFICER LOGIN ATTEMPT");
    const { email, password, department } = req.body;
    console.log("   📧 Email received:", email);
    console.log("   🔑 Password received:", password ? "YES (length: " + password.length + ")" : "NO");
    console.log("   🏷 Department received:", department);

    // #1 Trim and lowercase email
    const trimmedEmail = email?.trim().toLowerCase();
    console.log("   📧 Trimmed email:", trimmedEmail);

    // #2 Check required fields
    if (!trimmedEmail || !password) {
      console.log("   ❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // #3 Find officer by email
    console.log("   🔍 Searching for officer with email:", trimmedEmail);
    let findOfficer = await officer.findOne({ email: trimmedEmail });

    if (!findOfficer) {
      console.log("   ⚠️ Officer not found in database. Checking default officer credentials.");
      const defaultOfficer = OFFICER_DEFAULTS[trimmedEmail];
      console.log("   🔎 Default officer record for this email:", defaultOfficer);

      if (defaultOfficer && defaultOfficer.password === password) {
        if (department && department !== defaultOfficer.department) {
          return res.status(400).json({
            success: false,
            message: "Department mismatch for this default officer",
          });
        }

        const createdOfficer = await officer.create({
          name: `${defaultOfficer.department} Officer`,
          email: trimmedEmail,
          password: await bcrypt.hash(password, 10),
          role: "Officer",
          department: defaultOfficer.department,
        });

        findOfficer = createdOfficer;
        console.log("   ✅ Default officer account created for login:", trimmedEmail);
      } else {
        console.log("   ❌ Officer not found and no matching default credentials");
        return res.status(404).json({
          success: false,
          message: "Officer not found",
        });
      }
    }

    console.log("   ✅ Officer found:", findOfficer._id);
    console.log("   📝 Officer name:", findOfficer.name);
    console.log("   🏢 Officer department:", findOfficer.department);

    // #4 If default account used in-memory created, compare directly
    console.log("   🔐 Comparing passwords...");
    console.log("   📝 Stored hash length:", findOfficer.password ? findOfficer.password.length : "NO HASH");
    const comparePassword = await bcrypt.compare(password, findOfficer.password);
    console.log("   ✅ Password comparison result:", comparePassword);

    if (!comparePassword) {
      console.log("   ❌ PASSWORD MISMATCH - Login failed");
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
    console.log("   ✅ Password matched successfully");

    // #5 Generate JWT token with 1-day expiry
    console.log("   🔑 Generating JWT token...");
    const token = jwt.sign(
      {
        id: findOfficer._id,
        email: findOfficer.email,
        role: findOfficer.role,
      },
      OFFICER_KEY,
      { expiresIn: "1d" }
    );
    console.log("   ✅ Token generated successfully");

    // #6 Send success response with user metadata and department
    console.log("   ✅ OFFICER LOGIN COMPLETED SUCCESSFULLY\n");
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: findOfficer._id,
        email: findOfficer.email,
        name: findOfficer.name || findOfficer.email,
        role: findOfficer.role,
        department: findOfficer.department,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const getOfficerProfile = async (req, res) => {
    try {
        const officerID = req.officer.id;
        const findOfficer = await officer.findById(officerID).select("-password");
        if (!findOfficer) {
            return res.status(404).json({
                success: false,
                message: "Officer not found!"
            });
        }
        res.status(200).json({
            success: true,
            message: "Officer profile found!",
            data: findOfficer,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}

// ===============================
// 🛡️ Admin Login Controller
// ===============================

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // #1 Trim and lowercase email
    const trimmedEmail = email?.trim().toLowerCase();

    // #2 Check required fields
    if (!trimmedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // #3 Validate against default credentials
    if (trimmedEmail !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const comparePassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!comparePassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // #4 Generate admin JWT token
    const token = jwt.sign(
      {
        id: "admin", // static id
        email: ADMIN_EMAIL,
        role: "Admin",
      },
      ADMIN_KEY,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      user: {
        id: "admin",
        email: ADMIN_EMAIL,
        role: "Admin",
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const getAdminProfile = async (req, res) => {
  // since admin is static we just return default info
  try {
    res.status(200).json({
      success: true,
      message: "Admin profile found!",
      data: {
        id: "admin",
        email: ADMIN_EMAIL,
        role: "Admin",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// 👥 Get All Users (Citizens)
// ===============================

export const getAllCitizens = async (req, res) => {
  try {
    const citizens = await citizen.find({}).select("-password");
    res.status(200).json({
      success: true,
      message: "All citizens fetched successfully",
      data: citizens,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching citizens",
    });
  }
};

// ===============================
// 👮 Get All Officers
// ===============================

export const getAllOfficers = async (req, res) => {
  try {
    const officers = await officer.find({}).select("-password");
    res.status(200).json({
      success: true,
      message: "All officers fetched successfully",
      data: officers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching officers",
    });
  }
};

// ===============================
// ➕ Create Officer (By Admin)
// ===============================

export const createOfficer = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // #1 Validate required fields
    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, password, department) are required",
      });
    }

    // #2 Trim and lowercase email
    const trimmedEmail = email.trim().toLowerCase();

    // #3 Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // #4 Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // #5 Validate department
    const validDepartments = ["Road Damage", "Garbage", "Streetlight", "Water Leakage", "Other"];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department. Must be one of: " + validDepartments.join(", "),
      });
    }

    // #6 Check if officer with this email already exists
    const existingOfficer = await officer.findOne({ email: trimmedEmail });
    if (existingOfficer) {
      return res.status(409).json({
        success: false,
        message: "Officer with this email already exists",
      });
    }

    // #7 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // #8 Create new officer
    const newOfficer = await officer.create({
      name,
      email: trimmedEmail,
      password: hashedPassword,
      role: "Officer",
      department,
    });

    // #9 Return response without password
    const officerData = newOfficer.toObject();
    delete officerData.password;

    res.status(201).json({
      success: true,
      message: "Officer created successfully",
      data: officerData,
    });

  } catch (error) {
    console.error("Error creating officer:", error);
    res.status(500).json({
      success: false,
      message: "Error creating officer. Please try again later.",
    });
  }
};