import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';

interface RTLHandlerProps {
  children: React.ReactNode;
}

const RTLHandler: React.FC<RTLHandlerProps> = ({ children }) => {
  useEffect(() => {
    // Example: Enable RTL if the current language is Arabic
    const isRTL = true; // Replace with logic to determine if the language is RTL
    I18nManager.forceRTL(isRTL);
  }, []);

  return <>{children}</>;
};

export default RTLHandler;