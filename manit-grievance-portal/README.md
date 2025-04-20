# MANIT Grievance Portal

A full-stack web application for managing grievances at MANIT (Maulana Azad National Institute of Technology). This portal allows students and staff to submit, track, and manage grievances efficiently.

## Project Structure

The project is divided into two main parts:
- `client/`: Frontend React application
- `server/`: Backend Node.js/Express server

### Technology Stack

#### Frontend
- React.js
- Material-UI (MUI) for UI components
- React Router for navigation
- Formik & Yup for form handling and validation
- Axios for API requests

#### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Nodemailer for email services
- Multer for file uploads
- Express Validator for request validation

## Features

- User Authentication (Register, Login, Forgot Password)
- Email Verification System
- Grievance Submission and Tracking
- Dashboard with Statistics
- File Upload Support
- Email Notifications

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd manit-grievance-portal
\`\`\`

2. Install Server Dependencies:
\`\`\`bash
cd server
npm install
\`\`\`

3. Install Client Dependencies:
\`\`\`bash
cd ../client
npm install
\`\`\`

4. Set up environment variables:
   - Create `.env` file in server directory
   - Create `.env` file in client directory

5. Start the development servers:

For backend:
\`\`\`bash
cd server
npm run dev
\`\`\`

For frontend:
\`\`\`bash
cd client
npm start
\`\`\`

## Environment Variables

### Server (.env)
```
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5001
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/verify-email` - Email verification
- POST `/api/auth/forgot-password` - Password reset request

### Grievances
- POST `/api/grievances` - Submit new grievance
- GET `/api/grievances` - Get all grievances
- GET `/api/grievances/:id` - Get specific grievance
- PUT `/api/grievances/:id` - Update grievance status

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
