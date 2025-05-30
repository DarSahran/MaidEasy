import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useTranslation } from '../../hooks/useTranslation';
import { useLocationService } from '../../hooks/useLocationService';
import { ArrowLeft, Star, BadgeCheck, Tag } from 'lucide-react-native';

export default function ConfirmationScreen() {
  const { 
    service, 
    date, 
    time, 
    duration, 
    addressId 
  } = useLocalSearchParams<{ 
    service: string, 
    date: string, 
    time: string, 
    duration: string,
    addressId: string 
  }>();
  
  const { t } = useTranslation();
  const { savedAddresses } = useLocationService();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discount: number } | null>(null);
  const [isLoadingCoupon, setIsLoadingCoupon] = useState(false);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);

  // Get selected address
  const selectedAddress = savedAddresses.find(addr => addr.id === addressId);

  // Mock pricing calculation
  const getBasePrice = () => {
    switch (service) {
      case 'House Cleaning':
        return 199;
      case 'Cooking':
        return 249;
      case 'Babysitting':
        return 299;
      case 'Elderly Care':
        return 349;
      default:
        return 199;
    }
  };

  const basePrice = getBasePrice();
  const durationNum = parseInt(duration, 10);
  const durationCost = basePrice * (durationNum > 1 ? (durationNum - 1) * 0.8 : 0);
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalPrice = basePrice + durationCost - discount;

  // Mock maid data
  const maid = {
    id: '1',
    name: 'Lakshmi P.',
    image: 'https://images.pexels.com/photos/7551621/pexels-photo-7551621.jpeg?auto=compress&cs=tinysrgb&w=300',
    rating: 4.9,
    reviews: 124,
    skills: ['Cleaning', 'Cooking'],
    verified: true,
  };

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    
    setIsLoadingCoupon(true);
    
    // Simulate coupon validation
    setTimeout(() => {
      if (couponCode.toUpperCase() === 'WELCOME20') {
        setAppliedCoupon({ 
          code: 'WELCOME20', 
          discount: Math.round((basePrice + durationCost) * 0.2) // 20% discount
        });
      } else if (couponCode.toUpperCase() === 'FIRST50') {
        setAppliedCoupon({ 
          code: 'FIRST50', 
          discount: 50 // flat ₹50 off
        });
      } else {
        setAppliedCoupon(null);
        alert('Invalid coupon code');
      }
      setIsLoadingCoupon(false);
    }, 1000);
  };

  const handleConfirmBooking = () => {
    setIsLoadingBooking(true);
    
    // Simulate booking process
    setTimeout(() => {
      setIsLoadingBooking(false);
      router.push('/');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={COLORS.black} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Confirm Booking')}</Text>
        <View style={styles.placeholderRight} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Service Details')}</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('Service')}:</Text>
              <Text style={styles.detailValue}>{t(service || '')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('Date')}:</Text>
              <Text style={styles.detailValue}>{date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('Time')}:</Text>
              <Text style={styles.detailValue}>{time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('Duration')}:</Text>
              <Text style={styles.detailValue}>{duration} {parseInt(duration, 10) === 1 ? t('hour') : t('hours')}</Text>
            </View>
            <View style={[styles.detailRow, styles.lastDetailRow]}>
              <Text style={styles.detailLabel}>{t('Address')}:</Text>
              <Text style={styles.detailValue}>{selectedAddress?.address}</Text>
            </View>
          </View>
        </View>

        {/* Maid Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Maid')}</Text>
          <View style={styles.maidCard}>
            <Image source={{ uri: maid.image }} style={styles.maidImage} />
            <View style={styles.maidInfo}>
              <View style={styles.maidNameRow}>
                <Text style={styles.maidName}>{maid.name}</Text>
                {maid.verified && (
                  <View style={styles.verifiedBadge}>
                    <BadgeCheck size={14} color={COLORS.tertiary} />
                    <Text style={styles.verifiedText}>{t('Verified')}</Text>
                  </View>
                )}
              </View>
              <View style={styles.ratingContainer}>
                <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.ratingText}>{maid.rating} ({maid.reviews} {t('reviews')})</Text>
              </View>
              <View style={styles.skillsContainer}>
                <Text style={styles.skillsLabel}>{t('Skills')}: </Text>
                {maid.skills.map((skill, index) => (
                  <View key={skill} style={styles.skillBadge}>
                    <Text style={styles.skillText}>
                      {t(skill)}{index < maid.skills.length - 1 ? ', ' : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Coupon Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Apply Coupon')}</Text>
          <View style={styles.couponContainer}>
            <View style={styles.couponInputContainer}>
              <Tag size={20} color={COLORS.darkGray} style={styles.couponIcon} />
              <TextInput
                style={styles.couponInput}
                placeholder={t('Enter coupon code')}
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
            </View>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleApplyCoupon}
              disabled={!couponCode || isLoadingCoupon}
            >
              {isLoadingCoupon ? (
                <ActivityIndicator size ="small\" color={COLORS.white} />
              ) : (
                <Text style={styles.applyButtonText}>{t('Apply')}</Text>
              )}
            </TouchableOpacity>
          </View>
          {appliedCoupon && (
            <View style={styles.appliedCouponContainer}>
              <Text style={styles.appliedCouponText}>
                {appliedCoupon.code} {t('applied')} - ₹{appliedCoupon.discount} {t('off')}
              </Text>
            </View>
          )}
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Price Details')}</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('Base Price')}</Text>
              <Text style={styles.priceValue}>₹{basePrice}</Text>
            </View>
            {durationCost > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('Duration Cost')}</Text>
                <Text style={styles.priceValue}>₹{durationCost}</Text>
              </View>
            )}
            {discount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('Discount')}</Text>
                <Text style={[styles.priceValue, styles.discountText]}>-₹{discount}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('Total')}</Text>
              <Text style={styles.totalValue}>₹{totalPrice}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceSummary}>
          <Text style={styles.footerPriceLabel}>{t('Total')}</Text>
          <Text style={styles.footerPriceValue}>₹{totalPrice}</Text>
        </View>
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirmBooking}
          disabled={isLoadingBooking}
        >
          {isLoadingBooking ? (
            <ActivityIndicator size="small\" color={COLORS.white} />
          ) : (
            <Text style={styles.confirmButtonText}>{t('Confirm')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SIZES.padding * 6,
    paddingBottom: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding * 2,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    padding: SIZES.padding,
    marginLeft: -SIZES.padding,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.black,
  },
  placeholderRight: {
    width: 40,
  },
  contentContainer: {
    padding: SIZES.padding * 2,
    paddingBottom: SIZES.padding * 10,
  },
  section: {
    marginBottom: SIZES.padding * 2,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.small,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
  detailValue: {
    ...FONTS.body3,
    color: COLORS.black,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  maidCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row',
    ...SHADOWS.small,
  },
  maidImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius,
  },
  maidInfo: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  maidNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  maidName: {
    ...FONTS.h4,
    color: COLORS.black,
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    ...FONTS.body4,
    color: COLORS.tertiary,
    marginLeft: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  skillsLabel: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
  skillBadge: {
    flexDirection: 'row',
  },
  skillText: {
    ...FONTS.body3,
    color: COLORS.black,
  },
  couponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginRight: SIZES.padding,
    ...SHADOWS.small,
  },
  couponIcon: {
    marginRight: SIZES.padding,
  },
  couponInput: {
    flex: 1,
    ...FONTS.body3,
    color: COLORS.black,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius,
  },
  applyButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
  },
  appliedCouponContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding,
  },
  appliedCouponText: {
    ...FONTS.body3,
    color: COLORS.tertiary,
  },
  priceCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.small,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
  priceValue: {
    ...FONTS.body3,
    color: COLORS.black,
  },
  discountText: {
    color: COLORS.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    ...FONTS.h4,
    color: COLORS.black,
  },
  totalValue: {
    ...FONTS.h4,
    color: COLORS.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding * 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceSummary: {
    flex: 1,
  },
  footerPriceLabel: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
  footerPriceValue: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius,
  },
  confirmButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
  },
});