# Automation UI Dashboard

A comprehensive Smart Building Management System (BMS) with SCADA-like monitoring and control capabilities for industrial buildings.

## Features

- **AHU Monitoring**: Air Handling Unit control and monitoring with temperature/humidity tracking
- **FCU Control**: Fan Coil Unit management with speed and occupancy controls
- **Energy Meter**: Real-time energy consumption monitoring and analysis
- **Fire Alarm System**: Advanced fire detection and alarm management
- **DG Monitoring**: Diesel Generator performance and fuel monitoring
- **Role-based Access**: Admin, Operator, and Viewer access levels
- **Real-time Dashboard**: Live data visualization and trend analysis

## Tech Stack

### Frontend

- React 19 + TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Recharts for data visualization
- Vite for build tooling

### Backend

- Node.js + Express
- JWT authentication
- MySQL database (with mock fallbacks)
- RESTful API architecture

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- MySQL (optional - works with mock data)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/karthigai-Pandi/Automation-UI-dash-board.git
cd automation-ui-dashboard
```

2. Install dependencies:

```bash
npm run build
```

3. Start development servers:

```bash
npm run dev
```

This will start both frontend (port 5173) and backend (port 5000) servers concurrently.

### Manual Setup (Alternative)

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

3. Start backend:

```bash
cd ../backend
npm run dev
```

4. Start frontend (in another terminal):

```bash
cd frontend
npm run dev
```

## Production Build

```bash
npm run build
```

This builds the frontend and prepares the backend for production.

## Deployment

### Render.com Deployment

1. **Connect Repository**: Link your GitHub repository to Render
2. **Service Type**: Choose "Web Service"
3. **Build Settings**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   - `NODE_ENV=production`
   - `PORT=10000` (or Render's assigned port)
   - `JWT_SECRET=your-secret-key`
   - `DB_HOST=your-database-host` (optional)
   - `DB_USER=your-database-user` (optional)
   - `DB_PASSWORD=your-database-password` (optional)
   - `DB_NAME=your-database-name` (optional)

### Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=bms_dashboard
```

## Demo Credentials

- **Admin**: admin / admin123 (Full access)
- **Operator**: operator / operator123 (Equipment control)
- **Viewer**: viewer / viewer123 (Read-only)

## API Documentation

The backend provides RESTful APIs for:

- `/api/auth` - Authentication endpoints
- `/api/dashboard` - Dashboard summary data
- `/api/ahu` - AHU monitoring and control
- `/api/fcu` - FCU monitoring and control
- `/api/energy` - Energy meter data
- `/api/fire` - Fire alarm system
- `/api/dg` - DG monitoring and control
- `/api/alarms` - Alarm management
- `/api/trends` - Trend analysis data

## Project Structure

```
automation-ui-dashboard/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Custom middleware
│   │   └── app.js         # Main application file
│   ├── db/                 # Database files
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── services/      # API services
│   ├── public/            # Static assets
│   └── package.json
├── package.json           # Root package.json for deployment
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License

## Support

For support or questions, please open an issue on GitHub.
