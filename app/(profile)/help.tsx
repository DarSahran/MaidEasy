import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { 
  ArrowLeft, 
  MessageCircle, 
  Phone, 
  Mail, 
  ExternalLink,
  HelpCircle,
  FileText,
  Shield,
  ChevronRight,
} from 'lucide-react-native';

export default function HelpSupportScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const handleEmailSupport = () => {
    const email = 'support@maideasy.com';
    const subject = 'Support Request - MaidEasy App';
    const body = 'Hi MaidEasy Support Team,\n\nI need help with:\n\n';
    
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`)
      .catch(() => Alert.alert('Error', 'Unable to open email app'));
  };

  const handlePhoneSupport = () => {
    const phoneNumber = '+91-8000-123-456';
    Linking.openURL(`tel:${phoneNumber}`)
      .catch(() => Alert.alert('Error', 'Unable to make phone call'));
  };

  const handleWhatsAppSupport = () => {
    const phoneNumber = '918000123456';
    const message = 'Hi, I need help with MaidEasy app';
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${message}`)
      .catch(() => Alert.alert('Error', 'WhatsApp not installed'));
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://maideasy.com/terms')
      .catch(() => Alert.alert('Error', 'Unable to open link'));
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://maideasy.com/privacy')
      .catch(() => Alert.alert('Error', 'Unable to open link'));
  };

  const handleFAQ = () => {
    Alert.alert('FAQ', 'FAQ section coming soon!');
  };

  const faqData = [
    {
      question: 'How do I book a service?',
      answer: 'Select a service from the home screen, choose date & time, confirm your location, and proceed with payment.'
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking up to 2 hours before the scheduled time without any charges.'
    },
    {
      question: 'How do I change my booking time?',
      answer: 'Go to your bookings, select the booking you want to reschedule, and choose a new time slot.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept cash, UPI, credit/debit cards, and digital wallets like Paytm, PhonePe.'
    },
    {
      question: 'Are the maids verified?',
      answer: 'Yes, all our maids go through background verification and skill assessment before joining our platform.'
    },
  ];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDark ? COLORS.white : COLORS.black} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.darkText]}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Support Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Contact Support</Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleEmailSupport}>
            <View style={[styles.contactIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <Mail size={20} color={COLORS.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, isDark && styles.darkText]}>Email Support</Text>
              <Text style={[styles.contactSubtitle, isDark && styles.darkSubtext]}>
                support@maideasy.com
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? COLORS.white : COLORS.darkGray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={handlePhoneSupport}>
            <View style={[styles.contactIcon, { backgroundColor: COLORS.tertiary + '20' }]}>
              <Phone size={20} color={COLORS.tertiary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, isDark && styles.darkText]}>Phone Support</Text>
              <Text style={[styles.contactSubtitle, isDark && styles.darkSubtext]}>
                +91-8000-123-456
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? COLORS.white : COLORS.darkGray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={handleWhatsAppSupport}>
            <View style={[styles.contactIcon, { backgroundColor: '#25D366' + '20' }]}>
              <MessageCircle size={20} color="#25D366" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, isDark && styles.darkText]}>WhatsApp Support</Text>
              <Text style={[styles.contactSubtitle, isDark && styles.darkSubtext]}>
                Chat with us on WhatsApp
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? COLORS.white : COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Frequently Asked Questions</Text>
          
          {faqData.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={[styles.faqQuestion, isDark && styles.darkText]}>
                {faq.question}
              </Text>
              <Text style={[styles.faqAnswer, isDark && styles.darkSubtext]}>
                {faq.answer}
              </Text>
            </View>
          ))}

          <TouchableOpacity style={styles.viewAllFAQ} onPress={handleFAQ}>
            <Text style={styles.viewAllText}>View All FAQs</Text>
            <ExternalLink size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Legal</Text>
          
          <TouchableOpacity style={styles.legalItem} onPress={handleTermsOfService}>
            <View style={[styles.legalIcon, isDark && styles.darkIcon]}>
              <FileText size={20} color={COLORS.primary} />
            </View>
            <View style={styles.legalInfo}>
              <Text style={[styles.legalTitle, isDark && styles.darkText]}>Terms of Service</Text>
              <Text style={[styles.legalSubtitle, isDark && styles.darkSubtext]}>
                Read our terms and conditions
              </Text>
            </View>
            <ExternalLink size={20} color={isDark ? COLORS.white : COLORS.darkGray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.legalItem} onPress={handlePrivacyPolicy}>
            <View style={[styles.legalIcon, isDark && styles.darkIcon]}>
              <Shield size={20} color={COLORS.primary} />
            </View>
            <View style={styles.legalInfo}>
              <Text style={[styles.legalTitle, isDark && styles.darkText]}>Privacy Policy</Text>
              <Text style={[styles.legalSubtitle, isDark && styles.darkSubtext]}>
                How we protect your privacy
              </Text>
            </View>
            <ExternalLink size={20} color={isDark ? COLORS.white : COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>App Information</Text>
          <View style={styles.appInfo}>
            <Text style={[styles.appInfoText, isDark && styles.darkText]}>
              MaidEasy v1.0.0
            </Text>
            <Text style={[styles.appInfoSubtext, isDark && styles.darkSubtext]}>
              Made with ❤️ for household services
            </Text>
          </View>
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    ...FONTS.body2,
    color: COLORS.black,
    fontWeight: '600',
  },
  contactSubtitle: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  darkSubtext: {
    color: COLORS.lightGray,
  },
  faqItem: {
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  faqQuestion: {
    ...FONTS.body2,
    color: COLORS.black,
    fontWeight: '600',
    marginBottom: 4,
  },
  faqAnswer: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  viewAllFAQ: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding,
  },
  viewAllText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginRight: 8,
    fontWeight: '600',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  legalIcon: {
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
  legalInfo: {
    flex: 1,
  },
  legalTitle: {
    ...FONTS.body2,
    color: COLORS.black,
    fontWeight: '600',
  },
  legalSubtitle: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SIZES.padding,
  },
  appInfoText: {
    ...FONTS.body2,
    color: COLORS.black,
    fontWeight: '600',
  },
  appInfoSubtext: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginTop: 4,
  },
});
