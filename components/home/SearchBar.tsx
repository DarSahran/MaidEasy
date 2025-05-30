import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, Bell } from 'lucide-react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

interface SearchBarProps {
  onSearchPress: () => void;
  onNotificationPress: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearchPress, 
  onNotificationPress 
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.searchBar} onPress={onSearchPress}>
        <Search size={20} color={COLORS.darkGray} />
        <Text style={styles.placeholder}>Search for services...</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress}>
        <Bell size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  placeholder: {
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
});
