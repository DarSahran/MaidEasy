import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useTranslation } from '../../hooks/useTranslation';
import { Star, Calendar } from 'lucide-react-native';

type ServiceHistory = {
  id: string;
  service: string;
  date: string;
  maidName: string;
  maidImage: string;
  price: string;
  rating?: number;
};

export default function HistoryScreen() {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState('All');

  // Mock data for service history
  const historyData: ServiceHistory[] = [
    {
      id: '1',
      service: 'House Cleaning',
      date: '10 Jun 2025',
      maidName: 'Lakshmi P.',
      maidImage: 'https://images.pexels.com/photos/7551621/pexels-photo-7551621.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: '₹399',
      rating: 4.5,
    },
    {
      id: '2',
      service: 'Cooking',
      date: '05 Jun 2025',
      maidName: 'Priya M.',
      maidImage: 'https://images.pexels.com/photos/7551634/pexels-photo-7551634.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: '₹499',
      rating: 5,
    },
    {
      id: '3',
      service: 'Babysitting',
      date: '28 May 2025',
      maidName: 'Anita K.',
      maidImage: 'https://images.pexels.com/photos/7551702/pexels-photo-7551702.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: '₹899',
      rating: 4,
    },
  ];

  const months = ['All', 'Jun 2025', 'May 2025', 'Apr 2025'];

  const filteredHistory = selectedMonth === 'All'
    ? historyData
    : historyData.filter(item => item.date.includes(selectedMonth.split(' ')[0]));

  const renderHistoryItem = ({ item }: { item: ServiceHistory }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => router.push(`/(booking)/details?id=${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.serviceType}>{t(item.service)}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardContent}>
        <View style={styles.maidDetails}>
          <Image source={{ uri: item.maidImage }} style={styles.maidImage} />
          <View>
            <Text style={styles.maidName}>{item.maidName}</Text>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.rating}>{item.rating}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.priceSection}>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        {item.rating ? (
          <TouchableOpacity style={styles.actionButton}>
            <Calendar size={16} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>{t('Book Again')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rateServiceContainer}>
            <Text style={styles.rateText}>{t('Rate this service:')}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} style={styles.starIcon}>
                  <Star size={20} color={COLORS.lightGray} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image
        source={{ uri: 'https://via.placeholder.com/150' }}
        style={styles.emptyStateImage}
      />
      <Text style={styles.emptyStateTitle}>{t('No booking history')}</Text>
      <TouchableOpacity 
        style={styles.bookNowButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.bookNowText}>{t('Book Now')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('History')}</Text>
        <FlatList
          data={months}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.monthTab,
                selectedMonth === item && styles.selectedMonthTab,
              ]}
              onPress={() => setSelectedMonth(item)}
            >
              <Text
                style={[
                  styles.monthText,
                  selectedMonth === item && styles.selectedMonthText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.monthsContainer}
        />
      </View>

      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: SIZES.padding * 6,
    paddingBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    ...SHADOWS.small,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  monthsContainer: {
    paddingVertical: SIZES.padding,
  },
  monthTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray,
  },
  selectedMonthTab: {
    backgroundColor: COLORS.primary,
  },
  monthText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
  selectedMonthText: {
    color: COLORS.white,
  },
  listContainer: {
    padding: SIZES.padding * 2,
    paddingBottom: SIZES.padding * 4,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding * 2,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceType: {
    ...FONTS.h4,
    color: COLORS.black,
  },
  date: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SIZES.padding,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maidDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maidImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SIZES.padding,
  },
  maidName: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rating: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  cardFooter: {
    marginTop: SIZES.padding,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    paddingVertical: SIZES.padding - 2,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    alignSelf: 'center',
  },
  actionButtonText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 4,
  },
  rateServiceContainer: {
    alignItems: 'center',
  },
  rateText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginHorizontal: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding * 4,
  },
  emptyStateImage: {
    width: 150,
    height: 150,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding * 2,
  },
  emptyStateTitle: {
    ...FONTS.h3,
    color: COLORS.darkGray,
    marginBottom: SIZES.padding * 2,
    textAlign: 'center',
  },
  bookNowButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius,
  },
  bookNowText: {
    ...FONTS.h4,
    color: COLORS.white,
  },
});
