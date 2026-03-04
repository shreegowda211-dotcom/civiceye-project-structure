# CivicEye

Full-stack civic issue reporting and management system built using the MERN stack.

CivicEye enables citizens to report civic problems and allows officers and administrators to manage and track issue resolution through secure, role-based dashboards.

---

## 🔗 Repository

https://github.com/shreegowda211-dotcom/civiceye-project-structure

---

## 📌 Overview

CivicEye digitizes civic complaint handling with structured workflows and transparent status tracking.

This project demonstrates:

- Role-based authentication
- Protected routes
- REST API integration
- Modular full-stack architecture

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Context API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

---

## 🚀 Core Features

### 👤 Citizen
- Register and login
- Submit complaints
- Track complaint status

### 👮 Officer
- View assigned complaints
- Update issue progress

### 🛠️ Admin
- Monitor system activity
- Manage officers
- View complaint statistics

---

## 📁 Project Structure

civiceye-project-structure/
│
├── backend/
│   ├── controller/
│   │   ├── loginController.js
│   │   ├── officerController.js
│   │
│   ├── model/
│   │   ├── complaintSchema.js
│   │   ├── officerSchema.js
│   │
│   ├── router/
│   │   ├── adminRouter.js
│   │   ├── citizenRouter.js
│   │   ├── officerRouter.js
│   │
│   ├── middleware/
│   │   ├── authAdmin.js
│   │
│   ├── config.js
│   ├── index.js
│   └── package.json
│
├── civiceye-project/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   │
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── citizen/
│   │   │   └── officer/
│   │   │
│   │   ├── contexts/
│   │   ├── types/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore


---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/shreegowda211-dotcom/civiceye-project-structure.git
cd civiceye-project-structure

## ⚙️ Setup Instructions

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
node index.js

---

### 2️⃣ Frontend Setup

```bash
cd civiceye-project
npm install
npm run dev

---

