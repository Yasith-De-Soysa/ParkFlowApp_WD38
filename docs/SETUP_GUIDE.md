# Getting Started with ParkFlow

## Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Configure Environment Variables

In `/backend` folder:
```bash
cp .env.example .env
```

Then update `.env` with your MongoDB connection string and other settings.

### 3. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# On Windows
mongod

# On macOS (with Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### 4. Run the Backend

```bash
cd backend
npm run dev
```

Server will start on `http://localhost:5000`

### 5. Run the Frontend

In a new terminal:
```bash
cd frontend
npm start
```

Then choose to run on Android, iOS, or Web using Expo.

## Project Structure Overview

```
ParkFlowApp_WD38/
├── frontend/              # React Native mobile app
│   ├── src/
│   │   ├── screens/      # App screens/pages
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API calls
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Helper functions
│   └── assets/           # Images, fonts
│
├── backend/               # Express.js API server
│   └── src/
│       ├── models/       # MongoDB schemas
│       ├── routes/       # API endpoints
│       ├── controllers/  # Business logic
│       ├── middleware/   # Express middleware
│       └── config/       # Configuration files
│
├── shared/                # Shared types & constants
├── docs/                  # Documentation
```

## Key Files

- **Frontend Entry Point:** `frontend/src/App.tsx`
- **Backend Entry Point:** `backend/src/index.js`
- **API Service:** `frontend/src/services/api.ts`
- **Database Config:** `backend/src/config/database.js`
- **Example Screen:** `frontend/src/screens/HomeScreen.tsx`
- **Example Model:** `backend/src/models/User.js`

## Common Commands

### Frontend
- `npm start` - Start Expo dev server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm test` - Run tests

### Backend
- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm test` - Run tests

## Next Steps

1. Create more screens in `frontend/src/screens/`
2. Add API endpoints in `backend/src/routes/`
3. Define database models in `backend/src/models/`
4. Implement business logic in `backend/src/controllers/`
5. Create custom hooks in `frontend/src/hooks/`
6. Build reusable components in `frontend/src/components/`

## Useful Resources

- [React Native Documentation](https://reactnative.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Navigation](https://reactnavigation.org/)
- [Mongoose Documentation](https://mongoosejs.com/)
