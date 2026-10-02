# ParkFlow Project Structure

## Overview
This is a React Native mobile application with a Node.js/Express backend and MongoDB database.

## Directory Structure

### Frontend (`/frontend`)
- **`src/`** - Main source code
  - **`screens/`** - Screen/page components
  - **`components/`** - Reusable UI components
  - **`services/`** - API service calls (axios instances, API endpoints)
  - **`hooks/`** - Custom React hooks
  - **`utils/`** - Utility functions and helpers
  - **`types/`** - TypeScript type definitions
  - **`constants/`** - App constants and configuration
  - **`App.tsx`** - Main app component with navigation
- **`assets/`** - Static assets
  - **`images/`** - Image files
  - **`fonts/`** - Font files
- **`app.json`** - Expo configuration
- **`tsconfig.json`** - TypeScript configuration
- **`package.json`** - Dependencies and scripts

### Backend (`/backend`)
- **`src/`** - Source code
  - **`routes/`** - Express route handlers
  - **`controllers/`** - Business logic and request handlers
  - **`models/`** - Mongoose schema definitions
  - **`middleware/`** - Express middleware (auth, validation, etc.)
  - **`config/`** - Configuration files (database, etc.)
  - **`utils/`** - Utility functions
  - **`index.js`** - Server entry point
- **`.env.example`** - Environment variables template
- **`package.json`** - Dependencies and scripts

### Shared (`/shared`)
- **`types/`** - Shared TypeScript types between frontend and backend
- **`constants/`** - Shared constants

### Documentation (`/docs`)
- Project documentation and guides

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Expo CLI (for React Native development)

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Technology Stack
- **Frontend:** React Native, TypeScript, React Navigation, Zustand (state management)
- **Backend:** Express.js, MongoDB, Mongoose, JWT authentication
- **Tools:** Axios for API calls, Nodemon for development

## Environment Variables
Copy `.env.example` to `.env` in the backend folder and configure the necessary variables.

## Development Workflow
1. Start MongoDB
2. Run backend: `npm run dev` in `/backend`
3. Run frontend: `npm start` in `/frontend`

## File Naming Conventions
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase (e.g., `User.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
