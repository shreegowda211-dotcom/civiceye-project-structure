# LocationInput Component - Usage Guide

## Overview
Production-ready location input component using **OpenStreetMap Nominatim API** (free, no API key required).

## Features
✅ **Location Search** - Type location to get suggestions from Nominatim  
✅ **Current Location** - Browser geolocation with reverse geocoding  
✅ **Map Preview** - Leaflet map with marker (loads on demand)  
✅ **Error Handling** - User-friendly error messages  
✅ **Loading States** - Shows loading indicators  
✅ **Tailwind Styled** - Clean, responsive UI  

## Basic Usage

```jsx
import { useState } from 'react';
import LocationInput from '@/components/common/LocationInput';

function MyForm() {
  const [location, setLocation] = useState({});

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    console.log('Selected location:', newLocation);
  };

  return (
    <div className="space-y-4">
      <LocationInput
        value={location}
        onChange={handleLocationChange}
        required={true}
      />
      
      {location.lat && (
        <div>
          <p>📍 Address: {location.address}</p>
          <p>Coordinates: {location.lat}, {location.lng}</p>
        </div>
      )}
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Object` | `{}` | Selected location `{address, lat, lng, placeId}` |
| `onChange` | `Function` | `() => {}` | Callback when location changes |
| `error` | `String` | `null` | Error message to display |
| `required` | `Boolean` | `true` | Makes field required (shows *) |

## Return Value

When a location is selected, `onChange` receives:

```js
{
  address: "Mumbai, Maharashtra, India",
  lat: 19.0760,
  lng: 72.8777,
  placeId: 123456,
  addressDetails: {...}  // Full address components
}
```

## Features Explained

### 1. Search Locations
- User types location name
- Shows up to 8 suggestions from Nominatim
- Includes location type (city, street, etc.)

### 2. Current Location Button
- Clicks to detect user's GPS location
- Reverse geocodes coordinates to address
- Shows "Locating..." status during fetch

### 3. Map Preview (Optional)
- Shows after selecting a location
- Uses free Leaflet map
- Adds marker at exact coordinates
- Loads CDN resources dynamically

### 4. Error Handling
- Shows permission denied for geolocation
- Handles API failures gracefully
- Displays friendly error messages

## Integration with Complaint Form

```jsx
import { useState } from 'react';
import LocationInput from '@/components/common/LocationInput';
import { reportAPI } from '@/services/api';

function ReportIssuePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: {},
    image: null,
  });

  const handleLocationChange = (location) => {
    setFormData(prev => ({ ...prev, location }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate location
    if (!formData.location?.lat || !formData.location?.lng) {
      alert('Please select a location');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('location', formData.location.address);
    formDataToSend.append('latitude', formData.location.lat);
    formDataToSend.append('longitude', formData.location.lng);
    formDataToSend.append('image', formData.image);

    try {
      await reportAPI.submitIssue(formDataToSend);
      alert('Issue reported successfully!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        placeholder="Complaint title"
        value={formData.title}
        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
        required
      />

      <textarea
        placeholder="Describe the issue"
        value={formData.description}
        onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
        required
      />

      {/* Location Input Component */}
      <LocationInput
        value={formData.location}
        onChange={handleLocationChange}
        required={true}
      />

      <button type="submit">Submit Complaint</button>
    </form>
  );
}
```

## API Used

### Nominatim Search API
```
GET https://nominatim.openstreetmap.org/search?format=json&q=QUERY&limit=8
```
- **Free**: No API key required
- **Rate limit**: 1 request/second
- **Documentation**: https://nominatim.org/

### Nominatim Reverse Geocoding
```
GET https://nominatim.openstreetmap.org/reverse?format=json&lat=LAT&lon=LON
```
- Used to convert coordinates to address

### Leaflet Map (Optional)
```
https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/
```
- Free map library
- Loads on demand when location is selected

## Customization

### Change Map Zoom Level
Edit in `renderMap` function:
```jsx
const map = window.L.map('location-map').setView(
  [location.lat, location.lng],
  15  // ← Change this (higher = more zoomed in)
);
```

### Customize Suggestion Count
Edit in `fetchLocationSuggestions`:
```jsx
`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8`
                                                                                    // ↑ Change this
```

### Change Search Delay
Edit debounce timer in `handleLocationChange`:
```jsx
debounceTimerRef.current = setTimeout(() => {
  // ...
}, 300);  // ← milliseconds (300ms delay)
```

### Restrict to Specific Country
Nominatim supports country restrictions:
```jsx
// In fetchLocationSuggestions
const query = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&countrycodes=in`;
// countrycodes=in restricts to India
```

## No Dependencies
✅ **No Google Maps API key needed**  
✅ **No extra npm packages**  
✅ **Uses native fetch API**  
✅ **Map loads from CDN**  

## Browser Support
- ✅ Chrome/Edge (v60+)
- ✅ Firefox (v55+)
- ✅ Safari (v12+)
- ✅ Mobile browsers

## Troubleshooting

### Geolocation Not Working
- Check browser permissions for location access
- Geolocation requires HTTPS (except localhost)
- Some browsers require user interaction before accessing location

### Map Not Showing
- Map loads only when location is selected
- Leaflet CDN must be accessible
- Check browser console for errors

### No Suggestions
- Nominatim requires at least 2 characters
- Search uses 300ms debounce
- Rate limit: 1 request/second (respect this)

### Slow Performance
- Nominatim is free but has rate limits
- Consider implementing caching for frequently searched locations
- Debounce search input to reduce requests
