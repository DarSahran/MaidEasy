import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

interface PromoBannerProps {
  onPress: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Special Offer!</Text>
      <Text style={styles.subtitle}>Get 20% off on your first booking</Text>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Claim Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SIZES.padding * 2,
    marginVertical: SIZES.padding,
    padding: SIZES.padding * 2,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    ...FONTS.body3,
    color: COLORS.white,
    marginBottom: SIZES.padding,
  },
  button: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    alignSelf: 'flex-start',
  },
  buttonText: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
