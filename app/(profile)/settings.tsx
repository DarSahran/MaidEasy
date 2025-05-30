import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Bell, 
  Languages, 
  Shield,
  ChevronRight,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const notifications = await AsyncStorage.getItem('notificationsEnabled');
      const push = await AsyncStorage.getItem('pushNotifications');
      const email = await AsyncStorage.getItem('emailNotifications');
      
      if (notifications !== null) setNotificationsEnabled(JSON.parse(notifications));
      if (push !== null) setPushNotifications(JSON.parse(push));
      if (email !== null) setEmailNotifications(JSON.parse(email));
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    await setThemeMode(newTheme);
    Alert.alert('Theme Changed', `Switched to ${newTheme} mode`);
  };

  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    await setLanguage(newLanguage);
    Alert.alert('Language Changed', `Switched to ${newLanguage === 'en' ? 'English' : 'Hindi'}`);
  };

  const toggleNotifications = async (type: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(type, JSON.stringify(value));
      
      switch (type) {
        case 'notificationsEnabled':
          setNotificationsEnabled(value);
          break;
        case 'pushNotifications':
          setPushNotifications(value);
          break;
        case 'emailNotifications':
          setEmailNotifications(value);
          break;
      }
    } catch (error) {
      console.error('Error saving notification setting:', error);
    }
  };

  const handleDataPrivacy = () => {
    Alert.alert(
      'Data & Privacy',
      'Your data is encrypted and stored securely. We never share your personal information with third parties.',
      [{ text: 'OK' }]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data and may require you to re-download some content.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear specific cache items (keep auth and important settings)
              await AsyncStorage.removeItem('cachedServices');
              await AsyncStorage.removeItem('cachedMaids');
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDark ? COLORS.white : COLORS.black} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.darkText]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, isDark && styles.darkIcon]}>
                {isDark ? (
                  <Moon size={20} color={COLORS.primary} />
                ) : (
                  <Sun size={20} color={COLORS.primary} />
                )}
              </View>
              <View>
                <Text style={[styles.settingText, isDark && styles.darkText]}>Dark Mode</Text>
                <Text style={[styles.settingSubtext, isDark && styles.darkSubtext]}>
                  {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingItem}>
            <TouchableOpacity style={styles.settingInfo} onPress={toggleLanguage}>
              <View style={[styles.settingIcon, isDark && styles.darkIcon]}>
                <Languages size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingText, isDark && styles.darkText]}>Language</Text>
                <Text style={[styles.settingSubtext, isDark && styles.darkSubtext]}>
                  {language === 'en' ? 'English' : 'हिंदी'}
                </Text>
              </View>
            </TouchableOpacity>
            <ChevronRight size={20} color={isDark ? COLORS.white : COLORS.darkGray} />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, isDark && styles.darkIcon]}>
                <Bell size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={[styles.settingText, isDark && styles.darkText]}>Enable Notifications</Text>
                <Text style={[styles.settingSubtext, isDark && styles.darkSubtext]}>
                  Receive booking updates and offers
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => toggleNotifications('notificationsEnabled', value)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, isDark && styles.darkIcon]}>
                <Bell size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={[styles.settingText, isDark && styles.darkText]}>Push Notifications</Text>
                <Text style={[styles.settingSubtext, isDark && styles.darkSubtext]}>
                  Instant notifications on your device
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotifications && notificationsEnabled}
              onValueChange={(value) => toggleNotifications('pushNotifications', value)}
              disabled={!notificationsEnabled}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, isDark && styles.darkIcon]}>
                <Bell size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={[styles.settingText, isDark && styles.darkText]}>Email Notifications</Text>
                <Text style={[styles.settingSubtext, isDark && styles.darkSubtext]}>
                  Receive updates via email
                </Text>
              </View>
            </View>
            <Switch
              value={emailNotifications && notificationsEnabled}
              onValueChange={(value) => toggleNotifications('emailNotifications', value)}
              disabled={!notificationsEnabled}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Privacy & Security Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Privacy & Security</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleDataPrivacy}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, isDark && styles.darkIcon]}>
                <Shield size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingText, isDark && styles.darkText]}>Data & Privacy</Text>
                <Text style={[styles.settingSubtext, isDark && styles.darkSubtext]}>
                  How we handle your data
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={isDark ? COLORS.white : COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        {/* Advanced Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Advanced</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, isDark && styles.darkIcon]}>
                <Shield size={20} color={COLORS.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingText, { color: COLORS.error }]}>Clear Cache</Text>
                <Text style={[styles.settingSubtext, isDark && styles.darkSubtext]}>
                  Free up storage space
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={isDark ? COLORS.white : COLORS.darkGray} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  darkContainer: {
    backgroundColor: COLORS.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  darkHeader: {
    backgroundColor: COLORS.darkGray,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.black,
  },
  darkText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding * 2,
    marginTop: SIZES.padding * 2,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.small,
  },
  darkSection: {
    backgroundColor: COLORS.darkGray,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  darkIcon: {
    backgroundColor: COLORS.primary + '30',
  },
  settingText: {
    ...FONTS.body2,
    color: COLORS.black,
  },
  settingSubtext: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  darkSubtext: {
    color: COLORS.lightGray,
  },
});
