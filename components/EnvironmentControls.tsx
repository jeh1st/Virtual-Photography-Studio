
import React, { useEffect, useState, useMemo } from 'react';
import { Weather, Season, LocationConfig } from '../types';
import { WEATHER_OPTIONS, SEASON_OPTIONS } from '../constants';
import SelectInput from './SelectInput';
import TextInput from './TextInput';
import { getSunPhase, getSeason } from '../utils/sunMath';

interface EnvironmentControlsProps {
    location: LocationConfig;
    date: string;
    time: string;
    weather: Weather;
    season: Season;
    onLocationChange: (loc: LocationConfig) => void;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
    onWeatherChange: (val: string) => void;
    onSeasonChange: (val: string) => void;
}

const EnvironmentControls: React.FC<EnvironmentControlsProps> = ({ 
    location, date, time, weather, season, 
    onLocationChange, onDateChange, onTimeChange, onWeatherChange, onSeasonChange 
}) => {
    const [sunPhase, setSunPhase] = useState<string>("");
    const [geoLoading, setGeoLoading] = useState(false);

    // Auto-calculate Sun Phase and Season based on inputs
    useEffect(() => {
        if (location.latitude && location.longitude && date && time) {
            const phase = getSunPhase(location.latitude, location.longitude, date, time);
            setSunPhase(phase);

            if (date) {
                const month = new Date(date).getMonth();
                getSeason(location.latitude, month); // just used for logic if needed
            }
        }
    }, [location, date, time]);

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                onLocationChange({
                    name: "Current Location",
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    useCurrent: true
                });
                setGeoLoading(false);
            },
            (error) => {
                console.error(error);
                alert("Unable to retrieve location. Please enter manually.");
                setGeoLoading(false);
            }
        );
    };

    // Calculate rotation for clock hand
    const getRotation = () => {
        if (!time) return 0;
        const [h, m] = time.split(':').map(Number);
        const hours = h % 12;
        // 360 degrees / 12 hours = 30 deg per hour
        // + minutes contribution
        return (hours * 30) + (m * 0.5);
    };

    // Determine background gradient for clock
    const getClockBackground = () => {
        if (sunPhase.includes("Night") || sunPhase.includes("Midnight")) return "bg-gradient-to-b from-indigo-950 to-black";
        if (sunPhase.includes("Blue")) return "bg-gradient-to-b from-blue-900 to-indigo-900";
        if (sunPhase.includes("Sunrise")) return "bg-gradient-to-t from-orange-400 to-blue-400";
        if (sunPhase.includes("Sunset")) return "bg-gradient-to-b from-blue-500 to-orange-500";
        if (sunPhase.includes("Golden")) return "bg-gradient-to-br from-yellow-300 to-orange-400";
        return "bg-gradient-to-b from-sky-400 to-sky-200"; // Day
    };

    const isNight = useMemo(() => {
        const p = sunPhase.toLowerCase();
        return p.includes('night') || p.includes('midnight') || p.includes('blue hour');
    }, [sunPhase]);

    // Filter Weather Options based on time
    const filteredWeatherOptions = useMemo(() => {
        return WEATHER_OPTIONS.filter(w => {
            if (isNight) {
                // Remove sunny/clear options that imply daylight if strict, 
                // but we keep 'clear' as we'll map it to 'starry' in prompt builder
                // We mainly want to remove "Cloudy" if it blocks stars? No, cloudy night is valid.
                return true; 
            } else {
                return true;
            }
        });
    }, [isNight]);

    // Helper to render weather label contextually
    const getWeatherLabel = (val: string) => {
        if (val === Weather.Clear && isNight) return "Clear Starry Skies";
        if (val === Weather.Clear && !isNight) return "Clear Sunny Skies";
        return val;
    };

    return (
        <div className="space-y-6">
            {/* Location Section */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Location</h3>
                    <button 
                        onClick={handleGetCurrentLocation}
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                        <svg className={`w-3 h-3 ${geoLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {geoLoading ? "Locating..." : "Use Current"}
                    </button>
                </div>
                <TextInput 
                    label="" 
                    value={location.name} 
                    onChange={(e) => onLocationChange({...location, name: e.target.value, useCurrent: false})} 
                    placeholder="e.g. Paris, France or 40.7, -74.0" 
                />
            </div>

            {/* Time & Date with Dynamic Clock Face */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Time</h3>
                
                <div className="flex items-center gap-5 mb-4">
                    {/* Visual Clock */}
                    <div className={`w-16 h-16 rounded-full border-2 border-gray-600 relative shadow-inner overflow-hidden ${getClockBackground()} flex items-center justify-center`}>
                         {/* Clock Center Dot */}
                         <div className="w-1.5 h-1.5 bg-white rounded-full z-10 shadow-sm"></div>
                         
                         {/* Hour Hand */}
                         <div 
                            className="absolute w-0.5 h-6 bg-white origin-bottom rounded-full shadow-sm"
                            style={{ 
                                bottom: '50%', 
                                left: 'calc(50% - 1px)', 
                                transform: `rotate(${getRotation()}deg)` 
                            }}
                         ></div>
                         
                         {/* Minute Hand */}
                         <div 
                            className="absolute w-0.5 h-7 bg-white/70 origin-bottom rounded-full"
                            style={{ 
                                bottom: '50%', 
                                left: 'calc(50% - 1px)', 
                                transform: `rotate(${Number(time.split(':')[1]) * 6}deg)` 
                            }}
                         ></div>
                         
                         {/* Tick Marks (4 main) */}
                         <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-white/50"></div>
                         <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-white/50"></div>
                         <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-0.5 bg-white/50"></div>
                         <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-0.5 bg-white/50"></div>
                    </div>

                    <div className="flex-grow">
                         <div className="flex justify-between items-baseline mb-1">
                             <span className="text-2xl font-mono text-white font-bold tracking-widest">{time}</span>
                             <span className="text-xs text-purple-300 font-bold uppercase">{sunPhase}</span>
                         </div>
                         <input 
                            type="time" 
                            value={time} 
                            onChange={(e) => onTimeChange(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-xs text-gray-400 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                </div>

                 <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => onDateChange(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700/50 rounded-lg py-2 px-3 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
            </div>

            {/* Weather & Season */}
            <div className="space-y-4">
                 <SelectInput 
                    label="Weather Condition" 
                    value={weather} 
                    onChange={(e) => onWeatherChange(e.target.value)} 
                    options={filteredWeatherOptions} 
                    labelMap={WEATHER_OPTIONS.reduce((acc, w) => ({...acc, [w]: getWeatherLabel(w)}), {})}
                />
                 <SelectInput 
                    label="Season" 
                    value={season} 
                    onChange={(e) => onSeasonChange(e.target.value)} 
                    options={SEASON_OPTIONS} 
                />
            </div>
        </div>
    );
};

export default EnvironmentControls;
