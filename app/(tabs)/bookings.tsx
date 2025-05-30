import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/config/supabase';
import { Calendar, Clock, X } from 'lucide-react-native';

export default function BookingsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, activeTab]);

  const fetchBookings = async () => {
    try {
      if (!user) return;

      const statusFilter = activeTab === 'active' 
        ? ['pending', 'confirmed'] 
        : ['completed', 'cancelled'];

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (name, image, price),
          maids (name, image, rating)
        `)
        .eq('user_id', user.id)
        .in('status', statusFilter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const renderBookingCard = ({ item }) => {
    const service = item.services;
    const maid = item.maids;

    return (
      <TouchableOpacity 
        style={styles.bookingCard}
        onPress={() => router.push(`/(booking)/details?id=${item.id}`)}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service?.name}</Text>
            <Text style={styles.bookingTime}>
              {new Date(item.date).toLocaleDateString()}, {item.time}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            item.status === 'pending' && styles.pendingBadge,
            item.status === 'confirmed' && styles.confirmedBadge,
            item.status === 'completed' && styles.completedBadge,
            item.status === 'cancelled' && styles.cancelledBadge,
          ]}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bookingDetails}>
          <View style={styles.maidInfo}>
            {maid?.image && (
              <Image source={{ uri: maid.image }} style={styles.maidImage} />
            )}
            <Text style={styles.maidName}>{maid?.name || 'Assigned Maid'}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{item.total_price}</Text>
          </View>
        </View>

        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.rescheduleButton}>
              <Calendar size={16} color={COLORS.primary} />
              <Text style={styles.rescheduleText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton}>
              <X size={16} color={COLORS.error} />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateTitle}>
          {activeTab === 'active' ? 'No active bookings' : 'No booking history'}
        </Text>
        {activeTab === 'active' && (
          <TouchableOpacity 
            style={styles.bookNowButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.bookNowText}>{t('Book Now')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('Bookings')}</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'past' && styles.activeTab]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
              Past
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: 8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: COLORS.secondaryBackground,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 24,
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    ...SHADOWS.medium,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 4,
  },
  bookingTime: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayLight,
  },
  pendingBadge: {
    backgroundColor: COLORS.warningLight,
  },
  confirmedBadge: {
    backgroundColor: COLORS.successLight,
  },
  completedBadge: {
    backgroundColor: COLORS.successLight,
  },
  cancelledBadge: {
    backgroundColor: COLORS.errorLight,
  },
  statusText: {
    ...FONTS.body5,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayLight,
    marginVertical: 12,
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maidImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: COLORS.grayLight,
  },
  maidName: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    ...FONTS.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  rescheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  rescheduleText: {
    ...FONTS.body4,
    color: COLORS.primary,
    marginLeft: 4,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelText: {
    ...FONTS.body4,
    color: COLORS.error,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyStateTitle: {
    ...FONTS.h4,
    color: COLORS.gray,
    marginBottom: 16,
  },
  bookNowButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookNowText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
