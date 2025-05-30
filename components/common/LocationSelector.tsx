import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import { useLocationService } from '@/hooks/useLocationService';
import { MapPin, Search, Navigation, Plus } from 'lucide-react-native';
import * as Location from 'expo-location';

interface LocationSelectorProps {
  onLocationSelect: (address: string, coords?: { latitude: number; longitude: number }) => void;
  onClose: () => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  onClose,
}) => {
  const {
    currentAddress,
    savedAddresses,
    isLoading,
    getCurrentLocation,
    searchAddresses,
    setDefaultAddress,
  } = useLocationService();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location.LocationGeocodedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleCurrentLocation = async () => {
    const success = await getCurrentLocation();
    if (success && currentAddress) {
      onLocationSelect(currentAddress);
      onClose();
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      setIsSearching(true);
      const results = await searchAddresses(query);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchResultSelect = (result: Location.LocationGeocodedLocation) => {
    const address = formatSearchResult(result);
    onLocationSelect(address, {
      latitude: result.latitude,
      longitude: result.longitude,
    });
    onClose();
  };

  const handleSavedAddressSelect = async (address: any) => {
    await setDefaultAddress(address.id);
    onLocationSelect(address.address, {
      latitude: address.latitude,
      longitude: address.longitude,
    });
    onClose();
  };

  const formatSearchResult = (result: Location.LocationGeocodedLocation): string => {
    // Format the search result into a readable address
    return `${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`;
  };

  const renderSavedAddress = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.addressItem, item.isDefault && styles.defaultAddress]}
      onPress={() => handleSavedAddressSelect(item)}
    >
      <View style={styles.addressIcon}>
        <MapPin size={20} color={item.isDefault ? COLORS.primary : COLORS.darkGray} />
      </View>
      <View style={styles.addressInfo}>
        <Text style={styles.addressTitle}>{item.title}</Text>
        <Text style={styles.addressText}>{item.address}</Text>
        {item.isDefault && (
          <Text style={styles.defaultText}>Default</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: Location.LocationGeocodedLocation }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleSearchResultSelect(item)}
    >
      <MapPin size={20} color={COLORS.darkGray} />
      <Text style={styles.searchResultText}>
        {formatSearchResult(item)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Location</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={handleCurrentLocation}
        disabled={isLoading}
      >
        <Navigation size={20} color={COLORS.primary} />
        <Text style={styles.currentLocationText}>
          {isLoading ? 'Getting location...' : 'Use Current Location'}
        </Text>
        {isLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
      </TouchableOpacity>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.darkGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for area, street name..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {isSearching && <ActivityIndicator size="small" color={COLORS.primary} />}
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderSearchResult}
            style={styles.resultsList}
          />
        </View>
      )}

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          <FlatList
            data={savedAddresses}
            keyExtractor={(item) => item.id}
            renderItem={renderSavedAddress}
            style={styles.resultsList}
          />
        </View>
      )}

      {/* Add New Address Button */}
      <TouchableOpacity style={styles.addAddressButton}>
        <Plus size={20} color={COLORS.primary} />
        <Text style={styles.addAddressText}>Add New Address</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding * 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.black,
  },
  closeButton: {
    ...FONTS.h3,
    color: COLORS.darkGray,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding * 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  currentLocationText: {
    ...FONTS.body2,
    color: COLORS.primary,
    marginLeft: SIZES.padding,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SIZES.padding * 2,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.padding,
    ...FONTS.body2,
    color: COLORS.black,
  },
  section: {
    paddingHorizontal: SIZES.padding * 2,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  resultsList: {
    maxHeight: 200,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  defaultAddress: {
    backgroundColor: COLORS.primary + '10',
  },
  addressIcon: {
    marginRight: SIZES.padding,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitle: {
    ...FONTS.body2,
    color: COLORS.black,
    fontWeight: '600',
  },
  addressText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  defaultText: {
    ...FONTS.body4,
    color: COLORS.primary,
    marginTop: 2,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchResultText: {
    ...FONTS.body3,
    color: COLORS.black,
    marginLeft: SIZES.padding,
    flex: 1,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  addAddressText: {
    ...FONTS.body2,
    color: COLORS.primary,
    marginLeft: SIZES.padding,
  },
});
