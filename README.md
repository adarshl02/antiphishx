# AntiPhish

A comprehensive phishing detection platform that leverages AWS AI services and machine learning to analyze text and images for potential security threats, sentiment analysis, and PII detection.

## 🚀 Features

- **Text Analysis**: Detect phishing attempts, analyze sentiment, and identify personally identifiable information (PII)
- **Image Analysis**: Detect malicious content in images
- **Real-time Risk Assessment**: Get instant threat scores and verdicts
- **Historical Analysis**: Track and review past analyses
- **AWS Integration**: Powered by AWS Comprehend and Fraud Detector
- **Machine Learning**: URL classification using trained Random Forest and Decision Tree models
- **User Authentication**: Secure login with Google OAuth via Supabase

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for blazing fast builds
- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for styling
- **Supabase** for authentication
- **React Query** for data fetching

### Backend
- **Bun** runtime
- **Express.js** for API
- **AWS SDK** (Comprehend, Fraud Detector)
- **JWT** for authentication
- **Winston** for logging
- **DynamoDB** for data storage

### Machine Learning
- **scikit-learn** models (Random Forest, Decision Tree)
- Trained models for URL classification

## 📁 Project Structure

```
AntiPhish/
├── backend/              # Express.js API server
│   ├── config/          # AWS and database configuration
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic (AWS Comprehend, Fraud Detector)
│   ├── routes/          # API routes
│   ├── middlewares/     # Authentication and error handling
│   └── utils/           # Helper functions
├── frontend/            # React TypeScript application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── service/     # API service layer
│   │   ├── contexts/    # React contexts
│   │   └── providers/   # Context providers
│   └── public/
└── urlmodel/            # ML models (not tracked in git)
    ├── random_forest_model.pkl
    ├── decision_tree_model.pkl
    ├── feature_columns.pkl
    └── label_map.pkl
```

## 🔧 Setup

### Prerequisites
- [Bun](https://bun.sh) v1.1.42 or higher
- Node.js v18+ (optional, for npm compatibility)
- AWS Account with Comprehend and Fraud Detector access
- Supabase project

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file:
```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region

# JWT
JWT_SECRET=your_jwt_secret

# Server
PORT=3000
```

4. Run the development server:
```bash
bun run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

4. Run the development server:
```bash
bun run dev
```

## 🎯 Usage

1. Start the backend server (default: http://localhost:3000)
2. Start the frontend development server (default: http://localhost:5173)
3. Open your browser and navigate to the frontend URL
4. Sign in with Google
5. Enter text or upload images to analyze for phishing threats

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify JWT token

### Text Analysis
- `POST /api/text/analyze` - Analyze text for phishing, sentiment, and PII
- `GET /api/text/history` - Get analysis history

## 🔐 Security

- All API routes are protected with JWT authentication
- AWS credentials are stored securely in environment variables
- User passwords are hashed with Argon2
- CORS is configured to prevent unauthorized access

## 📝 License

This project is private and not licensed for public use.

## 🤝 Contributing

This is a private project. Contact the repository owner for contribution guidelines.

## 📧 Contact

For questions or support, please contact the project maintainer.
