# Assignment Portal Backend

A comprehensive Node.js + Express backend API for an Assignment Workflow Portal with MongoDB + Mongoose.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access (Teacher/Student)
- **Assignment Management**: CRUD operations with status workflow (Draft → Published → Completed)
- **Submission System**: Students can submit assignments with due date validation
- **Review System**: Teachers can grade and provide feedback on submissions
- **Analytics**: Comprehensive analytics for teachers including submission counts and grades
- **Security**: Password hashing, JWT tokens, input validation, and error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv
- **CORS**: cors middleware

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User model (Teacher/Student)
│   │   ├── Assignment.js        # Assignment model
│   │   └── Submission.js        # Submission model
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── assignmentRoutes.js  # Assignment CRUD routes
│   │   ├── submissionRoutes.js  # Submission routes
│   │   └── analyticsRoutes.js   # Analytics routes
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── assignmentController.js # Assignment logic
│   │   └── submissionController.js # Submission logic
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification & role authorization
│   │   └── errorHandler.js      # Global error handling
│   └── server.js               # Main server file
├── .env                        # Environment variables
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/assignment-portal
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=1h
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Important**: Change the `JWT_SECRET` to a secure random string in production.

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB installation
mongod

# Or use MongoDB Atlas cloud connection
# Update MONGODB_URI in .env with your Atlas connection string
```

### 4. Run the Application

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "teacher" // or "student"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "role": "teacher",
    "name": "John Doe",
    "email": "john@example.com",
    "userId": "user-id"
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

### Assignment Endpoints

#### Get Assignments
```http
GET /api/assignments
Authorization: Bearer <jwt-token>

# Optional query parameters for teachers:
# ?status=Draft|Published|Completed
# ?page=1&limit=10
```

#### Create Assignment (Teacher Only)
```http
POST /api/assignments
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Assignment Title",
  "description": "Assignment description",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

#### Update Assignment (Teacher Only)
```http
PUT /api/assignments/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

#### Update Assignment Status (Teacher Only)
```http
PUT /api/assignments/:id/status
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "status": "Published" // Draft → Published → Completed
}
```

#### Delete Assignment (Teacher Only)
```http
DELETE /api/assignments/:id
Authorization: Bearer <jwt-token>
```

### Submission Endpoints

#### Submit Assignment (Student Only)
```http
POST /api/submissions
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "assignmentId": "assignment-id",
  "answer": "Student's answer text"
}
```

#### Get Assignment Submissions (Teacher Only)
```http
GET /api/submissions/:assignmentId
Authorization: Bearer <jwt-token>
```

#### Get My Submissions (Student Only)
```http
GET /api/submissions/my-submissions
Authorization: Bearer <jwt-token>
```

#### Review Submission (Teacher Only)
```http
PUT /api/submissions/:id/review
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "grade": 85,
  "feedback": "Good work! Consider improving..."
}
```

### Analytics Endpoints

#### Get Analytics (Teacher Only)
```http
GET /api/analytics
Authorization: Bearer <jwt-token>
```

Returns submission counts, review status, and average grades for all teacher's assignments.

## Database Models

### User Model
- `name`: String, required
- `email`: String, required, unique
- `password`: String, required (hashed)
- `role`: String, enum ['teacher', 'student'], required

### Assignment Model
- `title`: String, required
- `description`: String, required
- `dueDate`: Date, required
- `status`: String, enum ['Draft', 'Published', 'Completed'], default: 'Draft'
- `createdBy`: ObjectId (User), required
- `createdAt`: Date, default: now

### Submission Model
- `assignmentId`: ObjectId (Assignment), required
- `studentId`: ObjectId (User), required
- `answer`: String, required
- `submittedAt`: Date, default: now
- `reviewed`: Boolean, default: false
- `grade`: Number (0-100)
- `feedback`: String

## Business Rules

### Assignment Workflow
1. **Draft**: Teachers can create, edit, and delete assignments
2. **Published**: Students can view and submit assignments, teachers cannot edit
3. **Completed**: No changes allowed, final state

### Submission Rules
- Students can only submit to **Published** assignments
- One submission per student per assignment
- Submissions blocked after due date
- Teachers can only view submissions for their own assignments

### Authorization Rules
- **Teachers**: Can manage their own assignments, view/grade submissions
- **Students**: Can view published assignments, submit answers, view their own submissions

## Bonus Features Implemented

✅ **Due Date Validation**: Submissions blocked after assignment due date  
✅ **Pagination**: GET /api/assignments supports page and limit parameters  
✅ **Analytics**: Comprehensive analytics endpoint with submission counts and grades

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Development

### Available Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm test         # Run tests (placeholder)
```

### Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT expiration time (default: 1h)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong, unique `JWT_SECRET`
3. Use MongoDB Atlas or a production MongoDB instance
4. Configure proper CORS origins
5. Use PM2 or similar process manager
6. Set up proper logging and monitoring

## Health Check

The API provides a health check endpoint:

```http
GET /health
```

Returns server status and basic information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License
