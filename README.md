CivicEye

A full-stack civic issue reporting and management system built using the MERN stack.

CivicEye enables citizens to report local civic problems and allows officers and administrators to manage and track issue resolution through secure, role-based dashboards.

Repository

https://github.com/shreegowda211-dotcom/civiceye-project-structure

Overview

CivicEye is designed to digitize civic complaint handling with a structured workflow and transparent status tracking system.

The application demonstrates real-world implementation of:

Role-based authentication

Protected routes

REST API integration

Modular full-stack architecture

Tech Stack

Frontend

React (Vite)

Tailwind CSS

Context API

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT Authentication

Core Features
Citizen

Register and login

Submit complaints

Track complaint status

Officer

View assigned complaints

Update issue progress

Admin

Monitor system activity

Manage officers

View complaint statistics

Project Structure
civiceye-project-structure/
│
├── backend/
│   ├── controller/
│   ├── model/
│   ├── router/
│   ├── middleware/
│   └── config.js
│
├── civiceye-project/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── contexts/
│       └── types/
Setup
Clone
git clone https://github.com/shreegowda211-dotcom/civiceye-project-structure.git
cd civiceye-project-structure
Backend
cd backend
node index.js

Create a .env file:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=7000

Run backend:
cd backend
npm i
node index.js
Frontend
cd civiceye-project
npm install
npm run dev

Frontend: http://localhost:5173

Backend: http://localhost:5000
