import React, { useState, useRef, useCallback } from 'react';
import { MapPin, Loader, X, Navigation } from 'lucide-react';

/**
 * LocationInput Component - Production-ready OpenStreetMap Nominatim API
 * Features:
 * - Nominatim Autocomplete suggestions (free, no API key needed)
 * - Browser geolocation support
 * - Loading states and error handling
 * - Clean Tailwind UI with map preview
 */
export default function LocationInput({
  value = {},
  onChange = () => {},
  error = null,
  required = true,
}) {
  // State management
  const [inputValue, setInputValue] = useState(value.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeoLocating, setIsGeoLocating] = useState(false);
  const [localError, setLocalError] = useState(error || null);

  // Refs
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Fetch suggestions from Nominatim API
  const fetchLocationSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      setLocalError(null);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}&limit=8`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location suggestions');
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setSuggestions(data);
      } else {
        setSuggestions([]);
        setLocalError('No locations found');
      }
    } catch (err) {
      console.error('Nominatim API error:', err);
      setLocalError('Failed to fetch locations. Please try again.');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle location input with debounce
  const handleLocationChange = useCallback(
    (e) => {
      const value = e.target.value;
      setInputValue(value);
      setLocalError(null);

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer for debounced search
      debounceTimerRef.current = setTimeout(() => {
        if (value.length >= 2) {
          fetchLocationSuggestions(value);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, 300);
    },
    [fetchLocationSuggestions]
  );

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion) => {
      const {
        display_name,
        lat,
        lon,
        place_id,
        address,
      } = suggestion;

      // Format address from display_name
      const formattedAddress = display_name || 'Unknown location';

      setInputValue(formattedAddress);
      setSuggestions([]);
      setShowSuggestions(false);
      setLocalError(null);

      // Update parent state
      onChange({
        address: formattedAddress,
        lat: parseFloat(lat),
        lng: parseFloat(lon),
        placeId: place_id,
        addressDetails: address,
      });

      // Initialize map
      initializeMap({
        lat: parseFloat(lat),
        lng: parseFloat(lon),
      });
    },
    [onChange]
  );

  // Get current location using browser geolocation
  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocalError('Geolocation is not supported by your browser');
      return;
    }

    setIsGeoLocating(true);
    setLocalError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode using Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'Accept': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Reverse geocoding failed');
          }

          const data = await response.json();
          const address = data.address?.name || data.display_name || 'Current Location';

          setInputValue(address);
          setIsGeoLocating(false);

          onChange({
            address: data.display_name || address,
            lat: latitude,
            lng: longitude,
            placeId: data.place_id,
            addressDetails: data.address,
          });

          // Initialize map
          initializeMap({
            lat: latitude,
            lng: longitude,
          });
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          setIsGeoLocating(false);
          setLocalError('Failed to get address from coordinates');
        }
      },
      (err) => {
        setIsGeoLocating(false);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocalError(
              'Location permission denied. Please enable it in your browser settings.'
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setLocalError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setLocalError('The location request timed out.');
            break;
          default:
            setLocalError('Failed to get your location');
        }
      }
    );
  }, [onChange]);



  // Render map
  const renderMap = useCallback((location) => {
    const mapContainer = document.getElementById('location-map');
    if (!mapContainer) return;

    // Clear previous map
    if (window.mapInstance) {
      window.mapInstance.remove();
    }

    // Configure default marker icons to use local paths
    window.L.Icon.Default.prototype.options.iconUrl = '/libs/leaflet/images/marker-icon.png';
    window.L.Icon.Default.prototype.options.iconRetinaUrl = '/libs/leaflet/images/marker-icon-2x.png';
    window.L.Icon.Default.prototype.options.shadowUrl = '/libs/leaflet/images/marker-shadow.png';

    // Create new map
    const map = window.L.map('location-map').setView(
      [location.lat, location.lng],
      15
    );

    window.mapInstance = map;

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker
    window.L.marker([location.lat, location.lng])
      .addTo(map)
      .bindPopup('Selected Location')
      .openPopup();
  }, []);

  // Initialize simple map using local Leaflet
  const initializeMap = useCallback((location) => {
    // Load Leaflet if not already loaded
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/libs/leaflet/leaflet.min.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = '/libs/leaflet/leaflet.min.js';
      script.onload = () => {
        renderMap(location);
      };
      document.head.appendChild(script);
    } else {
      renderMap(location);
    }
  }, [renderMap]);

  // Clear selection
  const handleClear = useCallback(() => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setLocalError(null);
    onChange({});
  }, [onChange]);

  // Check if location is selected
  const isLocationSelected = value?.lat && value?.lng;

  return (
    <div className="w-full space-y-3">
      {/* Label */}
      <label className="block text-sm font-semibold text-slate-700">
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600" />
          {required ? 'Location *' : 'Location'}
        </span>
      </label>

      {/* Input Container */}
      <div className="relative">
        <div className="flex gap-2">
          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleLocationChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search location (e.g., Mumbai, Main Street)"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all outline-none ${
                localError
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200'
                  : isLocationSelected
                    ? 'border-emerald-300 bg-emerald-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
              }`}
              required={required}
              autoComplete="off"
            />

            {/* Loading indicator */}
            {isLoading && (
              <Loader className="absolute right-3 top-3 h-5 w-5 animate-spin text-emerald-600" />
            )}

            {/* Clear button */}
            {inputValue && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-3 p-1 hover:bg-slate-200 rounded"
              >
                <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Current Location Button */}
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={isGeoLocating}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {isGeoLocating ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Locating...</span>
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4" />
                <span className="hidden sm:inline">Current</span>
              </>
            )}
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-emerald-50 focus:bg-emerald-100 border-b border-slate-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {suggestion.display_name.split(',').slice(0, 2).join(',')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {suggestion.type}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSuggestions && !isLoading && suggestions.length === 0 && inputValue.length >= 2 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center">
            <p className="text-sm text-slate-500">No locations found</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {localError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{localError}</p>
        </div>
      )}

      {/* Selected Location Display */}
      {isLocationSelected && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-900 line-clamp-2">
                {value.address}
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                📍 {value.lat?.toFixed(6)}, {value.lng?.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map Preview */}
      {isLocationSelected && (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm">
          <div
            id="location-map"
            className="w-full bg-slate-100"
            style={{ height: '200px', minHeight: '200px' }}
          />
        </div>
      )}
    </div>
  );
}
