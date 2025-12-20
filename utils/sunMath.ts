
// Simple approximation of sun position
// Based on general astronomical algorithms

export const getSunPhase = (lat: number, lng: number, dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    
    // Get day of year
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Simple solar declination
    const declination = 23.45 * Math.sin((Math.PI / 180) * (360 / 365) * (dayOfYear - 81));

    // Approximate sunrise/sunset times (simplistic, assumes flat horizon)
    // In a real app, use 'suncalc' library. Here we do a rough estimation based on latitude.
    
    // Hour angle for sunrise/sunset
    // cos(H) = -tan(lat) * tan(decl)
    const latRad = (lat * Math.PI) / 180;
    const declRad = (declination * Math.PI) / 180;
    
    // Check polar night/day
    let hasSunrise = true;
    let hasSunset = true;
    
    // Basic clamping for acos
    let cosH = -Math.tan(latRad) * Math.tan(declRad);
    if (cosH > 1) { hasSunrise = false; hasSunset = false; } // Polar night
    if (cosH < -1) { hasSunrise = false; hasSunset = false; } // Midnight sun

    // Duration of half day in hours
    const halfDayHours = (180 / Math.PI) * Math.acos(Math.max(-1, Math.min(1, cosH))) / 15;
    
    // Solar noon is roughly 12:00 + longitude correction + equation of time
    // Simplifying: Solar Noon ~= 12:00 - (lng / 15)
    // This gives UTC solar noon.
    const solarNoonUTC = 12 - (lng / 15);
    
    // Convert to local time (very rough, assumes standard time zone for longitude)
    // Ideally we'd use timezone offset from the date object
    const timezoneOffset = -date.getTimezoneOffset() / 60; // hours
    const solarNoonLocal = solarNoonUTC + timezoneOffset;

    const sunriseTime = solarNoonLocal - halfDayHours;
    const sunsetTime = solarNoonLocal + halfDayHours;

    const currentDecimalTime = date.getHours() + (date.getMinutes() / 60);

    // Determine Phase
    if (!hasSunrise) {
        return cosH > 1 ? "Winter Night (Polar)" : "Summer Day (Polar)";
    }

    if (Math.abs(currentDecimalTime - solarNoonLocal) < 1) return "High Noon";
    if (Math.abs(currentDecimalTime - sunriseTime) < 0.5) return "Sunrise";
    if (Math.abs(currentDecimalTime - sunsetTime) < 0.5) return "Sunset";
    
    // Golden Hour (approx 1 hour after sunrise, 1 hour before sunset)
    if (currentDecimalTime > sunriseTime && currentDecimalTime < sunriseTime + 1) return "Golden Hour (Morning)";
    if (currentDecimalTime > sunsetTime - 1 && currentDecimalTime < sunsetTime) return "Golden Hour (Evening)";

    // Blue Hour (just before sunrise, just after sunset)
    if (Math.abs(currentDecimalTime - sunriseTime) < 1 && currentDecimalTime < sunriseTime) return "Blue Hour (Dawn)";
    if (Math.abs(currentDecimalTime - sunsetTime) < 1 && currentDecimalTime > sunsetTime) return "Blue Hour (Dusk)";

    if (currentDecimalTime > sunriseTime && currentDecimalTime < sunsetTime) return "Daytime";
    
    return "Night";
};

export const getSeason = (lat: number, month: number) => {
    // 0 = Jan, 11 = Dec
    const isNorthern = lat >= 0;
    
    if (month >= 2 && month <= 4) return isNorthern ? "Spring" : "Autumn";
    if (month >= 5 && month <= 7) return isNorthern ? "Summer" : "Winter";
    if (month >= 8 && month <= 10) return isNorthern ? "Autumn" : "Spring";
    return isNorthern ? "Winter" : "Summer";
};
