import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import { supabase } from '@/config/supabase';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    avatar_url: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching profile for user ID:', user?.id);
      
      if (!user?.id) {
        Alert.alert('Error', 'User not found. Please login again.');
        router.replace('/(auth)/login');
        return;
      }

      // Try to fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error when no rows

      console.log('Profile fetch result:', { data, error });

      if (error) {
        console.error('Error fetching profile:', error);
        // Initialize with user data from auth
        initializeWithAuthData();
      } else if (data) {
        // Profile exists, populate form
        setProfileExists(true);
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          pincode: data.pincode || '',
          avatar_url: data.avatar_url || '',
        });
      } else {
        // No profile found, initialize with auth data
        initializeWithAuthData();
      }
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      initializeWithAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWithAuthData = () => {
    console.log('Initializing with auth data:', user);
    setProfileExists(false);
    setProfileData({
      name: user?.user_metadata?.displayName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      pincode: '',
      avatar_url: '',
    });
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // For now, just use the local URI (you can implement cloud upload later)
        setProfileData(prev => ({ ...prev, avatar_url: result.assets[0].uri }));
        Alert.alert('Success', 'Profile picture selected! Save changes to update.');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }

      if (!profileData.name.trim()) {
        Alert.alert('Validation Error', 'Name is required');
        return;
      }

      console.log('Saving profile for user ID:', user.id);
      console.log('Profile exists:', profileExists);
      console.log('Profile data to save:', profileData);

      const saveData = {
        id: user.id, // Always include the ID
        name: profileData.name.trim(),
        email: profileData.email.trim() || null,
        phone: profileData.phone.trim() || null,
        address: profileData.address.trim() || null,
        city: profileData.city.trim() || null,
        pincode: profileData.pincode.trim() || null,
        avatar_url: profileData.avatar_url || null,
        updated_at: new Date().toISOString(),
      };

      let result;
      
      if (profileExists) {
        // Update existing profile
        console.log('Updating existing profile...');
        result = await supabase
          .from('profiles')
          .update(saveData)
          .eq('id', user.id)
          .select();
      } else {
        // Insert new profile
        console.log('Creating new profile...');
        saveData.created_at = new Date().toISOString();
        result = await supabase
          .from('profiles')
          .insert([saveData])
          .select();
      }

      const { data, error } = result;
      console.log('Save result:', { data, error });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setProfileExists(true);
        Alert.alert(
          'Success', 
          'Profile updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        throw new Error('No data returned from save operation');
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(
        'Error', 
        `Failed to save profile: ${error.message || 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileInitial = () => {
    return profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U';
  };

  if (isLoading && !profileData.name && !user?.user_metadata?.displayName) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {profileData.avatar_url ? (
              <Image source={{ uri: profileData.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{getProfileInitial()}</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={pickImage}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Camera size={16} color={COLORS.white} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarText}>Tap to change photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.input}
                value={profileData.name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.darkGray}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.input}
                value={profileData.email}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.input}
                value={profileData.phone}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter your phone number"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={COLORS.darkGray} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profileData.address}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, address: text }))}
                placeholder="Enter your address"
                placeholderTextColor={COLORS.darkGray}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: SIZES.padding }]}>
              <Text style={styles.label}>City</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={profileData.city}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, city: text }))}
                  placeholder="City"
                  placeholderTextColor={COLORS.darkGray}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Pincode</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={profileData.pincode}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, pincode: text }))}
                  placeholder="Pincode"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>
          </View>

          {/* Debug Info (remove in production) */}
          {__DEV__ && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>Debug Info:</Text>
              <Text style={styles.debugText}>User ID: {user?.id}</Text>
              <Text style={styles.debugText}>Profile Exists: {profileExists ? 'Yes' : 'No'}</Text>
              <Text style={styles.debugText}>Name: {profileData.name}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={handleSave}
          disabled={isLoading || !profileData.name.trim()}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.white} size="small" />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  title: {
    ...FONTS.h3,
    color: COLORS.black,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 3,
    backgroundColor: COLORS.background,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.padding,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    ...FONTS.h1,
    color: COLORS.white,
    fontSize: 48,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
  form: {
    padding: SIZES.padding * 2,
  },
  inputGroup: {
    marginBottom: SIZES.padding * 2,
  },
  label: {
    ...FONTS.body3,
    color: COLORS.black,
    marginBottom: SIZES.padding,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  input: {
    flex: 1,
    marginLeft: SIZES.padding,
    ...FONTS.body2,
    color: COLORS.black,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  footer: {
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  saveButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugInfo: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding,
  },
  debugText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
});
