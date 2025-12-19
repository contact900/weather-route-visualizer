import { useState } from 'react';
import { WaypointWeather } from '../types/weather';
import { generateClientAdvice, getAdviceColor, WeatherAdvice } from '../services/adviceService';

interface AdviceGeneratorProps {
  waypointWeathers: WaypointWeather[];
  pickupDate?: Date;
  deliveryDate?: Date;
}

export const AdviceGenerator = ({ waypointWeathers, pickupDate, deliveryDate }: AdviceGeneratorProps) => {
  const [copied, setCopied] = useState(false);

  if (waypointWeathers.length === 0) {
    return null;
  }

  const advice: WeatherAdvice = generateClientAdvice(waypointWeathers, pickupDate, deliveryDate);
  const colorClass = getAdviceColor(advice.severity);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(advice.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className={`border-2 rounded-2xl p-8 shadow-xl ${colorClass} backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-10 rounded-full ${
            advice.severity === 'severe' ? 'bg-red-600' :
            advice.severity === 'moderate' ? 'bg-orange-600' :
            advice.severity === 'minor' ? 'bg-yellow-600' : 'bg-green-600'
          }`}></div>
          <h3 className="text-2xl font-bold">Client Message</h3>
        </div>
        <button
          onClick={handleCopy}
          className="px-5 py-2.5 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          {copied ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Message
            </span>
          )}
        </button>
      </div>
      <p className="text-lg leading-relaxed mb-6 font-medium">{advice.message}</p>
      {advice.details.length > 0 && (
        <div className="mt-6 pt-6 border-t-2 border-current border-opacity-20">
          <h4 className="font-bold mb-3 text-lg">Additional Details:</h4>
          <ul className="space-y-2">
            {advice.details.map((detail, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

