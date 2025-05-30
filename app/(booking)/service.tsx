import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/config/supabase';
import { ArrowLeft, Star, Clock, CheckCircle } from 'lucide-react-native';

export default function ServiceSelectionScreen() {
  const [services, setServices] = useState([]);
  const [maids, setMaids] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedMaid, setSelectedMaid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([fetchServices(), fetchMaids()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      let servicesQuery = supabase.from('services').select('*');
      
      // Filter by category if provided
      if (params.serviceCategory) {
        servicesQuery = servicesQuery.eq('category', params.serviceCategory);
      }
      
      const { data, error } = await servicesQuery.order('name');
      
      if (error) throw error;
      setServices(data || []);

      // Pre-select service if serviceId is provided
      if (params.serviceId && data) {
        const preSelectedService = data.find(s => s.id === params.serviceId);
        if (preSelectedService) {
          setSelectedService(preSelectedService);
        }
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchMaids = async () => {
    try {
      let maidsQuery = supabase
        .from('maids')
        .select('*')
        .eq('verified', true);

      // Filter maids by skills that match the service category
      if (params.serviceCategory) {
        const categorySkillMap = {
          'cleaning': 'Cleaning',
          'cooking': 'Cooking', 
          'childcare': 'Babysitting',
          'eldercare': 'Elderly Care'
        };
        
        const skill = categorySkillMap[params.serviceCategory];
        if (skill) {
          maidsQuery = maidsQuery.contains('skills', [skill]);
        }
      }

      const { data, error } = await maidsQuery
        .order('rating', { ascending: false });
      
      if (error) throw error;
      setMaids(data || []);

      // Pre-select maid if maidId is provided
      if (params.maidId && data) {
        const preSelectedMaid = data.find(m => m.id === params.maidId);
        if (preSelectedMaid) {
          setSelectedMaid(preSelectedMaid);
        }
      }
    } catch (error) {
      console.error('Error fetching maids:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    // If a maid was selected but doesn't have skills for this service, deselect them
    if (selectedMaid && service.category) {
      const categorySkillMap = {
        'cleaning': 'Cleaning',
        'cooking': 'Cooking', 
        'childcare': 'Babysitting',
        'eldercare': 'Elderly Care'
      };
      
      const requiredSkill = categorySkillMap[service.category];
      if (requiredSkill && !selectedMaid.skills?.includes(requiredSkill)) {
        setSelectedMaid(null);
        Alert.alert('Notice', 'The selected maid is not available for this service. Please choose another maid.');
      }
    }
  };

  const handleMaidSelect = (maid) => {
    if (selectedMaid?.id === maid.id) {
      setSelectedMaid(null);
    } else {
      setSelectedMaid(maid);
    }
  };

  const handleContinue = () => {
    if (!selectedService) {
      Alert.alert('Selection Required', 'Please select a service to continue.');
      return;
    }

    router.push({
      pathname: '/(booking)/date-time',
      params: { 
        serviceId: selectedService.id,
        maidId: selectedMaid?.id || '',
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        serviceDuration: selectedService.duration,
        maidName: selectedMaid?.name || '',
        maidPrice: selectedMaid?.price_per_hour || 0
      }
    });
  };

  const renderServiceCard = (service) => (
    <TouchableOpacity
      key={service.id}
      style={[
        styles.serviceCard,
        selectedService?.id === service.id && styles.selectedCard
      ]}
      onPress={() => handleServiceSelect(service)}
    >
      <Image source={{ uri: service.image }} style={styles.serviceImage} />
      <View style={styles.serviceInfo}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{service.name}</Text>
          {selectedService?.id === service.id && (
            <CheckCircle size={20} color={COLORS.primary} />
          )}
        </View>
        <Text style={styles.serviceDescription}>{service.description}</Text>
        <View style={styles.serviceDetails}>
          <Text style={styles.servicePrice}>₹{service.price}</Text>
          <View style={styles.serviceDuration}>
            <Clock size={14} color={COLORS.darkGray} />
            <Text style={styles.serviceDurationText}>{service.duration} min</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMaidCard = (maid) => (
    <TouchableOpacity
      key={maid.id}
      style={[
        styles.maidCard,
        selectedMaid?.id === maid.id && styles.selectedCard
      ]}
      onPress={() => handleMaidSelect(maid)}
    >
      <Image source={{ uri: maid.image }} style={styles.maidImage} />
      <View style={styles.maidInfo}>
        <View style={styles.maidHeader}>
          <Text style={styles.maidName}>{maid.name}</Text>
          {selectedMaid?.id === maid.id && (
            <CheckCircle size={20} color={COLORS.primary} />
          )}
          {maid.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>
        
        <View style={styles.maidRating}>
          <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
          <Text style={styles.ratingText}>{maid.rating}</Text>
          <Text style={styles.reviewsText}>({maid.reviews_count} reviews)</Text>
        </View>
        
        <View style={styles.skillsContainer}>
          {maid.skills?.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.maidPrice}>₹{maid.price_per_hour}/hour</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = (type) => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {type === 'services' ? 'No services available' : 'No maids available for this service'}
      </Text>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {params.serviceCategory 
            ? `${params.serviceCategory.charAt(0).toUpperCase() + params.serviceCategory.slice(1)} Services`
            : 'Select Service'
          }
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          {services.length === 0 ? (
            renderEmptyState('services')
          ) : (
            services.map(renderServiceCard)
          )}
        </View>

        {/* Maids Section */}
        {maids.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Maid (Optional)</Text>
            <Text style={styles.sectionSubtitle}>
              Select a preferred maid or we'll assign the best available one
            </Text>
            {maids.map(renderMaidCard)}
          </View>
        )}

        {/* Selected Summary */}
        {selectedService && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Your Selection</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryService}>Service: {selectedService.name}</Text>
              <Text style={styles.summaryPrice}>Price: ₹{selectedService.price}</Text>
              {selectedMaid && (
                <Text style={styles.summaryMaid}>Maid: {selectedMaid.name}</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedService && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedService}
        >
          <Text style={styles.continueButtonText}>
            {selectedService 
              ? `Continue with ${selectedService.name}` 
              : 'Select a Service'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginTop: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: SIZES.padding * 6,
    paddingBottom: SIZES.padding,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    padding: SIZES.padding / 2,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.black,
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SIZES.padding * 2,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  sectionSubtitle: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginBottom: SIZES.padding * 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 3,
  },
  emptyStateText: {
    ...FONTS.body2,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    ...SHADOWS.small,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius,
    marginRight: SIZES.padding,
  },
  serviceInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceName: {
    ...FONTS.h4,
    color: COLORS.black,
    flex: 1,
  },
  serviceDescription: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    ...FONTS.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  serviceDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDurationText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  maidCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    ...SHADOWS.small,
  },
  maidImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius,
    marginRight: SIZES.padding,
  },
  maidInfo: {
    flex: 1,
  },
  maidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  maidName: {
    ...FONTS.h4,
    color: COLORS.black,
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: COLORS.tertiary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  verifiedText: {
    ...FONTS.body4,
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  maidRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    ...FONTS.body3,
    color: COLORS.black,
    marginLeft: 4,
    fontWeight: '600',
  },
  reviewsText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  skillBadge: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    fontSize: 10,
  },
  maidPrice: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  summarySection: {
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.background,
  },
  summaryTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.small,
  },
  summaryService: {
    ...FONTS.body2,
    color: COLORS.black,
    marginBottom: 4,
  },
  summaryPrice: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryMaid: {
    ...FONTS.body2,
    color: COLORS.darkGray,
  },
  footer: {
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  continueButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
