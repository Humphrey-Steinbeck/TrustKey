// TrustKey Geolocation Hook

import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: GeolocationPositionError | null;
  loading: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGeolocation(
  options: GeolocationOptions = {}
): GeolocationState & {
  getCurrentPosition: () => void;
  watchPosition: () => number;
  clearWatch: (watchId: number) => void;
} {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: new GeolocationPositionError('Geolocation is not supported by this browser.'),
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error,
          loading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
        ...options,
      }
    );
  };

  const watchPosition = (): number => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: new GeolocationPositionError('Geolocation is not supported by this browser.'),
      }));
      return -1;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    return navigator.geolocation.watchPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error,
          loading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
        ...options,
      }
    );
  };

  const clearWatch = (watchId: number) => {
    navigator.geolocation.clearWatch(watchId);
  };

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    clearWatch,
  };
}
