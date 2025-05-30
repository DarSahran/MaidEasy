import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  startingPrice: string;
  onPress: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
  startingPrice,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: icon }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.price}>Starting {startingPrice}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    width: '48%',
    marginBottom: SIZES.padding,
    ...SHADOWS.small,
  },
  image: {
    width: '100%',
    height: 80,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  title: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 4,
  },
  description: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  price: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
