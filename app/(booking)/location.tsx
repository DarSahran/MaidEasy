import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useTranslation } from '../../hooks/useTranslation';
import { useLocationService } from '../../hooks/useLocationService';
import { ArrowLeft, ChevronRight, MapPin, Plus, Home, Building, Briefcase, Check } from 'lucide-react-native';

type AddressType = 'home' | 'work' | 'other';

export default function LocationScreen() {
  const { service, date, time, duration } = useLocalSearchParams<{ 
    service: string, 
    date: string, 
    time: string, 
    duration: string 
  }>();
  const { t } = useTranslation();
  const { 
    currentAddress, 
    savedAddresses, 
    isLoading,
    getCurrentLocation,
    saveAddress,
    setDefaultAddress,
  } = useLocationService();
  
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.find(addr => addr.isDefault)?.id || null
  );
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    address: '',
    pincode: '',
    type: 'home' as AddressType,
  });

  const handleGetCurrentLocation = async () => {
    const success = await getCurrentLocation();
    if (success) {
      // The default address should be updated by the hook
      const defaultAddress = savedAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  };

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    setDefaultAddress(id);
  };

  const handleSaveNewAddress = async () => {
    if (newAddress.title && newAddress.address && newAddress.pincode) {
      const success = await saveAddress({
        title: newAddress.title,
        address: newAddress.address,
        pincode: newAddress.pincode,
        isDefault: true,
      });
      
      if (success) {
        setIsAddingNew(false);
        // The newly added address should now be the default
        const newDefaultAddress = savedAddresses[savedAddresses.length - 1];
        if (newDefaultAddress) {
          setSelectedAddressId(newDefaultAddress.id);
        }
      }
    }
  };

  const handleNext = () => {
    if (selectedAddressId) {
      router.push({
        pathname: '/(booking)/confirmation',
        params: { 
          service, 
          date, 
          time, 
          duration, 
          addressId: selectedAddressId 
        }
      });
    }
  };

  const renderAddressIcon = (type: AddressType) => {
    switch (type) {
      case 'home':
        return <Home size={20} color={COLORS.darkGray} />;
      case 'work':
        return <Briefcase size={20} color={COLORS.darkGray} />;
      default:
        return <Building size={20} color={COLORS.darkGray} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={COLORS.black} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Select Location')}</Text>
        <View style={styles.placeholderRight} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Current Location Button */}
        <TouchableOpacity 
          style={styles.currentLocationButton}
          onPress={handleGetCurrentLocation}
        >
          <MapPin color={COLORS.primary} size={20} />
          <Text style={styles.currentLocationText}>{t('Use Current Location')}</Text>
        </TouchableOpacity>

        {/* Saved Addresses */}
        <Text style={styles.sectionTitle}>{t('Saved Addresses')}</Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <>
            {savedAddresses.length > 0 ? (
              savedAddresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  style={[
                    styles.addressCard,
                    selectedAddressId === address.id && styles.selectedAddressCard,
                  ]}
                  onPress={() => handleSelectAddress(address.id)}
                >
                  <View style={styles.addressIconContainer}>
                    {renderAddressIcon(address.title.toLowerCase() as AddressType)}
                  </View>
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressTitle}>{address.title}</Text>
                    <Text style={styles.addressText} numberOfLines={2}>{address.address}</Text>
                    <Text style={styles.pincode}>{address.pincode}</Text>
                  </View>
                  {selectedAddressId === address.id && (
                    <View style={styles.checkIcon}>
                      <Check size={16} color={COLORS.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noAddressText}>
                {t('No saved addresses. Add a new address or use current location.')}
              </Text>
            )}

            {/* Add New Address */}
            {!isAddingNew ? (
              <TouchableOpacity 
                style={styles.addNewButton}
                onPress={() => setIsAddingNew(true)}
              >
                <Plus color={COLORS.primary} size={20} />
                <Text style={styles.addNewText}>{t('Add New Address')}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.newAddressForm}>
                <Text style={styles.formLabel}>{t('Address Title')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('Home, Work, etc.')}
                    value={newAddress.title}
                    onChangeText={(text) => setNewAddress({...newAddress, title: text})}
                  />
                </View>
                
                <Text style={styles.formLabel}>{t('Full Address')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('Enter your complete address')}
                    value={newAddress.address}
                    onChangeText={(text) => setNewAddress({...newAddress, address: text})}
                    multiline
                    numberOfLines={3}
                  />
                </View>
                
                <Text style={styles.formLabel}>{t('PIN Code')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('6-digit PIN code')}
                    value={newAddress.pincode}
                    onChangeText={(text) => setNewAddress({...newAddress, pincode: text})}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                
                <View style={styles.addressTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.addressTypeButton,
                      newAddress.type === 'home' && styles.activeAddressType,
                    ]}
                    onPress={() => setNewAddress({...newAddress, type: 'home'})}
                  >
                    <Home 
                      size={16} 
                      color={newAddress.type === 'home' ? COLORS.white : COLORS.darkGray} 
                    />
                    <Text 
                      style={[
                        styles.addressTypeText,
                        newAddress.type === 'home' && styles.activeAddressTypeText,
                      ]}
                    >
                      {t('Home')}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.addressTypeButton,
                      newAddress.type === 'work' && styles.activeAddressType,
                    ]}
                    onPress={() => setNewAddress({...newAddress, type: 'work'})}
                  >
                    <Briefcase 
                      size={16} 
                      color={newAddress.type === 'work' ? COLORS.white : COLORS.darkGray} 
                    />
                    <Text 
                      style={[
                        styles.addressTypeText,
                        newAddress.type === 'work' && styles.activeAddressTypeText,
                      ]}
                    >
                      {t('Work')}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.addressTypeButton,
                      newAddress.type === 'other' && styles.activeAddressType,
                    ]}
                    onPress={() => setNewAddress({...newAddress, type: 'other'})}
                  >
                    <Building 
                      size={16} 
                      color={newAddress.type === 'other' ? COLORS.white : COLORS.darkGray} 
                    />
                    <Text 
                      style={[
                        styles.addressTypeText,
                        newAddress.type === 'other' && styles.activeAddressTypeText,
                      ]}
                    >
                      {t('Other')}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.formActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setIsAddingNew(false)}
                  >
                    <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.saveButton,
                      (!newAddress.title || !newAddress.address || !newAddress.pincode) && 
                      styles.disabledSaveButton,
                    ]}
                    onPress={handleSaveNewAddress}
                    disabled={!newAddress.title || !newAddress.address || !newAddress.pincode}
                  >
                    <Text style={styles.saveButtonText}>{t('Save')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedAddressId && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={!selectedAddressId}
        >
          <Text style={styles.nextButtonText}>{t('Next')}</Text>
          <ChevronRight color={COLORS.white} size={20} />
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
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding * 2,
  },
  currentLocationText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  loader: {
    marginVertical: SIZES.padding * 2,
  },
  noAddressText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginVertical: SIZES.padding * 2,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.small,
  },
  selectedAddressCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 2,
  },
  addressText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  pincode: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: SIZES.padding,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    marginVertical: SIZES.padding,
  },
  addNewText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: SIZES.padding,
  },
  newAddressForm: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginVertical: SIZES.padding,
    ...SHADOWS.small,
  },
  formLabel: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  input: {
    ...FONTS.body3,
    color: COLORS.black,
    padding: SIZES.padding,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  addressTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray,
    paddingVertical: 8,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    flex: 1,
    marginHorizontal: 4,
  },
  activeAddressType: {
    backgroundColor: COLORS.primary,
  },
  addressTypeText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  activeAddressTypeText: {
    color: COLORS.white,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.padding,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  cancelButtonText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  disabledSaveButton: {
    backgroundColor: COLORS.lightGray,
  },
  saveButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
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
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  nextButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
    marginRight: 4,
  },
});