import { useState, useEffect } from 'react';
import * as Font from 'expo-font';

export const useFrameworkReady = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // Load fonts and other resources
        await Font.loadAsync({
          'Poppins-Regular': require('@expo-google-fonts/poppins/Poppins_400Regular.ttf'),
          'Poppins-Medium': require('@expo-google-fonts/poppins/Poppins_500Medium.ttf'),
          'Poppins-SemiBold': require('@expo-google-fonts/poppins/Poppins_600SemiBold.ttf'),
          'Poppins-Bold': require('@expo-google-fonts/poppins/Poppins_700Bold.ttf'),
        });
        
        setIsReady(true);
      } catch (error) {
        console.error('Error loading app resources:', error);
        setIsReady(true); // Continue even if fonts fail to load
      }
    };

    prepareApp();
  }, []);

  return isReady;
};
