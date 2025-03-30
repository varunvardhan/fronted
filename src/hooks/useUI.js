import { useState, useEffect, useRef } from 'react';

export const useUI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const candidatesListRef = useRef(null);
  const middlePanelRef = useRef(null);

  // Auto-scroll to top of candidates list when analysis completes
  const scrollToTop = () => {
    if (candidatesListRef.current) {
      candidatesListRef.current.scrollTop = 0;
    }
  };

  // Auto-scroll to bottom of middle panel
  const scrollToBottom = () => {
    if (middlePanelRef.current) {
      middlePanelRef.current.scrollTop = middlePanelRef.current.scrollHeight;
    }
  };

  // Show toast message
  const showMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Scroll to selected candidate
  const scrollToCandidate = (element) => {
    if (candidatesListRef.current && element) {
      const container = candidatesListRef.current;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerHeight = container.offsetHeight;
      
      container.scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
    }
  };

  return {
    isLoading,
    setIsLoading,
    showToast,
    toastMessage,
    toastType,
    candidatesListRef,
    middlePanelRef,
    scrollToTop,
    scrollToBottom,
    showMessage,
    scrollToCandidate
  };
}; 