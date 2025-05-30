import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface Address {
  id: string;
  title: string;
  address: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const useLocationService = () => {
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [currentCoords, setCurrentCoords] = useState<LocationCoords | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  useEffect(() => {
    loadSavedAddresses();
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationPermission(granted);
      
      if (!granted) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to find services near you.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const loadSavedAddresses = async () => {
    try {
      const addresses = await AsyncStorage.getItem('savedAddresses');
      if (addresses) {
        const parsedAddresses = JSON.parse(addresses);
        setSavedAddresses(parsedAddresses);
        
        // Set default address as current if available
        const defaultAddress = parsedAddresses.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setCurrentAddress(defaultAddress.address);
          if (defaultAddress.latitude && defaultAddress.longitude) {
            setCurrentCoords({
              latitude: defaultAddress.latitude,
              longitude: defaultAddress.longitude
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const getCurrentLocation = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check and request permission
      const hasPermission = locationPermission || await requestLocationPermission();
      if (!hasPermission) {
        return false;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });

      const { latitude, longitude } = location.coords;
      setCurrentCoords({ latitude, longitude });

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const formattedAddress = formatAddress(address);
        setCurrentAddress(formattedAddress);
        
        // Save current location to AsyncStorage
        await AsyncStorage.setItem('currentLocation', JSON.stringify({
          address: formattedAddress,
          latitude,
          longitude,
          timestamp: Date.now()
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or select manually.',
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: Location.LocationGeocodedAddress): string => {
    const parts = [
      address.name,
      address.street,
      address.district,
      address.city,
      address.region,
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const saveAddress = async (newAddress: Omit<Address, 'id'>): Promise<boolean> => {
    try {
      const address: Address = {
        ...newAddress,
        id: Date.now().toString(),
      };

      // If this is set as default, remove default from others
      let updatedAddresses = [...savedAddresses];
      if (address.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: false
        }));
      }

      updatedAddresses.push(address);
      setSavedAddresses(updatedAddresses);
      await AsyncStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      
      // If this is default, set as current
      if (address.isDefault) {
        setCurrentAddress(address.address);
        if (address.latitude && address.longitude) {
          setCurrentCoords({
            latitude: address.latitude,
            longitude: address.longitude
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving address:', error);
      return false;
    }
  };

  const setDefaultAddress = async (addressId: string): Promise<boolean> => {
    try {
      const updatedAddresses = savedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));
      
      setSavedAddresses(updatedAddresses);
      await AsyncStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      
      // Set as current address
      const defaultAddress = updatedAddresses.find(addr => addr.id === addressId);
      if (defaultAddress) {
        setCurrentAddress(defaultAddress.address);
        if (defaultAddress.latitude && defaultAddress.longitude) {
          setCurrentCoords({
            latitude: defaultAddress.latitude,
            longitude: defaultAddress.longitude
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error setting default address:', error);
      return false;
    }
  };

  const deleteAddress = async (addressId: string): Promise<boolean> => {
    try {
      const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
      setSavedAddresses(updatedAddresses);
      await AsyncStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      
      // If deleted address was current, clear current
      const deletedAddress = savedAddresses.find(addr => addr.id === addressId);
      if (deletedAddress?.isDefault) {
        setCurrentAddress('');
        setCurrentCoords(null);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      return false;
    }
  };

  const searchAddresses = async (query: string): Promise<Location.LocationGeocodedLocation[]> => {
    try {
      if (query.length < 3) return [];
      
      const results = await Location.geocodeAsync(query);
      return results;
    } catch (error) {
      console.error('Error searching addresses:', error);
      return [];
    }
  };

  const selectAddress = (address: string, coords?: LocationCoords) => {
    setCurrentAddress(address);
    if (coords) {
      setCurrentCoords(coords);
    }
  };

  return {
    currentAddress,
    currentCoords,
    savedAddresses,
    isLoading,
    locationPermission,
    getCurrentLocation,
    saveAddress,
    setDefaultAddress,
    deleteAddress,
    searchAddresses,
    selectAddress,
    requestLocationPermission,
  };
};
