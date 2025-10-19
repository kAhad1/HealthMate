# HealthMate – Sehat ka Smart Dost 🏥

A full-stack MERN application that provides AI-powered medical report analysis using Google's Gemini API. Users can upload medical reports (PDF/images) and receive bilingual summaries in English and Roman Urdu.

## 🎯 Features

- **User Authentication**: JWT-based login/signup with password hashing
- **Report Upload**: Upload PDF or image files to Cloudinary storage
- **AI Analysis**: Gemini 1.5 Pro API analyzes reports and provides insights
- **Bilingual Support**: Responses in both English and Roman Urdu
- **Chat Interface**: Interactive AI chat for health-related questions
- **Report Management**: View, organize, and manage all uploaded reports
- **Timeline View**: Chronological view of all reports
- **Dashboard**: Comprehensive overview of reports and statistics

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB** (Atlas) with **Mongoose**
- **JWT** authentication with **bcryptjs**
- **Cloudinary** for file storage
- **Google Gemini 1.5 Pro** API for AI analysis
- **Multer** for file uploads
- **Helmet** for security
- **Express Rate Limiting**

### Frontend
- **React 18** with **Vite**
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Heroicons** for icons

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Cloudinary account
- Google AI Studio API key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd HealthMate
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthmate?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Gemini AI API
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=HealthMate
VITE_APP_VERSION=1.0.0
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 📁 Project Structure

```
HealthMate/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── reportController.js
│   │   └── chatController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Report.js
│   │   └── Chat.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── reportRoutes.js
│   │   └── chatRoutes.js
│   ├── utils/
│   │   ├── cloudinary.js
│   │   └── geminiClient.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Reports
- `POST /api/reports/upload` - Upload medical report
- `GET /api/reports` - Get user reports (with pagination/filters)
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/timeline` - Get reports timeline
- `POST /api/reports/:id/retry-analysis` - Retry failed analysis

### Chat
- `GET /api/chat` - Get chat history
- `POST /api/chat/message` - Send message
- `GET /api/chat/history` - Get paginated chat history
- `DELETE /api/chat/history` - Clear chat history
- `GET /api/chat/stats` - Get chat statistics
- `GET /api/chat/search` - Search messages

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Secure file upload handling

## 🌟 Key Features Explained

### AI Report Analysis
- Uses Google Gemini 1.5 Pro multimodal API
- Analyzes PDF and image medical reports
- Provides bilingual summaries (English + Roman Urdu)
- Identifies abnormal values and key findings
- Suggests questions for doctors
- Offers health recommendations

### File Management
- Secure upload to Cloudinary
- Support for PDF, JPEG, PNG files
- File size validation (10MB limit)
- Automatic image optimization
- Signed URLs for secure access

### Chat System
- Context-aware AI responses
- Report-specific conversations
- Search through chat history
- Persistent conversation storage
- Quick action buttons

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas is accessible
3. Deploy the backend code
4. Update frontend API URL

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the build folder
3. Set environment variables
4. Update API URLs for production

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=HealthMate
VITE_APP_VERSION=1.0.0
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This application is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical concerns.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**HealthMate – Your Smart Health Companion** 🏥✨