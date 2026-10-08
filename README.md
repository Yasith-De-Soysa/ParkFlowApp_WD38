# ParkFlow

ParkFlow is a mobile parking discovery and reservation application. Drivers can
find approved parking facilities, view live slot availability, reserve a slot,
and manage their profile. Parking owners can register facilities, publish live
car and bike availability, and request profile changes for administrator
approval. Administrators review owner registrations and facility changes.

The repository contains:

- An Expo/React Native mobile frontend.
- An Express REST API.
- MongoDB persistence through Mongoose.
- JWT authentication with user, owner, and administrator roles.

## Features

### Drivers

- User registration and login.
- Car or Bike vehicle selection.
- Profile and vehicle management.
- Map-based approved parking discovery.
- Facility search by name or address.
- Facility details, pricing, capacity, reviews, and live availability.
- Reservation flow with date, vehicle type, slot, and payment screens.
- Reservation history.

### Parking owners

- Owner login through the shared login screen.
- Facility registration with location, capacity, pricing, and image.
- Administrator approval workflow.
- Owner home map, management dashboard, and parking profile.
- Live car and bike slot availability updates.
- Owner availability publishing stays on the update screen after saving.
- Parking profile edits are held for administrator approval.

### Administrators

- Login through the normal login screen using configured administrator
  credentials.
- Review and approve or decline owner facility registrations.
- Review and approve or decline owner parking profile changes.
- Create owner accounts.

## Technology stack

- **Mobile:** React Native, Expo SDK 57, TypeScript
- **Navigation:** React Navigation
- **Maps and location:** `react-native-maps`, Expo Location, OpenStreetMap
- **Networking:** Axios
- **Backend:** Node.js, Express, Helmet, CORS
- **Database:** MongoDB and Mongoose
- **Authentication:** JWT and bcryptjs
- **Uploads:** Multer

## Prerequisites

Install the following before setting up the project:

1. Node.js 20 or newer.
2. npm.
3. MongoDB Community Server, MongoDB Atlas, or another reachable MongoDB
   instance.
4. Git.
5. For Android development:
   - Android Studio and an Android emulator, or
   - Expo Go on a physical Android phone.
6. For iOS development:
   - macOS with Xcode, or
   - Expo Go on an iPhone.

The frontend and backend have separate `package.json` files. Install
dependencies in both directories; there is no root-level npm project.

## Installation

Clone the repository and enter its directory:

```bash
git clone <repository-url>
cd ParkFlowApp_WD38
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

On Windows PowerShell, the equivalent directory commands are:

```powershell
Set-Location .\backend
npm install
Set-Location ..\frontend
npm install
```

## Backend configuration

Create the backend environment file:

```bash
cd backend
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update `backend/.env`:

```dotenv
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=parkflow

JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE=7d

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin

CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### Environment variable reference

| Variable | Purpose |
| --- | --- |
| `PORT` | API port. Defaults to `5000`. |
| `NODE_ENV` | Runtime environment. |
| `MONGODB_URI` | MongoDB server or Atlas connection string. |
| `DB_NAME` | MongoDB database name. |
| `JWT_SECRET` | Secret used to sign authentication tokens. Change it from the example value. |
| `JWT_EXPIRE` | JWT lifetime, for example `7d`. |
| `ADMIN_EMAIL` | Administrator login email. |
| `ADMIN_PASSWORD` | Administrator login password. |
| `CORS_ORIGIN` | Allowed frontend origin. The API currently enables CORS middleware for development. |
| `LOG_LEVEL` | Logging configuration used by the backend environment. |

Do not commit `.env` files or real credentials.

## Frontend configuration

Create the frontend environment file:

```bash
cd frontend
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set the API URL in `frontend/.env`:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://YOUR_COMPUTER_LAN_IP:5000/api
```

Use the correct host for the device running the app:

| Runtime | API URL |
| --- | --- |
| Android emulator | `http://10.0.2.2:5000/api` |
| iOS simulator | `http://localhost:5000/api` |
| Expo Go on a physical phone | `http://YOUR_COMPUTER_LAN_IP:5000/api` |

For a physical phone, the phone and computer must be on the same network and
the backend must listen on the computer's network interface. The API already
binds to `0.0.0.0`. Allow port `5000` through the local firewall if needed.

If Google Maps configuration is required by the local Expo setup, also set:

```dotenv
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

Restart Expo after changing `.env` values so the new values are bundled.

## Running the application

### 1. Start MongoDB

Use the method appropriate for your installation.

Windows service or MongoDB Compass:

```powershell
mongod
```

macOS with Homebrew:

```bash
brew services start mongodb-community
```

Linux:

```bash
sudo systemctl start mongod
```

For MongoDB Atlas, make sure the connection string and network access rules
are configured in `MONGODB_URI`.

### 2. Start the backend

Open a terminal at the repository root:

```bash
cd backend
npm run dev
```

The development API runs at:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

Expected response:

```json
{ "status": "API is running" }
```

For a normal Node.js start without Nodemon:

```bash
npm start
```

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm start
```

Expo displays a QR code and development commands. Common commands are:

```bash
npm run android
npm run ios
npm start
```

`npm run android` and `npm run ios` use Expo native run commands configured in
the frontend package. You can also press the corresponding key in the Expo
terminal to open the app on a connected emulator or device.

