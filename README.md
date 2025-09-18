# Getting Started

## How to Start the Backend

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` (if provided), or create a `.env` file in the `backend` directory with the required variables (see `backend/README.md` for details).

3. **Start MongoDB:**
   - Make sure MongoDB is running locally or update your `.env` with your MongoDB Atlas URI.

4. **Start the backend server:**
   - For development (with auto-restart):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```

The backend will run by default on [http://localhost:5000](http://localhost:5000).

---

## How to Start the Frontend

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the frontend development server:**
   ```bash
   npm start
   ```

The frontend will run by default on [http://localhost:3000](http://localhost:3000).

---

**Note:**  
- Make sure the backend is running before starting the frontend for full functionality.
- You can configure API endpoints and environment variables as needed in each project's `.env` file.
