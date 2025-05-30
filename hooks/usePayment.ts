import { useState } from 'react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet' | 'cash';
  name: string;
  details?: string;
}

export const usePayment = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'cash',
      name: 'Cash on Service',
      details: 'Pay when service is completed',
    },
    {
      id: '2',
      type: 'upi',
      name: 'UPI Payment',
      details: 'Pay using UPI apps',
    },
    {
      id: '3',
      type: 'card',
      name: 'Credit/Debit Card',
      details: 'Secure card payment',
    },
    {
      id: '4',
      type: 'wallet',
      name: 'Digital Wallet',
      details: 'Paytm, PhonePe, etc.',
    },
  ];

  const processPayment = async (amount: number): Promise<boolean> => {
    setIsProcessing(true);
    
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsProcessing(false);
        resolve(true); // Simulate successful payment
      }, 2000);
    });
  };

  return {
    paymentMethods,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    isProcessing,
    processPayment,
  };
};
