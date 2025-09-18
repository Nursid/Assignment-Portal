# Assignment Portal Frontend
A modern React.js frontend application for the Assignment Workflow Portal, built with Redux Toolkit, React Router, and TailwindCSS.

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── Layout.js              # Main layout with navigation
│   │   ├── ProtectedRoute.js      # Route protection component
│   │   ├── LoadingSpinner.js      # Loading indicator
│   │   ├── ErrorMessage.js        # Error display component
│   │   ├── AssignmentForm.js      # Assignment creation/editing form
│   │   └── SubmissionList.js      # Teacher submission review component
│   ├── pages/
│   │   ├── Login.js              # Login page for both roles
│   │   ├── TeacherDashboard.js   # Teacher assignment management
│   │   └── StudentDashboard.js   # Student assignment viewing
│   ├── redux/
│   │   ├── store.js              # Redux store configuration
│   │   └── slices/
│   │       ├── authSlice.js      # Authentication state
│   │       ├── assignmentSlice.js # Assignment management state
│   │       └── submissionSlice.js # Submission state
│   ├── services/
│   │   └── api.js                # Axios configuration and interceptors
│   ├── utils/
│   │   └── helpers.js            # Utility functions
│   ├── App.js                    # Main app component with routing
│   ├── index.js                  # App entry point
│   └── index.css                 # TailwindCSS imports and custom styles
├── package.json
├── tailwind.config.js
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on http://localhost:5000

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm start
```

The application will start on `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

## Available Scripts

```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
npm run eject    # Eject from Create React App (not recommended)
```

## User Roles & Features

### Teacher Features

- **Dashboard Overview**: View all assignments with status filtering
- **Assignment Management**:
  - Create new assignments with title, description, and due date
  - Edit assignments (Draft status only)
  - Delete assignments (Draft status only)
  - Update assignment status (Draft → Published → Completed)
- **Submission Review**:
  - View all student submissions for each assignment
  - Grade submissions (0-100 scale)
  - Provide written feedback
  - Track review status
- **Status Workflow**: Controlled assignment lifecycle management
- **Pagination**: Navigate through large assignment lists

### Student Features

- **Dashboard Overview**: Statistics showing available, submitted, and pending assignments
- **Assignment Viewing**: View all published assignments with details
- **Submission System**:
  - Submit text-based answers
  - One submission per assignment
  - View submission status and grades
  - Read teacher feedback
- **Due Date Awareness**: Visual indicators for overdue assignments
- **Progress Tracking**: Track completed vs pending assignments

## API Integration

The frontend integrates with the backend API through:

- **Authentication**: POST `/api/auth/login`
- **Assignments**: GET, POST, PUT, DELETE `/api/assignments`
- **Submissions**: POST, GET `/api/submissions`
- **Analytics**: GET `/api/analytics` (Teacher only)

## State Management

### Redux Slices

1. **authSlice**: User authentication and session management
2. **assignmentSlice**: Assignment CRUD operations and filtering
3. **submissionSlice**: Submission management and review

### Local Storage

- JWT token persistence
- User session data
- Automatic login state restoration

## Styling & UI

### TailwindCSS Features

- **Responsive Design**: Mobile-first approach
- **Custom Color Palette**: Primary blue theme with semantic colors
- **Component Classes**: Reusable button, input, and card styles
- **Dark Mode Ready**: Extensible color system

### Custom Components

- **Layout**: Consistent navigation and page structure
- **LoadingSpinner**: Consistent loading states
- **ErrorMessage**: User-friendly error display
- **ProtectedRoute**: Role-based access control

## Form Validation

### Client-side Validation

- **Email Format**: Regex validation for email inputs
- **Password Strength**: Minimum length requirements
- **Required Fields**: Real-time validation feedback
- **Character Limits**: Text length validation with counters

### Error Handling

- **API Errors**: User-friendly error messages
- **Network Issues**: Connection error handling
- **Validation Errors**: Inline field-specific errors

## Security Features

- **JWT Token Management**: Automatic token attachment and refresh
- **Route Protection**: Role-based access control
- **Input Sanitization**: XSS prevention
- **Secure Storage**: Token storage best practices

## Bonus Features Implemented

✅ **Due Date Validation**: Prevents submissions after deadline  
✅ **Pagination**: Assignment list pagination with navigation  
✅ **Analytics Dashboard**: Teacher statistics and submission tracking  
✅ **Real-time Status**: Live assignment and submission status updates  
✅ **Responsive Design**: Mobile-optimized interface  

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- **Code Splitting**: React Router lazy loading ready
- **Memoization**: Redux selector optimization
- **Image Optimization**: Optimized asset loading
- **Bundle Optimization**: Tree shaking and minification

## Development Guidelines

### Code Style

- **ES6+**: Modern JavaScript features
- **Functional Components**: React Hooks pattern
- **Redux Toolkit**: Modern Redux patterns
- **Consistent Naming**: camelCase for variables, PascalCase for components

### Best Practices

- **Component Reusability**: Modular component design
- **State Management**: Centralized state with Redux
- **Error Boundaries**: Graceful error handling
- **Accessibility**: ARIA labels and keyboard navigation

## Testing

The project includes basic testing setup with:

- **React Testing Library**: Component testing
- **Jest**: Test runner and assertions
- **User Event**: User interaction testing

Run tests with:
```bash
npm test
```

## Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

- **Netlify**: Static site hosting
- **Vercel**: Serverless deployment
- **AWS S3**: Static website hosting
- **GitHub Pages**: Free static hosting

### Environment Variables for Production

```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Troubleshooting

### Common Issues

1. **API Connection**: Ensure backend is running and CORS is configured
2. **Build Errors**: Check Node.js version compatibility
3. **Styling Issues**: Verify TailwindCSS configuration
4. **Routing Problems**: Check React Router setup

### Debug Mode

Enable Redux DevTools extension for debugging:
- Install Redux DevTools browser extension
- State changes will be visible in browser dev tools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Create an issue in the repository