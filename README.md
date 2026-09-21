# Cosmos

Cosmos is a microfrontend application for authentication, administration, and telemetry tracking.

## Architecture

- `backend/` - Express API, MySQL authentication, telemetry API, and WebSocket server
- `frontend/shell-host/shell/` - React host application at `http://localhost:5000`
- `frontend/react-auth/` - authentication microfrontend at `http://localhost:5001`
- `frontend/react-admin/console-admin/` - administration microfrontend at `http://localhost:5002`
- `frontend/react-admin/shared/` - shared layout and authentication services at `http://localhost:5003`
- `frontend/angular-tracker/tracker/` - Angular telemetry tracker at `http://localhost:5004`

The shell composes the frontend microfrontends through Webpack Module Federation.

## Requirements

- Node.js and npm
- MySQL
- A configured backend environment file

## Backend Setup

1. Create the database using [`backend/schema.sql`](backend/schema.sql).
2. Configure the backend environment variables, including database credentials and JWT secrets.
3. Install dependencies and start the API:

```powershell
cd backend
npm install
npm start
```

The API listens on `http://localhost:3000`.

## Frontend Setup

Install dependencies once in each frontend application:

```powershell
cd frontend/react-auth
npm install

cd ../../frontend/react-admin/console-admin
npm install

cd ../../frontend/react-admin/shared
npm install

cd ../../frontend/shell-host/shell
npm install

cd ../../frontend/angular-tracker/tracker
npm install
```

Start each service in a separate terminal:

```powershell
cd frontend/react-auth
npm start
```

```powershell
cd frontend/react-admin/console-admin
npm start
```

```powershell
cd frontend/react-admin/shared
npm start
```

```powershell
cd frontend/shell-host/shell
npm start
```

```powershell
cd frontend/angular-tracker/tracker
npm start
```

Open the application at `http://localhost:5000`.

## Main Routes

- `/login` - sign in or register
- `/admin/dashboard` - telemetry dashboard
- `/admin/users` - user list
- `/tracker` - Angular tracker

The admin and tracker routes are protected by the shell authentication guard. Logout clears the in-memory access token and invalidates the HttpOnly refresh cookie through the backend.

## Production Builds

Run the production build in each frontend application:

```powershell
npm run build
```

The backend currently provides a start script only; use `npm start` to run it.
