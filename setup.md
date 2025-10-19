# HealthMate Setup Guide 🏥

## Quick Setup (No TypeScript - Pure React!)

### 1. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthmate?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env.local` file in frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=HealthMate
VITE_APP_VERSION=1.0.0
```

Start frontend:
```bash
npm run dev
```

### 3. Access Your App
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## What's Different Now?
✅ **No TypeScript** - Pure React/JavaScript only
✅ **Clean file structure** - Removed all .ts files
✅ **Simple configuration** - Just Vite + React
✅ **Easy to understand** - No type definitions or complex setup

## Features Ready to Use:
- 🔐 User Authentication (Login/Register)
- 📊 Dashboard with report management
- 📤 Upload medical reports (PDF/Images)
- 🤖 AI analysis with Gemini API
- 💬 Interactive chat interface
- 📅 Timeline view of reports
- 👤 User profile management

Enjoy your HealthMate application! 🎉

