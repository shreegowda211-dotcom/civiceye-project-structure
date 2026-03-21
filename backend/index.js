import express from 'express';
import cors from 'cors';
import connectToDB from './db.js';
import citizenRouter from './router/citizenRouter.js';
import officerRouter from './router/officerRouter.js';
import adminRouter from './router/adminRouter.js';

// import individual controller functions for generic endpoints
import helpRouter from './router/helpRouter.js';
import { citizenRegister, submitFeedback, getFeedback } from './controller/citizenController.js';
import { officerRegister } from './controller/officerController.js';
import { citizenLogin, officerLogin, adminLogin } from './controller/loginController.js';
import { verifyCitizenToken } from './middleware/authAdmin.js';

const app = express();
app.use(express.json())
app.use(cors())
connectToDB();
app.use('/api/help', helpRouter);

// 📝 Request logging middleware for all requests
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString();
  
  // Log all requests
  console.log(`\n📨 [${timestamp}] ${req.method} ${req.path}`);
  
  // Log registration requests
  if (req.path.includes("/register") && req.method === "POST") {
    let userType = "Citizen";
    if (req.path.includes("/officer")) userType = "Officer";
    if (req.path.includes("/admin")) userType = "Admin";
    console.log(`   ✅ ${userType.toUpperCase()} REGISTRATION ATTEMPT`);
    console.log(`   📧 Email: ${req.body.email || "Not provided"}`);
    console.log(`   👤 Name: ${req.body.name || "Not provided"}`);
  }
  
  // Log login requests
  if (req.path.includes("/login") && req.method === "POST") {
    let userType = "Citizen";
    if (req.path.includes("/officer")) userType = "Officer";
    if (req.path.includes("/admin")) userType = "Admin";
    console.log(`   ✅ ${userType.toUpperCase()} LOGIN ATTEMPT`);
    console.log(`   📧 Email: ${req.body.email || "Not provided"}`);
  }
  
  // Log profile requests
  if (req.path.includes("/profile") && req.method === "GET") {
    let userType = "Citizen";
    if (req.path.includes("/officer")) userType = "Officer";
    if (req.path.includes("/admin")) userType = "Admin";
    console.log(`   ✅ ${userType.toUpperCase()} PROFILE REQUEST`);
    console.log(`   🔐 Auth-Token: ${req.header("auth-token") ? "Present" : "Missing"}`);
  }

  // Log officer creation requests
  if (req.path.includes("/officers") && req.method === "POST") {
    console.log(`   👮 OFFICER CREATION ATTEMPT`);
    console.log(`   👤 Name: ${req.body.name || "Not provided"}`);
    console.log(`   📧 Email: ${req.body.email || "Not provided"}`);
    console.log(`   🏢 Department: ${req.body.department || "Not provided"}`);
    console.log(`   🔐 Auth-Token: ${req.header("auth-token") ? "Present" : "Missing"}`);
  }

  // Log complaint requests
  if (req.path.includes("/complaints") && req.method === "POST") {
    console.log(`   📝 COMPLAINT CREATION ATTEMPT`);
    console.log(`   📋 Data:`, req.body);
    console.log(`   🔐 Auth-Token: ${req.header("auth-token") ? "Present" : "Missing"}`);
  }

  if (req.path.includes("/complaints") && req.method === "GET") {
    console.log(`   📋 COMPLAINT FETCH REQUEST`);
    console.log(`   🔐 Auth-Token: ${req.header("auth-token") ? "Present" : "Missing"}`);
  }
  
  // Intercept the response to log the result
  const originalJson = res.json;
  res.json = function(data) {
    if (req.path.includes("/register") || req.path.includes("/login") || req.path.includes("/profile")) {
      if (data.success) {
        console.log(`   ✔️ SUCCESS: ${data.message}`);
      } else {
        console.log(`   ❌ FAILED: ${data.message}`);
      }
    }
    if (req.path.includes("/officers") && req.method === "POST") {
      if (data.success) {
        console.log(`   ✔️ SUCCESS: Officer created - ${data.data?._id}`);
      } else {
        console.log(`   ❌ FAILED: ${data.message}`);
      }
    }
    if (req.path.includes("/complaints")) {
      if (data.message && data.message.includes("success")) {
        console.log(`   ✔️ SUCCESS: ${data.message}`);
      } else if (data.error || !data.message?.includes("success")) {
        console.log(`   ❌ FAILED:`, data.message || data.error);
      }
    }
    res.json = originalJson; // Restore original method
    return originalJson.call(this, data);
  };
  
  next();
});

// keep separate routers for direct access
app.use("/api/citizen", citizenRouter);
app.use("/api/officer", officerRouter);
app.use("/api/admin", adminRouter);

// Ensure direct feedback endpoints always work (safe fallback)
app.get('/api/citizen/feedback', verifyCitizenToken, getFeedback);
app.post('/api/citizen/feedback', verifyCitizenToken, submitFeedback);

// generic registration endpoint that dispatches based on role
app.post("/api/register", (req, res) => {
  const { role } = req.body;
  if (role) {
    const lr = role.toLowerCase();
    if (lr === "officer") return officerRegister(req, res);
    if (lr === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin registration is not allowed through this endpoint",
      });
    }
  }
  // default to citizen
  return citizenRegister(req, res);
});

// generic login endpoint
app.post("/api/login", (req, res) => {
  const { role } = req.body;
  if (role) {
    const lr = role.toLowerCase();
    if (lr === "officer") return officerLogin(req, res);
    if (lr === "admin") return adminLogin(req, res);
  }
  // default to citizen
  return citizenLogin(req, res);
});

// app.use("/uploads", express.static("uploads")) //access uploaded file in frontend 

// Global error handler
app.use((err, req, res, next) => {
  console.error("\n❌ ERROR:", err.message);
  console.error("   Stack:", err.stack);
  
  res.status(500).json({
    message: "Server error",
    error: err.message
  });
});

const PORT = 7000;
app.listen(PORT, ()=>{
    console.log(`\n🚀 Server is running on port ${PORT}`);
})
