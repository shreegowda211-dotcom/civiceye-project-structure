# Rakshitha SR - Backend: Core APIs & Controllers

## Overview
Rakshitha SR develops backend APIs and controllers, handling the core business logic and data management for the CivicEye platform.

## Responsibilities & Features

### 1. **Complaint Management** (`backend/controller/complaintController.js`)
- Create complaint endpoints
- Update complaint status
- Retrieve complaint details
- List all complaints with pagination
- Filter complaints by category, status, location
- Complaint escalation logic

### 2. **Officer Management** (`backend/controller/officerController.js`)
- Officer assignment to complaints
- Officer availability status
- Performance metrics calculation
- Officer dashboard data
- Officer action logging

### 3. **Login & Authentication** (`backend/controller/loginController.js`)
- User authentication logic
- JWT token generation
- Session management
- Password validation
- Role-based login routing

### 4. **Citizen Management** (`backend/controller/citizenController.js`)
- Citizen profile management
- Account creation and updates
- Citizen statistics retrieval
- Complaint history for citizens
- Citizen communication

### 5. **Category Management** (`backend/controller/categoryController.js`)
- Complaint categories CRUD operations
- Category filtering
- Category statistics
- Category assignments

### 6. **Notification Controller** (`backend/controller/notificationController.js`)
- Send notification events
- Notification delivery system
- Notification status tracking
- Notification preferences

### 7. **Database Models**
- **Complaint Schema** (`backend/model/complaintSchema.js`)
  - Fields: title, description, category, status, priority, location, images
  
- **Citizen Schema** (`backend/model/citizenScheme.js`)
  - Fields: name, email, contact, address, complaints array

- **Officer Schema** (`backend/model/officerSchema.js`)
  - Fields: name, department, email, assigned complaints, availability

- **Category Schema** (`backend/model/categorySchema.js`)
  - Fields: category_name, description, icon, color

- **Notification Schema** (`backend/model/notificationSchema.js`)
  - Fields: recipient, message, type, status, timestamp

- **Area Schema** (`backend/model/areaSchema.js`)
  - Geographic area data for mapping

## API Endpoints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id` - Update complaint
- `GET /api/officers` - List officers
- `POST /api/login` - User authentication
- `GET /api/categories` - List complaint categories
- `POST /api/notifications` - Send notification

## Tech Stack
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- RESTful API architecture

## Key Achievements
✓ Implemented core complaint management APIs  
✓ Built secure authentication system  
✓ Created efficient database schemas  
✓ Implemented paginated data retrieval  
✓ Built notification system  
✓ Integrated role-based access control  

## Deliverables
- Production-ready backend APIs
- Secure authentication system
- Complete data models
- API documentation
- Error handling middleware
