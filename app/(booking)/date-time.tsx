import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react-native';

export default function DateTimeScreen() {
  const { service } = useLocalSearchParams<{ service: string }>();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  // Generate next 7 days for selection
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const weekday = date.toLocaleString('default', { weekday: 'short' });
      
      const isToday = i === 0;
      const isTomorrow = i === 1;
      
      let displayDate;
      if (isToday) {
        displayDate = t('Today');
      } else if (isTomorrow) {
        displayDate = t('Tomorrow');
      } else {
        displayDate = `${day} ${month}`;
      }
      
      dates.push({
        id: `${day}-${month}`,
        weekday,
        date: displayDate,
        fullDate: `${day} ${month}`,
        timestamp: date.getTime(),
      });
    }
    
    return dates;
  };

  const dates = generateDates();

  // Time slots by category
  const timeSlots = {
    morning: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'],
    afternoon: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'],
    evening: ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'],
  };

  // Duration options
  const durations = [1, 2, 4, 8];

  const handleNext = () => {
    if (selectedDate && selectedTimeSlot && selectedDuration) {
      router.push({
        pathname: '/(booking)/location',
        params: { 
          service, 
          date: selectedDate, 
          time: selectedTimeSlot, 
          duration: selectedDuration.toString() 
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={COLORS.black} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Select Date & Time')}</Text>
        <View style={styles.placeholderRight} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Date Selection */}
        <Text style={styles.sectionTitle}>{t('Date')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datesContainer}
        >
          {dates.map((date) => (
            <TouchableOpacity
              key={date.id}
              style={[
                styles.dateCard,
                selectedDate === date.fullDate && styles.selectedDateCard,
              ]}
              onPress={() => setSelectedDate(date.fullDate)}
            >
              <Text style={[
                styles.weekday,
                selectedDate === date.fullDate && styles.selectedDateText,
              ]}>
                {date.weekday}
              </Text>
              <Text style={[
                styles.dateText,
                selectedDate === date.fullDate && styles.selectedDateText,
              ]}>
                {date.date}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Time Slot Selection */}
        {selectedDate && (
          <>
            <Text style={styles.sectionTitle}>{t('Available slots')}</Text>
            
            <View style={styles.timeSlotSection}>
              <Text style={styles.timeSlotCategory}>{t('Morning')}</Text>
              <View style={styles.timeSlotGrid}>
                {timeSlots.morning.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      selectedTimeSlot === time && styles.selectedTimeSlot,
                    ]}
                    onPress={() => setSelectedTimeSlot(time)}
                  >
                    <Clock
                      size={16}
                      color={selectedTimeSlot === time ? COLORS.white : COLORS.darkGray}
                    />
                    <Text style={[
                      styles.timeSlotText,
                      selectedTimeSlot === time && styles.selectedTimeSlotText,
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.timeSlotSection}>
              <Text style={styles.timeSlotCategory}>{t('Afternoon')}</Text>
              <View style={styles.timeSlotGrid}>
                {timeSlots.afternoon.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      selectedTimeSlot === time && styles.selectedTimeSlot,
                    ]}
                    onPress={() => setSelectedTimeSlot(time)}
                  >
                    <Clock
                      size={16}
                      color={selectedTimeSlot === time ? COLORS.white : COLORS.darkGray}
                    />
                    <Text style={[
                      styles.timeSlotText,
                      selectedTimeSlot === time && styles.selectedTimeSlotText,
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.timeSlotSection}>
              <Text style={styles.timeSlotCategory}>{t('Evening')}</Text>
              <View style={styles.timeSlotGrid}>
                {timeSlots.evening.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      selectedTimeSlot === time && styles.selectedTimeSlot,
                    ]}
                    onPress={() => setSelectedTimeSlot(time)}
                  >
                    <Clock
                      size={16}
                      color={selectedTimeSlot === time ? COLORS.white : COLORS.darkGray}
                    />
                    <Text style={[
                      styles.timeSlotText,
                      selectedTimeSlot === time && styles.selectedTimeSlotText,
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Duration Selection */}
        {selectedTimeSlot && (
          <>
            <Text style={styles.sectionTitle}>{t('Duration')}</Text>
            <View style={styles.durationContainer}>
              {durations.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    selectedDuration === duration && styles.selectedDurationButton,
                  ]}
                  onPress={() => setSelectedDuration(duration)}
                >
                  <Text style={[
                    styles.durationText,
                    selectedDuration === duration && styles.selectedDurationText,
                  ]}>
                    {duration} {duration === 1 ? t('hour') : t('hours')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!selectedDate || !selectedTimeSlot || !selectedDuration) && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={!selectedDate || !selectedTimeSlot || !selectedDuration}
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
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginTop: SIZES.padding * 2,
    marginBottom: SIZES.padding,
  },
  datesContainer: {
    paddingVertical: SIZES.padding,
  },
  dateCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    marginRight: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    ...SHADOWS.small,
  },
  selectedDateCard: {
    backgroundColor: COLORS.primary,
  },
  weekday: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  dateText: {
    ...FONTS.h4,
    color: COLORS.black,
  },
  selectedDateText: {
    color: COLORS.white,
  },
  timeSlotSection: {
    marginBottom: SIZES.padding * 2,
  },
  timeSlotCategory: {
    ...FONTS.body2,
    color: COLORS.darkGray,
    marginBottom: SIZES.padding,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.padding / 2,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding / 2,
    marginBottom: SIZES.padding,
    width: '47%',
    ...SHADOWS.small,
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
  },
  timeSlotText: {
    ...FONTS.body3,
    color: COLORS.black,
    marginLeft: 6,
  },
  selectedTimeSlotText: {
    color: COLORS.white,
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.padding / 2,
  },
  durationButton: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding / 2,
    marginBottom: SIZES.padding,
    width: '22%',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  selectedDurationButton: {
    backgroundColor: COLORS.primary,
  },
  durationText: {
    ...FONTS.body3,
    color: COLORS.black,
  },
  selectedDurationText: {
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