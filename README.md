# Cooli - The Next-Gen Blue Collar Job Platform

Cooli is a full-stack web platform designed to seamlessly connect daily wage workers, contractors, and blue-collar professionals with local employers instantly. Utilizing advanced geolocation matching and real-time communication, it removes the friction and inefficiency from the unorganized labor sector, making hiring fast, transparent, and reliable.

---

## 🚀 Key Features

### For Employers
- **Post Jobs Instantly**: Specify required skills, location, job type (hourly/daily/contract), and wages.
- **Worker Discovery (Map & List Views)**: Interactive geolocation-based discovery to find available workers nearby in real-time.
- **Applicant Management**: Review worker profiles, portfolios, and past ratings before making a hiring decision.
- **Manage Active Jobs**: Track applicants, manage job statuses (open, in-progress, completed).

### For Workers
- **Job Discovery**: Interactive map and list interfaces to discover nearby job opportunities based on distance, pay, and skills.
- **Profile & Portfolio Management**: Add past experiences, specific skills, and portfolio photos to build trust and stand out.
- **Smart Matching Algorithm**: Receive percentage-based matching scores (High, Medium, Low Match) for jobs that fit their profile.
- **Availability Toggle**: Easily toggle status between "Available" and "Busy" to control visibility to employers.
- **Save & Apply**: Save interesting jobs for later or apply instantly with a single click.

### Shared Features
- **Real-Time Messaging**: Built on Socket.io to allow instant, secure communication between employers and workers without initially sharing personal phone numbers.
- **Review & Rating System**: A trust-based ecosystem where employers and workers can rate each other and leave post-job reviews.
- **Secure Authentication**: Integration with Firebase and JWT for secure login flows and session management.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18, Vite
- **Styling**: TailwindCSS, Vanilla CSS
- **Maps & Geolocation**: Leaflet, React-Leaflet
- **Real-Time**: Socket.io-client
- **HTTP Client**: Axios
- **State/Routing**: React Router DOM, Context API

### Backend
- **Runtime Environment**: Node.js, Express.js
- **Database**: MongoDB (Mongoose) with 2dsphere indexing for geospatial queries
- **Real-Time**: Socket.io
- **Authentication & Security**: JSON Web Tokens (JWT), Firebase Admin, CORS
- **Storage**: Cloudinary (for profile photos and portfolios), Multer

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (Local or Atlas)
- Cloudinary Account (for image uploads)
- Firebase Project (for authentication)

### 1. Backend Setup
1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env\` file in the \`backend\` root with the following variables:
   \`\`\`env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   \`\`\`
4. Start the backend development server:
   \`\`\`bash
   npm run dev
   \`\`\`

### 2. Frontend Setup
1. Navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env\` file in the \`frontend\` root with your variables:
   \`\`\`env
   VITE_API_URL=http://localhost:5000/api
   # Add Firebase config variables if required
   \`\`\`
4. Start the frontend development server:
   \`\`\`bash
   npm run dev
   \`\`\`

---

## 📂 Project Structure Overview

- **\`backend/src/models/\`**: Contains MongoDB schemas (Job, User, Conversation, Message, Review, Notification).
- **\`backend/src/controllers/\`**: Contains business logic for handling API requests.
- **\`frontend/src/pages/\`**: Divided into core roles (\`worker\`, \`employer\`, \`dashboard\`, \`messages\`).
- **\`frontend/src/components/\`**: Reusable UI components (JobCards, Maps, etc.).

---

**Cooli** aims to digitize and streamline the everyday blue-collar job market, empowering workers with better opportunities and employers with reliable talent.
