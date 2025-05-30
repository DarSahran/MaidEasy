import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

interface AddressBarProps {
  address: string;
  onPress: () => void;
}

export const AddressBar: React.FC<AddressBarProps> = ({ address, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <MapPin size={16} color={COLORS.darkGray} />
      <Text style={styles.addressText} numberOfLines={1}>
        {address || 'Select location'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addressText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginLeft: 4,
    flex: 1,
  },
});
