import { useContext } from 'react';
import { useLanguage } from '../context/LanguageContext';

const translations: Record<string, Record<string, string>> = {
  en: {
    // Auth
    'Welcome to MaidEasy': 'Welcome to MaidEasy',
    'Book household help in minutes': 'Book household help in minutes',
    'Phone': 'Phone',
    'Email': 'Email',
    'Continue with Phone': 'Continue with Phone',
    'Continue with Google': 'Continue with Google',
    'Enter OTP': 'Enter OTP',
    'Verify': 'Verify',
    
    // Home
    'Hello': 'Hello',
    'Guest': 'Guest',
    'Our Services': 'Our Services',
    'Top Rated Maids': 'Top Rated Maids',
    
    // Services
    'House Cleaning': 'House Cleaning',
    'Cooking': 'Cooking',
    'Babysitting': 'Babysitting',
    'Elderly Care': 'Elderly Care',
    'Regular house cleaning services': 'Regular house cleaning services',
    'Professional cooking services': 'Professional cooking services',
    'Reliable childcare services': 'Reliable childcare services',
    'Compassionate senior care': 'Compassionate senior care',
    
    // Booking
    'Select Service': 'Select Service',
    'Select Date & Time': 'Select Date & Time',
    'Select Location': 'Select Location',
    'Confirm Booking': 'Confirm Booking',
    'Next': 'Next',
    'Confirm': 'Confirm',
    
    // Common
    'Book Now': 'Book Now',
    'Cancel': 'Cancel',
    'Save': 'Save',
    'Loading': 'Loading...',
  },
  hi: {
    // Auth
    'Welcome to MaidEasy': 'मेडईज़ी में आपका स्वागत है',
    'Book household help in minutes': 'मिनटों में घरेलू मदद बुक करें',
    'Phone': 'फ़ोन',
    'Email': 'ईमेल',
    'Continue with Phone': 'फ़ोन से जारी रखें',
    'Continue with Google': 'Google से जारी रखें',
    'Enter OTP': 'OTP दर्ज करें',
    'Verify': 'सत्यापित करें',
    
    // Home
    'Hello': 'नमस्ते',
    'Guest': 'अतिथि',
    'Our Services': 'हमारी सेवाएं',
    'Top Rated Maids': 'टॉप रेटेड मेड्स',
    
    // Services
    'House Cleaning': 'घर की सफाई',
    'Cooking': 'खाना बनाना',
    'Babysitting': 'बेबीसिटिंग',
    'Elderly Care': 'बुजुर्गों की देखभाल',
    'Regular house cleaning services': 'नियमित घर की सफाई सेवाएं',
    'Professional cooking services': 'पेशेवर खाना पकाने की सेवाएं',
    'Reliable childcare services': 'विश्वसनीय बाल देखभाल सेवाएं',
    'Compassionate senior care': 'दयालु वरिष्ठ देखभाल',
    
    // Booking
    'Select Service': 'सेवा चुनें',
    'Select Date & Time': 'दिनांक और समय चुनें',
    'Select Location': 'स्थान चुनें',
    'Confirm Booking': 'बुकिंग की पुष्टि करें',
    'Next': 'अगला',
    'Confirm': 'पुष्टि करें',
    
    // Common
    'Book Now': 'अभी बुक करें',
    'Cancel': 'रद्द करें',
    'Save': 'सेव करें',
    'Loading': 'लोड हो रहा है...',
  },
};

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return { t };
};
