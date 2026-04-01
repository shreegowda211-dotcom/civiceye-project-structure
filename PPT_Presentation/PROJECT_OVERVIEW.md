# CivicEye - Project Overview

## Project Introduction
**CivicEye** is a comprehensive complaint management system designed to streamline the process of filing, tracking, and resolving civic complaints. The platform connects citizens with municipal authorities through a user-friendly interface enabling efficient issue resolution.

## Project Architecture

### Tech Stack
- **Frontend**: React.js with Vite, Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Location Services**: Leaflet.js for mapping
- **Testing**: Jest

### System Components
1. **Frontend Application** (`civiceye-project/`)
   - React-based SPA
   - Responsive UI with Tailwind CSS
   - Multi-role dashboards (Citizen, Officer, Admin)

2. **Backend Services** (`backend/`)
   - RESTful API endpoints
   - Business logic controllers
   - Database models
   - Authentication & authorization

## Key Features

### For Citizens
- 📝 Easy complaint filing with category selection
- 📍 Location-based complaint submission using Leaflet maps
- 📊 Real-time complaint tracking and status updates
- 📱 Responsive mobile-friendly interface
- ⭐ Feedback and rating system for officers
- 🔔 Real-time notifications on complaint updates

### For Officers
- 📋 Dashboard with assigned complaints
- 🎯 Priority-based task management
- 📊 Performance metrics tracking
- 🔄 Complaint status update capabilities
- 🏆 Leaderboard rankings
- 📞 Direct communication with citizens

### For Administrators
- 🎛️ System-wide dashboard with analytics
- 👥 User and officer management
- 📈 Advanced reporting and analytics
- 🏢 Department and area management
- ⚙️ System configuration and settings
- 🔍 All-complaints monitoring and escalation
- 📊 Performance analytics and trends

## Project Structure

```
civiceye-project-structure/
├── civiceye-project/          # Frontend React application
│   ├── src/
│   │   ├── pages/             # Page components (Login, Register, Dashboards)
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # Auth context & state management
│   │   ├── services/          # API integration
│   │   └── lib/               # Utility functions
│   └── package.json
│
├── backend/                   # Backend Node.js application
│   ├── controller/            # API logic (Complaint, Officer, Admin, etc.)
│   ├── model/                 # MongoDB schemas
│   ├── router/                # API routes
│   ├── middleware/            # Auth & error handling
│   ├── lib/                   # Utility functions
│   ├── tests/                 # Test files
│   └── package.json
│
└── PPT_Presentation/          # Presentation materials
    ├── Shreelatha.md          # Frontend Lead - Auth & User Dashboard
    ├── Rakshitha.md           # Frontend - Citizen Module
    ├── Rakshitha_SR.md        # Backend - Core APIs & Controllers
    └── Shreedeeksha.md        # Frontend - Admin & Officer Dashboards
```

## Team Members & Roles

| Member | Role | Responsibility |
|--------|------|-----------------|
| **Shreelatha** | Frontend Lead | Authentication, Landing Page, UI Components |
| **Rakshitha** | Frontend Developer | Citizen Module & Dashboard |
| **Rakshitha SR** | Backend Developer | Core APIs, Controllers, Database Models |
| **Shreedeeksha** | Frontend Developer | Admin & Officer Dashboards |

## Development Workflow

### Frontend Development Process
1. Component creation with Tailwind CSS
2. GradientCard styling system (blue-600 → sky-500 → cyan-400)
3. State management with React Context API
4. API integration with backend
5. Responsive testing across devices

### Backend Development Process
1. Schema design in MongoDB
2. Controller logic implementation
3. Route creation and testing
4. Error handling and validation
5. Authentication & authorization

## Design System
- **Color Gradient**: `bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400`
- **Component**: Reusable GradientCard with consistent styling
- **Theme**: White text on gradient backgrounds
- **Responsive**: Mobile-first approach with breakpoints

## Deployment & Testing
- **Frontend**: Vite bundling, Jest testing
- **Backend**: Node.js server, Jest unit tests
- **Database**: MongoDB collections for all entities
- **Additional**: Pagination, error handling, logging

## Achievements
✅ Complete authentication system  
✅ Multi-role dashboard system  
✅ Real-time complaint tracking  
✅ Advanced analytics for admins  
✅ Responsive mobile interface  
✅ Reusable component library  
✅ Secure API endpoints  
✅ Efficient database design  

## Future Enhancements
- SMS/Email notifications
- Advanced ML-based complaint routing
- Integration with municipal databases
- Payment gateway for premium features
- Mobile app native versions
- AI-powered complaint categorization
