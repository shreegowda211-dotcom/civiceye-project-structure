# Rakshitha - Frontend: Citizen Module & Dashboard

## Overview
Rakshitha focuses on developing the Citizen-facing features and dashboard components of the CivicEye platform.

## Responsibilities & Features

### 1. **Citizen Dashboard** (`src/pages/citizen/CitizenDashboard.jsx`)
- Main citizen dashboard with statistic cards
- Issue statistics:
  - Total complaints filed
  - Pending issues
  - In-progress resolutions
  - Resolved complaints
- GradientCard styled stat cards with smooth animations
- Overview of user's ticket status

### 2. **Citizen Modules**
- **Report Issue** (`src/pages/citizen/ReportIssue.jsx`)
  - Form to file new complaints
  - Category selection
  - Location input (Leaflet integration)
  - Image upload functionality
  - Priority assignment

- **Issue Tracking** (`src/pages/citizen/IssueTracking.jsx`)
  - View all filed complaints
  - Filter and search functionality
  - Status tracking for each issue
  - Timeline view of complaint updates

- **All Issues** (`src/pages/citizen/AllIssues.jsx`)
  - Browse all platform issues
  - Filter by category, status, area
  - Sort by priority and date
  - View complaint details

- **Citizen Profile** (`src/pages/citizen/CitizenProfile.jsx`)
  - User profile management
  - Account settings
  - Personal information updates
  - Profile statistics

- **Feedback** (`src/pages/citizen/CitizenFeedback.jsx`)
  - Submit feedback on resolutions
  - Rate officer performance
  - Rate resolution quality
  - Improvement suggestions

### 3. **Citizen UI Components**
- Citizen-specific layout components
- Responsive dashboard grid
- Status badges and indicators
- Issue card components

## Database Models Integration
- **Citizen Schema** (`backend/model/citizenScheme.js`)
  - User profile data
  - Contact information
  - Account preferences

- **Complaint Schema** (`backend/model/complaintSchema.js`)
  - Complaint details
  - Status tracking
  - Resolution history

## Tech Stack
- React.js with motion animations
- Tailwind CSS with GradientCard components
- Leaflet.js for location mapping
- RESTful API integration

## Key Achievements
✓ Complete citizen dashboard with real-time statistics  
✓ Multi-step issue reporting workflow  
✓ Advanced filtering and search functionality  
✓ Responsive design across all devices  
✓ Integrated location mapping feature  
✓ Feedback collection system  

## Deliverables
- Fully functional Citizen module
- Dashboard with 4 animated stat cards
- Complete issue tracking system
- User profile management interface
- Feedback and rating system
