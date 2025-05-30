// File: login.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Phone, AtSign, Mail } from 'lucide-react-native';

// ---- THEME CONSTANTS ----
const COLORS = {
  white: '#fff',
  black: '#222',
  primary: '#fa442a',
  darkGray: '#666',
  lightGray: '#e5e5e5',
  error: '#FF5A5F',
  success: '#34C759',
};

const FONTS = {
  h1: { fontSize: 28, fontWeight: 'bold' as 'bold' },
  h4: { fontSize: 18, fontWeight: '600' as '600' },
  body2: { fontSize: 16 },
  body3: { fontSize: 15 },
  body4: { fontSize: 13 },
};

const SIZES = {
  padding: 16,
  radius: 18,
};

// ---- TRANSLATION CONTEXT ----
const translations = {
  en: {
    'Welcome to MaidEasy': 'Welcome to MaidEasy',
    'Book household help in minutes': 'Book household help in minutes',
    'Phone': 'Phone',
    'Email': 'Email',
    'Mobile Number': 'Mobile Number',
    'Email Address': 'Email Address',
    'Enter your mobile number': 'Enter your mobile number',
    'Enter your email address': 'Enter your email address',
    'Please enter a valid Indian mobile number.': 'Please enter a valid Indian mobile number.',
    'Please enter a valid email address.': 'Please enter a valid email address.',
    'Continue with Phone': 'Continue with Phone',
    'Continue with Email': 'Continue with Email',
    'Continue with Google': 'Continue with Google',
    'OR': 'OR',
    'By continuing, you agree to our': 'By continuing, you agree to our',
    'Terms of Service': 'Terms of Service',
    'and': 'and',
    'Privacy Policy': 'Privacy Policy',
  },
  hi: {
    'Welcome to MaidEasy': 'मेडईज़ी में आपका स्वागत है',
    'Book household help in minutes': 'मिनटों में घरेलू मदद बुक करें',
    'Phone': 'फ़ोन',
    'Email': 'ईमेल',
    'Mobile Number': 'मोबाइल नंबर',
    'Email Address': 'ईमेल पता',
    'Enter your mobile number': 'अपना मोबाइल नंबर दर्ज करें',
    'Enter your email address': 'अपना ईमेल पता दर्ज करें',
    'Please enter a valid Indian mobile number.': 'कृपया मान्य भारतीय मोबाइल नंबर दर्ज करें।',
    'Please enter a valid email address.': 'कृपया मान्य ईमेल पता दर्ज करें।',
    'Continue with Phone': 'फ़ोन से जारी रखें',
    'Continue with Email': 'ईमेल से जारी रखें',
    'Continue with Google': 'Google से जारी रखें',
    'OR': 'या',
    'By continuing, you agree to our': 'जारी रखते हुए, आप हमारी',
    'Terms of Service': 'सेवा की शर्तें',
    'and': 'और',
    'Privacy Policy': 'गोपनीयता नीति',
  },
};

const TranslationContext = React.createContext<{
  t: (key: string) => string;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
}>({
  t: (key: string) => key,
  language: 'en',
  setLanguage: (_lang: 'en' | 'hi') => {},
});

function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const t = (key: string) => translations[language][key] || key;

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

const useTranslation = () => React.useContext(TranslationContext);

// ---- FIXED IMAGE IMPORT ----
const loginImage = require('../../assets/images/login_image.jpeg');

