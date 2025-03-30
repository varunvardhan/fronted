import { useRef } from 'react';

export const useScroll = () => {
  const candidatesListRef = useRef(null);
  const middlePanelRef = useRef(null);

  const scrollToTop = () => {
    if (candidatesListRef.current) {
      candidatesListRef.current.scrollTop = 0;
    }
  };

  const scrollToBottom = () => {
    if (middlePanelRef.current) {
      middlePanelRef.current.scrollTop = middlePanelRef.current.scrollHeight;
    }
  };

  const scrollToCandidate = (element) => {
    if (candidatesListRef.current && element) {
      const container = candidatesListRef.current;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerHeight = container.offsetHeight;
      
      container.scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
    }
  };

  const smoothScrollToBottom = () => {
    if (middlePanelRef.current) {
      middlePanelRef.current.scrollTo({
        top: middlePanelRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return {
    candidatesListRef,
    middlePanelRef,
    scrollToTop,
    scrollToBottom,
    scrollToCandidate,
    smoothScrollToBottom
  };
}; 