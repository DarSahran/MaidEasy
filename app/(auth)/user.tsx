import React, { useState } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import { User, Mail, Phone, Eye, EyeOff, Lock } from 'lucide-react-native';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function UserScreen() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { createProfile, pendingIdentifier } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const isEmailIdentifier = pendingIdentifier.includes('@');

  // Initialize form with pending identifier
  React.useEffect(() => {
    if (isEmailIdentifier) {
      setFormData(prev => ({ ...prev, email: pendingIdentifier }));
    } else {
      setFormData(prev => ({ ...prev, phone: pendingIdentifier }));
    }
  }, [pendingIdentifier, isEmailIdentifier]);

  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Name can only contain letters and spaces';
        return undefined;

      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return undefined;

      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(value)) return 'Please enter a valid 10-digit Indian mobile number';
        return undefined;

      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character';
        return undefined;

      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return undefined;

      default:
        return undefined;
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Validate confirm password when password changes
    if (field === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    return isValid;
  };

  const handleComplete = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before continuing');
      return;
    }

    setIsLoading(true);
    
    try {
      const profileData = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: `+91${formData.phone.trim()}`,
        password: formData.password, // In real app, this should be hashed
      };

      console.log('Creating profile with data:', profileData);
      const success = await createProfile(profileData);
      
      if (success) {
        console.log('Profile created successfully, navigating to home...');
        Alert.alert(
          'Success!', 
          'Your account has been created successfully!',
          [
            {
              text: 'Continue',
              onPress: () => {
                setTimeout(() => {
                  router.replace('/(tabs)');
                }, 100);
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to create profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; width: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[@$!%*?&])/.test(password)) score++;

    if (score < 2) return { strength: 'Weak', color: COLORS.error, width: '20' };
    if (score < 4) return { strength: 'Medium', color: COLORS.warning, width: '60' };
    return { strength: 'Strong', color: COLORS.success, width: '100' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <User size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Please fill in all the details to complete your registration
            </Text>
          </View>

          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={[
                styles.inputContainer,
                touched.fullName && errors.fullName && styles.inputError,
                formData.fullName.trim() && !errors.fullName && styles.inputSuccess
              ]}>
                <User size={20} color={COLORS.darkGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.fullName}
                  onChangeText={(value) => handleInputChange('fullName', value)}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.darkGray}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
              {touched.fullName && errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={[
                styles.inputContainer,
                touched.email && errors.email && styles.inputError,
                formData.email.trim() && !errors.email && styles.inputSuccess
              ]}>
                <Mail size={20} color={COLORS.darkGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="Enter your email address"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  editable={!isEmailIdentifier}
                />
              </View>
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={[
                styles.inputContainer,
                touched.phone && errors.phone && styles.inputError,
                formData.phone.trim() && !errors.phone && styles.inputSuccess
              ]}>
                <Phone size={20} color={COLORS.darkGray} style={styles.inputIcon} />
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="next"
                  editable={!isEmailIdentifier}
                />
              </View>
              {touched.phone && errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={[
                styles.inputContainer,
                touched.password && errors.password && styles.inputError,
                formData.password && !errors.password && styles.inputSuccess
              ]}>
                <Lock size={20} color={COLORS.darkGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.darkGray}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={COLORS.darkGray} />
                  ) : (
                    <Eye size={20} color={COLORS.darkGray} />
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={styles.passwordStrengthBar}>
                    <View 
                      style={[
                        styles.passwordStrengthFill,
                        { width: parseFloat(passwordStrength.width) / 100, backgroundColor: passwordStrength.color }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.strength}
                  </Text>
                </View>
              )}
              
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={[
                styles.inputContainer,
                touched.confirmPassword && errors.confirmPassword && styles.inputError,
                formData.confirmPassword && !errors.confirmPassword && styles.inputSuccess
              ]}>
                <Lock size={20} color={COLORS.darkGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Confirm your password"
                  placeholderTextColor={COLORS.darkGray}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleComplete}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={COLORS.darkGray} />
                  ) : (
                    <Eye size={20} color={COLORS.darkGray} />
                  )}
                </TouchableOpacity>
              </View>
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, Object.keys(errors).some(key => errors[key]) && styles.buttonDisabled]}
              onPress={handleComplete}
              disabled={Object.keys(errors).some(key => errors[key]) || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={COLORS.white} size="small" />
                  <Text style={styles.loadingText}>Creating Account...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressText}>Step 3 of 3</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 3,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.padding * 2,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.black,
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
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
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputSuccess: {
    borderColor: COLORS.success,
  },
  inputIcon: {
    marginLeft: SIZES.padding,
  },
  input: {
    flex: 1,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    ...FONTS.body2,
    color: COLORS.black,
  },
  phoneInput: {
    paddingLeft: SIZES.padding / 2,
  },
  countryCode: {
    ...FONTS.body2,
    color: COLORS.black,
    fontWeight: '600',
    paddingHorizontal: SIZES.padding,
    borderRightWidth: 1,
    borderRightColor: COLORS.lightGray,
  },
  eyeIcon: {
    padding: SIZES.padding,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.padding / 2,
  },
  passwordStrengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    marginRight: SIZES.padding,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    ...FONTS.body4,
    fontWeight: '600',
  },
  errorText: {
    ...FONTS.body4,
    color: COLORS.error,
    marginTop: SIZES.padding / 2,
    marginLeft: SIZES.padding,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.padding,
    ...SHADOWS.medium,
  },
  buttonDisabled: {
    backgroundColor: COLORS.lightGray,
    ...SHADOWS.small,
  },
  buttonText: {
    ...FONTS.h4,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.white,
    marginLeft: SIZES.padding,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: SIZES.padding * 2,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    marginBottom: SIZES.padding,
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
});