## First launch and login

On the first launch, the app displays onboarding and then the login screen.
After onboarding is completed, later launches start at login.

### Regular user

Register from the login screen. Vehicle type is restricted to:

- `Car`
- `Bike`

After login, the user is taken to the map-based home screen.

### Owner

An owner account must have an approved facility before owner functionality is
available:

1. Log in with an owner account.
2. Submit the parking facility registration.
3. Wait for administrator approval.
4. Log in again after approval.

Pending and declined facilities remain in the registration status flow. An
approved owner opens the owner home map.

### Administrator

Use the configured `ADMIN_EMAIL` and `ADMIN_PASSWORD` on the normal login
screen. There is no separate administrator login screen.

## Main API routes

All routes are prefixed with `/api`.

### Authentication

| Method | Route | Authentication |
| --- | --- | --- |
| `POST` | `/auth/register` | Public |
| `POST` | `/auth/login` | Public |
| `GET` | `/auth/me` | JWT |
| `PUT` | `/auth/me` | JWT |

### Facilities

| Method | Route | Authentication |
| --- | --- | --- |
| `GET` | `/facilities` | Public |
| `GET` | `/facilities/check-name` | Public |
| `GET` | `/facilities/:facilityId/reviews` | Public |
| `POST` | `/facilities/:facilityId/reviews` | JWT |
| `PUT` | `/facilities/:facilityId/reviews/:reviewId` | JWT, review author only |
| `GET` | `/facilities/owner/me` | Owner |
| `POST` | `/facilities` | Owner |
| `PUT` | `/facilities/:facilityId` | Owner |
| `PATCH` | `/facilities/:facilityId/availability` | Owner |

Use `GET /facilities?q=term` to search approved facilities by name or address.

### Reservations

| Method | Route | Authentication |
| --- | --- | --- |
| `GET` | `/reservations/me` | JWT |
| `POST` | `/reservations` | JWT |

### Administration

| Method | Route | Authentication |
| --- | --- | --- |
| `POST` | `/admin/owners` | Administrator |
| `GET` | `/admin/facilities/pending` | Administrator |
| `PATCH` | `/admin/facilities/:facilityId/review` | Administrator |

Uploaded files are served from:

```text
GET /uploads/<filename>
```

## Project structure

```text
ParkFlowApp_WD38/
├── backend/
│   ├── src/
│   │   ├── config/          MongoDB configuration
│   │   ├── controllers/     Request and business logic
│   │   ├── middleware/      Authentication and uploads
│   │   ├── models/          Mongoose schemas
│   │   ├── routes/          Express route definitions
│   │   └── index.js         API entry point
│   ├── .env.example         Backend configuration template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      Reusable UI and map components
│   │   ├── screens/         App screens
│   │   ├── services/        Axios API service
│   │   └── App.tsx          Navigation and application entry point
│   ├── .env.example         Frontend configuration template
│   └── package.json
├── docs/                    Additional project documentation
├── shared/                  Shared project resources
└── README.md
```

## Useful development commands

### Frontend

```bash
cd frontend
npm start
npm run android
npm run ios
npm test
npm run lint
```

### Backend

```bash
cd backend
npm run dev
npm start
npm test
npm run lint
```

The backend test and lint scripts are available in `backend/package.json`.
The frontend test and lint scripts are available in `frontend/package.json`.

## Troubleshooting

### `Cannot find package 'multer'`

Install backend dependencies from the backend directory, not the repository
root:

```bash
cd backend
npm install
npm run dev
```

### Facilities do not appear

Check the following:

1. MongoDB is running.
2. The backend terminal reports a successful database connection.
3. `http://localhost:5000/api/health` responds successfully.
4. `frontend/.env` points to the correct computer address.
5. The facility was approved by an administrator. Public facility results only
   include facilities with `active` status.
6. A physical phone and the computer are connected to the same network.

### Android emulator cannot connect to the API

Use:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000/api
```

### Expo Go on a physical phone cannot connect

Use the computer's LAN IPv4 address:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:5000/api
```

Do not use `localhost` for a physical phone because it points to the phone
itself. Restart Expo after changing the value.

### Map or location does not load

- Grant location permission when requested.
- Check that the device has network access.
- The app can display facilities around the fallback Colombo region when
  location permission is unavailable.
- Native map configuration may require a platform-specific maps key.

### API reports database unavailable

Verify `MONGODB_URI`, `DB_NAME`, MongoDB service status, Atlas network access,
and database credentials. Then restart the backend.

## Security notes

- Replace all example secrets before using the application.
- Never commit `.env` files, JWT secrets, administrator passwords, or API keys.
- Use a strong unique `JWT_SECRET`.
- Restrict production CORS origins.
- Restrict Google Maps API keys to the required platforms and applications.
- Use HTTPS and a production-grade deployment configuration outside local
  development.

## Additional documentation

- [Setup guide](docs/SETUP_GUIDE.md)
- [React Native documentation](https://reactnative.dev/)
- [Expo documentation](https://docs.expo.dev/)
- [Express documentation](https://expressjs.com/)
- [MongoDB documentation](https://www.mongodb.com/docs/)
- [Mongoose documentation](https://mongoosejs.com/docs/)
- [React Navigation documentation](https://reactnavigation.org/)
