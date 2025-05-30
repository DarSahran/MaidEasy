import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/config/supabase';
import { 
  LogOut, 
  ChevronRight, 
  User, 
  Phone, 
  AtSign, 
  Moon, 
  Sun, 
  Languages,
  Edit,
  MapPin,
  Settings,
  Heart,
  HelpCircle,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const toggleTheme = async () => {
    await setThemeMode(isDark ? 'light' : 'dark');
  };

  const toggleLanguage = async () => {
    await setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const getDisplayName = () => {
    return profileData?.name || 
           user?.user_metadata?.displayName || 
           user?.email?.split('@')[0] || 
           'Guest';
  };

  const getPhoneNumber = () => {
    return profileData?.phone || 
           user?.phone || 
           'Not set';
  };

  const getEmail = () => {
    return profileData?.email || 
           user?.email || 
           'Not set';
  };

  const getProfileInitial = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('Profile')}</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {profileData?.avatar_url ? (
            <Image
              source={{ uri: profileData.avatar_url }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>{getProfileInitial()}</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.editImageButton}
            onPress={() => router.push('/(profile)/edit')}
          >
            <Edit size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>
          {getDisplayName()}
        </Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => router.push('/(profile)/edit')}
        >
          <Text style={styles.editButtonText}>{t('Edit Profile')}</Text>
        </TouchableOpacity>
      </View>

      {/* User Information */}
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <User size={20} color={COLORS.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t('Full Name')}</Text>
            <Text style={styles.infoValue}>
              {getDisplayName()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <Phone size={20} color={COLORS.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t('Phone Number')}</Text>
            <Text style={styles.infoValue}>
              {getPhoneNumber()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <AtSign size={20} color={COLORS.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t('Email')}</Text>
            <Text style={styles.infoValue}>
              {getEmail()}
            </Text>
          </View>
        </View>

        {profileData?.address && (
          <>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <MapPin size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('Address')}</Text>
                <Text style={styles.infoValue}>
                  {profileData.address}
                  {profileData.city && `, ${profileData.city}`}
                  {profileData.pincode && ` - ${profileData.pincode}`}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Menu Section */}
      <View style={styles.menuSection}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/(profile)/settings')}
        >
          <View style={styles.menuInfo}>
            <View style={styles.menuIcon}>
              <Settings size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuText}>{t('Settings')}</Text>
          </View>
          <ChevronRight size={20} color={COLORS.darkGray} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuInfo}>
            <View style={styles.menuIcon}>
              <MapPin size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuText}>{t('Saved Addresses')}</Text>
          </View>
          <ChevronRight size={20} color={COLORS.darkGray} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuInfo}>
            <View style={styles.menuIcon}>
              <Heart size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuText}>{t('Favorites')}</Text>
          </View>
          <ChevronRight size={20} color={COLORS.darkGray} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/(profile)/help')}
        >
          <View style={styles.menuInfo}>
            <View style={styles.menuIcon}>
              <HelpCircle size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuText}>{t('Help & Support')}</Text>
          </View>
          <ChevronRight size={20} color={COLORS.darkGray} />
        </TouchableOpacity>
      </View>

      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <TouchableOpacity style={styles.settingItem} onPress={toggleLanguage}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Languages size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.settingText}>{t('Language')}</Text>
          </View>
          <View style={styles.settingAction}>
            <Text style={styles.currentSetting}>
              {language === 'en' ? 'English' : 'हिंदी'}
            </Text>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              {isDark ? (
                <Moon size={20} color={COLORS.primary} />
              ) : (
                <Sun size={20} color={COLORS.primary} />
              )}
            </View>
            <Text style={styles.settingText}>{t('Dark Mode')}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut size={20} color={COLORS.error} />
        <Text style={styles.signOutText}>{t('Sign Out')}</Text>
      </TouchableOpacity>

      {/* Version Info */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>MaidEasy v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: SIZES.padding * 6,
    paddingBottom: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding * 2,
    ...SHADOWS.small,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.black,
  },
  profileSection: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding * 2,
    marginTop: SIZES.padding * 2,
    padding: SIZES.padding * 2,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SIZES.padding,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    ...FONTS.h1,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileName: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding - 2,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius,
  },
  editButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding * 2,
    marginTop: SIZES.padding * 2,
    padding: SIZES.padding,
    ...SHADOWS.small,
  },
  menuSection: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding * 2,
    marginTop: SIZES.padding * 2,
    padding: SIZES.padding,
    ...SHADOWS.small,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  infoContent: {
    flex: 1,
  },
  menuInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  infoValue: {
    ...FONTS.body2,
    color: COLORS.black,
  },
  menuText: {
    ...FONTS.body2,
    color: COLORS.black,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  settingsSection: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding * 2,
    marginTop: SIZES.padding * 2,
    padding: SIZES.padding,
    ...SHADOWS.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  settingText: {
    ...FONTS.body2,
    color: COLORS.black,
  },
  settingAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentSetting: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginRight: SIZES.padding,
  },
  signOutButton: {
    backgroundColor: COLORS.error + '20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIZES.padding * 2,
    marginTop: SIZES.padding * 2,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  signOutText: {
    ...FONTS.body2,
    color: COLORS.error,
    marginLeft: SIZES.padding,
    fontWeight: '600',
  },
  versionInfo: {
    alignItems: 'center',
    marginVertical: SIZES.padding * 2,
  },
  versionText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
});
