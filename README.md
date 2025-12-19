# Weather Route Visualizer for Truck Dispatchers

A standalone web application that displays weather conditions and forecasts along trucking routes from point A to point B. Designed for dispatchers to monitor weather patterns and generate automated client messaging.

## Features

- **Interactive Map**: Visualize the route with weather overlays and markers at waypoints
- **Weather Data**: Current conditions and forecasts for major cities along the route
- **Severe Weather Alerts**: Only displays weather data for severe conditions that could hinder driving
- **Automated Client Advice**: AI-generated messages for dispatchers to send to clients based on weather analysis
- **Route Information**: Distance, estimated time, and waypoint details
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **React + TypeScript**: Modern frontend framework
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Leaflet.js**: Interactive map library
- **OpenRouteService API**: Route calculation
- **OpenWeatherMap API**: Weather data

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

### API Keys

API keys are pre-configured in the application. If you need to use different keys:

1. **OpenRouteService** (free tier: 2,000 requests/day)
   - Sign up at: https://openrouteservice.org/dev/#/signup
   - Get your API key from the dashboard

2. **OpenWeatherMap** (free tier: 1,000 calls/day)
   - Sign up at: https://openweathermap.org/api
   - Get your API key from the account page

### Running the Application

1. Start the development server:

```bash
npm run dev
```

2. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

3. Enter origin and destination addresses to calculate a route

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to any static hosting service.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Vercel.

## Usage

1. **Enter Route**: Input origin and destination addresses or city names
2. **View Route**: The map displays the calculated route with weather markers for severe conditions only
3. **Check Weather**: Weather cards show severe weather conditions for major cities along the route
4. **Get Client Message**: The advice generator provides automated messaging for clients
5. **Copy Message**: Click "Copy Message" to copy the generated advice to clipboard

## Weather Alerts

The application only displays weather for severe conditions that could hinder driving:
- **Severe Weather**: Thunderstorms, snow, ice, heavy rain, blizzards
- **High Winds**: > 30 mph (affects truck stability)
- **Reduced Visibility**: < 1 mile (severe fog/conditions)

## Project Structure

```
weather-route-visualizer/
├── src/
│   ├── components/       # React components
│   ├── services/         # API service functions
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── public/              # Static assets
└── index.html           # HTML entry point
```

## License

MIT

