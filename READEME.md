# Delivery Route Optimization System

## Project Overview
A web-based application for optimizing delivery routes and managing driver schedules. The system simulates delivery scenarios to maximize efficiency and profit while maintaining timely deliveries.

## Tech Stack
### Frontend
- React 19 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Axios for API calls
- React Context for state management

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Git

### Frontend Setup
1. Clone the repository
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

### Backend Setup
1. Navigate to backend directory
```bash
cd server
```

2. Install dependencies
```bash
npm install
```

3. Start server
```bash
npm run dev
```

### Frontend 
```
Modify vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  ----------
  server:{
    proxy: {
      '/backend': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/backend/, '')
      }
    }
  }
  ----------
});

```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI="mongodb+srv://username:<password>@cluster0.xwlzvmongodb.net/"
JWT_SECRET="jwt-secret-token"
NODE_ENV=development
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "string",
  "password": "string"
}
```

### Simulation Endpoints

#### POST /api/simulation/run
Run delivery simulation
```json
{
  "availableDrivers": "number",
  "routeStartTime": "string",
  "maxHoursPerDriver": "number"
}
```

### Driver Endpoints

#### GET /api/drivers
Get all drivers

#### POST /api/drivers
Add new driver
```json
{
  "name": "string",
  "contact": "string"
}
```

## Deployment Instructions

### Frontend Deployment
1. Build the project
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service
```bash
# Example for Netlify
netlify deploy
```

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Deploy using your preferred service (Heroku, DigitalOcean, etc.)
```bash
# Example for Heroku
git push heroku main
```

## Additional Information
- The simulation algorithm optimizes for:
  - Driver utilization
  - Delivery timing
  - Fuel costs
  - Customer satisfaction
- Real-time updates for delivery status
- Comprehensive error handling
- Mobile-responsive design

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a pull request
