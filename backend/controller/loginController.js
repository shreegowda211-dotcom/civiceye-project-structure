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

export const officerLogin = async (req, res) => {
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

    // #3 Find officer by email
    const findOfficer = await officer.findOne({ email: trimmedEmail });

    if (!findOfficer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found",
      });
    }

    // #4 Compare password
    const comparePassword = await bcrypt.compare(password, findOfficer.password);

    if (!comparePassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // #5 Generate JWT token with 1-day expiry
    const token = jwt.sign(
      {
        id: findOfficer._id,
        email: findOfficer.email,
        role: findOfficer.role,
      },
      OFFICER_KEY,
      { expiresIn: "1d" }
    );

    // #6 Send success response with user metadata
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: findOfficer._id,
        email: findOfficer.email,
        name: findOfficer.name || findOfficer.email,
        role: findOfficer.role,
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