import { RouteData } from '../types/weather';
import { formatDistance, formatDuration } from '../utils/formatHelpers';

interface RouteSummaryProps {
  routeData: RouteData;
}

export const RouteSummary = ({ routeData }: RouteSummaryProps) => {
  const averageSpeed = routeData.distance / (routeData.duration / 3600); // km/h

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800">Route Summary</h2>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Distance</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{formatDistance(routeData.distance)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estimated Time</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{formatDuration(routeData.duration)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Waypoints</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{routeData.waypoints.length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Avg Speed</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{(averageSpeed * 0.621371).toFixed(0)} mph</p>
        </div>
      </div>
    </div>
  );
};