function LoginScreen() {
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const { sendOtp, isLoading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();

  // Validation
  const validateInput = (text: string) => {
    if (authMode === 'phone') {
      const phoneRegex = /^[6-9]\d{9}$/;
      const valid = phoneRegex.test(text);
      setIsValid(valid);
      return valid;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const valid = emailRegex.test(text);
      setIsValid(valid);
      return valid;
    }
  };

  // Handle Continue
  const handleContinue = async () => {
    setError('');
    if (!validateInput(inputValue)) return;

    try {
      const success = await sendOtp(inputValue);
      if (success) {
        Alert.alert('Success', 'OTP sent successfully! Check your phone/email.');
        router.push({
          pathname: '/(auth)/otp',
          params: { identifier: inputValue },
        });
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image source={loginImage} style={styles.logo} resizeMode="cover" />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{t('Welcome to MaidEasy')}</Text>
          <Text style={styles.subtitle}>{t('Book household help in minutes')}</Text>

          <View style={styles.authModeToggle}>
            <TouchableOpacity
              style={[
                styles.authModeBtn,
                authMode === 'phone' ? styles.authModeBtnActive : null,
              ]}
              onPress={() => {
                setAuthMode('phone');
                setInputValue('');
                setIsValid(false);
                setTouched(false);
                setError('');
              }}
            >
              <Phone size={16} color={authMode === 'phone' ? COLORS.white : COLORS.darkGray} />
              <Text
                style={[
                  styles.authModeBtnText,
                  authMode === 'phone' ? styles.authModeBtnTextActive : null,
                ]}
              >
                {t('Phone')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.authModeBtn,
                authMode === 'email' ? styles.authModeBtnActive : null,
              ]}
              onPress={() => {
                setAuthMode('email');
                setInputValue('');
                setIsValid(false);
                setTouched(false);
                setError('');
              }}
            >
              <AtSign size={16} color={authMode === 'email' ? COLORS.white : COLORS.darkGray} />
              <Text
                style={[
                  styles.authModeBtnText,
                  authMode === 'email' ? styles.authModeBtnTextActive : null,
                ]}
              >
                {t('Email')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              {authMode === 'phone' ? t('Mobile Number') : t('Email Address')}
            </Text>
            <View
              style={[
                styles.inputContainer,
                touched && inputValue.length > 0 && !isValid
                  ? styles.inputError
                  : null,
                isValid ? styles.inputSuccess : null,
              ]}
            >
              {authMode === 'phone' && (
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
              )}

              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={(text) => {
                  setInputValue(text);
                  validateInput(text);
                }}
                onBlur={() => setTouched(true)}
                placeholder={
                  authMode === 'phone'
                    ? t('Enter your mobile number')
                    : t('Enter your email address')
                }
                keyboardType={authMode === 'phone' ? 'phone-pad' : 'email-address'}
                maxLength={authMode === 'phone' ? 10 : 50}
                returnKeyType="done"
                autoFocus
                accessibilityLabel={
                  authMode === 'phone'
                    ? t('Enter your mobile number')
                    : t('Enter your email address')
                }
                autoCapitalize="none"
              />

              {authMode === 'phone' && (
                <Phone size={18} color={COLORS.darkGray} style={styles.inputIcon} />
              )}
            </View>

            {touched && inputValue.length > 0 && !isValid && (
              <Text style={styles.errorText}>
                {authMode === 'phone'
                  ? t('Please enter a valid Indian mobile number.')
                  : t('Please enter a valid email address.')}
              </Text>
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.button, (!isValid || isLoading) && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>
                {authMode === 'phone'
                  ? t('Continue with Phone')
                  : t('Continue with Email')}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('OR')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={async () => {
              const ok = await signInWithGoogle();
              if (!ok) Alert.alert('Error', 'Google sign-in failed');
            }}
          >
            <Mail size={20} color={COLORS.primary} />
            <Text style={styles.googleButtonText}>{t('Continue with Google')}</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            {t('By continuing, you agree to our')}{' '}
            <Text style={styles.termsLink}>{t('Terms of Service')}</Text>{' '}
            {t('and')}{' '}
            <Text style={styles.termsLink}>{t('Privacy Policy')}</Text>
          </Text>

          <View style={styles.languageToggleBottom}>
            <TouchableOpacity style={styles.langBtn} onPress={handleLanguageToggle}>
              <Text style={[styles.langText, language === 'en' && styles.langActive]}>
                EN
              </Text>
              <Text style={styles.langDivider}>|</Text>
              <Text style={[styles.langText, language === 'hi' && styles.langActive]}>
                हि
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingBottom: SIZES.padding * 2 },
  header: { alignItems: 'center', paddingTop: SIZES.padding, paddingBottom: SIZES.padding },
  logo: { width: '90%', height: 300, borderRadius: SIZES.radius, marginVertical: SIZES.padding, elevation: 1 },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    marginHorizontal: SIZES.padding,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  title: { ...FONTS.h1, color: COLORS.primary, marginBottom: 6, textAlign: 'center', letterSpacing: 0.5 },
  subtitle: { ...FONTS.body2, color: COLORS.darkGray, marginBottom: SIZES.padding * 2, textAlign: 'center' },
  authModeToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: SIZES.padding * 1.2,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  },
  authModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: COLORS.lightGray,
  },
  authModeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  authModeBtnText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginLeft: 6,
    fontWeight: '500',
  },
  authModeBtnTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  inputSection: { marginBottom: SIZES.padding * 1.5 },
  inputLabel: { ...FONTS.body4, color: COLORS.darkGray, marginBottom: 4, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: SIZES.padding,
    ...FONTS.body3,
    color: COLORS.black,
    backgroundColor: 'transparent',
  },
  countryCode: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopLeftRadius: SIZES.radius,
    borderBottomLeftRadius: SIZES.radius,
    marginRight: 2,
  },
  countryCodeText: { ...FONTS.body3, color: COLORS.black, fontWeight: 'bold' },
  inputIcon: { marginRight: 10 },
  inputError: { borderColor: COLORS.error },
  inputSuccess: { borderColor: COLORS.success },
  errorText: { color: COLORS.error, ...FONTS.body4, marginTop: 2, marginLeft: 4 },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 0.9,
    alignItems: 'center',
    marginBottom: SIZES.padding,
    elevation: 2,
  },
  buttonDisabled: { backgroundColor: COLORS.lightGray, opacity: 0.7 },
  buttonText: { ...FONTS.h4, color: COLORS.white, letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SIZES.padding * 0.8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.lightGray },
  dividerText: { ...FONTS.body3, color: COLORS.darkGray, marginHorizontal: SIZES.padding, fontWeight: 'bold' },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.2,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 0.9,
    marginBottom: SIZES.padding * 0.7,
    elevation: 1,
  },
  googleButtonText: { ...FONTS.body3, color: COLORS.primary, fontWeight: '600', marginLeft: SIZES.padding },
  termsText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: SIZES.padding * 0.8,
    marginBottom: SIZES.padding * 0.5,
    lineHeight: 18,
  },
  termsLink: { ...FONTS.body4, color: COLORS.primary, fontWeight: 'bold' },
  languageToggleBottom: {
    alignItems: 'center',
    marginTop: SIZES.padding * 1.5,
    marginBottom: SIZES.padding * 0.5,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: COLORS.lightGray,
  },
  langText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    fontWeight: 'bold',
    fontSize: 16,
  },
  langActive: {
    color: COLORS.primary,
  },
  langDivider: {
    color: COLORS.darkGray,
    marginHorizontal: 5,
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default function WrappedLoginScreen() {
  return (
    <TranslationProvider>
      <LoginScreen />
    </TranslationProvider>
  );
}
