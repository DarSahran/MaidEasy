import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocationService } from '@/hooks/useLocationService';
import { supabase } from '@/config/supabase';
import { LocationSelector } from '@/components/common/LocationSelector';
import { MapPin, Star, Search, Bell, ArrowRight } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { currentAddress, getCurrentLocation } = useLocationService();
  const [services, setServices] = useState([]);
  const [topRatedMaids, setTopRatedMaids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  useEffect(() => {
    loadData();
    // Auto-get location on first load
    if (!currentAddress) {
      getCurrentLocation();
    }
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchServices(),
        fetchTopRatedMaids()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchTopRatedMaids = async () => {
    try {
      const { data, error } = await supabase
        .from('maids')
        .select('*')
        .eq('verified', true)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setTopRatedMaids(data || []);
    } catch (error) {
      console.error('Error fetching maids:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleServicePress = (service) => {
    router.push({
      pathname: '/(booking)/service',
      params: { 
        serviceId: service.id,
        serviceName: service.name,
        serviceCategory: service.category
      }
    });
  };

  const handleMaidPress = (maid) => {
    router.push({
      pathname: '/(booking)/service',
      params: { 
        maidId: maid.id,
        maidName: maid.name
      }
    });
  };

  const handleLocationSelect = (address, coords) => {
    console.log('Selected address:', address, coords);
    // You can save this to context or state as needed
  };

  const handleSearchPress = () => {
    // Navigate to search screen or show search modal
    Alert.alert('Search', 'Search functionality coming soon!');
  };

  const handleNotificationPress = () => {
    router.push('/(tabs)/notifications');
  };

  const getDisplayName = () => {
    return user?.user_metadata?.displayName || 
           user?.email?.split('@')[0] || 
           'Guest';
  };

  const getProfileInitial = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const renderServiceCard = ({ item: service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServicePress(service)}
    >
      <Image source={{ uri: service.image }} style={styles.serviceImage} />
      <View style={styles.serviceContent}>
        <Text style={styles.serviceTitle}>{service.name}</Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {service.description}
        </Text>
        <View style={styles.serviceFooter}>
          <Text style={styles.servicePrice}>₹{service.price}</Text>
          <View style={styles.serviceDuration}>
            <Text style={styles.serviceDurationText}>{service.duration} min</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMaidCard = ({ item: maid }) => (
    <TouchableOpacity
      style={styles.maidCard}
      onPress={() => handleMaidPress(maid)}
    >
      <Image source={{ uri: maid.image }} style={styles.maidImage} />
      <View style={styles.maidInfo}>
        <Text style={styles.maidName}>{maid.name}</Text>
        <View style={styles.ratingContainer}>
          <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
          <Text style={styles.ratingText}>{maid.rating}</Text>
          <Text style={styles.reviewsText}>({maid.reviews_count})</Text>
        </View>
        <View style={styles.skillsContainer}>
          {maid.skills?.slice(0, 2).map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
        {maid.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}
        <Text style={styles.maidPrice}>₹{maid.price_per_hour}/hr</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPromoBanner = () => (
    <View style={styles.promoBanner}>
      <View style={styles.promoContent}>
        <Text style={styles.promoTitle}>Special Offer!</Text>
        <Text style={styles.promoSubtitle}>Get 20% off on your first booking</Text>
        <TouchableOpacity style={styles.promoButton}>
          <Text style={styles.promoButtonText}>Claim Now</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.promoImage}>
        <Text style={styles.promoEmoji}>🎉</Text>
      </View>
    </View>
  );

  const renderEmptyState = (type) => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {type === 'services' ? 'No services available' : 'No maids available'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadData}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfoContainer}>
            <Text style={styles.greeting}>
              {t('Hello')}, {getDisplayName()}
            </Text>
            <TouchableOpacity 
              style={styles.locationContainer}
              onPress={() => setShowLocationSelector(true)}
            >
              <MapPin size={16} color={COLORS.darkGray} />
              <Text style={styles.locationText} numberOfLines={1}>
                {currentAddress || 'Select location'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.profileContainer}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.profileImageContainer}>
              <Text style={styles.profileInitial}>{getProfileInitial()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress}>
            <Search size={20} color={COLORS.darkGray} />
            <Text style={styles.searchPlaceholder}>Search for services...</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={handleNotificationPress}
          >
            <Bell size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Promo Banner */}
        {renderPromoBanner()}

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('Our Services')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {services.length === 0 ? (
            renderEmptyState('services')
          ) : (
            <FlatList
              data={services}
              renderItem={renderServiceCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.serviceRow}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Top Rated Maids */}
        {topRatedMaids.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('Top Rated Maids')}</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={topRatedMaids}
              renderItem={renderMaidCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.maidsListContainer}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/bookings')}
            >
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>My Bookings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/history')}
            >
              <Text style={styles.quickActionIcon}>📋</Text>
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionIcon}>🎫</Text>
              <Text style={styles.quickActionText}>Coupons</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionIcon}>💬</Text>
              <Text style={styles.quickActionText}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Location Selector Modal */}
      <Modal
        visible={showLocationSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <LocationSelector
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowLocationSelector(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginTop: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: SIZES.padding * 6,
    paddingBottom: SIZES.padding,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  userInfoContainer: {
    flex: 1,
    marginRight: SIZES.padding,
  },
  greeting: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginLeft: 4,
    flex: 1,
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    ...FONTS.h4,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    marginRight: SIZES.padding,
  },
  searchPlaceholder: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginLeft: SIZES.padding,
  },
  notificationButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
  },
  promoBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    marginHorizontal: SIZES.padding * 2,
    marginVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 2,
    ...SHADOWS.medium,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    ...FONTS.h3,
    color: COLORS.white,
    marginBottom: 4,
  },
  promoSubtitle: {
    ...FONTS.body3,
    color: COLORS.white,
    marginBottom: SIZES.padding,
    opacity: 0.9,
  },
  promoButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  promoImage: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.padding,
  },
  promoEmoji: {
    fontSize: 40,
  },
  section: {
    paddingHorizontal: SIZES.padding * 2,
    marginTop: SIZES.padding * 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.black,
  },
  seeAllText: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  serviceRow: {
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    width: '48%',
    marginBottom: SIZES.padding,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  serviceImage: {
    width: '100%',
    height: 100,
  },
  serviceContent: {
    padding: SIZES.padding,
  },
  serviceTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 4,
  },
  serviceDescription: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginBottom: 8,
    lineHeight: 18,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  serviceDuration: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serviceDurationText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    fontSize: 10,
  },
  maidsListContainer: {
    paddingRight: SIZES.padding,
  },
  maidCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginRight: SIZES.padding,
    width: 160,
    ...SHADOWS.small,
  },
  maidImage: {
    width: '100%',
    height: 120,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  maidInfo: {
    flex: 1,
  },
  maidName: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    ...FONTS.body4,
    color: COLORS.black,
    marginLeft: 4,
    fontWeight: '600',
  },
  reviewsText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginLeft: 2,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  skillBadge: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  skillText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    fontSize: 10,
  },
  verifiedBadge: {
    backgroundColor: COLORS.tertiary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  verifiedText: {
    ...FONTS.body4,
    color: COLORS.tertiary,
    fontWeight: '600',
    fontSize: 10,
  },
  maidPrice: {
    ...FONTS.body4,
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    width: '48%',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    ...SHADOWS.small,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    ...FONTS.body3,
    color: COLORS.black,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 3,
  },
  emptyStateText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginBottom: SIZES.padding,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
});
