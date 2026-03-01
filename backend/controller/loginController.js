import citizen from "../model/citizenScheme.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CITIZEN_KEY } from "../config.js";

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

    // #6 Send success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
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